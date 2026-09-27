/**
 * Care Screen
 * Comprehensive care management destination organizing everything happening around
 * the selected person's care:
 * - Overview (active episode, goals, status, care team)
 * - Tasks (creation, assignment, ownership, completion, filters)
 * - Timeline (longitudinal chronological history with provenance)
 * - Medications (prescriptions, dosages, instructions)
 * - Appointments (follow-ups, doctor visits)
 * - Services (physical therapy, nursing, equipment execution)
 * - Documents (discharge instructions, clinical records)
 */

import React, { useState, useMemo, useCallback } from 'react';
import { View, Text, ScrollView, StyleSheet, Pressable, Modal, TextInput } from 'react-native';
import { SafeAreaView, useSafeAreaInsets } from 'react-native-safe-area-context';
import { useNavigation } from '@react-navigation/native';
import * as Haptics from 'react-native-haptic-feedback';
import { useCareStore } from '../../store/useCareStore';
import { useBookingsStore } from '../../store/useBookingsStore';
import { useSelectedPersonContext } from '../../hooks/useSelectedPersonContext';
import { AppIcon } from '../../components/icons/AppIcon';
import { colors, radius, shadows, spacing } from '../../theme';
import type {
  CareTask,
  CareTaskOwnerType,
  CareTaskPriority,
  CareTaskType,
  CareWorkflowStatus,
} from '../../types/care';
import { WORKFLOW_STATUS_LABELS } from '../../types/care';

type CareSection =
  | 'overview'
  | 'tasks'
  | 'timeline'
  | 'medications'
  | 'appointments'
  | 'services'
  | 'documents';

const SECTIONS: { id: CareSection; label: string; icon: string }[] = [
  { id: 'overview', label: 'Overview', icon: 'heart' },
  { id: 'tasks', label: 'Tasks', icon: 'check-circle' },
  { id: 'timeline', label: 'Timeline', icon: 'time' },
  { id: 'medications', label: 'Meds', icon: 'pulse' },
  { id: 'appointments', label: 'Appts', icon: 'calendar' },
  { id: 'services', label: 'Services', icon: 'physio' },
  { id: 'documents', label: 'Docs', icon: 'document' },
];

export default function CareScreen() {
  const insets = useSafeAreaInsets();
  const navigation = useNavigation<any>();

  const { selectedPerson, selectedPersonId, displayName, relationshipLabel, activeEpisode } =
    useSelectedPersonContext();

  const [activeSection, setActiveSection] = useState<CareSection>('overview');
  const [taskFilter, setTaskFilter] = useState<'all' | 'pending' | 'completed' | 'overdue'>('all');

  // Care store selectors
  const tasks = useCareStore((state) => state.tasks);
  const createTask = useCareStore((state) => state.createTask);
  const completeTask = useCareStore((state) => state.completeTask);
  const reopenTask = useCareStore((state) => state.reopenTask);
  const assignTask = useCareStore((state) => state.assignTask);
  const timelineEvents = useCareStore((state) => state.timelineEvents);
  const serviceRequests = useCareStore((state) => state.serviceRequests);
  const collaborators = useCareStore((state) => state.collaborators);
  const setWorkflowStatus = useCareStore((state) => state.setWorkflowStatus);

  // Bookings from bookingsStore
  const bookings = useBookingsStore((state) => state.bookings);

  // Add Task Modal State
  const [showAddTaskModal, setShowAddTaskModal] = useState(false);
  const [newTaskTitle, setNewTaskTitle] = useState('');
  const [newTaskDesc, setNewTaskDesc] = useState('');
  const [newTaskType] = useState<CareTaskType>('GENERAL');
  const [newTaskOwner, setNewTaskOwner] = useState<CareTaskOwnerType>('caregiver');
  const [newTaskPriority, setNewTaskPriority] = useState<CareTaskPriority>('medium');

  // Reassign Modal State
  const [taskToReassign, setTaskToReassign] = useState<CareTask | null>(null);

  // Filter tasks for this person
  const personTasks = useMemo(() => {
    if (!selectedPersonId) return [];
    return tasks.filter((t) => t.personId === selectedPersonId);
  }, [tasks, selectedPersonId]);

  const todayStr = useMemo(() => new Date().toISOString().split('T')[0], []);

  const filteredTasks = useMemo(() => {
    switch (taskFilter) {
      case 'pending':
        return personTasks.filter((t) => t.status === 'pending' || t.status === 'in_progress');
      case 'completed':
        return personTasks.filter((t) => t.status === 'completed');
      case 'overdue':
        return personTasks.filter((t) => {
          if (t.status === 'completed' || t.status === 'cancelled') return false;
          const due = t.dueAt ? t.dueAt.split('T')[0] : '';
          return due !== '' && due < todayStr;
        });
      default:
        return personTasks;
    }
  }, [personTasks, taskFilter, todayStr]);

  // Timeline events for this person
  const personTimeline = useMemo(() => {
    if (!selectedPersonId) return [];
    return timelineEvents
      .filter((ev) => ev.personId === selectedPersonId)
      .sort((a, b) => new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime());
  }, [timelineEvents, selectedPersonId]);

  // Service requests for this person
  const personServices = useMemo(() => {
    if (!selectedPersonId) return [];
    return serviceRequests.filter((r) => r.personId === selectedPersonId);
  }, [serviceRequests, selectedPersonId]);

  // Person medications
  const personMedications = useMemo(() => {
    return selectedPerson?.healthInfo?.medications || [];
  }, [selectedPerson]);

  // Person collaborators
  const personCollaborators = useMemo(() => {
    if (!selectedPersonId) return [];
    return collaborators.filter((c) => c.personId === selectedPersonId);
  }, [collaborators, selectedPersonId]);

  // Handle task submission
  const handleCreateTask = useCallback(() => {
    if (!newTaskTitle.trim() || !selectedPersonId) return;
    Haptics.trigger('notificationSuccess');

    const due = new Date(Date.now() + 86400000).toISOString();
    createTask({
      personId: selectedPersonId,
      episodeId: activeEpisode?.id,
      title: newTaskTitle.trim(),
      description: newTaskDesc.trim() || undefined,
      taskType: newTaskType,
      ownerType: newTaskOwner,
      ownerName:
        newTaskOwner === 'caregiver'
          ? 'Primary Caregiver'
          : newTaskOwner === 'care_recipient'
            ? displayName
            : newTaskOwner === 'carebow'
              ? 'CareBow Coordination'
              : 'Provider',
      dueAt: due,
      status: 'pending',
      priority: newTaskPriority,
      source: 'caregiver_manual',
    });

    setNewTaskTitle('');
    setNewTaskDesc('');
    setShowAddTaskModal(false);
  }, [
    newTaskTitle,
    newTaskDesc,
    newTaskType,
    newTaskOwner,
    newTaskPriority,
    selectedPersonId,
    activeEpisode,
    displayName,
    createTask,
  ]);

  // Handle reassign task
  const handleConfirmReassign = useCallback(
    (ownerType: CareTaskOwnerType, ownerName: string) => {
      if (!taskToReassign) return;
      Haptics.trigger('impactMedium');
      assignTask(taskToReassign.id, ownerType, undefined, ownerName);
      setTaskToReassign(null);
    },
    [taskToReassign, assignTask]
  );

  return (
    <SafeAreaView style={styles.safeArea} edges={['top']}>
      {/* HEADER */}
      <View style={styles.header}>
        <View>
          <Text style={styles.headerContext}>CARE PLAN & EXECUTION</Text>
          <Text style={styles.headerTitle}>{displayName}'s Care</Text>
        </View>

        <Pressable
          style={styles.askButton}
          onPress={() => {
            Haptics.trigger('impactLight');
            navigation.navigate('MainTabs', { screen: 'Ask' });
          }}
          accessibilityRole="button"
          accessibilityLabel="Ask CareBow about this care plan"
        >
          <AppIcon name="sparkles" size={14} color="#FFFFFF" />
          <Text style={styles.askButtonText}>Ask AI</Text>
        </Pressable>
      </View>

      {/* SECTION TABS (Horizontal Scroll) */}
      <View style={styles.tabsContainer}>
        <ScrollView
          horizontal
          showsHorizontalScrollIndicator={false}
          contentContainerStyle={styles.tabsScrollContent}
        >
          {SECTIONS.map((sec) => {
            const isSelected = activeSection === sec.id;
            return (
              <Pressable
                key={sec.id}
                style={[styles.tabChip, isSelected && styles.tabChipActive]}
                onPress={() => {
                  Haptics.trigger('impactLight');
                  setActiveSection(sec.id);
                }}
                accessibilityRole="tab"
                accessibilityState={{ selected: isSelected }}
                accessibilityLabel={`${sec.label} section`}
              >
                <AppIcon
                  name={sec.icon as any}
                  size={14}
                  color={isSelected ? '#FFFFFF' : colors.textSecondary}
                />
                <Text style={[styles.tabChipText, isSelected && styles.tabChipTextActive]}>
                  {sec.label}
                </Text>
              </Pressable>
            );
          })}
        </ScrollView>
      </View>

      {/* BODY CONTENT BY SECTION */}
      <ScrollView
        style={styles.contentScroll}
        contentContainerStyle={[styles.contentInner, { paddingBottom: insets.bottom + 90 }]}
        showsVerticalScrollIndicator={false}
      >
        {/* ============================================ */}
        {/* OVERVIEW SECTION */}
        {/* ============================================ */}
        {activeSection === 'overview' && (
          <View style={styles.sectionContainer}>
            {/* Active Episode Banner */}
            {activeEpisode ? (
              <View style={styles.episodeDetailCard}>
                <View style={styles.episodeTopRow}>
                  <View style={styles.statusBadge}>
                    <Text style={styles.statusBadgeText}>
                      {WORKFLOW_STATUS_LABELS[activeEpisode.workflowStatus]}
                    </Text>
                  </View>
                  <Text style={styles.episodeDate}>
                    Started {new Date(activeEpisode.startDate).toLocaleDateString()}
                  </Text>
                </View>

                <Text style={styles.episodeDetailTitle}>{activeEpisode.title}</Text>
                <Text style={styles.episodeDetailDesc}>
                  {activeEpisode.description || 'Active longitudinal care workflow.'}
                </Text>

                {/* Workflow Status Selector */}
                <View style={styles.statusRow}>
                  <Text style={styles.statusLabel}>Care State:</Text>
                  <View style={styles.statusPillsWrap}>
                    {(
                      ['stable', 'recovery_ongoing', 'needs_attention'] as CareWorkflowStatus[]
                    ).map((status) => (
                      <Pressable
                        key={status}
                        style={[
                          styles.workflowPill,
                          activeEpisode.workflowStatus === status && styles.workflowPillActive,
                        ]}
                        onPress={() => setWorkflowStatus(activeEpisode.id, status)}
                      >
                        <Text
                          style={[
                            styles.workflowPillText,
                            activeEpisode.workflowStatus === status &&
                              styles.workflowPillTextActive,
                          ]}
                        >
                          {WORKFLOW_STATUS_LABELS[status]}
                        </Text>
                      </Pressable>
                    ))}
                  </View>
                </View>

                {/* Care Goals */}
                {activeEpisode.careGoals && activeEpisode.careGoals.length > 0 ? (
                  <View style={styles.goalsWrap}>
                    <Text style={styles.goalsTitle}>CARE GOALS & TARGETS</Text>
                    {activeEpisode.careGoals.map((goal, idx) => (
                      <View key={idx} style={styles.goalItem}>
                        <AppIcon name="check" size={12} color={colors.accent} />
                        <Text style={styles.goalText}>{goal}</Text>
                      </View>
                    ))}
                  </View>
                ) : null}
              </View>
            ) : (
              <View style={styles.cardEmpty}>
                <AppIcon name="heart" size={28} color={colors.accent} />
                <Text style={styles.cardEmptyTitle}>No active care episode</Text>
                <Text style={styles.cardEmptySub}>
                  Create a structured episode for post-hospital discharge, surgery, or chronic care
                  management.
                </Text>
              </View>
            )}

            {/* Quick Metrics Snapshot */}
            <View style={styles.metricsGrid}>
              <View style={styles.metricCard}>
                <Text style={styles.metricNum}>
                  {personTasks.filter((t) => t.status !== 'completed').length}
                </Text>
                <Text style={styles.metricLabel}>Open Tasks</Text>
              </View>
              <View style={styles.metricCard}>
                <Text style={styles.metricNum}>{personMedications.length}</Text>
                <Text style={styles.metricLabel}>Active Meds</Text>
              </View>
              <View style={styles.metricCard}>
                <Text style={styles.metricNum}>{personServices.length}</Text>
                <Text style={styles.metricLabel}>Services</Text>
              </View>
              <View style={styles.metricCard}>
                <Text style={styles.metricNum}>{personTimeline.length}</Text>
                <Text style={styles.metricLabel}>Events</Text>
              </View>
            </View>

            {/* Care Team Snapshot */}
            <View style={styles.cardSection}>
              <View style={styles.cardSectionHeader}>
                <Text style={styles.cardSectionTitle}>CARE TEAM & COLLABORATORS</Text>
                <Pressable onPress={() => navigation.navigate('MainTabs', { screen: 'Family' })}>
                  <Text style={styles.cardSectionLink}>Manage →</Text>
                </Pressable>
              </View>

              <View style={styles.teamList}>
                <View style={styles.teamMemberItem}>
                  <View style={styles.teamMemberAvatar}>
                    <Text style={styles.teamMemberAvatarText}>
                      {displayName.charAt(0).toUpperCase()}
                    </Text>
                  </View>
                  <View style={styles.teamMemberInfo}>
                    <Text style={styles.teamMemberName}>{displayName}</Text>
                    <Text style={styles.teamMemberRole}>Care Recipient ({relationshipLabel})</Text>
                  </View>
                  <View style={styles.teamMemberBadge}>
                    <Text style={styles.teamMemberBadgeText}>Recipient</Text>
                  </View>
                </View>

                {personCollaborators.map((c) => (
                  <View key={c.id} style={styles.teamMemberItem}>
                    <View style={[styles.teamMemberAvatar, { backgroundColor: '#EDE9FE' }]}>
                      <Text style={[styles.teamMemberAvatarText, { color: '#7C3AED' }]}>
                        {c.name.charAt(0).toUpperCase()}
                      </Text>
                    </View>
                    <View style={styles.teamMemberInfo}>
                      <Text style={styles.teamMemberName}>{c.name}</Text>
                      <Text style={styles.teamMemberRole}>{c.role.replace(/_/g, ' ')}</Text>
                    </View>
                    <View style={[styles.teamMemberBadge, { backgroundColor: '#EDE9FE' }]}>
                      <Text style={[styles.teamMemberBadgeText, { color: '#7C3AED' }]}>
                        {c.status}
                      </Text>
                    </View>
                  </View>
                ))}
              </View>
            </View>
          </View>
        )}

        {/* ============================================ */}
        {/* TASKS SECTION */}
        {/* ============================================ */}
        {activeSection === 'tasks' && (
          <View style={styles.sectionContainer}>
            {/* Task Controls Row */}
            <View style={styles.taskControlsRow}>
              <View style={styles.filterChipsRow}>
                {(['all', 'pending', 'overdue', 'completed'] as const).map((filter) => (
                  <Pressable
                    key={filter}
                    style={[styles.filterChip, taskFilter === filter && styles.filterChipActive]}
                    onPress={() => setTaskFilter(filter)}
                  >
                    <Text
                      style={[
                        styles.filterChipText,
                        taskFilter === filter && styles.filterChipTextActive,
                      ]}
                    >
                      {filter.toUpperCase()}
                    </Text>
                  </Pressable>
                ))}
              </View>

              <Pressable
                style={styles.addTaskButton}
                onPress={() => {
                  Haptics.trigger('impactLight');
                  setShowAddTaskModal(true);
                }}
              >
                <AppIcon name="plus" size={14} color="#FFFFFF" />
                <Text style={styles.addTaskButtonText}>Add Task</Text>
              </Pressable>
            </View>

            {filteredTasks.length === 0 ? (
              <View style={styles.cardEmpty}>
                <AppIcon name="check-circle" size={26} color={colors.accent} />
                <Text style={styles.cardEmptyTitle}>No {taskFilter} tasks</Text>
                <Text style={styles.cardEmptySub}>
                  Create tasks to coordinate medication, appointments, vitals, or caregiver actions.
                </Text>
              </View>
            ) : (
              <View style={styles.tasksVerticalList}>
                {filteredTasks.map((t) => {
                  const isDone = t.status === 'completed';
                  return (
                    <View
                      key={t.id}
                      style={[styles.taskDetailCard, isDone && styles.taskDetailCardDone]}
                    >
                      <View style={styles.taskDetailHeader}>
                        <Pressable
                          style={[styles.taskCheck, isDone && styles.taskCheckDone]}
                          onPress={() => {
                            Haptics.trigger('impactMedium');
                            if (isDone) reopenTask(t.id);
                            else completeTask(t.id);
                          }}
                        >
                          {isDone ? <AppIcon name="check" size={14} color="#FFFFFF" /> : null}
                        </Pressable>

                        <View style={styles.taskHeaderContent}>
                          <Text
                            style={[styles.taskDetailTitle, isDone && styles.taskDetailTitleDone]}
                          >
                            {t.title}
                          </Text>
                          {t.description ? (
                            <Text style={styles.taskDetailDescription}>{t.description}</Text>
                          ) : null}
                        </View>
                      </View>

                      <View style={styles.taskFooterRow}>
                        {/* Owner & Reassign */}
                        <Pressable
                          style={styles.taskOwnerChip}
                          onPress={() => setTaskToReassign(t)}
                          accessibilityLabel={`Assigned to ${t.ownerName || t.ownerType}. Tap to reassign.`}
                        >
                          <AppIcon
                            name={
                              t.ownerType === 'carebow'
                                ? 'sparkles'
                                : t.ownerType === 'provider'
                                  ? 'doctor'
                                  : 'user'
                            }
                            size={12}
                            color={colors.accent}
                          />
                          <Text style={styles.taskOwnerText}>{t.ownerName || t.ownerType} ▾</Text>
                        </Pressable>

                        {/* Due Date */}
                        <Text style={styles.taskDueDate}>
                          Due {new Date(t.dueAt).toLocaleDateString()}
                        </Text>

                        {/* Priority Badge */}
                        {t.priority === 'urgent' && !isDone ? (
                          <View style={styles.urgentPill}>
                            <Text style={styles.urgentPillText}>URGENT</Text>
                          </View>
                        ) : null}
                      </View>
                    </View>
                  );
                })}
              </View>
            )}
          </View>
        )}

        {/* ============================================ */}
        {/* TIMELINE SECTION */}
        {/* ============================================ */}
        {activeSection === 'timeline' && (
          <View style={styles.sectionContainer}>
            <View style={styles.timelineHeaderRow}>
              <Text style={styles.timelineHeading}>CARE TIMELINE & HISTORY</Text>
              <Text style={styles.timelineCount}>{personTimeline.length} events</Text>
            </View>

            {personTimeline.length === 0 ? (
              <View style={styles.cardEmpty}>
                <AppIcon name="time" size={26} color={colors.accent} />
                <Text style={styles.cardEmptyTitle}>No events recorded</Text>
                <Text style={styles.cardEmptySub}>
                  Timeline events will log here automatically as care updates, appointments, tasks,
                  and medications are tracked.
                </Text>
              </View>
            ) : (
              <View style={styles.timelineEventsList}>
                {personTimeline.map((ev, index) => {
                  const evDate = new Date(ev.timestamp);
                  const isCritical = ev.severity === 'critical';
                  const isAttention = ev.severity === 'attention';

                  return (
                    <View key={ev.id} style={styles.timelineRow}>
                      <View style={styles.timelineTrackCol}>
                        <View
                          style={[
                            styles.timelineDot,
                            isCritical && styles.timelineDotCritical,
                            isAttention && styles.timelineDotAttention,
                          ]}
                        />
                        {index < personTimeline.length - 1 && <View style={styles.timelineLine} />}
                      </View>

                      <View style={styles.timelineContentCard}>
                        <View style={styles.timelineContentTop}>
                          <Text style={styles.timelineEventTitle}>{ev.title}</Text>
                          <Text style={styles.timelineTime}>
                            {evDate.toLocaleDateString([], { month: 'short', day: 'numeric' })} •{' '}
                            {evDate.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                          </Text>
                        </View>

                        {ev.description ? (
                          <Text style={styles.timelineEventDesc}>{ev.description}</Text>
                        ) : null}

                        {ev.author ? (
                          <Text style={styles.timelineAuthor}>Logged by: {ev.author.name}</Text>
                        ) : null}
                      </View>
                    </View>
                  );
                })}
              </View>
            )}
          </View>
        )}

        {/* ============================================ */}
        {/* MEDICATIONS SECTION */}
        {/* ============================================ */}
        {activeSection === 'medications' && (
          <View style={styles.sectionContainer}>
            <View style={styles.subSectionHeader}>
              <Text style={styles.subSectionTitle}>PRESCRIBED MEDICATIONS</Text>
              <Pressable onPress={() => navigation.navigate('Profile', { screen: 'HealthInfo' })}>
                <Text style={styles.subSectionLink}>+ Edit Meds</Text>
              </Pressable>
            </View>

            {personMedications.length === 0 ? (
              <View style={styles.cardEmpty}>
                <AppIcon name="pulse" size={26} color={colors.accent} />
                <Text style={styles.cardEmptyTitle}>No medications recorded</Text>
                <Text style={styles.cardEmptySub}>
                  Keep an accurate medication list for {displayName} to prevent adverse interactions
                  and track daily adherence.
                </Text>
                <Pressable
                  style={styles.actionBtnCentered}
                  onPress={() => navigation.navigate('Profile', { screen: 'HealthInfo' })}
                >
                  <Text style={styles.actionBtnCenteredText}>Add Medication</Text>
                </Pressable>
              </View>
            ) : (
              <View style={styles.medsList}>
                {personMedications.map((med) => (
                  <View key={med.id} style={styles.medCard}>
                    <View style={styles.medTopRow}>
                      <Text style={styles.medName}>{med.name}</Text>
                      {med.dosage ? <Text style={styles.medDosage}>{med.dosage}</Text> : null}
                    </View>
                    <Text style={styles.medFreq}>{med.frequency}</Text>
                    {med.notes ? <Text style={styles.medInstructions}>{med.notes}</Text> : null}
                  </View>
                ))}
              </View>
            )}
          </View>
        )}

        {/* ============================================ */}
        {/* APPOINTMENTS SECTION */}
        {/* ============================================ */}
        {activeSection === 'appointments' && (
          <View style={styles.sectionContainer}>
            <View style={styles.subSectionHeader}>
              <Text style={styles.subSectionTitle}>UPCOMING VISITS & CONSULTATIONS</Text>
              <Pressable onPress={() => navigation.navigate('Schedule')}>
                <Text style={styles.subSectionLink}>All Bookings →</Text>
              </Pressable>
            </View>

            {bookings.length === 0 ? (
              <View style={styles.cardEmpty}>
                <AppIcon name="calendar" size={26} color={colors.accent} />
                <Text style={styles.cardEmptyTitle}>No upcoming appointments</Text>
                <Text style={styles.cardEmptySub}>
                  Schedule doctor follow-ups, teleconsultations, or check-ups.
                </Text>
                <Pressable
                  style={styles.actionBtnCentered}
                  onPress={() => navigation.navigate('Services')}
                >
                  <Text style={styles.actionBtnCenteredText}>Find Doctor or Service</Text>
                </Pressable>
              </View>
            ) : (
              <View style={styles.appointmentsList}>
                {bookings.map((b) => (
                  <View key={b.id} style={styles.appointmentCard}>
                    <View style={styles.appTop}>
                      <Text style={styles.appService}>
                        {b.service?.name || 'Healthcare Service'}
                      </Text>
                      <View style={styles.appStatusPill}>
                        <Text style={styles.appStatusText}>{b.status}</Text>
                      </View>
                    </View>
                    <Text style={styles.appTime}>{new Date(b.scheduledAt).toLocaleString()}</Text>
                    {b.provider?.name ? (
                      <Text style={styles.appProvider}>Provider: {b.provider.name}</Text>
                    ) : null}
                  </View>
                ))}
              </View>
            )}
          </View>
        )}

        {/* ============================================ */}
        {/* SERVICES SECTION */}
        {/* ============================================ */}
        {activeSection === 'services' && (
          <View style={styles.sectionContainer}>
            <View style={styles.subSectionHeader}>
              <Text style={styles.subSectionTitle}>CARE EXECUTION & SERVICES</Text>
              <Pressable onPress={() => navigation.navigate('Services')}>
                <Text style={styles.subSectionLink}>Browse Catalog →</Text>
              </Pressable>
            </View>

            {personServices.length === 0 ? (
              <View style={styles.cardEmpty}>
                <AppIcon name="physio" size={26} color={colors.accent} />
                <Text style={styles.cardEmptyTitle}>No active service requests</Text>
                <Text style={styles.cardEmptySub}>
                  CareBow can coordinate physical therapy, in-home nursing, medical equipment, and
                  doctor visits.
                </Text>
                <Pressable
                  style={styles.actionBtnCentered}
                  onPress={() => navigation.navigate('Services')}
                >
                  <Text style={styles.actionBtnCenteredText}>Request Care Service</Text>
                </Pressable>
              </View>
            ) : (
              <View style={styles.servicesList}>
                {personServices.map((req) => (
                  <View key={req.id} style={styles.serviceDetailCard}>
                    <View style={styles.serviceTop}>
                      <Text style={styles.serviceItemTitle}>{req.serviceTitle}</Text>
                      <View style={styles.serviceStatusBadge}>
                        <Text style={styles.serviceStatusBadgeText}>
                          {req.status.replace(/_/g, ' ').toUpperCase()}
                        </Text>
                      </View>
                    </View>

                    <Text style={styles.serviceMsg}>
                      {req.statusMessage || `Status: ${req.status}`}
                    </Text>

                    {req.providerName ? (
                      <Text style={styles.serviceProvider}>Assigned: {req.providerName}</Text>
                    ) : null}

                    <View style={styles.serviceActionRow}>
                      <Pressable
                        style={styles.serviceActionBtn}
                        onPress={() => navigation.navigate('Services')}
                      >
                        <Text style={styles.serviceActionBtnText}>Manage Service</Text>
                      </Pressable>
                    </View>
                  </View>
                ))}
              </View>
            )}
          </View>
        )}

        {/* ============================================ */}
        {/* DOCUMENTS SECTION */}
        {/* ============================================ */}
        {activeSection === 'documents' && (
          <View style={styles.sectionContainer}>
            <View style={styles.subSectionHeader}>
              <Text style={styles.subSectionTitle}>CARE DOCUMENTS & DISCHARGE</Text>
              <Pressable
                onPress={() => navigation.navigate('Profile', { screen: 'HealthRecords' })}
              >
                <Text style={styles.subSectionLink}>All Records →</Text>
              </Pressable>
            </View>

            {activeEpisode?.dischargeDetails ? (
              <View style={styles.docCard}>
                <View style={styles.docIconWrap}>
                  <AppIcon name="document" size={24} color={colors.accent} />
                </View>
                <View style={styles.docInfo}>
                  <Text style={styles.docTitle}>Discharge Summary & Instructions</Text>
                  <Text style={styles.docHospital}>
                    {activeEpisode.dischargeDetails.hospitalName || 'Hospital Care Plan'}
                  </Text>
                  {activeEpisode.dischargeDetails.primaryDiagnosis ? (
                    <Text style={styles.docDiagnosis}>
                      Diagnosis: {activeEpisode.dischargeDetails.primaryDiagnosis}
                    </Text>
                  ) : null}
                </View>
              </View>
            ) : null}

            <Pressable
              style={styles.uploadDocBanner}
              onPress={() => {
                Haptics.trigger('impactLight');
                navigation.navigate('CareTransition', {
                  personId: selectedPersonId,
                });
              }}
            >
              <AppIcon name="document" size={20} color={colors.accent} />
              <View style={{ flex: 1 }}>
                <Text style={styles.uploadDocTitle}>Upload or Paste Discharge Notes</Text>
                <Text style={styles.uploadDocSub}>
                  CareBow will extract structured appointments, medications, and tasks for
                  confirmation.
                </Text>
              </View>
              <AppIcon name="arrow-right" size={16} color={colors.accent} />
            </Pressable>
          </View>
        )}
      </ScrollView>

      {/* CREATE TASK MODAL */}
      <Modal
        visible={showAddTaskModal}
        transparent
        animationType="slide"
        onRequestClose={() => setShowAddTaskModal(false)}
      >
        <Pressable style={styles.modalOverlay} onPress={() => setShowAddTaskModal(false)}>
          <Pressable style={styles.modalCard} onPress={(e) => e.stopPropagation()}>
            <Text style={styles.modalTitle}>Add Care Task</Text>
            <Text style={styles.modalSub}>
              Assign an action to yourself, {displayName}, or CareBow coordination.
            </Text>

            <TextInput
              style={styles.inputField}
              placeholder="Task title (e.g. Schedule cardiologist follow-up)"
              placeholderTextColor={colors.textTertiary}
              value={newTaskTitle}
              onChangeText={setNewTaskTitle}
            />

            <TextInput
              style={[styles.inputField, { minHeight: 60 }]}
              placeholder="Instructions or notes (optional)"
              placeholderTextColor={colors.textTertiary}
              value={newTaskDesc}
              onChangeText={setNewTaskDesc}
              multiline
            />

            <Text style={styles.fieldLabel}>ASSIGN TO</Text>
            <View style={styles.ownerOptionRow}>
              {(
                [
                  { type: 'caregiver', label: 'You' },
                  { type: 'care_recipient', label: displayName },
                  { type: 'carebow', label: 'CareBow' },
                ] as const
              ).map((opt) => (
                <Pressable
                  key={opt.type}
                  style={[
                    styles.ownerOptionPill,
                    newTaskOwner === opt.type && styles.ownerOptionPillActive,
                  ]}
                  onPress={() => setNewTaskOwner(opt.type)}
                >
                  <Text
                    style={[
                      styles.ownerOptionText,
                      newTaskOwner === opt.type && styles.ownerOptionTextActive,
                    ]}
                  >
                    {opt.label}
                  </Text>
                </Pressable>
              ))}
            </View>

            <Text style={styles.fieldLabel}>PRIORITY</Text>
            <View style={styles.ownerOptionRow}>
              {(['urgent', 'high', 'medium', 'low'] as CareTaskPriority[]).map((p) => (
                <Pressable
                  key={p}
                  style={[
                    styles.ownerOptionPill,
                    newTaskPriority === p && styles.ownerOptionPillActive,
                  ]}
                  onPress={() => setNewTaskPriority(p)}
                >
                  <Text
                    style={[
                      styles.ownerOptionText,
                      newTaskPriority === p && styles.ownerOptionTextActive,
                    ]}
                  >
                    {p.toUpperCase()}
                  </Text>
                </Pressable>
              ))}
            </View>

            <View style={styles.modalBtnRow}>
              <Pressable style={styles.cancelBtn} onPress={() => setShowAddTaskModal(false)}>
                <Text style={styles.cancelBtnText}>Cancel</Text>
              </Pressable>
              <Pressable
                style={[styles.saveBtn, !newTaskTitle.trim() && styles.saveBtnDisabled]}
                onPress={handleCreateTask}
                disabled={!newTaskTitle.trim()}
              >
                <Text style={styles.saveBtnText}>Create Task</Text>
              </Pressable>
            </View>
          </Pressable>
        </Pressable>
      </Modal>

      {/* REASSIGN TASK MODAL */}
      <Modal
        visible={!!taskToReassign}
        transparent
        animationType="fade"
        onRequestClose={() => setTaskToReassign(null)}
      >
        <Pressable style={styles.modalOverlay} onPress={() => setTaskToReassign(null)}>
          <Pressable style={styles.modalCard} onPress={(e) => e.stopPropagation()}>
            <Text style={styles.modalTitle}>Reassign Task</Text>
            <Text style={styles.modalSub}>
              Choose who will be responsible for "{taskToReassign?.title}".
            </Text>

            <View style={styles.reassignList}>
              <Pressable
                style={styles.reassignOption}
                onPress={() => handleConfirmReassign('caregiver', 'Primary Caregiver')}
              >
                <AppIcon name="user" size={18} color={colors.accent} />
                <View style={{ flex: 1 }}>
                  <Text style={styles.reassignName}>Primary Caregiver (You)</Text>
                  <Text style={styles.reassignSub}>Full care access</Text>
                </View>
              </Pressable>

              <Pressable
                style={styles.reassignOption}
                onPress={() => handleConfirmReassign('care_recipient', displayName)}
              >
                <AppIcon name="heart" size={18} color={colors.accent} />
                <View style={{ flex: 1 }}>
                  <Text style={styles.reassignName}>{displayName}</Text>
                  <Text style={styles.reassignSub}>Care Recipient</Text>
                </View>
              </Pressable>

              <Pressable
                style={styles.reassignOption}
                onPress={() => handleConfirmReassign('carebow', 'CareBow Coordination')}
              >
                <AppIcon name="sparkles" size={18} color={colors.accent} />
                <View style={{ flex: 1 }}>
                  <Text style={styles.reassignName}>CareBow Coordination</Text>
                  <Text style={styles.reassignSub}>Automated & operational follow-up</Text>
                </View>
              </Pressable>
            </View>

            <Pressable style={styles.cancelBtnCentered} onPress={() => setTaskToReassign(null)}>
              <Text style={styles.cancelBtnText}>Cancel</Text>
            </Pressable>
          </Pressable>
        </Pressable>
      </Modal>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
    backgroundColor: '#F8FAFC',
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: spacing.lg,
    paddingVertical: spacing.md,
    backgroundColor: '#FFFFFF',
    borderBottomWidth: 1,
    borderBottomColor: '#E2E8F0',
  },
  headerContext: {
    fontSize: 10,
    fontWeight: '800',
    color: colors.textTertiary,
    letterSpacing: 0.8,
  },
  headerTitle: {
    fontSize: 20,
    fontWeight: '700',
    color: colors.textPrimary,
  },
  askButton: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    backgroundColor: colors.accent,
    paddingHorizontal: 12,
    paddingVertical: 7,
    borderRadius: radius.full,
  },
  askButtonText: {
    color: '#FFFFFF',
    fontSize: 12,
    fontWeight: '700',
  },
  tabsContainer: {
    backgroundColor: '#FFFFFF',
    borderBottomWidth: 1,
    borderBottomColor: '#E2E8F0',
  },
  tabsScrollContent: {
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.sm,
    gap: spacing.sm,
  },
  tabChip: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    paddingHorizontal: 12,
    paddingVertical: 7,
    borderRadius: radius.full,
    backgroundColor: '#F1F5F9',
  },
  tabChipActive: {
    backgroundColor: colors.accent,
  },
  tabChipText: {
    fontSize: 12,
    fontWeight: '600',
    color: colors.textSecondary,
  },
  tabChipTextActive: {
    color: '#FFFFFF',
  },
  contentScroll: {
    flex: 1,
  },
  contentInner: {
    padding: spacing.lg,
  },
  sectionContainer: {
    gap: spacing.lg,
  },
  episodeDetailCard: {
    backgroundColor: '#FFFFFF',
    borderRadius: radius.lg,
    padding: spacing.lg,
    borderWidth: 1,
    borderColor: '#E2E8F0',
    ...shadows.card,
  },
  episodeTopRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: spacing.xs,
  },
  statusBadge: {
    backgroundColor: '#CCFBF1',
    paddingHorizontal: 8,
    paddingVertical: 3,
    borderRadius: 4,
  },
  statusBadgeText: {
    fontSize: 10,
    fontWeight: '800',
    color: colors.accent,
  },
  episodeDate: {
    fontSize: 11,
    color: colors.textTertiary,
  },
  episodeDetailTitle: {
    fontSize: 17,
    fontWeight: '700',
    color: colors.textPrimary,
    marginTop: spacing.xs,
  },
  episodeDetailDesc: {
    fontSize: 13,
    color: colors.textSecondary,
    lineHeight: 18,
    marginTop: 4,
  },
  statusRow: {
    marginTop: spacing.md,
    paddingTop: spacing.md,
    borderTopWidth: 1,
    borderTopColor: '#F1F5F9',
  },
  statusLabel: {
    fontSize: 11,
    fontWeight: '700',
    color: colors.textTertiary,
    marginBottom: spacing.xs,
  },
  statusPillsWrap: {
    flexDirection: 'row',
    gap: spacing.sm,
  },
  workflowPill: {
    paddingHorizontal: 10,
    paddingVertical: 5,
    borderRadius: radius.full,
    backgroundColor: '#F1F5F9',
  },
  workflowPillActive: {
    backgroundColor: colors.accent,
  },
  workflowPillText: {
    fontSize: 11,
    fontWeight: '600',
    color: colors.textSecondary,
  },
  workflowPillTextActive: {
    color: '#FFFFFF',
  },
  goalsWrap: {
    marginTop: spacing.md,
    paddingTop: spacing.md,
    borderTopWidth: 1,
    borderTopColor: '#F1F5F9',
    gap: 6,
  },
  goalsTitle: {
    fontSize: 10,
    fontWeight: '800',
    color: colors.textTertiary,
    letterSpacing: 0.8,
  },
  goalItem: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
  },
  goalText: {
    fontSize: 13,
    color: colors.textPrimary,
    flex: 1,
  },
  cardEmpty: {
    backgroundColor: '#FFFFFF',
    borderRadius: radius.lg,
    padding: spacing.xl,
    borderWidth: 1,
    borderColor: '#E2E8F0',
    alignItems: 'center',
    gap: spacing.xs,
  },
  cardEmptyTitle: {
    fontSize: 15,
    fontWeight: '700',
    color: colors.textPrimary,
    marginTop: spacing.xs,
  },
  cardEmptySub: {
    fontSize: 12,
    color: colors.textSecondary,
    textAlign: 'center',
    lineHeight: 16,
  },
  actionBtnCentered: {
    marginTop: spacing.md,
    backgroundColor: colors.accent,
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: radius.md,
  },
  actionBtnCenteredText: {
    color: '#FFFFFF',
    fontSize: 12,
    fontWeight: '700',
  },
  metricsGrid: {
    flexDirection: 'row',
    gap: spacing.sm,
  },
  metricCard: {
    flex: 1,
    backgroundColor: '#FFFFFF',
    padding: spacing.md,
    borderRadius: radius.md,
    borderWidth: 1,
    borderColor: '#E2E8F0',
    alignItems: 'center',
  },
  metricNum: {
    fontSize: 20,
    fontWeight: '800',
    color: colors.accent,
  },
  metricLabel: {
    fontSize: 11,
    color: colors.textSecondary,
    marginTop: 2,
  },
  cardSection: {
    backgroundColor: '#FFFFFF',
    borderRadius: radius.lg,
    padding: spacing.lg,
    borderWidth: 1,
    borderColor: '#E2E8F0',
  },
  cardSectionHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: spacing.md,
  },
  cardSectionTitle: {
    fontSize: 11,
    fontWeight: '800',
    color: colors.textTertiary,
    letterSpacing: 0.8,
  },
  cardSectionLink: {
    fontSize: 12,
    fontWeight: '700',
    color: colors.accent,
  },
  teamList: {
    gap: spacing.sm,
  },
  teamMemberItem: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: spacing.xs,
    gap: spacing.md,
  },
  teamMemberAvatar: {
    width: 32,
    height: 32,
    borderRadius: 16,
    backgroundColor: '#CCFBF1',
    justifyContent: 'center',
    alignItems: 'center',
  },
  teamMemberAvatarText: {
    fontSize: 13,
    fontWeight: '700',
    color: colors.accent,
  },
  teamMemberInfo: {
    flex: 1,
  },
  teamMemberName: {
    fontSize: 13,
    fontWeight: '600',
    color: colors.textPrimary,
  },
  teamMemberRole: {
    fontSize: 11,
    color: colors.textSecondary,
  },
  teamMemberBadge: {
    backgroundColor: '#F1F5F9',
    paddingHorizontal: 8,
    paddingVertical: 3,
    borderRadius: 4,
  },
  teamMemberBadgeText: {
    fontSize: 10,
    fontWeight: '700',
    color: colors.textSecondary,
  },
  taskControlsRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  filterChipsRow: {
    flexDirection: 'row',
    gap: 6,
  },
  filterChip: {
    paddingHorizontal: 8,
    paddingVertical: 5,
    borderRadius: 4,
    backgroundColor: '#F1F5F9',
  },
  filterChipActive: {
    backgroundColor: colors.accent,
  },
  filterChipText: {
    fontSize: 10,
    fontWeight: '700',
    color: colors.textSecondary,
  },
  filterChipTextActive: {
    color: '#FFFFFF',
  },
  addTaskButton: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    backgroundColor: colors.accent,
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: radius.md,
  },
  addTaskButtonText: {
    color: '#FFFFFF',
    fontSize: 11,
    fontWeight: '700',
  },
  tasksVerticalList: {
    gap: spacing.sm,
  },
  taskDetailCard: {
    backgroundColor: '#FFFFFF',
    borderRadius: radius.md,
    padding: spacing.md,
    borderWidth: 1,
    borderColor: '#E2E8F0',
  },
  taskDetailCardDone: {
    backgroundColor: '#F8FAFC',
    opacity: 0.6,
  },
  taskDetailHeader: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    gap: spacing.md,
  },
  taskCheck: {
    width: 22,
    height: 22,
    borderRadius: 6,
    borderWidth: 2,
    borderColor: colors.textTertiary,
    marginTop: 2,
    justifyContent: 'center',
    alignItems: 'center',
  },
  taskCheckDone: {
    backgroundColor: colors.success,
    borderColor: colors.success,
  },
  taskHeaderContent: {
    flex: 1,
  },
  taskDetailTitle: {
    fontSize: 14,
    fontWeight: '600',
    color: colors.textPrimary,
  },
  taskDetailTitleDone: {
    textDecorationLine: 'line-through',
    color: colors.textTertiary,
  },
  taskDetailDescription: {
    fontSize: 12,
    color: colors.textSecondary,
    marginTop: 2,
  },
  taskFooterRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.sm,
    marginTop: spacing.md,
    paddingTop: spacing.sm,
    borderTopWidth: 1,
    borderTopColor: '#F8FAFC',
  },
  taskOwnerChip: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#F1F5F9',
    paddingHorizontal: 8,
    paddingVertical: 3,
    borderRadius: 4,
    gap: 4,
  },
  taskOwnerText: {
    fontSize: 11,
    fontWeight: '600',
    color: colors.accent,
  },
  taskDueDate: {
    fontSize: 11,
    color: colors.textTertiary,
    flex: 1,
  },
  urgentPill: {
    backgroundColor: '#FEE2E2',
    paddingHorizontal: 6,
    paddingVertical: 2,
    borderRadius: 4,
  },
  urgentPillText: {
    fontSize: 9,
    fontWeight: '800',
    color: '#DC2626',
  },
  timelineHeaderRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  timelineHeading: {
    fontSize: 11,
    fontWeight: '800',
    color: colors.textTertiary,
    letterSpacing: 0.8,
  },
  timelineCount: {
    fontSize: 12,
    color: colors.textSecondary,
  },
  timelineEventsList: {
    marginTop: spacing.xs,
  },
  timelineRow: {
    flexDirection: 'row',
    gap: spacing.md,
  },
  timelineTrackCol: {
    alignItems: 'center',
    width: 16,
  },
  timelineDot: {
    width: 10,
    height: 10,
    borderRadius: 5,
    backgroundColor: colors.accent,
    marginTop: 6,
  },
  timelineDotAttention: {
    backgroundColor: '#F59E0B',
  },
  timelineDotCritical: {
    backgroundColor: '#DC2626',
  },
  timelineLine: {
    width: 2,
    flex: 1,
    backgroundColor: '#E2E8F0',
    marginVertical: 4,
  },
  timelineContentCard: {
    flex: 1,
    backgroundColor: '#FFFFFF',
    borderRadius: radius.md,
    padding: spacing.md,
    borderWidth: 1,
    borderColor: '#E2E8F0',
    marginBottom: spacing.md,
  },
  timelineContentTop: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    marginBottom: 2,
  },
  timelineEventTitle: {
    fontSize: 13,
    fontWeight: '700',
    color: colors.textPrimary,
    flex: 1,
  },
  timelineTime: {
    fontSize: 11,
    color: colors.textTertiary,
  },
  timelineEventDesc: {
    fontSize: 12,
    color: colors.textSecondary,
    marginTop: 2,
  },
  timelineAuthor: {
    fontSize: 10,
    color: colors.textTertiary,
    marginTop: 4,
  },
  subSectionHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  subSectionTitle: {
    fontSize: 11,
    fontWeight: '800',
    color: colors.textTertiary,
    letterSpacing: 0.8,
  },
  subSectionLink: {
    fontSize: 12,
    fontWeight: '700',
    color: colors.accent,
  },
  medsList: {
    gap: spacing.sm,
  },
  medCard: {
    backgroundColor: '#FFFFFF',
    borderRadius: radius.md,
    padding: spacing.md,
    borderWidth: 1,
    borderColor: '#E2E8F0',
  },
  medTopRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  medName: {
    fontSize: 14,
    fontWeight: '700',
    color: colors.textPrimary,
  },
  medDosage: {
    fontSize: 12,
    fontWeight: '600',
    color: colors.accent,
  },
  medFreq: {
    fontSize: 12,
    color: colors.textSecondary,
    marginTop: 2,
  },
  medInstructions: {
    fontSize: 11,
    color: colors.textTertiary,
    marginTop: 4,
  },
  appointmentsList: {
    gap: spacing.sm,
  },
  appointmentCard: {
    backgroundColor: '#FFFFFF',
    borderRadius: radius.md,
    padding: spacing.md,
    borderWidth: 1,
    borderColor: '#E2E8F0',
  },
  appTop: {
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  appService: {
    fontSize: 14,
    fontWeight: '700',
    color: colors.textPrimary,
  },
  appStatusPill: {
    backgroundColor: '#CCFBF1',
    paddingHorizontal: 6,
    paddingVertical: 2,
    borderRadius: 4,
  },
  appStatusText: {
    fontSize: 10,
    fontWeight: '700',
    color: colors.accent,
  },
  appTime: {
    fontSize: 12,
    color: colors.textSecondary,
    marginTop: 4,
  },
  appProvider: {
    fontSize: 11,
    color: colors.textTertiary,
    marginTop: 2,
  },
  servicesList: {
    gap: spacing.sm,
  },
  serviceDetailCard: {
    backgroundColor: '#FFFFFF',
    borderRadius: radius.md,
    padding: spacing.md,
    borderWidth: 1,
    borderColor: '#E2E8F0',
  },
  serviceTop: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  serviceItemTitle: {
    fontSize: 14,
    fontWeight: '700',
    color: colors.textPrimary,
  },
  serviceStatusBadge: {
    backgroundColor: '#E0F2FE',
    paddingHorizontal: 6,
    paddingVertical: 2,
    borderRadius: 4,
  },
  serviceStatusBadgeText: {
    fontSize: 10,
    fontWeight: '700',
    color: '#0369A1',
  },
  serviceMsg: {
    fontSize: 12,
    color: colors.textSecondary,
    marginTop: 4,
  },
  serviceProvider: {
    fontSize: 11,
    color: colors.textTertiary,
    marginTop: 2,
  },
  serviceActionRow: {
    marginTop: spacing.sm,
    flexDirection: 'row',
  },
  serviceActionBtn: {
    backgroundColor: colors.accent,
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: radius.md,
  },
  serviceActionBtnText: {
    color: '#FFFFFF',
    fontSize: 11,
    fontWeight: '700',
  },
  docCard: {
    backgroundColor: '#FFFFFF',
    borderRadius: radius.md,
    padding: spacing.md,
    borderWidth: 1,
    borderColor: '#E2E8F0',
    flexDirection: 'row',
    gap: spacing.md,
    alignItems: 'center',
  },
  docIconWrap: {
    width: 40,
    height: 40,
    borderRadius: 8,
    backgroundColor: '#CCFBF1',
    justifyContent: 'center',
    alignItems: 'center',
  },
  docInfo: {
    flex: 1,
  },
  docTitle: {
    fontSize: 13,
    fontWeight: '700',
    color: colors.textPrimary,
  },
  docHospital: {
    fontSize: 11,
    color: colors.textSecondary,
  },
  docDiagnosis: {
    fontSize: 11,
    color: colors.textTertiary,
  },
  uploadDocBanner: {
    backgroundColor: '#F0FDFA',
    borderRadius: radius.md,
    padding: spacing.md,
    borderWidth: 1,
    borderColor: '#99F6E4',
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.md,
  },
  uploadDocTitle: {
    fontSize: 13,
    fontWeight: '700',
    color: colors.textPrimary,
  },
  uploadDocSub: {
    fontSize: 11,
    color: colors.textSecondary,
    marginTop: 2,
    lineHeight: 15,
  },
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.5)',
    justifyContent: 'center',
    alignItems: 'center',
    padding: spacing.lg,
  },
  modalCard: {
    backgroundColor: '#FFFFFF',
    borderRadius: radius.lg,
    padding: spacing.lg,
    width: '100%',
    maxWidth: 440,
  },
  modalTitle: {
    fontSize: 17,
    fontWeight: '700',
    color: colors.textPrimary,
  },
  modalSub: {
    fontSize: 12,
    color: colors.textSecondary,
    marginTop: 2,
    marginBottom: spacing.md,
  },
  inputField: {
    borderWidth: 1,
    borderColor: '#E2E8F0',
    borderRadius: radius.md,
    padding: spacing.md,
    fontSize: 14,
    color: colors.textPrimary,
    marginBottom: spacing.sm,
  },
  fieldLabel: {
    fontSize: 10,
    fontWeight: '800',
    color: colors.textTertiary,
    letterSpacing: 0.8,
    marginTop: spacing.xs,
    marginBottom: spacing.xs,
  },
  ownerOptionRow: {
    flexDirection: 'row',
    gap: spacing.sm,
    marginBottom: spacing.sm,
  },
  ownerOptionPill: {
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: radius.full,
    backgroundColor: '#F1F5F9',
  },
  ownerOptionPillActive: {
    backgroundColor: colors.accent,
  },
  ownerOptionText: {
    fontSize: 11,
    fontWeight: '700',
    color: colors.textSecondary,
  },
  ownerOptionTextActive: {
    color: '#FFFFFF',
  },
  modalBtnRow: {
    flexDirection: 'row',
    justifyContent: 'flex-end',
    gap: spacing.md,
    marginTop: spacing.md,
  },
  cancelBtn: {
    paddingHorizontal: 16,
    paddingVertical: 10,
  },
  cancelBtnCentered: {
    paddingVertical: 10,
    alignItems: 'center',
    marginTop: spacing.sm,
  },
  cancelBtnText: {
    color: colors.textSecondary,
    fontWeight: '600',
    fontSize: 13,
  },
  saveBtn: {
    backgroundColor: colors.accent,
    paddingHorizontal: 18,
    paddingVertical: 10,
    borderRadius: radius.md,
  },
  saveBtnDisabled: {
    opacity: 0.5,
  },
  saveBtnText: {
    color: '#FFFFFF',
    fontWeight: '700',
    fontSize: 13,
  },
  reassignList: {
    gap: spacing.sm,
    marginVertical: spacing.md,
  },
  reassignOption: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.md,
    padding: spacing.md,
    borderRadius: radius.md,
    borderWidth: 1,
    borderColor: '#E2E8F0',
  },
  reassignName: {
    fontSize: 13,
    fontWeight: '700',
    color: colors.textPrimary,
  },
  reassignSub: {
    fontSize: 11,
    color: colors.textSecondary,
  },
});
