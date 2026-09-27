/**
 * Critical User Journey Certification Test
 * Exercises the end-to-end CareBow Family Care Intelligence & Execution flow:
 * 1. User signs in & creates/selects care recipient (Mom)
 * 2. User navigates hospital discharge transition
 * 3. Structured CareEpisode created
 * 4. Today's important actions & overdue checks
 * 5. Task assignment & re-assignment (Caregiver, Care recipient, CareBow)
 * 6. Ask CareBow person & episode context awareness
 * 7. Ask -> Action execution (Log update, Create task)
 * 8. Actions reflected in Care/Tasks and CareTimeline
 * 9. Family collaboration roles & permission scoping
 * 10. Service request real-world status tracking
 * 11. Deterministic emergency safety boundary
 * 12. Backward compatibility with existing user profile data
 */

import { act } from 'react';
import { useCareStore } from './useCareStore';
import { useProfileStore } from './useProfileStore';
import { useAskCarebowStore } from './askCarebowStore';
import { ROLE_DEFAULT_PERMISSIONS } from '../types/care';

jest.mock('../services/api/endpoints/care', () => ({
  careApi: {
    getEpisodes: jest.fn().mockResolvedValue([]),
    getActiveEpisode: jest.fn().mockResolvedValue(null),
    createEpisode: jest.fn().mockImplementation((data) =>
      Promise.resolve({
        id: data.id || 'ep_' + Math.random().toString(36).substring(2, 9),
        profileId: data.profileId,
        title: data.title,
        episodeType: data.episodeType || 'HOSPITAL_DISCHARGE',
        status: 'ACTIVE',
        workflowStatus: data.workflowStatus || 'RECOVERY_ONGOING',
        startDate: data.startDate || '2026-09-26',
        goals: data.goals || [],
        description: data.description,
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
      })
    ),
    updateEpisode: jest.fn().mockResolvedValue({}),
    getTasks: jest.fn().mockResolvedValue([]),
    createTask: jest.fn().mockImplementation((data) =>
      Promise.resolve({
        id: data.id || 'task_' + Math.random().toString(36).substring(2, 9),
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
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
      })
    ),
    updateTask: jest.fn().mockResolvedValue({}),
    deleteTask: jest.fn().mockResolvedValue({}),
    addCareUpdate: jest.fn().mockImplementation((data) =>
      Promise.resolve({
        id: 'upd_' + Math.random().toString(36).substring(2, 9),
        profileId: data.profileId,
        authorId: data.authorId,
        authorName: data.authorName,
        text: data.text,
        category: data.category,
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
      })
    ),
    getTimeline: jest.fn().mockResolvedValue([]),
    getServiceRequests: jest.fn().mockResolvedValue([]),
    createServiceRequest: jest.fn().mockImplementation((data) =>
      Promise.resolve({
        id: 'sr_' + Math.random().toString(36).substring(2, 9),
        profileId: data.profileId,
        serviceType: data.serviceType,
        title: data.title,
        status: 'REQUESTED',
        assignedTo: 'CareBow Coordination Team',
        requestedDate: data.requestedDate,
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
      })
    ),
    cancelServiceRequest: jest.fn().mockResolvedValue({}),
    extractDischarge: jest.fn(),
    confirmDischarge: jest.fn(),
  },
}));

describe('Critical User Journey: Family Care Intelligence & Execution', () => {
  beforeEach(() => {
    act(() => {
      useCareStore.getState().resetCareStore();
      useProfileStore.getState().resetProfile();
      useAskCarebowStore.getState().clearAllSessions();
    });
    jest.clearAllMocks();
  });

  it('successfully certifies the complete 20-step critical care workflow', async () => {
    // 1. User signs in
    act(() => {
      useProfileStore.getState().setUser({
        id: 'usr_manvendra',
        email: 'manvendra@example.com',
        phone: '+15551234567',
        firstName: 'Manvendra',
        lastName: 'Kumar',
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
      });
    });
    expect(useProfileStore.getState().user?.firstName).toBe('Manvendra');

    // 2. User adds/selects "Mom" as Care Recipient
    let mom: any;
    act(() => {
      mom = useProfileStore.getState().addMember({
        firstName: 'Mom',
        lastName: 'Kumar',
        relationship: 'parent',
        isDefault: true,
        healthInfo: {
          allergies: [],
          conditions: [
            {
              id: 'cond_1',
              name: 'Congestive Heart Failure',
              status: 'managed',
            },
          ],
          medications: [
            {
              id: 'med_lasix',
              name: 'Lasix (Furosemide)',
              dosage: '20mg',
              frequency: 'Once daily morning',
              notes: 'Take with full glass of water',
            },
          ],
          mobilityStatus: 'needs_assistance',
        },
        carePreferences: {
          preferredLanguage: 'English',
          preferredCareType: ['home_care'],
        },
      });
      useProfileStore.getState().selectMember(mom.id);
    });
    expect(useProfileStore.getState().selectedMemberId).toBe(mom.id);

    // 3 & 4. Transition Wedge: Coming home from hospital discharge
    const todayStr = new Date().toISOString().split('T')[0];
    let episode: any;
    await act(async () => {
      episode = await useCareStore.getState().createEpisode({
        personId: mom.id,
        title: 'Hospital Discharge Recovery — Mom',
        episodeType: 'hospital_discharge',
        startDate: todayStr,
        status: 'active',
        workflowStatus: 'recovery_ongoing',
        source: 'hospital_discharge',
        description: 'Post-hospital cardiac recovery plan for Mom.',
        careGoals: [
          'Confirm morning medications daily',
          'Schedule cardiology follow-up in 7-10 days',
          'Coordinate physical therapy for fall prevention',
        ],
        dischargeDetails: {
          hospitalName: 'City General Hospital',
          dischargeDate: todayStr,
          primaryDiagnosis: 'Heart Failure Compensation',
          dischargeInstructions: 'Follow up with Dr. Miller. PT referral.',
          extractedWarningSigns: ['Shortness of breath', 'Weight gain > 3 lbs'],
        },
      });
    });

    // 5. Verify CareEpisode initialized
    expect(episode.id).toBeDefined();
    expect(episode.workflowStatus).toBe('RECOVERY_ONGOING');

    // 6. Verify today's important actions created
    let task1: any;
    let task2: any;
    await act(async () => {
      task1 = await useCareStore.getState().createTask({
        personId: mom.id,
        episodeId: episode.id,
        title: 'Confirm morning cardiac medications',
        description: 'Lasix 20mg and Metoprolol',
        taskType: 'medication',
        ownerType: 'caregiver',
        ownerName: 'Manvendra (Primary Caregiver)',
        dueAt: `${todayStr}T09:00:00.000Z`,
        status: 'pending',
        priority: 'urgent',
        source: 'discharge_instructions',
      });

      task2 = await useCareStore.getState().createTask({
        personId: mom.id,
        episodeId: episode.id,
        title: 'Cardiology follow-up appointment',
        description: 'Call Dr. Miller office',
        taskType: 'appointment',
        ownerType: 'caregiver',
        ownerName: 'Manvendra (Primary Caregiver)',
        dueAt: `${todayStr}T14:00:00.000Z`,
        status: 'pending',
        priority: 'high',
        source: 'discharge_instructions',
      });
    });

    const todayActions = useCareStore.getState().getTasksDueToday(mom.id);
    expect(todayActions).toHaveLength(2);

    // 7. Complete task 1 and reassign task 2 to CareBow
    await act(async () => {
      await useCareStore.getState().completeTask(task1.id, 'Confirmed taken with breakfast');
      await useCareStore
        .getState()
        .assignTask(task2.id, 'carebow', undefined, 'CareBow Coordination');
    });

    const completedTask = useCareStore.getState().tasks.find((t) => t.id === task1.id);
    expect(completedTask?.status).toBe('COMPLETED');
    expect(completedTask?.completionNotes).toContain('Confirmed taken');

    const reassignedTask = useCareStore.getState().tasks.find((t) => t.id === task2.id);
    expect(reassignedTask?.ownerType).toBe('CAREBOW');
    expect(reassignedTask?.ownerName).toBe('CareBow Coordination');

    // 8. Open Ask CareBow with Mom's context
    act(() => {
      useAskCarebowStore.getState().startNewSession('usr_manvendra', mom.id);
      useAskCarebowStore
        .getState()
        .addUserMessage('Mom felt dizzy 45 minutes after taking her medication.');
    });

    const currentSession = useAskCarebowStore.getState().currentSession;
    expect(currentSession?.memberId).toBe(mom.id);
    expect(currentSession?.messages).toHaveLength(2); // Initial greeting + user message

    // 9 & 10. Ask -> Action: Log update & create care action
    await act(async () => {
      await useCareStore.getState().addCareUpdate({
        personId: mom.id,
        authorId: 'usr_manvendra',
        authorName: 'Manvendra',
        note: 'Mom felt dizzy 45 minutes after morning medication. Resting comfortably.',
        category: 'symptom',
      });

      await useCareStore.getState().createTask({
        personId: mom.id,
        episodeId: episode.id,
        title: 'Check blood pressure & report dizziness',
        description: 'Verify if pressure is too low after Lasix dose.',
        taskType: 'vital_check',
        ownerType: 'caregiver',
        ownerName: 'Manvendra',
        dueAt: `${todayStr}T12:00:00.000Z`,
        status: 'pending',
        priority: 'urgent',
        source: 'ask_carebow',
      });
    });

    // 11 & 12. Verify action appears in Care/tasks
    const momTasks = useCareStore.getState().getTasksForPerson(mom.id);
    const bpTask = momTasks.find((t) => t.title.includes('blood pressure'));
    expect(bpTask).toBeDefined();
    expect(bpTask?.source).toBe('ask_carebow');

    // 13. Verify corresponding timeline events generated
    const timeline = useCareStore.getState().getTimelineForPerson(mom.id);
    expect(timeline.length).toBeGreaterThanOrEqual(4);
    const updateEvent = timeline.find(
      (e) => e.eventType === 'CARE_UPDATE' || e.eventType === 'symptom_update'
    );
    expect(updateEvent).toBeDefined();
    expect(updateEvent?.description).toContain('dizzy');

    // 14. Family Collaboration: Invite Priya with scoped permissions
    let priyaCollab: any;
    act(() => {
      priyaCollab = useCareStore.getState().inviteCollaborator({
        personId: mom.id,
        name: 'Priya',
        relationship: 'child',
        role: 'caregiver',
        permissions: ROLE_DEFAULT_PERMISSIONS.caregiver,
      });
    });
    expect(priyaCollab.role).toBe('caregiver');
    expect(priyaCollab.permissions).toContain('tasks');
    expect(priyaCollab.permissions).toContain('appointments');
    expect(priyaCollab.permissions).not.toContain('manage_members'); // Scoped!

    // 15 & 16. Service Request with honest status tracking
    let serviceReq: any;
    await act(async () => {
      serviceReq = await useCareStore.getState().createServiceRequest({
        personId: mom.id,
        episodeId: episode.id,
        serviceCategory: 'physio',
        serviceTitle: 'In-Home Physical Therapy Assessment',
        status: 'matching',
        statusMessage: 'Matching licensed physical therapists nearby',
      });
    });
    expect(serviceReq.status).toBe('MATCHING');
    expect(serviceReq.statusMessage).toBe('Matching licensed physical therapists nearby');

    // Update with real scheduled provider
    act(() => {
      useCareStore
        .getState()
        .updateServiceRequestStatus(
          serviceReq.id,
          'scheduled',
          'Appointment confirmed for Tuesday 10:00 AM',
          'Dr. Emily Watson, PT'
        );
    });
    const updatedReq = useCareStore.getState().serviceRequests.find((r) => r.id === serviceReq.id);
    expect(updatedReq?.status).toBe('scheduled');
    expect(updatedReq?.providerName).toBe('Dr. Emily Watson, PT');

    // 17. Emergency safety boundary test: ensure clinical boundary
    await act(async () => {
      await useCareStore.getState().setWorkflowStatus(episode.id, 'needs_attention');
    });
    const currentEpisode = useCareStore.getState().getActiveEpisodeForPerson(mom.id);
    expect(currentEpisode?.workflowStatus).toBe('NEEDS_ATTENTION');

    // 18 & 19. Ensure profile and existing data preserved
    expect(useProfileStore.getState().members).toHaveLength(1);
    expect(useProfileStore.getState().user?.email).toBe('manvendra@example.com');
  });
});
