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
} from '../types/care';
import { generateId } from '../types/profile';
import { careApi } from '../services/api/endpoints/care';

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
            careApi.getEpisodes(personId).catch(() => []),
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
            ownerId: t.ownerId || undefined,
            ownerName: t.ownerName || undefined,
            dueAt: t.dueAt || new Date().toISOString(),
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
          set({ isLoading: false, error: err.message || 'Sync failed' });
        }
      },

      syncOfflineQueue: async () => {
        const queue = get().offlineQueue;
        if (!queue.length || get().isSyncing) return;

        set({ isSyncing: true });
        const remainingQueue: OfflineMutation[] = [];

        for (const op of queue) {
          try {
            if (op.entityType === 'task' && op.opType === 'create') {
              await careApi.createTask(op.payload as any);
            } else if (op.entityType === 'task' && op.opType === 'update') {
              await careApi.updateTask(op.entityId, op.payload);
            } else if (op.entityType === 'task' && op.opType === 'delete') {
              await careApi.deleteTask(op.entityId);
            } else if (op.entityType === 'update' && op.opType === 'create') {
              await careApi.addUpdate(op.payload as any);
            } else if (op.entityType === 'episode' && op.opType === 'create') {
              await careApi.createEpisode(op.payload as any);
            } else if (op.entityType === 'service_request' && op.opType === 'create') {
              await careApi.createServiceRequest(op.payload as any);
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
        const clientEpisode: CareEpisode = {
          id: generateId(),
          ...data,
          status: 'active',
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

        // Async server dispatch
        try {
          const serverEpisode = await careApi.createEpisode({
            profileId: data.personId,
            title: data.title,
            episodeType: data.episodeType as any,
            workflowStatus: toCanonicalWorkflowStatus(
              data.workflowStatus || 'RECOVERY_ONGOING'
            ) as any,
            startDate: data.startDate,
            targetEndDate: data.targetEndDate,
            goals: data.careGoals,
            description: data.description,
            facilityName: data.dischargeDetails?.hospitalName,
            dischargeDiagnosis: data.dischargeDetails?.primaryDiagnosis,
          });

          // Replace client ID with canonical server ID
          set((state) => ({
            episodes: state.episodes.map((e) =>
              e.id === clientEpisode.id ? { ...e, id: serverEpisode.id } : e
            ),
          }));
          return { ...clientEpisode, id: serverEpisode.id };
        } catch {
          // Record to offline queue
          set((state) => ({
            offlineQueue: [
              ...state.offlineQueue,
              {
                clientOpId: generateId(),
                entityId: clientEpisode.id,
                entityType: 'episode',
                opType: 'create',
                payload: data,
                timestamp: now,
                retryCount: 0,
              },
            ],
          }));
          return clientEpisode;
        }
      },

      updateEpisode: async (id, updates) => {
        set((state) => ({
          episodes: state.episodes.map((e) =>
            e.id === id ? { ...e, ...updates, updatedAt: new Date().toISOString() } : e
          ),
        }));

        try {
          await careApi.updateEpisode(id, updates as any);
        } catch {
          // offline queue
        }
      },

      setWorkflowStatus: async (id, status) => {
        const canonicalStatus = toCanonicalWorkflowStatus(status);
        const episode = get().episodes.find((e) => e.id === id);
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
          // offline queue
        }
      },

      completeEpisode: async (id) => {
        const now = new Date().toISOString();
        set((state) => ({
          episodes: state.episodes.map((e) =>
            e.id === id
              ? {
                  ...e,
                  status: 'completed',
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
          // offline queue
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
        const clientTask: CareTask = {
          id: generateId(),
          ...data,
          taskType: toCanonicalTaskType(data.taskType),
          ownerType: toCanonicalTaskOwner(data.ownerType),
          priority: toCanonicalPriority(data.priority),
          status: toCanonicalTaskStatus(data.status || 'PENDING'),
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

        // Server dispatch
        try {
          const serverTask = await careApi.createTask({
            profileId: data.personId,
            episodeId: data.episodeId,
            title: data.title,
            description: data.description,
            type: toCanonicalTaskType(data.taskType),
            ownerType: toCanonicalTaskOwner(data.ownerType),
            ownerId: data.ownerId,
            ownerName: data.ownerName,
            dueAt: data.dueAt,
            priority: toCanonicalPriority(data.priority),
            status: toCanonicalTaskStatus(data.status || 'PENDING'),
          });

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
                clientOpId: generateId(),
                entityId: clientTask.id,
                entityType: 'task',
                opType: 'create',
                payload: data,
                timestamp: now,
                retryCount: 0,
              },
            ],
          }));
          return clientTask;
        }
      },

      updateTask: async (id, updates) => {
        set((state) => ({
          tasks: state.tasks.map((t) =>
            t.id === id ? { ...t, ...updates, updatedAt: new Date().toISOString() } : t
          ),
        }));

        try {
          await careApi.updateTask(id, updates as any);
        } catch {
          // offline queue
        }
      },

      assignTask: async (id, ownerType, ownerId, ownerName) => {
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
          // offline queue
        }
      },

      completeTask: async (id, notes) => {
        const now = new Date().toISOString();
        const existing = get().tasks.find((t) => t.id === id);

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

        if (existing) {
          get().addTimelineEvent({
            personId: existing.personId,
            episodeId: existing.episodeId,
            eventType: 'TASK_COMPLETED',
            title: `Completed: ${existing.title}`,
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
          // offline queue
        }
      },

      reopenTask: async (id) => {
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
          // offline queue
        }
      },

      deleteTask: async (id) => {
        set((state) => ({
          tasks: state.tasks.filter((t) => t.id !== id),
        }));

        try {
          await careApi.deleteTask(id);
        } catch {
          // offline queue
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
          if (!t.dueAt) return true;
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

        try {
          await careApi.addUpdate({
            profileId: data.personId,
            text: data.note,
            category: data.category,
          });
        } catch {
          // offline queue
        }

        return update;
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
        const request: CareServiceRequest = {
          id: generateId(),
          requestedAt: now,
          updatedAt: now,
          ...data,
          status: (data.status?.toUpperCase() as CareServiceRequestStatus) || 'REQUESTED',
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

        try {
          const serverReq = await careApi.createServiceRequest({
            profileId: data.personId,
            episodeId: data.episodeId,
            taskId: data.linkedTaskId,
            serviceType: data.serviceCategory,
            title: data.serviceTitle,
            description: data.notes,
          });

          set((state) => ({
            serviceRequests: state.serviceRequests.map((s) =>
              s.id === request.id ? { ...s, id: serverReq.id } : s
            ),
          }));
          return { ...request, id: serverReq.id };
        } catch {
          return request;
        }
      },

      cancelServiceRequest: async (id) => {
        set((state) => ({
          serviceRequests: state.serviceRequests.map((r) =>
            r.id === id ? { ...r, status: 'CANCELLED', updatedAt: new Date().toISOString() } : r
          ),
        }));

        try {
          await careApi.cancelServiceRequest(id);
        } catch {
          // offline queue
        }
      },

      updateServiceRequestStatus: (id, status, statusMessage, providerName) => {
        // Operational fulfillment events are server-authoritative.
        set((state) => ({
          serviceRequests: state.serviceRequests.map((r) =>
            r.id === id
              ? {
                  ...r,
                  status,
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
