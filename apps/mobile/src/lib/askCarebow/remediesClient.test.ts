import AsyncStorage from '@react-native-async-storage/async-storage';
import { getRemediesForSymptom } from './remediesClient';
import { remediesApi } from '@/services/api/endpoints/remedies';

jest.mock('@/services/api/endpoints/remedies', () => ({
  remediesApi: { get: jest.fn() },
}));

const mockedGet = remediesApi.get as jest.Mock;

describe('getRemediesForSymptom', () => {
  beforeEach(async () => {
    await AsyncStorage.clear();
    mockedGet.mockReset();
  });

  it('returns the network response and caches it on success', async () => {
    const response = { success: true, condition: 'fever', remedies: [{ name: 'Rest' }] };
    mockedGet.mockResolvedValueOnce(response);

    const result = await getRemediesForSymptom({ symptom: 'fever', profileId: 'p1' });

    expect(result).toEqual({ data: response, fromCache: false });
    // A second call with the network down should now find this cached.
    mockedGet.mockRejectedValueOnce(new Error('offline'));
    const second = await getRemediesForSymptom({ symptom: 'fever', profileId: 'p1' });
    expect(second).toEqual({ data: response, fromCache: true });
  });

  it('falls back to the cache when the network call throws', async () => {
    const cached = { success: true, condition: 'headache', remedies: [{ name: 'Dark room' }] };
    mockedGet.mockResolvedValueOnce(cached);
    await getRemediesForSymptom({ symptom: 'headache' });

    mockedGet.mockRejectedValueOnce(new Error('network down'));
    const result = await getRemediesForSymptom({ symptom: 'headache' });

    expect(result).toEqual({ data: cached, fromCache: true });
  });

  it('falls back to the cache when the backend returns success: false', async () => {
    const cached = {
      success: true,
      condition: 'sore_throat',
      remedies: [{ name: 'Warm salt water' }],
    };
    mockedGet.mockResolvedValueOnce(cached);
    await getRemediesForSymptom({ symptom: 'sore throat' });

    mockedGet.mockResolvedValueOnce({ success: false, error: 'no match' });
    const result = await getRemediesForSymptom({ symptom: 'sore throat' });

    expect(result).toEqual({ data: cached, fromCache: true });
  });

  it('returns null when there is no cache and the network call fails', async () => {
    mockedGet.mockRejectedValueOnce(new Error('offline, never fetched before'));

    const result = await getRemediesForSymptom({ symptom: 'never seen this before' });

    expect(result).toBeNull();
  });

  it('caches per symptom+profile so unrelated lookups do not collide', async () => {
    const feverResponse = { success: true, condition: 'fever', remedies: [] };
    const headacheResponse = { success: true, condition: 'headache', remedies: [] };
    mockedGet.mockResolvedValueOnce(feverResponse);
    await getRemediesForSymptom({ symptom: 'fever', profileId: 'p1' });
    mockedGet.mockResolvedValueOnce(headacheResponse);
    await getRemediesForSymptom({ symptom: 'headache', profileId: 'p1' });

    mockedGet.mockRejectedValueOnce(new Error('offline'));
    const fever = await getRemediesForSymptom({ symptom: 'fever', profileId: 'p1' });
    expect(fever?.data).toEqual(feverResponse);
  });
});
