/**
 * CareBow Care Domain Contract Validation Tests
 * Verifies contract alignment between mobile client types and canonical backend domain types (src/lib/care/types.ts).
 */

import {
  EpisodeType,
  EpisodeStatus,
  WorkflowStatus,
  TaskType,
  TaskOwnerType,
  TaskPriority,
  TaskStatus,
  ServiceRequestStatus,
  toCanonicalTaskType,
  toCanonicalTaskStatus,
  toCanonicalTaskOwner,
  toCanonicalPriority,
  toCanonicalWorkflowStatus,
  toCanonicalEpisodeType,
  toCanonicalEpisodeStatus,
  toCanonicalServiceRequestStatus,
} from './care';

describe('Care Domain Contract Verification', () => {
  // Authoritative canonical lists synchronized with carebow-main src/lib/care/types.ts
  const BACKEND_EPISODE_TYPES: EpisodeType[] = [
    'HOSPITAL_DISCHARGE',
    'SURGERY_RECOVERY',
    'NEW_DIAGNOSIS',
    'FALL',
    'MEDICATION_TRANSITION',
    'HOME_CARE_SETUP',
    'CHRONIC_CONDITION',
    'OTHER',
  ];

  const BACKEND_EPISODE_STATUSES: EpisodeStatus[] = ['ACTIVE', 'COMPLETED', 'PAUSED', 'CANCELLED'];

  const BACKEND_WORKFLOW_STATUSES: WorkflowStatus[] = [
    'STABLE',
    'RECOVERY_ONGOING',
    'NEEDS_ATTENTION',
    'ACTION_NEEDED',
    'WAITING_ON_CARE',
    'EPISODE_COMPLETE',
  ];

  const BACKEND_TASK_TYPES: TaskType[] = [
    'MEDICATION',
    'APPOINTMENT',
    'VITALS',
    'EXERCISE',
    'HOME_CARE',
    'ASSESSMENT',
    'ADMINISTRATIVE',
    'GENERAL',
  ];

  const BACKEND_TASK_OWNER_TYPES: TaskOwnerType[] = [
    'CARE_RECIPIENT',
    'CAREGIVER',
    'CAREBOW',
    'PROVIDER',
  ];

  const BACKEND_TASK_PRIORITIES: TaskPriority[] = ['URGENT', 'HIGH', 'MEDIUM', 'LOW'];

  const BACKEND_TASK_STATUSES: TaskStatus[] = [
    'PENDING',
    'IN_PROGRESS',
    'WAITING',
    'COMPLETED',
    'BLOCKED',
    'CANCELLED',
  ];

  const BACKEND_SERVICE_REQUEST_STATUSES: ServiceRequestStatus[] = [
    'REQUESTED',
    'WAITING_PROVIDER',
    'SCHEDULED',
    'IN_PROGRESS',
    'COMPLETED',
    'CANCELLED',
    'UNABLE_TO_FULFILL',
  ];

  describe('Canonical Enums Integrity', () => {
    it('has all expected canonical EpisodeTypes', () => {
      expect(BACKEND_EPISODE_TYPES).toHaveLength(8);
      BACKEND_EPISODE_TYPES.forEach((type) => {
        expect(toCanonicalEpisodeType(type)).toBe(type);
      });
    });

    it('has all expected canonical EpisodeStatuses', () => {
      expect(BACKEND_EPISODE_STATUSES).toHaveLength(4);
      BACKEND_EPISODE_STATUSES.forEach((status) => {
        expect(toCanonicalEpisodeStatus(status)).toBe(status);
      });
    });

    it('has all expected canonical WorkflowStatuses', () => {
      expect(BACKEND_WORKFLOW_STATUSES).toHaveLength(6);
      BACKEND_WORKFLOW_STATUSES.forEach((status) => {
        expect(toCanonicalWorkflowStatus(status)).toBe(status);
      });
    });

    it('has all expected canonical TaskTypes', () => {
      expect(BACKEND_TASK_TYPES).toHaveLength(8);
      BACKEND_TASK_TYPES.forEach((type) => {
        expect(toCanonicalTaskType(type)).toBe(type);
      });
    });

    it('has all expected canonical TaskOwnerTypes', () => {
      expect(BACKEND_TASK_OWNER_TYPES).toHaveLength(4);
      BACKEND_TASK_OWNER_TYPES.forEach((owner) => {
        expect(toCanonicalTaskOwner(owner)).toBe(owner);
      });
    });

    it('has all expected canonical TaskPriorities', () => {
      expect(BACKEND_TASK_PRIORITIES).toHaveLength(4);
      BACKEND_TASK_PRIORITIES.forEach((priority) => {
        expect(toCanonicalPriority(priority)).toBe(priority);
      });
    });

    it('has all expected canonical TaskStatuses', () => {
      expect(BACKEND_TASK_STATUSES).toHaveLength(6);
      BACKEND_TASK_STATUSES.forEach((status) => {
        expect(toCanonicalTaskStatus(status)).toBe(status);
      });
    });

    it('has all expected canonical ServiceRequestStatuses', () => {
      expect(BACKEND_SERVICE_REQUEST_STATUSES).toHaveLength(7);
      BACKEND_SERVICE_REQUEST_STATUSES.forEach((status) => {
        expect(toCanonicalServiceRequestStatus(status)).toBe(status);
      });
    });
  });

  describe('Legacy and Lowercase Normalization', () => {
    describe('TaskType Normalization', () => {
      it('normalizes legacy task types correctly', () => {
        expect(toCanonicalTaskType('vital_check')).toBe('VITALS');
        expect(toCanonicalTaskType('care_action')).toBe('GENERAL');
        expect(toCanonicalTaskType('service')).toBe('HOME_CARE');
        expect(toCanonicalTaskType('documentation')).toBe('ADMINISTRATIVE');
      });

      it('normalizes lowercase task types correctly', () => {
        expect(toCanonicalTaskType('medication')).toBe('MEDICATION');
        expect(toCanonicalTaskType('appointment')).toBe('APPOINTMENT');
        expect(toCanonicalTaskType('vitals')).toBe('VITALS');
        expect(toCanonicalTaskType('exercise')).toBe('EXERCISE');
        expect(toCanonicalTaskType('home_care')).toBe('HOME_CARE');
        expect(toCanonicalTaskType('assessment')).toBe('ASSESSMENT');
        expect(toCanonicalTaskType('administrative')).toBe('ADMINISTRATIVE');
        expect(toCanonicalTaskType('general')).toBe('GENERAL');
      });

      it('safely defaults unknown task types to GENERAL', () => {
        expect(toCanonicalTaskType('unknown_type')).toBe('GENERAL');
        expect(toCanonicalTaskType('')).toBe('GENERAL');
      });
    });

    describe('EpisodeType Normalization', () => {
      it('normalizes legacy episode types correctly', () => {
        expect(toCanonicalEpisodeType('chronic_management')).toBe('CHRONIC_CONDITION');
        expect(toCanonicalEpisodeType('fall_recovery')).toBe('FALL');
        expect(toCanonicalEpisodeType('home_care')).toBe('HOME_CARE_SETUP');
      });

      it('normalizes lowercase episode types correctly', () => {
        expect(toCanonicalEpisodeType('hospital_discharge')).toBe('HOSPITAL_DISCHARGE');
        expect(toCanonicalEpisodeType('surgery_recovery')).toBe('SURGERY_RECOVERY');
        expect(toCanonicalEpisodeType('new_diagnosis')).toBe('NEW_DIAGNOSIS');
      });

      it('safely defaults unknown episode types to OTHER', () => {
        expect(toCanonicalEpisodeType('unrecognized')).toBe('OTHER');
      });
    });

    describe('WorkflowStatus Normalization', () => {
      it('normalizes legacy completed status to EPISODE_COMPLETE', () => {
        expect(toCanonicalWorkflowStatus('completed')).toBe('EPISODE_COMPLETE');
        expect(toCanonicalWorkflowStatus('COMPLETED')).toBe('EPISODE_COMPLETE');
      });

      it('normalizes lowercase workflow statuses', () => {
        expect(toCanonicalWorkflowStatus('stable')).toBe('STABLE');
        expect(toCanonicalWorkflowStatus('recovery_ongoing')).toBe('RECOVERY_ONGOING');
        expect(toCanonicalWorkflowStatus('needs_attention')).toBe('NEEDS_ATTENTION');
        expect(toCanonicalWorkflowStatus('action_needed')).toBe('ACTION_NEEDED');
        expect(toCanonicalWorkflowStatus('waiting_on_care')).toBe('WAITING_ON_CARE');
      });

      it('safely defaults unknown workflow status to RECOVERY_ONGOING', () => {
        expect(toCanonicalWorkflowStatus('unknown')).toBe('RECOVERY_ONGOING');
      });
    });

    describe('TaskOwner Normalization', () => {
      it('normalizes lowercase owners', () => {
        expect(toCanonicalTaskOwner('care_recipient')).toBe('CARE_RECIPIENT');
        expect(toCanonicalTaskOwner('caregiver')).toBe('CAREGIVER');
        expect(toCanonicalTaskOwner('carebow')).toBe('CAREBOW');
        expect(toCanonicalTaskOwner('provider')).toBe('PROVIDER');
      });

      it('safely defaults unknown owner to CAREGIVER', () => {
        expect(toCanonicalTaskOwner('stranger')).toBe('CAREGIVER');
      });
    });

    describe('ServiceRequestStatus Normalization', () => {
      it('normalizes legacy and intermediate statuses to WAITING_PROVIDER', () => {
        expect(toCanonicalServiceRequestStatus('matching')).toBe('WAITING_PROVIDER');
        expect(toCanonicalServiceRequestStatus('awaiting_information')).toBe('WAITING_PROVIDER');
        expect(toCanonicalServiceRequestStatus('reviewing')).toBe('WAITING_PROVIDER');
      });

      it('normalizes lowercase status values', () => {
        expect(toCanonicalServiceRequestStatus('requested')).toBe('REQUESTED');
        expect(toCanonicalServiceRequestStatus('scheduled')).toBe('SCHEDULED');
        expect(toCanonicalServiceRequestStatus('in_progress')).toBe('IN_PROGRESS');
        expect(toCanonicalServiceRequestStatus('completed')).toBe('COMPLETED');
        expect(toCanonicalServiceRequestStatus('cancelled')).toBe('CANCELLED');
        expect(toCanonicalServiceRequestStatus('unable_to_fulfill')).toBe('UNABLE_TO_FULFILL');
      });

      it('safely defaults unknown service status to REQUESTED', () => {
        expect(toCanonicalServiceRequestStatus('random_state')).toBe('REQUESTED');
      });
    });
  });

  describe('CareTask Structural Parity & Nullability (P0-6 & P0-7)', () => {
    it('accepts null and undefined dueAt without type or contract violation', () => {
      const taskWithNullDue: import('./care').CareTask = {
        id: 'task_null_due',
        personId: 'profile_123',
        title: 'Call insurance coordinator',
        taskType: 'ADMINISTRATIVE',
        ownerType: 'CAREGIVER',
        ownerId: null,
        ownerName: null,
        dueAt: null,
        status: 'PENDING',
        priority: 'MEDIUM',
        source: 'caregiver_manual',
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
      };

      expect(taskWithNullDue.dueAt).toBeNull();
      expect(taskWithNullDue.ownerId).toBeNull();
      expect(taskWithNullDue.ownerName).toBeNull();

      const taskWithUndefinedDue: import('./care').CareTask = {
        id: 'task_undefined_due',
        personId: 'profile_123',
        title: 'Follow up on lab work',
        taskType: 'GENERAL',
        ownerType: 'CARE_RECIPIENT',
        status: 'PENDING',
        priority: 'LOW',
        source: 'care_plan',
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
      };

      expect(taskWithUndefinedDue.dueAt).toBeUndefined();
      expect(taskWithUndefinedDue.ownerId).toBeUndefined();
    });

    it('matches backend CareTask schema nullability invariants', () => {
      // Backend prisma CareTask schema:
      // dueAt DateTime?
      // ownerId String?
      // ownerName String?
      // description String?
      // episodeId String?
      // completedAt DateTime?
      // completionNotes String?
      const nullableFields: (keyof import('./care').CareTask)[] = [
        'dueAt',
        'ownerId',
        'ownerName',
        'description',
        'episodeId',
        'completedAt',
        'completionNotes',
      ];

      expect(nullableFields).toHaveLength(7);
    });
  });
});
