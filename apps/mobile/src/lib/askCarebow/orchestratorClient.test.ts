import AsyncStorage from '@react-native-async-storage/async-storage';
import {
  clearKnownBackendSessions,
  getOrchestratorReply,
  streamOrchestratorReply,
} from './orchestratorClient';
import { askCarebowOrchestratorApi } from '@/services/api/endpoints/askCarebowOrchestrator';
import { ApiClient } from '@/services/api/ApiClient';
import { postSSE } from '@/services/api/sseClient';

jest.mock('@/services/api/endpoints/askCarebowOrchestrator', () => ({
  askCarebowOrchestratorApi: {
    createSession: jest.fn(),
    sendMessage: jest.fn(),
    getTurn: jest.fn(),
    getSession: jest.fn(),
    listSessions: jest.fn(),
  },
}));

jest.mock('@/services/api/ApiClient', () => ({
  ApiClient: { getBaseUrl: jest.fn(), getAccessToken: jest.fn() },
}));

jest.mock('@/services/api/sseClient', () => ({
  postSSE: jest.fn(),
}));

const mockedCreateSession = askCarebowOrchestratorApi.createSession as jest.Mock;
const mockedSendMessage = askCarebowOrchestratorApi.sendMessage as jest.Mock;
const mockedGetTurn = askCarebowOrchestratorApi.getTurn as jest.Mock;
const mockedGetBaseUrl = ApiClient.getBaseUrl as jest.Mock;
const mockedGetAccessToken = ApiClient.getAccessToken as jest.Mock;
const mockedPostSSE = postSSE as jest.Mock;

const REQUEST_ID = 'ask_test_turn_123';

beforeEach(async () => {
  clearKnownBackendSessions();
  await AsyncStorage.clear();
});

describe('getOrchestratorReply', () => {
  beforeEach(() => {
    mockedCreateSession.mockReset();
    mockedSendMessage.mockReset();
  });

  it('creates a session, sends the message with request id, and returns the reply', async () => {
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
      requestId: REQUEST_ID,
    });

    expect(result).toEqual({
      text: 'Sore throats are usually viral...',
      isEmergency: false,
      urgencyLevel: 'P4',
      backendSessionId: 'session-1',
    });
    expect(mockedCreateSession).toHaveBeenCalledWith('profile-1');
    expect(mockedSendMessage).toHaveBeenCalledWith('session-1', 'I have a sore throat', REQUEST_ID);
  });

  it('reuses the cached backend session for a second turn', async () => {
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
      requestId: 'ask_first_123',
    });
    await getOrchestratorReply({
      localSessionId: 'local-1',
      profileId: 'profile-1',
      text: 'second',
      requestId: 'ask_second_123',
    });

    expect(mockedCreateSession).toHaveBeenCalledTimes(1);
    expect(mockedSendMessage).toHaveBeenNthCalledWith(2, 'session-1', 'second', 'ask_second_123');
  });

  it('returns null when session creation fails', async () => {
    mockedCreateSession.mockRejectedValueOnce(new Error('unauthorized'));

    const result = await getOrchestratorReply({
      localSessionId: 'local-2',
      profileId: 'profile-1',
      text: 'hello',
      requestId: REQUEST_ID,
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
      requestId: REQUEST_ID,
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
      requestId: REQUEST_ID,
    });

    expect(result).toBeNull();
  });
});

describe('streamOrchestratorReply', () => {
  beforeEach(() => {
    mockedCreateSession.mockReset();
    mockedPostSSE.mockReset();
    mockedGetTurn.mockReset();
    mockedGetBaseUrl.mockReset().mockReturnValue('https://api.example.com');
    mockedGetAccessToken.mockReset().mockReturnValue('tok_123');
  });

  it('sends request id through the canonical v1 stream, emits deltas and resolves', async () => {
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
      requestId: REQUEST_ID,
      onTextDelta: (d) => deltas.push(d),
    });

    expect(deltas).toEqual(['Sore ', 'throats']);
    expect(result).toEqual({
      text: 'Sore throats are usually viral...',
      isEmergency: false,
      urgencyLevel: 'P4',
      backendSessionId: 'session-1',
    });
    expect(mockedPostSSE).toHaveBeenCalledWith(
      'https://api.example.com/v1/chat/sessions/session-1/messages',
      { content: 'sore throat', stream: true, requestId: REQUEST_ID },
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
      requestId: REQUEST_ID,
      onTextDelta: () => {},
    });

    expect(mockedPostSSE).toHaveBeenCalledWith(
      expect.stringContaining('/v1/chat/sessions/session-1/messages'),
      expect.objectContaining({ requestId: REQUEST_ID }),
      { 'Content-Type': 'application/json' },
      expect.any(Function)
    );
  });

  it('recovers a persisted assistant reply when the stream disconnects', async () => {
    mockedCreateSession.mockResolvedValueOnce({ id: 'session-1' });
    mockedPostSSE.mockImplementationOnce(async (_url, _body, _headers, onEvent) => {
      onEvent({ type: 'delta', text: 'partial' });
    });
    mockedGetTurn.mockResolvedValueOnce({
      assistantMessage: {
        id: 'a1',
        content: 'I am sorry you are not feeling well. What is bothering you most?',
      },
      isEmergency: false,
      urgencyLevel: 'P4',
      run: { id: 'run-1', requestId: REQUEST_ID, status: 'COMPLETED' },
    });

    const result = await streamOrchestratorReply({
      localSessionId: 'local-3',
      profileId: 'profile-1',
      text: 'I am not feeling well',
      requestId: REQUEST_ID,
      onTextDelta: () => {},
    });

    expect(result?.text).toMatch(/not feeling well/i);
    expect(mockedGetTurn).toHaveBeenCalledWith('session-1', REQUEST_ID);
  });

  it('recovers after a dropped SSE connection', async () => {
    mockedCreateSession.mockResolvedValueOnce({ id: 'session-1' });
    mockedPostSSE.mockRejectedValueOnce(new Error('connection failed'));
    mockedGetTurn.mockResolvedValueOnce({
      assistantMessage: { id: 'a1', content: 'Recovered reply' },
      isEmergency: false,
      urgencyLevel: 'P4',
      run: { id: 'run-1', requestId: REQUEST_ID, status: 'COMPLETED' },
    });

    const result = await streamOrchestratorReply({
      localSessionId: 'local-4',
      profileId: 'profile-1',
      text: 'hi',
      requestId: REQUEST_ID,
      onTextDelta: () => {},
    });

    expect(result).toEqual({
      text: 'Recovered reply',
      isEmergency: false,
      urgencyLevel: 'P4',
      backendSessionId: 'session-1',
    });
  });

  it('returns null when session creation fails', async () => {
    mockedCreateSession.mockRejectedValueOnce(new Error('unauthorized'));

    const result = await streamOrchestratorReply({
      localSessionId: 'local-5',
      profileId: 'profile-1',
      text: 'hi',
      requestId: REQUEST_ID,
      onTextDelta: () => {},
    });

    expect(result).toBeNull();
    expect(mockedPostSSE).not.toHaveBeenCalled();
  });
});
