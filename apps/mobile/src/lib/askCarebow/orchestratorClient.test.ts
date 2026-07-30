import AsyncStorage from '@react-native-async-storage/async-storage';
import { getOrchestratorReply, streamOrchestratorReply } from './orchestratorClient';
import { askCarebowOrchestratorApi } from '@/services/api/endpoints/askCarebowOrchestrator';
import { ApiClient } from '@/services/api/ApiClient';
import { postSSE } from '@/services/api/sseClient';

jest.mock('@/services/api/endpoints/askCarebowOrchestrator', () => ({
  askCarebowOrchestratorApi: { createSession: jest.fn(), sendMessage: jest.fn() },
}));

jest.mock('@/services/api/ApiClient', () => ({
  ApiClient: { getBaseUrl: jest.fn(), getAccessToken: jest.fn() },
}));

jest.mock('@/services/api/sseClient', () => ({
  postSSE: jest.fn(),
}));

const mockedCreateSession = askCarebowOrchestratorApi.createSession as jest.Mock;
const mockedSendMessage = askCarebowOrchestratorApi.sendMessage as jest.Mock;
const mockedGetBaseUrl = ApiClient.getBaseUrl as jest.Mock;
const mockedGetAccessToken = ApiClient.getAccessToken as jest.Mock;
const mockedPostSSE = postSSE as jest.Mock;

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

describe('streamOrchestratorReply', () => {
  beforeEach(async () => {
    await AsyncStorage.clear();
    mockedCreateSession.mockReset();
    mockedPostSSE.mockReset();
    mockedGetBaseUrl.mockReset().mockReturnValue('https://api.example.com');
    mockedGetAccessToken.mockReset().mockReturnValue('tok_123');
  });

  it('emits each delta and resolves with the final assistant reply', async () => {
    mockedCreateSession.mockResolvedValueOnce({ id: 'session-1' });
    mockedPostSSE.mockImplementationOnce(async (_url, _body, _headers, onEvent) => {
      onEvent({ type: 'delta', text: 'Sore ' });
      onEvent({ type: 'delta', text: 'throats' });
      onEvent({
        type: 'done',
        assistantMessage: { content: 'Sore throats are usually viral...' },
        isEmergency: false,
        urgencyLevel: 'P4',
      });
    });

    const deltas: string[] = [];
    const result = await streamOrchestratorReply({
      localSessionId: 'local-1',
      profileId: 'profile-1',
      text: 'sore throat',
      onTextDelta: (d) => deltas.push(d),
    });

    expect(deltas).toEqual(['Sore ', 'throats']);
    expect(result).toEqual({
      text: 'Sore throats are usually viral...',
      isEmergency: false,
      urgencyLevel: 'P4',
    });
    expect(mockedPostSSE).toHaveBeenCalledWith(
      'https://api.example.com/chat/sessions/session-1/messages',
      { content: 'sore throat', stream: true },
      { 'Content-Type': 'application/json', Authorization: 'Bearer tok_123' },
      expect.any(Function)
    );
  });

  it('omits the Authorization header when there is no access token', async () => {
    mockedCreateSession.mockResolvedValueOnce({ id: 'session-1' });
    mockedGetAccessToken.mockReturnValue(null);
    mockedPostSSE.mockImplementationOnce(async (_url, _body, _headers, onEvent) => {
      onEvent({
        type: 'done',
        assistantMessage: { content: 'ok' },
        isEmergency: false,
        urgencyLevel: 'P4',
      });
    });

    await streamOrchestratorReply({
      localSessionId: 'local-2',
      profileId: 'profile-1',
      text: 'hi',
      onTextDelta: () => {},
    });

    expect(mockedPostSSE).toHaveBeenCalledWith(
      expect.any(String),
      expect.any(Object),
      { 'Content-Type': 'application/json' },
      expect.any(Function)
    );
  });

  it('returns null when no done event with assistant content ever arrives', async () => {
    mockedCreateSession.mockResolvedValueOnce({ id: 'session-1' });
    mockedPostSSE.mockImplementationOnce(async (_url, _body, _headers, onEvent) => {
      onEvent({ type: 'delta', text: 'partial' });
      // connection drops before a 'done' event
    });

    const result = await streamOrchestratorReply({
      localSessionId: 'local-3',
      profileId: 'profile-1',
      text: 'hi',
      onTextDelta: () => {},
    });

    expect(result).toBeNull();
  });

  it('returns null without forwarding any deltas when E10 shadows this turn (rolledOut: false)', async () => {
    mockedCreateSession.mockResolvedValueOnce({ id: 'session-1' });
    mockedPostSSE.mockImplementationOnce(async (_url, _body, _headers, onEvent) => {
      // No 'delta' events at all — the backend buffers instead of streaming
      // live when a profile is outside the rollout bucket (see rollout.ts).
      onEvent({ type: 'done', rolledOut: false });
    });

    const deltas: string[] = [];
    const result = await streamOrchestratorReply({
      localSessionId: 'local-6',
      profileId: 'profile-1',
      text: 'sore throat',
      onTextDelta: (d) => deltas.push(d),
    });

    expect(result).toBeNull();
    expect(deltas).toEqual([]);
  });

  it('returns null when postSSE rejects', async () => {
    mockedCreateSession.mockResolvedValueOnce({ id: 'session-1' });
    mockedPostSSE.mockRejectedValueOnce(new Error('connection failed'));

    const result = await streamOrchestratorReply({
      localSessionId: 'local-4',
      profileId: 'profile-1',
      text: 'hi',
      onTextDelta: () => {},
    });

    expect(result).toBeNull();
  });

  it('returns null when session creation fails', async () => {
    mockedCreateSession.mockRejectedValueOnce(new Error('unauthorized'));

    const result = await streamOrchestratorReply({
      localSessionId: 'local-5',
      profileId: 'profile-1',
      text: 'hi',
      onTextDelta: () => {},
    });

    expect(result).toBeNull();
    expect(mockedPostSSE).not.toHaveBeenCalled();
  });
});
