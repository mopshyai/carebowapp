import AsyncStorage from '@react-native-async-storage/async-storage';
import { getOrchestratorReply } from './orchestratorClient';
import { askCarebowOrchestratorApi } from '@/services/api/endpoints/askCarebowOrchestrator';

jest.mock('@/services/api/endpoints/askCarebowOrchestrator', () => ({
  askCarebowOrchestratorApi: { createSession: jest.fn(), sendMessage: jest.fn() },
}));

const mockedCreateSession = askCarebowOrchestratorApi.createSession as jest.Mock;
const mockedSendMessage = askCarebowOrchestratorApi.sendMessage as jest.Mock;

describe('getOrchestratorReply', () => {
  beforeEach(async () => {
    await AsyncStorage.clear();
    mockedCreateSession.mockReset();
    mockedSendMessage.mockReset();
  });

  it('creates a session, sends the message, and returns the assistant reply', async () => {
    mockedCreateSession.mockResolvedValueOnce({ id: 'session-1' });
    mockedSendMessage.mockResolvedValueOnce({
      assistantMessage: { id: 'm1', content: 'Sore throats are usually viral...' },
      isEmergency: false,
      urgencyLevel: 'P4',
    });

    const result = await getOrchestratorReply({
      localSessionId: 'local-1',
      profileId: 'profile-1',
      text: 'I have a sore throat',
    });

    expect(result).toEqual({
      text: 'Sore throats are usually viral...',
      isEmergency: false,
      urgencyLevel: 'P4',
    });
    expect(mockedCreateSession).toHaveBeenCalledWith('profile-1');
    expect(mockedSendMessage).toHaveBeenCalledWith('session-1', 'I have a sore throat');
  });

  it('reuses the cached backend session for a second turn instead of creating a new one', async () => {
    mockedCreateSession.mockResolvedValueOnce({ id: 'session-1' });
    mockedSendMessage.mockResolvedValue({
      assistantMessage: { id: 'm1', content: 'ok' },
      isEmergency: false,
      urgencyLevel: 'P4',
    });

    await getOrchestratorReply({
      localSessionId: 'local-1',
      profileId: 'profile-1',
      text: 'first',
    });
    await getOrchestratorReply({
      localSessionId: 'local-1',
      profileId: 'profile-1',
      text: 'second',
    });

    expect(mockedCreateSession).toHaveBeenCalledTimes(1);
    expect(mockedSendMessage).toHaveBeenNthCalledWith(2, 'session-1', 'second');
  });

  it('returns null when session creation fails', async () => {
    mockedCreateSession.mockRejectedValueOnce(new Error('unauthorized'));

    const result = await getOrchestratorReply({
      localSessionId: 'local-2',
      profileId: 'profile-1',
      text: 'hello',
    });

    expect(result).toBeNull();
    expect(mockedSendMessage).not.toHaveBeenCalled();
  });

  it('returns null when sendMessage fails', async () => {
    mockedCreateSession.mockResolvedValueOnce({ id: 'session-1' });
    mockedSendMessage.mockRejectedValueOnce(new Error('network down'));

    const result = await getOrchestratorReply({
      localSessionId: 'local-3',
      profileId: 'profile-1',
      text: 'hello',
    });

    expect(result).toBeNull();
  });

  it('returns null when the response has no assistant content', async () => {
    mockedCreateSession.mockResolvedValueOnce({ id: 'session-1' });
    mockedSendMessage.mockResolvedValueOnce({
      assistantMessage: { id: 'm1', content: '' },
      isEmergency: false,
      urgencyLevel: 'P4',
    });

    const result = await getOrchestratorReply({
      localSessionId: 'local-4',
      profileId: 'profile-1',
      text: 'hello',
    });

    expect(result).toBeNull();
  });
});
