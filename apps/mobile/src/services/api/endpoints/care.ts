/**
 * CareBow Mobile Care Domain API Client
 * Connects the mobile app to canonical backend care services via Bearer authentication:
 * /api/v1/care/episodes
 * /api/v1/care/tasks
 * /api/v1/care/updates
 * /api/v1/care/timeline
 * /api/v1/care/services
 * /api/v1/care/actions
 * /api/v1/care/discharge/extract
 * /api/v1/care/discharge/confirm
 * /api/v1/care/overview
 */

import { ApiClient } from '../ApiClient';
import type {
  EpisodeType,
  EpisodeStatus,
  WorkflowStatus,
  TaskType,
  TaskOwnerType,
  TaskPriority,
  TaskStatus,
  ServiceRequestStatus,
  ExtractedDischargePlan,
  ProposedAction,
} from '../../../types/care';

export interface BackendCareEpisode {
  id: string;
  profileId: string;
  title: string;
  episodeType: EpisodeType;
  status: EpisodeStatus;
  workflowStatus: WorkflowStatus;
  startDate: string;
  targetEndDate?: string | null;
  goals: string[];
  source?: string | null;
  description?: string | null;
  facilityName?: string | null;
  admittingDiagnosis?: string | null;
  dischargeDiagnosis?: string | null;
  completedAt?: string | null;
  createdAt: string;
  updatedAt: string;
  tasks?: BackendCareTask[];
  updates?: BackendCareUpdate[];
  serviceRequests?: BackendCareServiceRequest[];
}

export interface BackendCareTask {
  id: string;
  profileId: string;
  episodeId?: string | null;
  title: string;
  description?: string | null;
  type: TaskType;
  ownerType: TaskOwnerType;
  ownerId?: string | null;
  ownerName?: string | null;
  dueAt?: string | null;
  priority: TaskPriority;
  status: TaskStatus;
  source: string;
  createdBy?: string | null;
  completedAt?: string | null;
  completionNotes?: string | null;
  externalReference?: string | null;
  createdAt: string;
  updatedAt: string;
  episode?: { id: string; title: string; workflowStatus: WorkflowStatus };
}

export interface BackendCareUpdate {
  id: string;
  profileId: string;
  episodeId?: string | null;
  authorId: string;
  authorName: string;
  text: string;
  category: string;
  createdAt: string;
  updatedAt: string;
}

export interface BackendCareServiceRequest {
  id: string;
  profileId: string;
  episodeId?: string | null;
  taskId?: string | null;
  serviceType: string;
  title: string;
  description?: string | null;
  status: ServiceRequestStatus;
  assignedTo: string;
  requestedDate?: string | null;
  scheduledDate?: string | null;
  notes?: string | null;
  createdAt: string;
  updatedAt: string;
  episode?: { id: string; title: string };
}

export interface BackendTimelineEvent {
  id: string;
  timestamp: string;
  dateLabel: string;
  timeLabel: string;
  type: string;
  title: string;
  description?: string;
  actorName?: string;
  ownerType?: TaskOwnerType;
  priority?: TaskPriority;
  status?: string;
  sourceType: string;
  sourceId: string;
  episodeId?: string;
}

export interface CreateEpisodeInput {
  profileId: string;
  title: string;
  episodeType?: EpisodeType;
  workflowStatus?: WorkflowStatus;
  startDate?: string;
  targetEndDate?: string | null;
  goals?: string[];
  source?: string;
  description?: string;
  facilityName?: string;
  admittingDiagnosis?: string;
  dischargeDiagnosis?: string;
}

export interface CreateTaskInput {
  profileId: string;
  episodeId?: string | null;
  title: string;
  description?: string;
  type?: TaskType;
  ownerType?: TaskOwnerType;
  ownerId?: string | null;
  ownerName?: string | null;
  dueAt?: string | null;
  priority?: TaskPriority;
  status?: TaskStatus;
  source?: string;
}

export interface UpdateTaskInput {
  title?: string;
  description?: string;
  type?: TaskType;
  ownerType?: TaskOwnerType;
  ownerId?: string | null;
  ownerName?: string | null;
  dueAt?: string | null;
  priority?: TaskPriority;
  status?: TaskStatus;
  completionNotes?: string;
}

export interface CreateServiceRequestInput {
  profileId: string;
  episodeId?: string | null;
  taskId?: string | null;
  serviceType: string;
  title: string;
  description?: string;
  assignedTo?: string;
  requestedDate?: string;
}

export interface ConfirmDischargeInput {
  documentId?: string;
  episodeTitle?: string;
  facilityName?: string;
  dischargeDiagnosis?: string;
  careGoals: string[];
  confirmedItems: Array<{
    id: string;
    category: string;
    title: string;
    description?: string;
    suggestedDueAt?: string;
    priority: TaskPriority;
    ownerType: TaskOwnerType;
    serviceHint?: string;
    sourceType: string;
    sourceSnippet?: string;
    confirmed: boolean;
  }>;
}

export const careApi = {
  // Episodes
  getEpisodes: async (profileId: string, status?: EpisodeStatus): Promise<BackendCareEpisode[]> => {
    const params: Record<string, string> = { profileId };
    if (status) params.status = status;
    const res = await ApiClient.get<{ success: boolean; episodes: BackendCareEpisode[] }>(
      '/v1/care/episodes',
      { params }
    );
    return res.data.episodes || [];
  },

  getActiveEpisode: async (profileId: string): Promise<BackendCareEpisode | null> => {
    const episodes = await careApi.getEpisodes(profileId, 'ACTIVE');
    return episodes.length > 0 ? episodes[0] : null;
  },

  getEpisodeById: async (id: string): Promise<BackendCareEpisode> => {
    const res = await ApiClient.get<{ success: boolean; episode: BackendCareEpisode }>(
      `/v1/care/episodes/${id}`
    );
    return res.data.episode;
  },

  createEpisode: async (data: CreateEpisodeInput): Promise<BackendCareEpisode> => {
    const res = await ApiClient.post<{ success: boolean; episode: BackendCareEpisode }>(
      '/v1/care/episodes',
      data
    );
    return res.data.episode;
  },

  updateEpisode: async (
    id: string,
    data: Partial<CreateEpisodeInput & { status: EpisodeStatus }>
  ): Promise<BackendCareEpisode> => {
    const res = await ApiClient.patch<{ success: boolean; episode: BackendCareEpisode }>(
      `/v1/care/episodes/${id}`,
      data
    );
    return res.data.episode;
  },

  // Tasks
  getTasks: async (
    profileId: string,
    filters?: {
      episodeId?: string;
      status?: TaskStatus | 'OPEN' | 'ALL';
      ownerType?: TaskOwnerType;
      priority?: TaskPriority;
    }
  ): Promise<BackendCareTask[]> => {
    const params: Record<string, string> = { profileId };
    if (filters?.episodeId) params.episodeId = filters.episodeId;
    if (filters?.status) params.status = filters.status;
    if (filters?.ownerType) params.ownerType = filters.ownerType;
    if (filters?.priority) params.priority = filters.priority;

    const res = await ApiClient.get<{ success: boolean; tasks: BackendCareTask[] }>(
      '/v1/care/tasks',
      { params }
    );
    return res.data.tasks || [];
  },

  createTask: async (data: CreateTaskInput): Promise<BackendCareTask> => {
    const res = await ApiClient.post<{ success: boolean; task: BackendCareTask }>(
      '/v1/care/tasks',
      data
    );
    return res.data.task;
  },

  updateTask: async (id: string, data: UpdateTaskInput): Promise<BackendCareTask> => {
    const res = await ApiClient.patch<{ success: boolean; task: BackendCareTask }>(
      `/v1/care/tasks/${id}`,
      data
    );
    return res.data.task;
  },

  deleteTask: async (id: string): Promise<boolean> => {
    const res = await ApiClient.delete<{ success: boolean }>(`/v1/care/tasks/${id}`);
    return res.data.success;
  },

  // Updates
  getUpdates: async (profileId: string, episodeId?: string): Promise<BackendCareUpdate[]> => {
    const params: Record<string, string> = { profileId };
    if (episodeId) params.episodeId = episodeId;
    const res = await ApiClient.get<{ success: boolean; updates: BackendCareUpdate[] }>(
      '/v1/care/updates',
      params
    );
    return res.data.updates || [];
  },

  addUpdate: async (data: {
    profileId: string;
    episodeId?: string;
    text: string;
    category?: string;
  }): Promise<BackendCareUpdate> => {
    const res = await ApiClient.post<{ success: boolean; update: BackendCareUpdate }>(
      '/v1/care/updates',
      data
    );
    return res.data.update;
  },

  // Timeline
  getTimeline: async (
    profileId: string,
    episodeId?: string,
    limit?: number
  ): Promise<BackendTimelineEvent[]> => {
    const params: Record<string, string> = { profileId };
    if (episodeId) params.episodeId = episodeId;
    if (limit) params.limit = String(limit);
    const res = await ApiClient.get<{ success: boolean; events: BackendTimelineEvent[] }>(
      '/v1/care/timeline',
      { params }
    );
    return res.data.events || [];
  },

  // Service Requests
  getServiceRequests: async (
    profileId: string,
    episodeId?: string
  ): Promise<BackendCareServiceRequest[]> => {
    const params: Record<string, string> = { profileId };
    if (episodeId) params.episodeId = episodeId;
    const res = await ApiClient.get<{
      success: boolean;
      serviceRequests: BackendCareServiceRequest[];
    }>('/v1/care/services', { params });
    return res.data.serviceRequests || [];
  },

  createServiceRequest: async (
    data: CreateServiceRequestInput
  ): Promise<BackendCareServiceRequest> => {
    const res = await ApiClient.post<{
      success: boolean;
      serviceRequest: BackendCareServiceRequest;
    }>('/v1/care/services', data);
    return res.data.serviceRequest;
  },

  cancelServiceRequest: async (id: string): Promise<BackendCareServiceRequest> => {
    const res = await ApiClient.patch<{
      success: boolean;
      serviceRequest: BackendCareServiceRequest;
    }>(`/v1/care/services/${id}`, { status: 'CANCELLED' });
    return res.data.serviceRequest;
  },

  // Discharge Recovery Extraction & Confirmation
  extractDischarge: async (
    text: string,
    fileName?: string,
    documentId?: string
  ): Promise<ExtractedDischargePlan> => {
    const res = await ApiClient.post<{ success: boolean; plan: ExtractedDischargePlan }>(
      '/v1/care/discharge/extract',
      { text, fileName, documentId }
    );
    return res.data.plan;
  },

  confirmDischarge: async (
    profileId: string,
    data: ConfirmDischargeInput
  ): Promise<{
    episode: BackendCareEpisode;
    tasks: BackendCareTask[];
    services: BackendCareServiceRequest[];
  }> => {
    const res = await ApiClient.post<{
      success: boolean;
      episode: BackendCareEpisode;
      tasks: BackendCareTask[];
      services: BackendCareServiceRequest[];
    }>('/v1/care/discharge/confirm', {
      profileId,
      ...data,
    });
    return {
      episode: res.data.episode,
      tasks: res.data.tasks || [],
      services: res.data.services || [],
    };
  },

  // Action Detection & Execution
  detectActions: async (text: string, episodeId?: string): Promise<ProposedAction[]> => {
    const res = await ApiClient.post<{ success: boolean; actions: ProposedAction[] }>(
      '/v1/care/actions',
      { mode: 'detect', text, episodeId }
    );
    return res.data.actions || [];
  },

  executeAction: async (
    profileId: string,
    action: ProposedAction,
    episodeId?: string
  ): Promise<{
    task?: BackendCareTask;
    update?: BackendCareUpdate;
    serviceRequest?: BackendCareServiceRequest;
  }> => {
    const res = await ApiClient.post<{
      success: boolean;
      task?: BackendCareTask;
      update?: BackendCareUpdate;
      serviceRequest?: BackendCareServiceRequest;
    }>('/v1/care/actions', {
      profileId,
      action,
      episodeId,
    });
    return res.data;
  },

  // Overview
  getOverview: async (profileId: string) => {
    const res = await ApiClient.get<{ success: boolean; [key: string]: any }>('/v1/care/overview', {
      params: { profileId },
    });
    return res.data;
  },
};
