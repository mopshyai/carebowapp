/**
 * CareBow Core Domain Types
 * Canonical contract synchronized with backend Prisma & care services.
 * Person, CareEpisode, CareTask, CareTimelineEvent, CareUpdate, CareServiceRequest, FamilyCollaboration.
 */

import type { Relationship } from './profile';

// ============================================
// CANONICAL LIFECYCLE ENUMS (MATCHES BACKEND PRISMA)
// ============================================

export type EpisodeType =
  | 'HOSPITAL_DISCHARGE'
  | 'SURGERY_RECOVERY'
  | 'NEW_DIAGNOSIS'
  | 'FALL'
  | 'MEDICATION_TRANSITION'
  | 'HOME_CARE_SETUP'
  | 'CHRONIC_CONDITION'
  | 'OTHER';

export type EpisodeStatus = 'ACTIVE' | 'COMPLETED' | 'PAUSED' | 'CANCELLED';

export type WorkflowStatus =
  | 'STABLE'
  | 'RECOVERY_ONGOING'
  | 'NEEDS_ATTENTION'
  | 'ACTION_NEEDED'
  | 'WAITING_ON_CARE'
  | 'EPISODE_COMPLETE';

export type TaskType =
  | 'MEDICATION'
  | 'APPOINTMENT'
  | 'VITALS'
  | 'EXERCISE'
  | 'HOME_CARE'
  | 'ASSESSMENT'
  | 'ADMINISTRATIVE'
  | 'GENERAL';

export type TaskOwnerType = 'CARE_RECIPIENT' | 'CAREGIVER' | 'CAREBOW' | 'PROVIDER';

export type TaskPriority = 'URGENT' | 'HIGH' | 'MEDIUM' | 'LOW';

export type TaskStatus =
  | 'PENDING'
  | 'IN_PROGRESS'
  | 'WAITING'
  | 'COMPLETED'
  | 'BLOCKED'
  | 'CANCELLED';

export type ServiceRequestStatus =
  | 'REQUESTED'
  | 'WAITING_PROVIDER'
  | 'SCHEDULED'
  | 'IN_PROGRESS'
  | 'COMPLETED'
  | 'CANCELLED'
  | 'UNABLE_TO_FULFILL';

export type CarebowExecutionStatus =
  | 'REQUEST_RECORDED'
  | 'QUEUED_FOR_REVIEW'
  | 'ASSIGNED'
  | 'WAITING_FOR_USER'
  | 'WAITING_FOR_PROVIDER'
  | 'SCHEDULED'
  | 'IN_PROGRESS'
  | 'COMPLETED'
  | 'BLOCKED'
  | 'UNABLE_TO_FULFILL'
  | 'CANCELLED';

// ============================================
// BACKWARD-COMPATIBLE UI ALIASES
// ============================================

export type CareEpisodeType =
  | EpisodeType
  | Lowercase<EpisodeType>
  | 'chronic_management'
  | 'fall_recovery'
  | 'home_care'
  | 'general_care';
export type CareWorkflowStatus = WorkflowStatus | Lowercase<WorkflowStatus> | 'completed';
export type CareTaskType =
  | TaskType
  | Lowercase<TaskType>
  | 'vital_check'
  | 'care_action'
  | 'service'
  | 'documentation';
export type CareTaskOwnerType = TaskOwnerType | Lowercase<TaskOwnerType>;
export type CareTaskStatus = TaskStatus | Lowercase<TaskStatus>;
export type CareTaskPriority = TaskPriority | Lowercase<TaskPriority>;
export type CareServiceRequestStatus =
  | ServiceRequestStatus
  | Lowercase<ServiceRequestStatus>
  | 'reviewing'
  | 'awaiting_information'
  | 'matching';

export type CareTaskSource =
  | 'DISCHARGE_SUMMARY'
  | 'ASK_CAREBOW'
  | 'CARE_EPISODE'
  | 'CLINICIAN'
  | 'USER'
  | 'discharge_instructions'
  | 'ask_carebow'
  | 'care_plan'
  | 'caregiver_manual'
  | 'reminder';

// ============================================
// OPERATIONAL DISPLAY LABELS (NO MISLEADING CLINICAL CLAIMS)
// ============================================

export const WORKFLOW_STATUS_LABELS: Record<string, string> = {
  STABLE: 'Plan active',
  RECOVERY_ONGOING: 'On track',
  NEEDS_ATTENTION: 'Action needed',
  ACTION_NEEDED: 'Follow-up needed',
  WAITING_ON_CARE: 'Waiting on care',
  EPISODE_COMPLETE: 'Episode complete',
  // Lowercase aliases
  stable: 'Plan active',
  recovery_ongoing: 'On track',
  needs_attention: 'Action needed',
  action_needed: 'Follow-up needed',
  waiting_on_care: 'Waiting on care',
  completed: 'Episode complete',
};

export const EPISODE_TYPE_LABELS: Record<string, string> = {
  HOSPITAL_DISCHARGE: 'Hospital Discharge Recovery',
  SURGERY_RECOVERY: 'Post-Surgical Recovery',
  NEW_DIAGNOSIS: 'New Diagnosis Navigation',
  FALL: 'Fall Recovery',
  MEDICATION_TRANSITION: 'Medication Transition',
  HOME_CARE_SETUP: 'Home Care Setup',
  CHRONIC_CONDITION: 'Ongoing Condition Management',
  OTHER: 'General Care Plan',
  // Lowercase aliases
  hospital_discharge: 'Hospital Discharge Recovery',
  surgery_recovery: 'Post-Surgical Recovery',
  chronic_management: 'Ongoing Condition Management',
  medication_transition: 'Medication Transition',
  fall_recovery: 'Fall Recovery',
  home_care: 'Home Care Setup',
  new_diagnosis: 'New Diagnosis Navigation',
  general_care: 'General Care Plan',
};

// ============================================
// FAMILY ROLES & SERVER CAPABILITY MAPPINGS
// ============================================

export type FamilyRole =
  | 'primary_caregiver'
  | 'caregiver'
  | 'family_member'
  | 'authorized_viewer'
  | 'care_recipient';

export const FAMILY_ROLE_LABELS: Record<FamilyRole, string> = {
  primary_caregiver: 'Primary Caregiver (Owner)',
  caregiver: 'Caregiver (Full Access)',
  family_member: 'Family Member',
  authorized_viewer: 'Authorized Viewer (Read-only)',
  care_recipient: 'Care Recipient',
};

/**
 * Server capabilities defined in backend profile-access.ts:
 * OWNER: All capabilities + manage_sharing
 * FULL: All read/write capabilities (excluding manage_sharing)
 * READ_ONLY: Read-only capabilities
 */
export type CarePermissionScope =
  | 'read_profile'
  | 'write_profile'
  | 'read_episodes'
  | 'write_episodes'
  | 'read_tasks'
  | 'write_tasks'
  | 'read_timeline'
  | 'read_care_updates'
  | 'write_care_updates'
  | 'read_service_requests'
  | 'write_service_requests'
  | 'read_medications'
  | 'write_medications'
  | 'read_documents'
  | 'write_documents'
  | 'read_vitals'
  | 'write_vitals'
  | 'manage_sharing'
  // UI aliases
  | 'overview'
  | 'health_info'
  | 'medications'
  | 'appointments'
  | 'tasks'
  | 'timeline'
  | 'documents'
  | 'services'
  | 'updates'
  | 'billing'
  | 'manage_members';

export const ROLE_DEFAULT_PERMISSIONS: Record<FamilyRole, CarePermissionScope[]> = {
  primary_caregiver: [
    'read_profile',
    'write_profile',
    'read_episodes',
    'write_episodes',
    'read_tasks',
    'write_tasks',
    'read_timeline',
    'read_care_updates',
    'write_care_updates',
    'read_service_requests',
    'write_service_requests',
    'read_medications',
    'write_medications',
    'read_documents',
    'write_documents',
    'read_vitals',
    'write_vitals',
    'manage_sharing',
    'overview',
    'health_info',
    'medications',
    'appointments',
    'tasks',
    'timeline',
    'documents',
    'services',
    'updates',
    'billing',
    'manage_members',
  ],
  caregiver: [
    'read_profile',
    'write_profile',
    'read_episodes',
    'write_episodes',
    'read_tasks',
    'write_tasks',
    'read_timeline',
    'read_care_updates',
    'write_care_updates',
    'read_service_requests',
    'write_service_requests',
    'read_medications',
    'write_medications',
    'read_documents',
    'write_documents',
    'read_vitals',
    'write_vitals',
    'overview',
    'health_info',
    'medications',
    'appointments',
    'tasks',
    'timeline',
    'documents',
    'services',
    'updates',
  ],
  care_recipient: [
    'read_profile',
    'write_profile',
    'read_episodes',
    'read_tasks',
    'write_tasks',
    'read_timeline',
    'read_care_updates',
    'write_care_updates',
    'read_medications',
    'overview',
    'health_info',
    'medications',
    'appointments',
    'tasks',
    'timeline',
    'documents',
    'updates',
  ],
  family_member: [
    'read_profile',
    'read_episodes',
    'read_tasks',
    'read_timeline',
    'read_care_updates',
    'write_care_updates',
    'overview',
    'appointments',
    'tasks',
    'timeline',
    'updates',
  ],
  authorized_viewer: [
    'read_profile',
    'read_episodes',
    'read_tasks',
    'read_timeline',
    'read_care_updates',
    'overview',
    'timeline',
    'updates',
  ],
};

export interface CaregiverCollaborator {
  id: string;
  personId: string;
  userId?: string;
  name: string;
  email?: string;
  phone?: string;
  relationship: Relationship;
  role: FamilyRole;
  permissions: CarePermissionScope[];
  status: 'active' | 'invited' | 'pending';
  invitedAt: string;
  joinedAt?: string;
}

// ============================================
// CORE ENTITY MODELS
// ============================================

export interface DischargeDetails {
  hospitalName?: string;
  dischargeDate?: string;
  attendingPhysician?: string;
  primaryDiagnosis?: string;
  dischargeInstructions?: string;
  followUpWindowDays?: number;
  extractedWarningSigns?: string[];
  documentUri?: string;
}

export type MutationSyncStatus = 'SERVER_CONFIRMED' | 'PENDING_SYNC' | 'FAILED';

export interface CareEpisode {
  id: string;
  personId: string;
  title: string;
  episodeType: CareEpisodeType;
  startDate: string;
  targetEndDate?: string;
  status: 'active' | 'completed' | 'paused' | 'archived' | EpisodeStatus;
  workflowStatus: CareWorkflowStatus;
  source: string;
  description?: string;
  careGoals: string[];
  dischargeDetails?: DischargeDetails;
  createdAt: string;
  updatedAt: string;
  completedAt?: string;
  syncStatus?: MutationSyncStatus;
}

export interface CareTask {
  id: string;
  personId: string;
  episodeId?: string;
  title: string;
  description?: string;
  taskType: CareTaskType;
  ownerType: CareTaskOwnerType;
  ownerId?: string | null;
  ownerName?: string | null;
  dueAt?: string | null;
  status: CareTaskStatus;
  priority: CareTaskPriority;
  source: CareTaskSource;
  createdBy?: string;
  completedAt?: string;
  completionNotes?: string;
  externalReference?: {
    type: 'booking' | 'order' | 'request' | 'medication';
    id: string;
  };
  createdAt: string;
  updatedAt: string;
  syncStatus?: MutationSyncStatus;
}

export interface CareTimelineEvent {
  id: string;
  personId: string;
  episodeId?: string;
  eventType: string;
  title: string;
  description?: string;
  severity?: 'normal' | 'attention' | 'critical';
  timestamp: string;
  author?: {
    id: string;
    name: string;
    role?: string;
  };
  linkedEntity?: {
    type: 'task' | 'episode' | 'booking' | 'document' | 'service';
    id: string;
  };
  metadata?: Record<string, unknown>;
}

export interface CareUpdate {
  id: string;
  personId: string;
  authorId: string;
  authorName: string;
  note: string;
  category:
    | 'symptom'
    | 'mood'
    | 'vital'
    | 'milestone'
    | 'general'
    | 'NOTE'
    | 'SYMPTOM'
    | 'VITALS'
    | 'OBSERVATION'
    | 'CLINICIAN_INSTRUCTION';
  createdAt: string;
  syncStatus?: MutationSyncStatus;
}

export interface CareServiceRequest {
  id: string;
  personId: string;
  episodeId?: string;
  serviceCategory: string;
  serviceTitle: string;
  notes?: string;
  status: CareServiceRequestStatus;
  statusMessage?: string;
  scheduledDate?: string;
  providerName?: string;
  requestedAt: string;
  updatedAt: string;
  linkedBookingId?: string;
  linkedTaskId?: string;
  syncStatus?: MutationSyncStatus;
}

// ============================================
// CLINICAL PROVENANCE & DISCHARGE CONTRACTS
// ============================================

export interface CandidateCarePlanItem {
  id: string;
  category: 'APPOINTMENT' | 'MEDICATION' | 'TASK' | 'SERVICE' | 'WARNING_SIGN';
  title: string;
  description?: string;
  suggestedDueAt?: string;
  priority: TaskPriority;
  ownerType: TaskOwnerType;
  serviceHint?: string;
  warningCriteria?: string;
  sourceType:
    | 'CLINICIAN_DISCHARGE_ORDER'
    | 'DOCUMENT_EXTRACTED'
    | 'CAREBOW_SUGGESTION'
    | 'USER_REQUEST';
  sourceSnippet?: string;
  sourceConfidence?: number;
  isSuggestion?: boolean;
  confirmed: boolean;
}

export interface ExtractedDischargePlan {
  documentId?: string;
  fileName?: string;
  hospitalName?: string | null;
  dischargeDate?: string | null;
  admittingDiagnosis?: string | null;
  dischargeDiagnosis?: string | null;
  careGoals: string[];
  candidateItems: CandidateCarePlanItem[];
  carebowSuggestions: CandidateCarePlanItem[];
  clinicianWarningSigns: string[];
}

export interface ProposedAction {
  id: string;
  type:
    | 'CREATE_TASK'
    | 'LOG_CARE_UPDATE'
    | 'INITIATE_SERVICE_REQUEST'
    | 'SCHEDULE_APPOINTMENT'
    | 'ADD_MEDICATION_REMINDER';
  title: string;
  description: string;
  suggestedDueAt?: string;
  priority?: TaskPriority;
  ownerType?: TaskOwnerType;
  ownerName?: string;
  serviceType?: string;
  category?: string;
  sourceType?:
    | 'USER_REQUEST'
    | 'CLINICIAN_INSTRUCTION'
    | 'DOCUMENT_EXTRACTED'
    | 'CAREBOW_SUGGESTION';
  sourceSnippet?: string;
  metadata?: Record<string, any>;
}

// Backward-compatible UI type
export interface ExtractedDischargeCandidate {
  episodeTitle: string;
  primaryDiagnosis: string;
  hospitalName?: string;
  dischargeDate?: string;
  candidateTasks: Array<{
    title: string;
    description?: string;
    taskType: CareTaskType;
    priority: CareTaskPriority;
    dueInDays?: number;
    recommendedOwner: CareTaskOwnerType;
  }>;
  candidateAppointments: Array<{
    specialty: string;
    recommendedTimeframe: string;
    notes?: string;
  }>;
  candidateMedications: Array<{
    name: string;
    dosage?: string;
    frequency?: string;
    instructions?: string;
  }>;
  warningSigns: string[];
}

// ============================================
// CANONICAL NORMALIZATION HELPERS
// ============================================

export function toCanonicalTaskType(t: string): TaskType {
  const upper = t.toUpperCase();
  if (upper === 'MEDICATION') return 'MEDICATION';
  if (upper === 'APPOINTMENT') return 'APPOINTMENT';
  if (upper === 'VITALS' || upper === 'VITAL_CHECK') return 'VITALS';
  if (upper === 'EXERCISE') return 'EXERCISE';
  if (upper === 'HOME_CARE' || upper === 'SERVICE') return 'HOME_CARE';
  if (upper === 'ASSESSMENT') return 'ASSESSMENT';
  if (upper === 'ADMINISTRATIVE' || upper === 'DOCUMENTATION') return 'ADMINISTRATIVE';
  return 'GENERAL';
}

export function toCanonicalTaskStatus(s: string): TaskStatus {
  const upper = s.toUpperCase();
  if (upper === 'PENDING') return 'PENDING';
  if (upper === 'IN_PROGRESS') return 'IN_PROGRESS';
  if (upper === 'WAITING') return 'WAITING';
  if (upper === 'COMPLETED') return 'COMPLETED';
  if (upper === 'BLOCKED') return 'BLOCKED';
  if (upper === 'CANCELLED') return 'CANCELLED';
  return 'PENDING';
}

export function toCanonicalTaskOwner(o: string): TaskOwnerType {
  const upper = o.toUpperCase();
  if (upper === 'CARE_RECIPIENT') return 'CARE_RECIPIENT';
  if (upper === 'CAREGIVER') return 'CAREGIVER';
  if (upper === 'CAREBOW') return 'CAREBOW';
  if (upper === 'PROVIDER') return 'PROVIDER';
  return 'CAREGIVER';
}

export function toCanonicalPriority(p: string): TaskPriority {
  const upper = p.toUpperCase();
  if (upper === 'URGENT') return 'URGENT';
  if (upper === 'HIGH') return 'HIGH';
  if (upper === 'LOW') return 'LOW';
  return 'MEDIUM';
}

export function toCanonicalWorkflowStatus(w: string): WorkflowStatus {
  const upper = w.toUpperCase();
  if (upper === 'STABLE') return 'STABLE';
  if (upper === 'RECOVERY_ONGOING') return 'RECOVERY_ONGOING';
  if (upper === 'NEEDS_ATTENTION') return 'NEEDS_ATTENTION';
  if (upper === 'ACTION_NEEDED') return 'ACTION_NEEDED';
  if (upper === 'WAITING_ON_CARE') return 'WAITING_ON_CARE';
  if (upper === 'EPISODE_COMPLETE' || upper === 'COMPLETED') return 'EPISODE_COMPLETE';
  return 'RECOVERY_ONGOING';
}

export function toCanonicalEpisodeType(t: string): EpisodeType {
  const upper = t.toUpperCase();
  if (upper === 'HOSPITAL_DISCHARGE') return 'HOSPITAL_DISCHARGE';
  if (upper === 'SURGERY_RECOVERY') return 'SURGERY_RECOVERY';
  if (upper === 'NEW_DIAGNOSIS') return 'NEW_DIAGNOSIS';
  if (upper === 'FALL' || upper === 'FALL_RECOVERY') return 'FALL';
  if (upper === 'MEDICATION_TRANSITION') return 'MEDICATION_TRANSITION';
  if (upper === 'HOME_CARE_SETUP' || upper === 'HOME_CARE') return 'HOME_CARE_SETUP';
  if (upper === 'CHRONIC_CONDITION' || upper === 'CHRONIC_MANAGEMENT') return 'CHRONIC_CONDITION';
  return 'OTHER';
}

export function toCanonicalEpisodeStatus(s: string): EpisodeStatus {
  const upper = s.toUpperCase();
  if (upper === 'ACTIVE') return 'ACTIVE';
  if (upper === 'COMPLETED') return 'COMPLETED';
  if (upper === 'PAUSED') return 'PAUSED';
  if (upper === 'CANCELLED') return 'CANCELLED';
  return 'ACTIVE';
}

export function toCanonicalServiceRequestStatus(s: string): ServiceRequestStatus {
  const upper = s.toUpperCase();
  if (upper === 'REQUESTED') return 'REQUESTED';
  if (
    upper === 'WAITING_PROVIDER' ||
    upper === 'MATCHING' ||
    upper === 'AWAITING_INFORMATION' ||
    upper === 'REVIEWING'
  )
    return 'WAITING_PROVIDER';
  if (upper === 'SCHEDULED') return 'SCHEDULED';
  if (upper === 'IN_PROGRESS') return 'IN_PROGRESS';
  if (upper === 'COMPLETED') return 'COMPLETED';
  if (upper === 'CANCELLED') return 'CANCELLED';
  if (upper === 'UNABLE_TO_FULFILL') return 'UNABLE_TO_FULFILL';
  return 'REQUESTED';
}
