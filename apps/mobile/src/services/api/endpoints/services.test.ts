import { ApiClient } from '../ApiClient';
import { servicesApi } from './services';

jest.mock('../ApiClient', () => ({ ApiClient: { get: jest.fn() } }));

const getMock = ApiClient.get as jest.Mock;
const productionServices = [
  {
    id: 'db_doctor',
    name: 'Doctor Home Visit',
    category: 'DOCTOR_VISIT',
    description: 'A doctor visits the patient at home.',
    basePrice: 80000,
    priceUnit: 'visit',
    estimatedDuration: 45,
    isAvailable: true,
  },
  {
    id: 'db_lab',
    name: 'Home Blood Test',
    category: 'LAB_TEST',
    description: 'Sample collection at home.',
    basePrice: 30000,
    priceUnit: 'visit',
    estimatedDuration: 30,
    isAvailable: true,
  },
];

describe('servicesApi production contract', () => {
  beforeEach(() => {
    getMock.mockReset();
    getMock.mockResolvedValue({ data: { success: true, services: productionServices } });
  });

  it('uses the authenticated v1 endpoint and production query names', async () => {
    await servicesApi.getServices({ categoryId: 'LAB_TEST', search: 'blood' });
    expect(getMock).toHaveBeenCalledWith('/v1/services', {
      params: { category: 'LAB_TEST', search: 'blood' },
      retries: 0,
    });
  });

  it('resolves a mobile catalogue id to the live database id', async () => {
    const service = await servicesApi.resolveProductionService('doctor_visit');
    expect(service.id).toBe('db_doctor');
    expect(getMock).toHaveBeenCalledWith('/v1/services', {
      params: { category: undefined, search: 'Doctor Home Visit' },
      retries: 0,
    });
  });

  it('rejects catalogue items that are not backed by production', async () => {
    await expect(servicesApi.resolveProductionService('deep_cleaning')).rejects.toThrow(
      'not yet available for online booking'
    );
    expect(getMock).not.toHaveBeenCalled();
  });
});
