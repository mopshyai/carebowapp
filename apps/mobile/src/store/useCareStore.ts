/**
 * CareBow Care Store
 * Server-authoritative application state and cache for the Family Care Intelligence layer.
 *
 * Invariants:
 * 1. Server state is authoritative. Zustand acts as in-memory state/cache; AsyncStorage provides bounded persistence.
 * 2. ZERO fabricated care data in production. Empty states remain truthful ("No active care episode").
 * 3. Cache is isolated per authenticated CareBow user.
 * 4. Mutations dispatch to careApi (/api/v1/care/*) and queue offline if disconnected.
 */

import { create } from 'zustand';
import { persist, createJSONStorage } from 'zustand/middleware';
import AsyncStorage from '@react-native-async-storage/async-storage';
import {
  CareEpisode,
  CareTask,
  CareTimelineEvent,
  CareUpdate,
  CareServiceRequest,
  CaregiverCollaborator,
  CareTaskOwnerType,
  CareWorkflowStatus,
  CareServiceRequestStatus,
  FamilyRole,
  CarePermissionScope,
  WORKFLOW_STATUS_LABELS,
  toCanonicalWorkflowStatus,
  toCanonicalTaskStatus,
  toCanonicalPriority,
  toCanonicalTaskOwner,
  toCanonicalTaskType,
  toCanonicalEpisodeType,
  toCanonicalEpisodeStatus,
  toCanonicalServiceRequestStatus,
} from '../types/care';
import { generateId } from '../types/profile';
import {
  careApi,
  CreateTaskInput,
  CreateEpisodeInput,
  CreateServiceRequestInput,
} from '../services/api/endpoints/care';
import { useProfileStore } from './useProfileStore';

// ============================================
// OFFLINE MUTATION TYPES
// ============================================

export interface OfflineMutation {
  clientOpId: string;
  entityId: string;
  entityType: 'episode' | 'task' | 'update' | 'service_request';
  opType: 'create' | 'update' | 'delete';
  payload: Record<string, any>;
  timestamp: string;
  retryCount: number;
}

// ============================================
// STORE STATE & ACTIONS
// ============================================

export interface CareState {
  episodes: CareEpisode[];
  tasks: CareTask[];
  timelineEvents: CareTimelineEvent[];
  careUpdates: CareUpdate[];
  serviceRequests: CareServiceRequest[];
  collaborators: CaregiverCollaborator[];
  offlineQueue: OfflineMutation[];
  isLoading: boolean;
  isSyncing: boolean;
  lastSyncedAt: string | null;
  error: string | null;
}

export type CareActions = {
  // Synchronization with Canonical Backend
  fetchCareForPerson: (personId: string) => Promise<void>;
  loadCareData: (personId: string) => Promise<void>;
  syncOfflineQueue: () => Promise<void>;

  // Episode operations
  createEpisode: (
    data: Omit<CareEpisode, 'id' | 'createdAt' | 'updatedAt'>
  ) => Promise<CareEpisode>;
  updateEpisode: (id: string, updates: Partial<CareEpisode>) => Promise<void>;
  setWorkflowStatus: (id: string, status: CareWorkflowStatus) => Promise<void>;
  completeEpisode: (id: string) => Promise<void>;
  getActiveEpisodeForPerson: (personId: string) => CareEpisode | undefined;
  getEpisodesForPerson: (personId: string) => CareEpisode[];

  // Task operations
  createTask: (data: Omit<CareTask, 'id' | 'createdAt' | 'updatedAt'>) => Promise<CareTask>;
  updateTask: (id: string, updates: Partial<CareTask>) => Promise<void>;
  assignTask: (
    id: string,
    ownerType: CareTaskOwnerType,
    ownerId?: string,
    ownerName?: string
  ) => Promise<void>;
  completeTask: (id: string, notes?: string) => Promise<void>;
  reopenTask: (id: string) => Promise<void>;
  deleteTask: (id: string) => Promise<void>;
  getTasksForPerson: (personId: string) => CareTask[];
  getTasksDueToday: (personId: string) => CareTask[];
  getOverdueTasks: (personId: string) => CareTask[];

  // Timeline operations
  addTimelineEvent: (
    data: Omit<CareTimelineEvent, 'id' | 'timestamp'> & { timestamp?: string }
  ) => CareTimelineEvent;
  getTimelineForPerson: (personId: string) => CareTimelineEvent[];

  // Care Updates
  addCareUpdate: (data: Omit<CareUpdate, 'id' | 'createdAt'>) => Promise<CareUpdate>;
  getUpdatesForPerson: (personId: string) => CareUpdate[];

  // Service Requests
  createServiceRequest: (
    data: Omit<CareServiceRequest, 'id' | 'requestedAt' | 'updatedAt'>
  ) => Promise<CareServiceRequest>;
  cancelServiceRequest: (id: string) => Promise<void>;
  updateServiceRequestStatus: (
    id: string,
    status: CareServiceRequestStatus,
    statusMessage?: string,
    providerName?: string
  ) => void;
  getServiceRequestsForPerson: (personId: string) => CareServiceRequest[];

  // Collaborators (Family access grants)
  inviteCollaborator: (
    data: Omit<CaregiverCollaborator, 'id' | 'invitedAt' | 'status'>
  ) => CaregiverCollaborator;
  updateCollaboratorRole: (
    id: string,
    role: FamilyRole,
    permissions?: CarePermissionScope[]
  ) => void;
  removeCollaborator: (id: string) => void;
  getCollaboratorsForPerson: (personId: string) => CaregiverCollaborator[];

  // Reset & Cache Management
  resetCareStore: () => void;
};

const initialState: CareState = {
  episodes: [],
  tasks: [],
  timelineEvents: [],
  careUpdates: [],
  serviceRequests: [],
  collaborators: [],
  offlineQueue: [],
  isLoading: false,
  isSyncing: false,
  lastSyncedAt: null,
  error: null,
};

export const useCareStore = create<CareState & CareActions>()(
  persist(
    (set, get) => ({
      ...initialState,

      // ============================================
      // SERVER SYNCHRONIZATION
      // ============================================

      fetchCareForPerson: async (personId: string) => {
        if (!personId) return;
        set({ isLoading: true, error: null });

        try {
          const [episodes, tasks, updates, timeline, services] = await Promise.all([
            careApi.getEpisodes(personId),
            careApi.getTasks(personId).catch(() => []),
            careApi.getUpdates(personId).catch(() => []),
            careApi.getTimeline(personId).catch(() => []),
            careApi.getServiceRequests(personId).catch(() => []),
          ]);

          // Map backend entities to mobile types
          const mappedEpisodes: CareEpisode[] = episodes.map((e) => ({
            id: e.id,
            personId: e.profileId,
            title: e.title,
            episodeType: e.episodeType,
            startDate: e.startDate,
            targetEndDate: e.targetEndDate || undefined,
            status: e.status,
            workflowStatus: e.workflowStatus,
            source: e.source || 'USER',
            description: e.description || undefined,
            careGoals: e.goals || [],
            dischargeDetails:
              e.facilityName || e.dischargeDiagnosis
                ? {
                    hospitalName: e.facilityName || undefined,
                    primaryDiagnosis: e.dischargeDiagnosis || e.admittingDiagnosis || undefined,
                    dischargeDate: (e as any).dischargeDate || e.startDate || undefined,
                  }
                : undefined,
            createdAt: e.createdAt,
            updatedAt: e.updatedAt,
            completedAt: e.completedAt || undefined,
          }));

          const mappedTasks: CareTask[] = tasks.map((t) => ({
            id: t.id,
            personId: t.profileId,
            episodeId: t.episodeId || undefined,
            title: t.title,
            description: t.description || undefined,
            taskType: t.type,
            ownerType: t.ownerType,
            ownerId: t.ownerId ?? null,
            ownerName: t.ownerName ?? null,
            dueAt: t.dueAt ?? null,
            status: t.status,
            priority: t.priority,
            source: (t.source as any) || 'USER',
            createdBy: t.createdBy || undefined,
            completedAt: t.completedAt || undefined,
            completionNotes: t.completionNotes || undefined,
            createdAt: t.createdAt,
            updatedAt: t.updatedAt,
          }));

          const mappedUpdates: CareUpdate[] = updates.map((u) => ({
            id: u.id,
            personId: u.profileId,
            authorId: u.authorId,
            authorName: u.authorName,
            note: u.text,
            category: (u.category as any) || 'general',
            createdAt: u.createdAt,
          }));

          const mappedTimeline: CareTimelineEvent[] = timeline.map((ev) => ({
            id: ev.id,
            personId: profileIdFromEvent(ev, personId),
            episodeId: ev.episodeId,
            eventType: ev.type,
            title: ev.title,
            description: ev.description,
            timestamp: ev.timestamp,
            author: ev.actorName ? { id: ev.actorName, name: ev.actorName } : undefined,
          }));

          const mappedServices: CareServiceRequest[] = services.map((s) => ({
            id: s.id,
            personId: s.profileId,
            episodeId: s.episodeId || undefined,
            serviceCategory: s.serviceType,
            serviceTitle: s.title,
            notes: s.notes || undefined,
            status: s.status,
            assignedTo: s.assignedTo,
            scheduledDate: s.scheduledDate || undefined,
            requestedAt: s.createdAt,
            updatedAt: s.updatedAt,
          }));

          set((state) => ({
            // Merge with state for other persons
            episodes: [...state.episodes.filter((e) => e.personId !== personId), ...mappedEpisodes],
            tasks: [...state.tasks.filter((t) => t.personId !== personId), ...mappedTasks],
            careUpdates: [
              ...state.careUpdates.filter((u) => u.personId !== personId),
              ...mappedUpdates,
            ],
            timelineEvents: [
              ...state.timelineEvents.filter((ev) => ev.personId !== personId),
              ...mappedTimeline,
            ],
            serviceRequests: [
              ...state.serviceRequests.filter((s) => s.personId !== personId),
              ...mappedServices,
            ],
            isLoading: false,
            lastSyncedAt: new Date().toISOString(),
          }));
        } catch (err: any) {
          const isAccessRevoked =
            err?.status === 403 ||
            err?.response?.status === 403 ||
            /forbidden|access revoked|not authorized/i.test(err?.message || '');

          const isNotFound =
            err?.status === 404 ||
            err?.response?.status === 404 ||
            /not found/i.test(err?.message || '');

          if (isAccessRevoked || isNotFound) {
            const profileState = useProfileStore.getState();
            const memberExists = profileState.members?.some((m) => m.id === personId);

            // Fail-closed: 403 always purges; 404 purges if profile is not among user's accessible members
            if (isAccessRevoked || !memberExists) {
              set((state) => ({
                episodes: state.episodes.filter((e) => e.personId !== personId),
                tasks: state.tasks.filter((t) => t.personId !== personId),
                careUpdates: state.careUpdates.filter((u) => u.personId !== personId),
                timelineEvents: state.timelineEvents.filter((ev) => ev.personId !== personId),
                serviceRequests: state.serviceRequests.filter((s) => s.personId !== personId),
                offlineQueue: state.offlineQueue.filter(
                  (op) => op.payload?.profileId !== personId && op.payload?.personId !== personId
                ),
                isLoading: false,
                error: isAccessRevoked
                  ? 'Access to this care profile has been revoked'
                  : 'Care profile not found or access revoked',
              }));

              if (profileState.selectedMemberId === personId) {
                const remaining = profileState.members?.filter((m) => m.id !== personId) || [];
                if (remaining.length > 0) {
                  profileState.selectMember(remaining[0].id);
                }
              }
              return;
            }
          }

          set({ isLoading: false, error: err.message || 'Sync failed' });
        }
      },

      loadCareData: async (personId: string) => {
        await get().fetchCareForPerson(personId);
      },

      syncOfflineQueue: async () => {
        const queue = get().offlineQueue;
        if (!queue.length || get().isSyncing) return;

        set({ isSyncing: true });
        const remainingQueue: OfflineMutation[] = [];

        for (const op of queue) {
          try {
            if (op.entityType === 'task' && op.opType === 'create') {
              const serverTask = await careApi.createTask({
                ...(op.payload as any),
                clientOpId: op.clientOpId,
              });
              set((state) => ({
                tasks: state.tasks.map((t) =>
                  t.id === op.entityId ? { ...t, id: serverTask.id } : t
                ),
              }));
            } else if (op.entityType === 'task' && op.opType === 'update') {
              await careApi.updateTask(op.entityId, op.payload);
            } else if (op.entityType === 'task' && op.opType === 'delete') {
              await careApi.deleteTask(op.entityId);
            } else if (op.entityType === 'update' && op.opType === 'create') {
              const serverUpdate = await careApi.addUpdate({
                ...(op.payload as any),
                clientOpId: op.clientOpId,
              });
              set((state) => ({
                careUpdates: state.careUpdates.map((u) =>
                  u.id === op.entityId ? { ...u, id: serverUpdate.id } : u
                ),
              }));
            } else if (op.entityType === 'episode' && op.opType === 'create') {
              const serverEpisode = await careApi.createEpisode({
                ...(op.payload as any),
                clientOpId: op.clientOpId,
              });
              set((state) => ({
                episodes: state.episodes.map((e) =>
                  e.id === op.entityId ? { ...e, id: serverEpisode.id } : e
                ),
              }));
            } else if (op.entityType === 'service_request' && op.opType === 'create') {
              const serverReq = await careApi.createServiceRequest({
                ...(op.payload as any),
                clientOpId: op.clientOpId,
              });
              set((state) => ({
                serviceRequests: state.serviceRequests.map((s) =>
                  s.id === op.entityId ? { ...s, id: serverReq.id } : s
                ),
              }));
            }
          } catch {
            // Keep in queue if failed
            remainingQueue.push({ ...op, retryCount: op.retryCount + 1 });
          }
        }

        set({ offlineQueue: remainingQueue, isSyncing: false });
      },

      // ============================================
      // EPISODE ACTIONS
      // ============================================

      createEpisode: async (data) => {
        const now = new Date().toISOString();
        const clientOpId = generateId();
        const clientEpisode: CareEpisode = {
          id: generateId(),
          ...data,
          episodeType: toCanonicalEpisodeType(data.episodeType || 'OTHER'),
          status: data.status ? toCanonicalEpisodeStatus(data.status) : 'ACTIVE',
          workflowStatus: toCanonicalWorkflowStatus(data.workflowStatus || 'RECOVERY_ONGOING'),
          createdAt: now,
          updatedAt: now,
        };

        // Optimistic local update
        set((state) => ({
          episodes: [clientEpisode, ...state.episodes],
        }));

        // Add timeline event
        get().addTimelineEvent({
          personId: data.personId,
          episodeId: clientEpisode.id,
          eventType: 'EPISODE_STARTED',
          title: `Care plan started: ${data.title}`,
          description: data.description,
          severity: 'normal',
        });

        const apiPayload: CreateEpisodeInput = {
          profileId: data.personId,
          title: data.title,
          episodeType: toCanonicalEpisodeType(data.episodeType || 'OTHER'),
          workflowStatus: toCanonicalWorkflowStatus(data.workflowStatus || 'RECOVERY_ONGOING'),
          startDate: data.startDate,
          targetEndDate: data.targetEndDate,
          goals: data.careGoals,
          description: data.description,
          facilityName: data.dischargeDetails?.hospitalName,
          dischargeDiagnosis: data.dischargeDetails?.primaryDiagnosis,
          clientOpId,
        };

        // Async server dispatch
        try {
          const serverEpisode = await careApi.createEpisode(apiPayload);

          // Replace client ID with canonical server ID
          set((state) => ({
            episodes: state.episodes.map((e) =>
              e.id === clientEpisode.id ? { ...e, id: serverEpisode.id } : e
            ),
          }));
          return { ...clientEpisode, id: serverEpisode.id };
        } catch {
          // Record to offline queue with SAME clientOpId and canonical payload
          set((state) => ({
            offlineQueue: [
              ...state.offlineQueue,
              {
                clientOpId,
                entityId: clientEpisode.id,
                entityType: 'episode',
                opType: 'create',
                payload: apiPayload,
                timestamp: now,
                retryCount: 0,
              },
            ],
          }));
          return clientEpisode;
        }
      },

      updateEpisode: async (id, updates) => {
        const previous = get().episodes.find((e) => e.id === id);
        set((state) => ({
          episodes: state.episodes.map((e) =>
            e.id === id ? { ...e, ...updates, updatedAt: new Date().toISOString() } : e
          ),
        }));

        try {
          await careApi.updateEpisode(id, updates as any);
        } catch {
          if (previous) {
            set((state) => ({
              episodes: state.episodes.map((e) => (e.id === id ? previous : e)),
              error: 'Internet connection is required to update episode',
            }));
          }
        }
      },

      setWorkflowStatus: async (id, status) => {
        const previous = get().episodes.find((e) => e.id === id);
        const canonicalStatus = toCanonicalWorkflowStatus(status);
        const episode = previous || get().episodes.find((e) => e.id === id);
        set((state) => ({
          episodes: state.episodes.map((e) =>
            e.id === id
              ? { ...e, workflowStatus: canonicalStatus, updatedAt: new Date().toISOString() }
              : e
          ),
        }));

        if (episode) {
          get().addTimelineEvent({
            personId: episode.personId,
            episodeId: episode.id,
            eventType: 'status_change',
            title: `Care status: ${WORKFLOW_STATUS_LABELS[canonicalStatus] || canonicalStatus}`,
            description: `Episode workflow status updated to ${WORKFLOW_STATUS_LABELS[canonicalStatus] || canonicalStatus}`,
            severity: canonicalStatus === 'NEEDS_ATTENTION' ? 'attention' : 'normal',
          });
        }

        try {
          await careApi.updateEpisode(id, { workflowStatus: canonicalStatus as any });
        } catch {
          if (previous) {
            set((state) => ({
              episodes: state.episodes.map((e) => (e.id === id ? previous : e)),
              error: 'Internet connection is required to update care status',
            }));
          }
        }
      },

      completeEpisode: async (id) => {
        const previous = get().episodes.find((e) => e.id === id);
        const now = new Date().toISOString();
        set((state) => ({
          episodes: state.episodes.map((e) =>
            e.id === id
              ? {
                  ...e,
                  status: 'COMPLETED',
                  workflowStatus: 'EPISODE_COMPLETE',
                  completedAt: now,
                  updatedAt: now,
                }
              : e
          ),
        }));

        try {
          await careApi.updateEpisode(id, {
            status: 'COMPLETED',
            workflowStatus: 'EPISODE_COMPLETE',
          });
        } catch {
          if (previous) {
            set((state) => ({
              episodes: state.episodes.map((e) => (e.id === id ? previous : e)),
              error: 'Internet connection is required to complete episode',
            }));
          }
        }
      },

      getActiveEpisodeForPerson: (personId) => {
        return get().episodes.find(
          (e) => e.personId === personId && (e.status === 'active' || e.status === 'ACTIVE')
        );
      },

      getEpisodesForPerson: (personId) => {
        return get().episodes.filter((e) => e.personId === personId);
      },

      // ============================================
      // TASK ACTIONS
      // ============================================

      createTask: async (data) => {
        const now = new Date().toISOString();
        const clientOpId = generateId();
        const clientTask: CareTask = {
          id: generateId(),
          ...data,
          taskType: toCanonicalTaskType(data.taskType),
          ownerType: toCanonicalTaskOwner(data.ownerType),
          priority: toCanonicalPriority(data.priority),
          status: toCanonicalTaskStatus(data.status || 'PENDING'),
          dueAt: data.dueAt ?? null,
          createdAt: now,
          updatedAt: now,
        };

        set((state) => ({
          tasks: [clientTask, ...state.tasks],
        }));

        // Log timeline event
        get().addTimelineEvent({
          personId: data.personId,
          episodeId: data.episodeId,
          eventType: 'TASK_CREATED',
          title: `Task created: ${data.title}`,
          description: data.description,
          severity:
            data.priority === 'urgent' || data.priority === 'URGENT' ? 'attention' : 'normal',
        });

        const apiPayload: CreateTaskInput = {
          profileId: data.personId,
          episodeId: data.episodeId,
          title: data.title,
          description: data.description,
          type: toCanonicalTaskType(data.taskType),
          ownerType: toCanonicalTaskOwner(data.ownerType),
          ownerId: data.ownerId,
          ownerName: data.ownerName,
          dueAt: data.dueAt ?? null,
          priority: toCanonicalPriority(data.priority),
          status: toCanonicalTaskStatus(data.status || 'PENDING'),
          clientOpId,
        };

        // Server dispatch
        try {
          const serverTask = await careApi.createTask(apiPayload);

          set((state) => ({
            tasks: state.tasks.map((t) =>
              t.id === clientTask.id ? { ...t, id: serverTask.id } : t
            ),
          }));
          return { ...clientTask, id: serverTask.id };
        } catch {
          set((state) => ({
            offlineQueue: [
              ...state.offlineQueue,
              {
                clientOpId,
                entityId: clientTask.id,
                entityType: 'task',
                opType: 'create',
                payload: apiPayload,
                timestamp: now,
                retryCount: 0,
              },
            ],
          }));
          return clientTask;
        }
      },

      updateTask: async (id, updates) => {
        const previous = get().tasks.find((t) => t.id === id);
        set((state) => ({
          tasks: state.tasks.map((t) =>
            t.id === id ? { ...t, ...updates, updatedAt: new Date().toISOString() } : t
          ),
        }));

        try {
          await careApi.updateTask(id, updates as any);
        } catch {
          if (previous) {
            set((state) => ({
              tasks: state.tasks.map((t) => (t.id === id ? previous : t)),
              error: 'Internet connection is required to update task',
            }));
          }
        }
      },

      assignTask: async (id, ownerType, ownerId, ownerName) => {
        const previous = get().tasks.find((t) => t.id === id);
        const canonicalOwner = toCanonicalTaskOwner(ownerType);
        set((state) => ({
          tasks: state.tasks.map((t) =>
            t.id === id
              ? {
                  ...t,
                  ownerType: canonicalOwner,
                  ownerId,
                  ownerName,
                  updatedAt: new Date().toISOString(),
                }
              : t
          ),
        }));

        try {
          await careApi.updateTask(id, {
            ownerType: canonicalOwner,
            ownerId,
            ownerName,
          });
        } catch {
          if (previous) {
            set((state) => ({
              tasks: state.tasks.map((t) => (t.id === id ? previous : t)),
              error: 'Internet connection is required to assign task',
            }));
          }
        }
      },

      completeTask: async (id, notes) => {
        const previous = get().tasks.find((t) => t.id === id);
        const now = new Date().toISOString();

        set((state) => ({
          tasks: state.tasks.map((t) =>
            t.id === id
              ? {
                  ...t,
                  status: 'COMPLETED',
                  completedAt: now,
                  completionNotes: notes,
                  updatedAt: now,
                }
              : t
          ),
        }));

        if (previous) {
          get().addTimelineEvent({
            personId: previous.personId,
            episodeId: previous.episodeId,
            eventType: 'TASK_COMPLETED',
            title: `Completed: ${previous.title}`,
            description: notes,
            severity: 'normal',
          });
        }

        try {
          await careApi.updateTask(id, {
            status: 'COMPLETED',
            completionNotes: notes,
          });
        } catch {
          if (previous) {
            set((state) => ({
              tasks: state.tasks.map((t) => (t.id === id ? previous : t)),
              error: 'Internet connection is required to complete task',
            }));
          }
        }
      },

      reopenTask: async (id) => {
        const previous = get().tasks.find((t) => t.id === id);
        set((state) => ({
          tasks: state.tasks.map((t) =>
            t.id === id
              ? {
                  ...t,
                  status: 'PENDING',
                  completedAt: undefined,
                  updatedAt: new Date().toISOString(),
                }
              : t
          ),
        }));

        try {
          await careApi.updateTask(id, { status: 'PENDING' });
        } catch {
          if (previous) {
            set((state) => ({
              tasks: state.tasks.map((t) => (t.id === id ? previous : t)),
              error: 'Internet connection is required to reopen task',
            }));
          }
        }
      },

      deleteTask: async (id) => {
        const previous = get().tasks.find((t) => t.id === id);
        set((state) => ({
          tasks: state.tasks.filter((t) => t.id !== id),
        }));

        try {
          await careApi.deleteTask(id);
        } catch {
          if (previous) {
            set((state) => ({
              tasks: [...state.tasks, previous],
              error: 'Internet connection is required to delete task',
            }));
          }
        }
      },

      getTasksForPerson: (personId) => {
        return get().tasks.filter((t) => t.personId === personId);
      },

      getTasksDueToday: (personId) => {
        const todayStr = new Date().toISOString().split('T')[0];
        return get().tasks.filter((t) => {
          if (t.personId !== personId) return false;
          if (t.status === 'completed' || t.status === 'COMPLETED' || t.status === 'CANCELLED')
            return false;
          if (!t.dueAt) return false;
          const dueDay = t.dueAt.split('T')[0];
          return dueDay === todayStr;
        });
      },

      getOverdueTasks: (personId) => {
        const todayStr = new Date().toISOString().split('T')[0];
        return get().tasks.filter((t) => {
          if (t.personId !== personId) return false;
          if (t.status === 'completed' || t.status === 'COMPLETED' || t.status === 'CANCELLED')
            return false;
          if (!t.dueAt) return false;
          const dueDay = t.dueAt.split('T')[0];
          return dueDay < todayStr;
        });
      },

      // ============================================
      // TIMELINE ACTIONS
      // ============================================

      addTimelineEvent: (data) => {
        const event: CareTimelineEvent = {
          id: generateId(),
          timestamp: data.timestamp || new Date().toISOString(),
          ...data,
        };

        set((state) => ({
          timelineEvents: [event, ...state.timelineEvents],
        }));

        return event;
      },

      getTimelineForPerson: (personId) => {
        return get()
          .timelineEvents.filter((ev) => ev.personId === personId)
          .sort((a, b) => new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime());
      },

      // ============================================
      // CARE UPDATES
      // ============================================

      addCareUpdate: async (data) => {
        const clientOpId = generateId();
        const update: CareUpdate = {
          id: generateId(),
          createdAt: new Date().toISOString(),
          ...data,
        };

        set((state) => ({
          careUpdates: [update, ...state.careUpdates],
        }));

        // Log corresponding timeline event
        get().addTimelineEvent({
          personId: data.personId,
          eventType: 'CARE_UPDATE',
          title: `Update from ${data.authorName}`,
          description: data.note,
          severity: data.category === 'symptom' ? 'attention' : 'normal',
        });

        const apiPayload = {
          profileId: data.personId,
          text: data.note,
          category: data.category,
          clientOpId,
        };

        try {
          const serverUpdate = await careApi.addUpdate(apiPayload);
          set((state) => ({
            careUpdates: state.careUpdates.map((u) =>
              u.id === update.id ? { ...u, id: serverUpdate.id } : u
            ),
          }));
          return { ...update, id: serverUpdate.id };
        } catch {
          set((state) => ({
            offlineQueue: [
              ...state.offlineQueue,
              {
                clientOpId,
                entityId: update.id,
                entityType: 'update',
                opType: 'create',
                payload: apiPayload,
                timestamp: new Date().toISOString(),
                retryCount: 0,
              },
            ],
          }));
          return update;
        }
      },

      getUpdatesForPerson: (personId) => {
        return get()
          .careUpdates.filter((u) => u.personId === personId)
          .sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());
      },

      // ============================================
      // SERVICE REQUESTS
      // ============================================

      createServiceRequest: async (data) => {
        const now = new Date().toISOString();
        const clientOpId = generateId();
        const request: CareServiceRequest = {
          id: generateId(),
          requestedAt: now,
          updatedAt: now,
          ...data,
          status: toCanonicalServiceRequestStatus(data.status || 'REQUESTED'),
        };

        set((state) => ({
          serviceRequests: [request, ...state.serviceRequests],
        }));

        get().addTimelineEvent({
          personId: data.personId,
          episodeId: data.episodeId,
          eventType: 'SERVICE_REQUESTED',
          title: `Service requested: ${data.serviceTitle}`,
          description: data.notes,
          severity: 'normal',
        });

        const apiPayload: CreateServiceRequestInput = {
          profileId: data.personId,
          episodeId: data.episodeId,
          taskId: data.linkedTaskId,
          serviceType: data.serviceCategory,
          title: data.serviceTitle,
          description: data.notes,
          clientOpId,
        };

        try {
          const serverReq = await careApi.createServiceRequest(apiPayload);

          set((state) => ({
            serviceRequests: state.serviceRequests.map((s) =>
              s.id === request.id ? { ...s, id: serverReq.id } : s
            ),
          }));
          return { ...request, id: serverReq.id };
        } catch {
          set((state) => ({
            offlineQueue: [
              ...state.offlineQueue,
              {
                clientOpId,
                entityId: request.id,
                entityType: 'service_request',
                opType: 'create',
                payload: apiPayload,
                timestamp: now,
                retryCount: 0,
              },
            ],
          }));
          return request;
        }
      },

      cancelServiceRequest: async (id) => {
        const previous = get().serviceRequests.find((r) => r.id === id);
        set((state) => ({
          serviceRequests: state.serviceRequests.map((r) =>
            r.id === id ? { ...r, status: 'CANCELLED', updatedAt: new Date().toISOString() } : r
          ),
        }));

        try {
          await careApi.cancelServiceRequest(id);
        } catch {
          if (previous) {
            set((state) => ({
              serviceRequests: state.serviceRequests.map((r) => (r.id === id ? previous : r)),
              error: 'Internet connection is required to cancel service request',
            }));
          }
        }
      },

      updateServiceRequestStatus: (id, status, statusMessage, providerName) => {
        // Operational fulfillment events are server-authoritative.
        set((state) => ({
          serviceRequests: state.serviceRequests.map((r) =>
            r.id === id
              ? {
                  ...r,
                  status: toCanonicalServiceRequestStatus(status),
                  statusMessage,
                  providerName: providerName || r.providerName,
                  updatedAt: new Date().toISOString(),
                }
              : r
          ),
        }));
      },

      getServiceRequestsForPerson: (personId) => {
        return get().serviceRequests.filter((r) => r.personId === personId);
      },

      // ============================================
      // COLLABORATORS
      // ============================================

      inviteCollaborator: (data) => {
        const collab: CaregiverCollaborator = {
          id: generateId(),
          invitedAt: new Date().toISOString(),
          status: 'invited',
          ...data,
        };

        set((state) => ({
          collaborators: [collab, ...state.collaborators],
        }));

        return collab;
      },

      updateCollaboratorRole: (id, role, permissions) => {
        set((state) => ({
          collaborators: state.collaborators.map((c) =>
            c.id === id
              ? {
                  ...c,
                  role,
                  permissions: permissions || c.permissions,
                }
              : c
          ),
        }));
      },

      removeCollaborator: (id) => {
        set((state) => ({
          collaborators: state.collaborators.filter((c) => c.id !== id),
        }));
      },

      getCollaboratorsForPerson: (personId) => {
        return get().collaborators.filter((c) => c.personId === personId);
      },

      // ============================================
      // RESET STORE
      // ============================================

      resetCareStore: () => {
        set({ ...initialState });
      },
    }),
    {
      name: 'carebow-care-store',
      storage: createJSONStorage(() => AsyncStorage),
      partialize: (state) => ({
        episodes: state.episodes,
        tasks: state.tasks,
        careUpdates: state.careUpdates,
        timelineEvents: state.timelineEvents,
        serviceRequests: state.serviceRequests,
        collaborators: state.collaborators,
        offlineQueue: state.offlineQueue,
        lastSyncedAt: state.lastSyncedAt,
      }),
    }
  )
);

function profileIdFromEvent(ev: any, fallback: string): string {
  if (ev.profileId) return ev.profileId;
  return fallback;
}
