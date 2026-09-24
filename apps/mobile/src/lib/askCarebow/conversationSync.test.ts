import AsyncStorage from '@react-native-async-storage/async-storage';
import {
  attachCanonicalSession,
  clearKnownBackendSessions,
  getKnownBackendSessionId,
  listCanonicalSessions,
  loadCanonicalSession,
} from './orchestratorClient';
import { askCarebowOrchestratorApi } from '@/services/api/endpoints/askCarebowOrchestrator';
import { useAskCarebowStore } from '@/store/askCarebowStore';

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

  it('loads exact authorized backendSessionId directly even if omitted from listSessions', async () => {
    mockedGet.mockResolvedValueOnce({
      session: {
        id: 'sess_direct_deep_link',
        messages: [{ id: 'm10', role: 'USER', content: 'Direct question' }],
      },
    });

    const loaded = await loadCanonicalSession('sess_direct_deep_link');
    expect(loaded.session.id).toBe('sess_direct_deep_link');
    expect(mockedGet).toHaveBeenCalledWith('sess_direct_deep_link');
    expect(mockedList).not.toHaveBeenCalled();
  });

  it('populates mobile canonical history from server sessions without inventing second local session object', () => {
    useAskCarebowStore.getState().clearAllSessions();

    const serverSessions = [
      { id: 'sess_web_1', title: 'Web triage', createdAt: '2026-09-24T10:00:00Z' },
      { id: 'sess_web_2', title: 'Follow-up question', createdAt: '2026-09-24T11:00:00Z' },
    ];

    useAskCarebowStore.getState().populateCanonicalSessions(serverSessions, {
      userId: 'user-1',
      memberId: 'member-1',
      memberName: 'Mom',
    });

    const stored = useAskCarebowStore.getState().sessions;
    expect(stored.map((s: { id: string }) => s.id)).toEqual(['sess_web_1', 'sess_web_2']);
    expect(stored[0].memberId).toBe('member-1');
    expect(stored[0].memberName).toBe('Mom');

    // Attach exact ID updates current session id directly
    useAskCarebowStore.getState().startNewSession('user-1', 'member-1');
    const localId = useAskCarebowStore.getState().currentSession?.id;
    expect(localId).toBeDefined();

    useAskCarebowStore.getState().attachCanonicalSessionId('sess_web_1');
    expect(useAskCarebowStore.getState().currentSession?.id).toBe('sess_web_1');
  });
});
