import { act, renderHook } from '@testing-library/react-native';
import { useFollowUpStore } from './followUpStore';
import { askCarebowOrchestratorApi } from '../services/api/endpoints/askCarebowOrchestrator';
import { getCachedBackendSessionId } from '../lib/askCarebow/orchestratorClient';
import type { FollowUpIntent } from '../types/followUp';

jest.mock('../utils/notifications', () => ({
  scheduleLocalNotification: jest.fn().mockResolvedValue(undefined),
  cancelLocalNotification: jest.fn().mockResolvedValue(undefined),
}));

jest.mock('../services/api/endpoints/askCarebowOrchestrator', () => ({
  askCarebowOrchestratorApi: {
    createSession: jest.fn(),
    sendMessage: jest.fn(),
    recordFollowUpOutcome: jest.fn(),
  },
}));

jest.mock('../lib/askCarebow/orchestratorClient', () => ({
  getCachedBackendSessionId: jest.fn(),
}));

const mockedGetBackendSession = getCachedBackendSessionId as jest.Mock;
const mockedRecordOutcome = askCarebowOrchestratorApi.recordFollowUpOutcome as jest.Mock;

function pendingFollowUp(): FollowUpIntent {
  return {
    id: 'followup-1',
    episodeId: 'episode-1',
    episodeTitle: 'Fever',
    localChatSessionId: 'local-chat-1',
    followUpAt: new Date().toISOString(),
    reasonSnippet: 'Check fever',
    status: 'done',
    createdAt: new Date().toISOString(),
    completedAt: new Date().toISOString(),
    outcome: 'better',
    serverSyncStatus: 'pending',
  };
}

describe('follow-up outcome server durability', () => {
  beforeEach(() => {
    jest.clearAllMocks();
    useFollowUpStore.setState({ followUps: [pendingFollowUp()] });
  });

  it('marks a pending outcome synced only after the backend accepts it', async () => {
    mockedGetBackendSession.mockResolvedValue('backend-session-1');
    mockedRecordOutcome.mockResolvedValue({ success: true, careStatus: 'resolved' });

    const { result } = renderHook(() => useFollowUpStore());
    await act(async () => {
      await result.current.syncFollowUpOutcome('followup-1');
    });

    expect(mockedRecordOutcome).toHaveBeenCalledWith('backend-session-1', 'better');
    expect(result.current.followUps[0].serverSyncStatus).toBe('synced');
    expect(result.current.followUps[0].serverSyncedAt).toBeDefined();
  });

  it('keeps a failed network write pending so it can be retried later', async () => {
    mockedGetBackendSession.mockResolvedValue('backend-session-1');
    mockedRecordOutcome.mockRejectedValue(new Error('offline'));

    const { result } = renderHook(() => useFollowUpStore());
    await act(async () => {
      await result.current.syncFollowUpOutcome('followup-1');
    });

    expect(result.current.followUps[0].serverSyncStatus).toBe('pending');
    expect(result.current.followUps[0].serverSyncedAt).toBeUndefined();
  });

  it('flushes all persisted pending outcomes when retry is requested', async () => {
    useFollowUpStore.setState({
      followUps: [
        pendingFollowUp(),
        { ...pendingFollowUp(), id: 'followup-2', outcome: 'worse' },
      ],
    });
    mockedGetBackendSession.mockResolvedValue('backend-session-1');
    mockedRecordOutcome.mockResolvedValue({ success: true });

    const { result } = renderHook(() => useFollowUpStore());
    await act(async () => {
      await result.current.syncPendingOutcomes();
    });

    expect(mockedRecordOutcome).toHaveBeenCalledTimes(2);
    expect(result.current.followUps.every((f) => f.serverSyncStatus === 'synced')).toBe(true);
  });
});
