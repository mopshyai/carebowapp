/**
 * Unit tests for Care Store
 * Validates domain model operations:
 * - Server-authoritative state & zero fabricated seed data
 * - Episode creation & workflow status
 * - Task creation, assignment, completion, and filters (today, overdue)
 * - Timeline event generation & chronological ordering
 * - Care updates & notes
 * - Service request lifecycle (requested -> matching -> scheduled -> completed)
 * - Family caregiver roles, permissions, and revocation
 * - Offline queue mutation tracking
 */

import { act } from 'react';
import { useCareStore } from './useCareStore';
import { ROLE_DEFAULT_PERMISSIONS } from '../types/care';
import { careApi } from '../services/api/endpoints/care';

jest.mock('../services/api/endpoints/care', () => ({
  careApi: {
    getEpisodes: jest.fn().mockResolvedValue([]),
    getActiveEpisode: jest.fn().mockResolvedValue(null),
    getEpisodeById: jest.fn(),
    createEpisode: jest.fn().mockImplementation((data) =>
      Promise.resolve({
        id: data.id || 'ep_server_' + Math.random().toString(36).substring(2, 9),
        profileId: data.profileId,
        title: data.title,
        episodeType: data.episodeType || 'HOSPITAL_DISCHARGE',
        status: 'ACTIVE',
        workflowStatus: data.workflowStatus || 'RECOVERY_ONGOING',
        startDate: data.startDate || '2026-09-26',
        goals: data.goals || [],
        description: data.description,
        createdAt: '2026-09-26T00:00:00.000Z',
        updatedAt: '2026-09-26T00:00:00.000Z',
      })
    ),
    updateEpisode: jest.fn().mockResolvedValue({}),
    getTasks: jest.fn().mockResolvedValue([]),
    createTask: jest.fn().mockImplementation((data) =>
      Promise.resolve({
        id: data.id || 'task_server_' + Math.random().toString(36).substring(2, 9),
        profileId: data.profileId,
        episodeId: data.episodeId,
        title: data.title,
        description: data.description,
        type: data.type || 'TASK',
        ownerType: data.ownerType || 'CAREGIVER',
        ownerName: data.ownerName,
        dueAt: data.dueAt,
        priority: data.priority || 'MEDIUM',
        status: data.status || 'PENDING',
        source: data.source || 'care_plan',
        createdAt: '2026-09-26T00:00:00.000Z',
        updatedAt: '2026-09-26T00:00:00.000Z',
      })
    ),
    updateTask: jest.fn().mockResolvedValue({}),
    deleteTask: jest.fn().mockResolvedValue({}),
    addCareUpdate: jest.fn().mockImplementation((data) =>
      Promise.resolve({
        id: 'upd_server_1',
        profileId: data.profileId,
        authorId: data.authorId,
        authorName: data.authorName,
        text: data.text,
        category: data.category,
        createdAt: '2026-09-26T00:00:00.000Z',
        updatedAt: '2026-09-26T00:00:00.000Z',
      })
    ),
    getTimeline: jest.fn().mockResolvedValue([]),
    getServiceRequests: jest.fn().mockResolvedValue([]),
    createServiceRequest: jest.fn().mockImplementation((data) =>
      Promise.resolve({
        id: 'sr_server_1',
        profileId: data.profileId,
        serviceType: data.serviceType,
        title: data.title,
        status: 'REQUESTED',
        assignedTo: 'CareBow Coordination Team',
        requestedDate: data.requestedDate,
        createdAt: '2026-09-26T00:00:00.000Z',
        updatedAt: '2026-09-26T00:00:00.000Z',
      })
    ),
    cancelServiceRequest: jest.fn().mockResolvedValue({}),
    extractDischarge: jest.fn(),
    confirmDischarge: jest.fn(),
  },
}));

describe('useCareStore', () => {
  beforeEach(() => {
    act(() => {
      useCareStore.getState().resetCareStore();
    });
    jest.clearAllMocks();
  });

  describe('Truthful Empty State (P0-1)', () => {
    it('initializes with zero fabricated episodes, zero tasks, zero updates', () => {
      const state = useCareStore.getState();
      expect(state.episodes).toHaveLength(0);
      expect(state.tasks).toHaveLength(0);
      expect(state.timelineEvents).toHaveLength(0);
      expect(state.careUpdates).toHaveLength(0);
      expect(state.serviceRequests).toHaveLength(0);
      expect(state.offlineQueue).toHaveLength(0);
    });
  });

  describe('Care Episodes', () => {
    it('creates an episode and generates a timeline event', async () => {
      let episode: any;
      await act(async () => {
        episode = await useCareStore.getState().createEpisode({
          personId: 'person_mom',
          title: 'Hospital Discharge Recovery',
          episodeType: 'hospital_discharge',
          startDate: '2026-09-26',
          status: 'active',
          workflowStatus: 'recovery_ongoing',
          source: 'hospital_discharge',
          careGoals: ['Take medications on time', 'Schedule cardiology follow-up'],
        });
      });

      expect(episode.id).toBeDefined();
      expect(episode.title).toBe('Hospital Discharge Recovery');
      expect(useCareStore.getState().episodes).toHaveLength(1);

      const activeEp = useCareStore.getState().getActiveEpisodeForPerson('person_mom');
      expect(activeEp?.id).toBe(episode.id);

      // Verify timeline event was automatically generated
      const timeline = useCareStore.getState().getTimelineForPerson('person_mom');
      expect(timeline.length).toBeGreaterThanOrEqual(1);
      expect(timeline[0].title).toContain('Care plan started');
    });

    it('updates workflow status and records timeline event', async () => {
      let episode: any;
      await act(async () => {
        episode = await useCareStore.getState().createEpisode({
          personId: 'person_mom',
          title: 'Hospital Recovery',
          episodeType: 'hospital_discharge',
          startDate: '2026-09-26',
          status: 'active',
          workflowStatus: 'recovery_ongoing',
          source: 'hospital_discharge',
          careGoals: [],
        });
      });

      await act(async () => {
        await useCareStore.getState().setWorkflowStatus(episode.id, 'needs_attention');
      });

      const updated = useCareStore.getState().episodes.find((e) => e.id === episode.id);
      expect(updated?.workflowStatus).toBe('NEEDS_ATTENTION');

      const timeline = useCareStore.getState().getTimelineForPerson('person_mom');
      const statusEvent = timeline.find(
        (e) =>
          e.title.includes('needs attention') ||
          e.title.includes('NEEDS_ATTENTION') ||
          e.title.includes('Action needed')
      );
      expect(statusEvent).toBeDefined();
      expect(statusEvent?.severity).toBe('attention');
    });

    it('completes an episode and updates status', async () => {
      let episode: any;
      await act(async () => {
        episode = await useCareStore.getState().createEpisode({
          personId: 'person_mom',
          title: 'Post-op Recovery',
          episodeType: 'surgery_recovery',
          startDate: '2026-09-01',
          status: 'active',
          workflowStatus: 'recovery_ongoing',
          source: 'hospital_discharge',
          careGoals: [],
        });
      });

      await act(async () => {
        await useCareStore.getState().completeEpisode(episode.id);
      });

      const activeEp = useCareStore.getState().getActiveEpisodeForPerson('person_mom');
      expect(activeEp).toBeUndefined();

      const ep = useCareStore.getState().episodes.find((e) => e.id === episode.id);
      expect(ep?.status).toBe('COMPLETED');
      expect(ep?.completedAt).toBeDefined();
    });
  });

  describe('Care Tasks', () => {
    it('creates and assigns a task', async () => {
      let task: any;
      await act(async () => {
        task = await useCareStore.getState().createTask({
          personId: 'person_mom',
          title: 'Morning medication check',
          taskType: 'medication',
          ownerType: 'caregiver',
          ownerName: 'Primary Caregiver',
          dueAt: new Date().toISOString(),
          status: 'pending',
          priority: 'urgent',
          source: 'discharge_instructions',
        });
      });

      expect(task.id).toBeDefined();
      expect(task.status).toBe('PENDING');
      expect(useCareStore.getState().tasks).toHaveLength(1);

      // Reassign to CareBow
      await act(async () => {
        await useCareStore
          .getState()
          .assignTask(task.id, 'carebow', undefined, 'CareBow Coordination');
      });

      const updated = useCareStore.getState().tasks.find((t) => t.id === task.id);
      expect(updated?.ownerType).toBe('CAREBOW');
      expect(updated?.ownerName).toBe('CareBow Coordination');
    });

    it('completes and reopens a task', async () => {
      let task: any;
      await act(async () => {
        task = await useCareStore.getState().createTask({
          personId: 'person_mom',
          title: 'Log Blood Pressure',
          taskType: 'VITALS',
          ownerType: 'CARE_RECIPIENT',
          ownerName: 'Mom',
          dueAt: new Date().toISOString(),
          status: 'PENDING',
          priority: 'MEDIUM',
          source: 'caregiver_manual',
        });
      });

      await act(async () => {
        await useCareStore.getState().completeTask(task.id, '122/78 mmHg recorded');
      });

      let updated = useCareStore.getState().tasks.find((t) => t.id === task.id);
      expect(updated?.status).toBe('COMPLETED');
      expect(updated?.completedAt).toBeDefined();
      expect(updated?.completionNotes).toBe('122/78 mmHg recorded');

      await act(async () => {
        await useCareStore.getState().reopenTask(task.id);
      });

      updated = useCareStore.getState().tasks.find((t) => t.id === task.id);
      expect(updated?.status).toBe('PENDING');
      expect(updated?.completedAt).toBeUndefined();
    });

    it('correctly filters tasks due today and overdue tasks', async () => {
      const todayStr = new Date().toISOString().split('T')[0];
      const yesterdayStr = new Date(Date.now() - 86400000).toISOString().split('T')[0];
      const tomorrowStr = new Date(Date.now() + 86400000).toISOString().split('T')[0];

      await act(async () => {
        await useCareStore.getState().createTask({
          personId: 'person_mom',
          title: 'Task Due Today',
          taskType: 'GENERAL',
          ownerType: 'CAREGIVER',
          dueAt: `${todayStr}T10:00:00.000Z`,
          status: 'PENDING',
          priority: 'MEDIUM',
          source: 'care_plan',
        });

        await useCareStore.getState().createTask({
          personId: 'person_mom',
          title: 'Task Overdue',
          taskType: 'APPOINTMENT',
          ownerType: 'CAREGIVER',
          dueAt: `${yesterdayStr}T10:00:00.000Z`,
          status: 'PENDING',
          priority: 'HIGH',
          source: 'care_plan',
        });

        await useCareStore.getState().createTask({
          personId: 'person_mom',
          title: 'Task Tomorrow',
          taskType: 'GENERAL',
          ownerType: 'CAREGIVER',
          dueAt: `${tomorrowStr}T10:00:00.000Z`,
          status: 'PENDING',
          priority: 'LOW',
          source: 'care_plan',
        });
      });

      const dueToday = useCareStore.getState().getTasksDueToday('person_mom');
      expect(dueToday).toHaveLength(1);
      expect(dueToday[0].title).toBe('Task Due Today');

      const overdue = useCareStore.getState().getOverdueTasks('person_mom');
      expect(overdue).toHaveLength(1);
      expect(overdue[0].title).toBe('Task Overdue');
    });

    it('undated tasks (dueAt: null or undefined) are neither due today nor overdue', async () => {
      await act(async () => {
        await useCareStore.getState().createTask({
          personId: 'person_mom',
          title: 'Undated Task',
          taskType: 'GENERAL',
          ownerType: 'CAREGIVER',
          dueAt: null,
          status: 'PENDING',
          priority: 'MEDIUM',
          source: 'caregiver_manual',
        });
      });

      const dueToday = useCareStore.getState().getTasksDueToday('person_mom');
      const undatedToday = dueToday.find((t) => t.title === 'Undated Task');
      expect(undatedToday).toBeUndefined();

      const overdue = useCareStore.getState().getOverdueTasks('person_mom');
      const undatedOverdue = overdue.find((t) => t.title === 'Undated Task');
      expect(undatedOverdue).toBeUndefined();
    });

    it('generates clientOpId before dispatch and preserves it in offlineQueue with canonical payload', async () => {
      (careApi.createTask as jest.Mock).mockRejectedValueOnce(new Error('Network disconnected'));

      await act(async () => {
        await useCareStore.getState().createTask({
          personId: 'person_mom',
          title: 'Offline Queue Task',
          taskType: 'MEDICATION',
          ownerType: 'CAREGIVER',
          dueAt: null,
          status: 'PENDING',
          priority: 'HIGH',
          source: 'caregiver_manual',
        });
      });

      const queue = useCareStore.getState().offlineQueue;
      expect(queue).toHaveLength(1);
      const queuedOp = queue[0];
      expect(queuedOp.entityType).toBe('task');
      expect(queuedOp.clientOpId).toBeDefined();
      expect(typeof queuedOp.clientOpId).toBe('string');
      expect(queuedOp.payload.profileId).toBe('person_mom');
      expect(queuedOp.payload.type).toBe('MEDICATION');
      expect(queuedOp.payload.dueAt).toBeNull();
      expect(queuedOp.payload.clientOpId).toBe(queuedOp.clientOpId);
    });
  });

  describe('Care Updates & Timeline', () => {
    it('adds a care update and reflects on the timeline', async () => {
      await act(async () => {
        await useCareStore.getState().addCareUpdate({
          personId: 'person_mom',
          authorId: 'auth_1',
          authorName: 'Priya (Daughter)',
          note: 'Mom walked 500 steps today and felt energetic.',
          category: 'milestone',
        });
      });

      const updates = useCareStore.getState().getUpdatesForPerson('person_mom');
      expect(updates).toHaveLength(1);
      expect(updates[0].note).toContain('500 steps');

      const timeline = useCareStore.getState().getTimelineForPerson('person_mom');
      const updateEv = timeline.find((e) => e.title.includes('Priya'));
      expect(updateEv).toBeDefined();
    });
  });

  describe('Service Requests', () => {
    it('tracks real-world execution state of service requests', async () => {
      let req: any;
      await act(async () => {
        req = await useCareStore.getState().createServiceRequest({
          personId: 'person_mom',
          serviceCategory: 'physio',
          serviceTitle: 'In-Home Physical Therapy',
          status: 'requested',
        });
      });

      expect(req.id).toBeDefined();
      expect(req.status).toBe('REQUESTED');

      // Update to matching (maps to canonical WAITING_PROVIDER)
      act(() => {
        useCareStore
          .getState()
          .updateServiceRequestStatus(
            req.id,
            'WAITING_PROVIDER',
            'Searching for certified PTs near your location'
          );
      });

      let current = useCareStore.getState().serviceRequests.find((r) => r.id === req.id);
      expect(current?.status).toBe('WAITING_PROVIDER');
      expect(current?.statusMessage).toContain('Searching');

      // Update to scheduled with provider
      act(() => {
        useCareStore
          .getState()
          .updateServiceRequestStatus(
            req.id,
            'SCHEDULED',
            'Physical therapist confirmed for Tuesday 10am',
            'Dr. Sarah Jenkins, PT'
          );
      });

      current = useCareStore.getState().serviceRequests.find((r) => r.id === req.id);
      expect(current?.status).toBe('SCHEDULED');
      expect(current?.providerName).toBe('Dr. Sarah Jenkins, PT');
    });
  });

  describe('Family Collaboration & Permissions', () => {
    it('invites a family member with default role permissions', () => {
      let collab: any;
      act(() => {
        collab = useCareStore.getState().inviteCollaborator({
          personId: 'person_mom',
          name: 'Priya Sharma',
          relationship: 'child',
          role: 'caregiver',
          email: 'priya@example.com',
          permissions: ROLE_DEFAULT_PERMISSIONS.caregiver,
        });
      });

      expect(collab.id).toBeDefined();
      expect(collab.status).toBe('invited');
      expect(collab.permissions).toContain('tasks');
      expect(collab.permissions).toContain('medications');

      const personCollabs = useCareStore.getState().getCollaboratorsForPerson('person_mom');
      expect(personCollabs).toHaveLength(1);
    });

    it('updates role and revokes access', () => {
      let collab: any;
      act(() => {
        collab = useCareStore.getState().inviteCollaborator({
          personId: 'person_mom',
          name: 'Raj',
          relationship: 'sibling',
          role: 'authorized_viewer',
          permissions: ROLE_DEFAULT_PERMISSIONS.authorized_viewer,
        });
      });

      // Update role to caregiver
      act(() => {
        useCareStore
          .getState()
          .updateCollaboratorRole(collab.id, 'caregiver', ROLE_DEFAULT_PERMISSIONS.caregiver);
      });

      let updated = useCareStore.getState().collaborators.find((c) => c.id === collab.id);
      expect(updated?.role).toBe('caregiver');
      expect(updated?.permissions).toContain('tasks');

      // Revoke access
      act(() => {
        useCareStore.getState().removeCollaborator(collab.id);
      });

      updated = useCareStore.getState().collaborators.find((c) => c.id === collab.id);
      expect(updated).toBeUndefined();
    });
  });

  describe('Offline Queue & Resiliency', () => {
    it('queues mutation when network is unavailable and keeps optimistic state', async () => {
      // Simulate network failure
      (careApi.createTask as jest.Mock).mockRejectedValueOnce(new Error('Network error'));

      let task: any;
      await act(async () => {
        task = await useCareStore.getState().createTask({
          personId: 'person_mom',
          title: 'Offline Medication Check',
          taskType: 'medication',
          ownerType: 'caregiver',
          dueAt: new Date().toISOString(),
          status: 'pending',
          priority: 'high',
          source: 'care_plan',
        });
      });

      // Optimistic state exists in store
      expect(task.id).toBeDefined();
      expect(useCareStore.getState().tasks.some((t) => t.id === task.id)).toBe(true);

      // Operation recorded in offlineQueue with idempotency clientOpId
      const queue = useCareStore.getState().offlineQueue;
      expect(queue.length).toBeGreaterThanOrEqual(1);
      const queueItem = queue.find((q) => q.entityId === task.id);
      expect(queueItem).toBeDefined();
      expect(queueItem?.entityType).toBe('task');
      expect(queueItem?.clientOpId).toBeDefined();
    });
  });
});
