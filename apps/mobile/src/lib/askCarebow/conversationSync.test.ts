import AsyncStorage from '@react-native-async-storage/async-storage';
import {
  attachCanonicalSession,
  clearKnownBackendSessions,
  getKnownBackendSessionId,
  listCanonicalSessions,
  loadCanonicalSession,
} from './orchestratorClient';
import { askCarebowOrchestratorApi } from '@/services/api/endpoints/askCarebowOrchestrator';

jest.mock('@/services/api/endpoints/askCarebowOrchestrator', () => ({
  askCarebowOrchestratorApi: {
    listSessions: jest.fn(),
    getSession: jest.fn(),
  },
}));

const mockedList = askCarebowOrchestratorApi.listSessions as jest.Mock;
const mockedGet = askCarebowOrchestratorApi.getSession as jest.Mock;

beforeEach(async () => {
  clearKnownBackendSessions();
  await AsyncStorage.clear();
  mockedList.mockReset();
  mockedGet.mockReset();
});

describe('canonical conversation sync', () => {
  it('lists server sessions and loads the exact requested session id', async () => {
    mockedList.mockResolvedValueOnce([
      { id: 'sess_older', title: 'Older thread' },
      { id: 'sess_web', title: 'Not feeling well' },
    ]);
    mockedGet.mockResolvedValueOnce({
      session: {
        id: 'sess_web',
        messages: [
          { id: 'm1', role: 'USER', content: 'I am not feeling well' },
          { id: 'm2', role: 'ASSISTANT', content: 'What is bothering you most right now?' },
        ],
      },
    });

    const listed = await listCanonicalSessions('profile-1');
    expect(listed.map((session) => session.id)).toEqual(['sess_older', 'sess_web']);

    await attachCanonicalSession('local-1', 'sess_web');
    expect(getKnownBackendSessionId('local-1')).toBe('sess_web');

    const loaded = await loadCanonicalSession('sess_web');
    expect(loaded.session.id).toBe('sess_web');
    expect(loaded.session.messages?.map((message) => message.id)).toEqual(['m1', 'm2']);
    expect(mockedGet).toHaveBeenCalledWith('sess_web');
    expect(mockedGet).not.toHaveBeenCalledWith('sess_older');
  });
});
