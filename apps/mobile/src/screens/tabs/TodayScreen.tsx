/**
 * Today Screen - The Center of Gravity for CareBow
 * Answers in seconds:
 * "Who am I caring for?"
 * "What is happening?"
 * "What needs attention today?"
 * "Who is responsible?"
 * "What happens next?"
 */

import React, { useState, useMemo, useCallback } from 'react';
import { View, Text, ScrollView, StyleSheet, Pressable, Modal, TextInput } from 'react-native';
import { SafeAreaView, useSafeAreaInsets } from 'react-native-safe-area-context';
import { useNavigation } from '@react-navigation/native';
import LinearGradient from 'react-native-linear-gradient';
import * as Haptics from 'react-native-haptic-feedback';
import { useAuthStore } from '../../store/useAuthStore';
import { useCareStore } from '../../store/useCareStore';
import { useSelectedPersonContext } from '../../hooks/useSelectedPersonContext';
import { AppIcon } from '../../components/icons/AppIcon';
import { CareBowLogoAccurate } from '../../components/icons/CareBowLogo';
import { colors, radius, shadows, spacing } from '../../theme';
import type { CareTask } from '../../types/care';
import { WORKFLOW_STATUS_LABELS } from '../../types/care';

export default function TodayScreen() {
  const insets = useSafeAreaInsets();
  const navigation = useNavigation<any>();
  const user = useAuthStore((state) => state.user);

  const { selectedPersonId, displayName, allPersons, selectPerson, activeEpisode } =
    useSelectedPersonContext();

  const tasks = useCareStore((state) => state.tasks);
  const completeTask = useCareStore((state) => state.completeTask);
  const reopenTask = useCareStore((state) => state.reopenTask);
  const careUpdates = useCareStore((state) => state.careUpdates);
  const addCareUpdate = useCareStore((state) => state.addCareUpdate);
  const serviceRequests = useCareStore((state) => state.serviceRequests);

  const [showPersonPicker, setShowPersonPicker] = useState(false);
  const [showAddUpdateModal, setShowAddUpdateModal] = useState(false);
  const [updateText, setUpdateText] = useState('');
  const [updateCategory, setUpdateCategory] = useState<'symptom' | 'general' | 'mood'>('symptom');

  // Filter tasks for selected person
  const personTasks = useMemo(() => {
    if (!selectedPersonId) return [];
    return tasks.filter((t) => t.personId === selectedPersonId);
  }, [tasks, selectedPersonId]);

  const todayStr = useMemo(() => new Date().toISOString().split('T')[0], []);

  const todayTasks = useMemo(() => {
    return personTasks.filter((t) => {
      if (t.status === 'cancelled') return false;
      const due = t.dueAt ? t.dueAt.split('T')[0] : '';
      return due === todayStr;
    });
  }, [personTasks, todayStr]);

  const overdueTasks = useMemo(() => {
    return personTasks.filter((t) => {
      if (t.status === 'completed' || t.status === 'cancelled') return false;
      const due = t.dueAt ? t.dueAt.split('T')[0] : '';
      return due !== '' && due < todayStr;
    });
  }, [personTasks, todayStr]);

  const recentUpdate = useMemo(() => {
    if (!selectedPersonId) return null;
    const personUpdates = careUpdates.filter((u) => u.personId === selectedPersonId);
    return personUpdates.length > 0 ? personUpdates[0] : null;
  }, [careUpdates, selectedPersonId]);

  const unresolvedService = useMemo(() => {
    if (!selectedPersonId) return null;
    return serviceRequests.find(
      (r) =>
        r.personId === selectedPersonId && ['requested', 'matching', 'reviewing'].includes(r.status)
    );
  }, [serviceRequests, selectedPersonId]);

  // Initials for avatar
  const initials = useMemo(() => {
    const fn = user?.firstName?.trim().charAt(0) || '';
    const ln = user?.lastName?.trim().charAt(0) || '';
    return (fn + ln).toUpperCase() || 'C';
  }, [user]);

  const handleToggleTask = useCallback(
    (task: CareTask) => {
      Haptics.trigger('impactMedium');
      if (task.status === 'completed') {
        reopenTask(task.id);
      } else {
        completeTask(task.id);
      }
    },
    [completeTask, reopenTask]
  );

  const handleSaveUpdate = useCallback(() => {
    if (!updateText.trim() || !selectedPersonId) return;
    Haptics.trigger('notificationSuccess');
    addCareUpdate({
      personId: selectedPersonId,
      authorId: user?.id || 'caregiver',
      authorName: user?.firstName || 'Caregiver',
      note: updateText.trim(),
      category: updateCategory,
    });
    setUpdateText('');
    setShowAddUpdateModal(false);
  }, [updateText, selectedPersonId, user, updateCategory, addCareUpdate]);

  // Days in episode calculation
  const episodeDays = useMemo(() => {
    if (!activeEpisode?.startDate) return 1;
    const start = new Date(activeEpisode.startDate).getTime();
    const now = new Date().getTime();
    const diff = Math.floor((now - start) / (1000 * 60 * 60 * 24));
    return Math.max(1, diff + 1);
  }, [activeEpisode]);

  return (
    <SafeAreaView style={styles.safeArea} edges={['top']}>
      {/* HEADER: Care Recipient Bar & Profile Control */}
      <View style={styles.header}>
        <View style={styles.headerLeft}>
          <CareBowLogoAccurate size={32} />
          <Pressable
            style={styles.personSelector}
            onPress={() => {
              Haptics.trigger('impactLight');
              setShowPersonPicker(true);
            }}
            accessibilityRole="button"
            accessibilityLabel={`Caring for ${displayName}. Tap to switch care recipient.`}
          >
            <View>
              <Text style={styles.caringForLabel}>CARING FOR</Text>
              <View style={styles.personRow}>
                <Text style={styles.personName}>{displayName}</Text>
                <AppIcon name="chevron-down" size={16} color={colors.accent} />
              </View>
            </View>
          </Pressable>
        </View>

        <View style={styles.headerRight}>
          <Pressable
            style={styles.avatarButton}
            onPress={() => {
              Haptics.trigger('impactLight');
              navigation.navigate('Profile', { screen: 'ProfileIndex' });
            }}
            accessibilityRole="button"
            accessibilityLabel="Open settings and profile"
          >
            <LinearGradient
              colors={[colors.accentLight, colors.accent]}
              style={styles.avatarGradient}
            >
              <Text style={styles.avatarText}>{initials}</Text>
            </LinearGradient>
          </Pressable>
        </View>
      </View>

      <ScrollView
        style={styles.scrollView}
        contentContainerStyle={[styles.scrollContent, { paddingBottom: insets.bottom + 90 }]}
        showsVerticalScrollIndicator={false}
      >
        {/* ACTIVE CARE SITUATION CARD */}
        {activeEpisode ? (
          <View style={styles.episodeCard}>
            <View style={styles.episodeHeader}>
              <View style={styles.badgeRow}>
                <View style={styles.episodeTypeBadge}>
                  <Text style={styles.episodeTypeBadgeText}>
                    {activeEpisode.episodeType === 'hospital_discharge' ? 'RECOVERY' : 'CARE PLAN'}
                  </Text>
                </View>
                <View
                  style={[
                    styles.statusPill,
                    activeEpisode.workflowStatus === 'needs_attention' && styles.statusPillAlert,
                    activeEpisode.workflowStatus === 'recovery_ongoing' &&
                      styles.statusPillProgress,
                  ]}
                >
                  <Text
                    style={[
                      styles.statusPillText,
                      activeEpisode.workflowStatus === 'needs_attention' &&
                        styles.statusPillTextAlert,
                    ]}
                  >
                    {WORKFLOW_STATUS_LABELS[activeEpisode.workflowStatus]}
                  </Text>
                </View>
              </View>
              <Text style={styles.episodeDuration}>Day {episodeDays} of recovery</Text>
            </View>

            <Text style={styles.episodeTitle}>{activeEpisode.title}</Text>
            {activeEpisode.description ? (
              <Text style={styles.episodeDescription} numberOfLines={2}>
                {activeEpisode.description}
              </Text>
            ) : null}

            <View style={styles.episodeFooter}>
              <Text style={styles.episodeSummaryCount}>
                {todayTasks.filter((t) => t.status === 'pending').length} items need attention today
              </Text>
              <Pressable
                onPress={() => {
                  Haptics.trigger('impactLight');
                  navigation.navigate('MainTabs', { screen: 'Care' });
                }}
                accessibilityRole="button"
                accessibilityLabel="View full care plan"
              >
                <Text style={styles.viewPlanLink}>View Care Plan →</Text>
              </Pressable>
            </View>
          </View>
        ) : (
          <View style={styles.noEpisodeCard}>
            <View style={styles.noEpisodeIconWrap}>
              <AppIcon name="heart" size={24} color={colors.accent} />
            </View>
            <View style={styles.noEpisodeContent}>
              <Text style={styles.noEpisodeTitle}>No active care episode</Text>
              <Text style={styles.noEpisodeSub}>
                Start a recovery or care plan for {displayName} to track tasks, meds, and provider
                follow-ups.
              </Text>
            </View>
            <Pressable
              style={styles.startEpisodeBtn}
              onPress={() => {
                Haptics.trigger('impactLight');
                navigation.navigate('CareTransition', { personId: selectedPersonId });
              }}
            >
              <Text style={styles.startEpisodeBtnText}>Start Plan</Text>
            </Pressable>
          </View>
        )}

        {/* OVERDUE ALERTS (IF ANY) */}
        {overdueTasks.length > 0 ? (
          <View style={styles.overdueBanner}>
            <View style={styles.overdueLeft}>
              <AppIcon name="warning" size={18} color="#DC2626" />
              <Text style={styles.overdueTitle}>
                {overdueTasks.length} {overdueTasks.length === 1 ? 'task is' : 'tasks are'} overdue
              </Text>
            </View>
            <Pressable
              onPress={() => navigation.navigate('MainTabs', { screen: 'Care' })}
              hitSlop={8}
            >
              <Text style={styles.overdueAction}>Review</Text>
            </Pressable>
          </View>
        ) : null}

        {/* TODAY'S ACTIONS */}
        <View style={styles.sectionHeader}>
          <Text style={styles.sectionTitle}>TODAY'S ATTENTION</Text>
          <Pressable
            onPress={() => navigation.navigate('MainTabs', { screen: 'Care' })}
            hitSlop={8}
          >
            <Text style={styles.sectionLink}>All Tasks ({personTasks.length}) →</Text>
          </Pressable>
        </View>

        {todayTasks.length === 0 ? (
          <View style={styles.emptyTasksCard}>
            <AppIcon name="check-circle" size={26} color={colors.success} />
            <Text style={styles.emptyTasksTitle}>All caught up for today!</Text>
            <Text style={styles.emptyTasksSub}>
              No pending tasks scheduled for {displayName} right now.
            </Text>
          </View>
        ) : (
          <View style={styles.tasksList}>
            {todayTasks.map((task) => {
              const isDone = task.status === 'completed';
              return (
                <Pressable
                  key={task.id}
                  style={[styles.taskItem, isDone && styles.taskItemDone]}
                  onPress={() => handleToggleTask(task)}
                  accessibilityRole="checkbox"
                  accessibilityState={{ checked: isDone }}
                  accessibilityLabel={`${task.title}. ${isDone ? 'Completed' : 'Pending'}. Assigned to ${task.ownerName || task.ownerType}.`}
                >
                  <View style={[styles.checkbox, isDone && styles.checkboxDone]}>
                    {isDone ? <AppIcon name="check" size={14} color="#FFFFFF" /> : null}
                  </View>

                  <View style={styles.taskContent}>
                    <Text style={[styles.taskTitle, isDone && styles.taskTitleDone]}>
                      {task.title}
                    </Text>
                    {task.description ? (
                      <Text style={styles.taskDesc} numberOfLines={1}>
                        {task.description}
                      </Text>
                    ) : null}
                    <View style={styles.taskMetaRow}>
                      <View style={styles.ownerBadge}>
                        <AppIcon
                          name={
                            task.ownerType === 'carebow'
                              ? 'sparkles'
                              : task.ownerType === 'provider'
                                ? 'doctor'
                                : 'user'
                          }
                          size={11}
                          color={
                            task.ownerType === 'carebow' ? colors.accent : colors.textSecondary
                          }
                        />
                        <Text style={styles.ownerBadgeText}>
                          {task.ownerName || task.ownerType}
                        </Text>
                      </View>
                      {task.priority === 'urgent' && !isDone ? (
                        <View style={styles.urgentBadge}>
                          <Text style={styles.urgentBadgeText}>Urgent</Text>
                        </View>
                      ) : null}
                    </View>
                  </View>
                </Pressable>
              );
            })}
          </View>
        )}

        {/* NEXT STEP / UNRESOLVED SERVICE */}
        {unresolvedService ? (
          <View style={styles.serviceExecutionCard}>
            <View style={styles.serviceHeaderRow}>
              <View style={styles.serviceIconWrap}>
                <AppIcon name="physio" size={20} color={colors.accent} />
              </View>
              <View style={styles.serviceTitleCol}>
                <Text style={styles.serviceActionTag}>NEXT STEP</Text>
                <Text style={styles.serviceTitle}>{unresolvedService.serviceTitle}</Text>
              </View>
            </View>
            <Text style={styles.serviceStatusMsg}>
              {unresolvedService.statusMessage || 'Coordinating scheduling with care team.'}
            </Text>
            <View style={styles.serviceCardActionRow}>
              <Pressable
                style={styles.resolveBtn}
                onPress={() => {
                  Haptics.trigger('impactLight');
                  navigation.navigate('MainTabs', { screen: 'Care' });
                }}
              >
                <Text style={styles.resolveBtnText}>Manage Service</Text>
              </Pressable>
              <Pressable
                style={styles.askBowBtn}
                onPress={() => {
                  Haptics.trigger('impactLight');
                  navigation.navigate('MainTabs', {
                    screen: 'Ask',
                    params: {
                      initialContext: `Help schedule ${unresolvedService.serviceTitle} for ${displayName}`,
                    },
                  });
                }}
              >
                <Text style={styles.askBowBtnText}>Ask CareBow</Text>
              </Pressable>
            </View>
          </View>
        ) : null}

        {/* RECENT CARE UPDATE */}
        <View style={styles.sectionHeader}>
          <Text style={styles.sectionTitle}>RECENT UPDATE</Text>
          <Pressable
            onPress={() => {
              Haptics.trigger('impactLight');
              setShowAddUpdateModal(true);
            }}
            hitSlop={8}
          >
            <Text style={styles.sectionLink}>+ Add Update</Text>
          </Pressable>
        </View>

        {recentUpdate ? (
          <View style={styles.recentUpdateCard}>
            <View style={styles.recentUpdateTop}>
              <Text style={styles.recentUpdateAuthor}>{recentUpdate.authorName}</Text>
              <Text style={styles.recentUpdateTime}>
                {new Date(recentUpdate.createdAt).toLocaleTimeString([], {
                  hour: '2-digit',
                  minute: '2-digit',
                })}
              </Text>
            </View>
            <Text style={styles.recentUpdateNote}>{recentUpdate.note}</Text>

            <View style={styles.recentUpdateActions}>
              <Pressable
                style={styles.updateActionChip}
                onPress={() => {
                  Haptics.trigger('impactLight');
                  navigation.navigate('MainTabs', {
                    screen: 'Ask',
                    params: {
                      initialContext: `Regarding ${displayName}'s update: "${recentUpdate.note}". What should we monitor or do next?`,
                    },
                  });
                }}
              >
                <AppIcon name="sparkles" size={13} color={colors.accent} />
                <Text style={styles.updateActionChipText}>Ask CareBow about this</Text>
              </Pressable>
            </View>
          </View>
        ) : (
          <View style={styles.emptyUpdateCard}>
            <Text style={styles.emptyUpdateText}>No recent health logs for {displayName}.</Text>
            <Pressable style={styles.addFirstUpdateBtn} onPress={() => setShowAddUpdateModal(true)}>
              <Text style={styles.addFirstUpdateBtnText}>Log check-in or symptom</Text>
            </Pressable>
          </View>
        )}

        {/* FAST ENTRY INTO CONTEXTUAL ASK CAREBOW */}
        <Pressable
          style={styles.askEntryCard}
          onPress={() => {
            Haptics.trigger('impactLight');
            navigation.navigate('MainTabs', { screen: 'Ask' });
          }}
          accessibilityRole="button"
          accessibilityLabel={`Open Ask CareBow with context for ${displayName}`}
        >
          <LinearGradient
            colors={['#0D4F52', '#0A3D3F']}
            style={styles.askGradient}
            start={{ x: 0, y: 0 }}
            end={{ x: 1, y: 1 }}
          >
            <View style={styles.askContent}>
              <View style={styles.askSparkleBadge}>
                <AppIcon name="sparkles" size={16} color="#FFFFFF" />
                <Text style={styles.askBadgeText}>Care Intelligence</Text>
              </View>
              <Text style={styles.askTitle}>Need guidance for {displayName}?</Text>
              <Text style={styles.askSubtitle}>
                Ask about medication questions, symptom changes, or creating care tasks.
              </Text>
            </View>
            <View style={styles.askArrow}>
              <AppIcon name="arrow-right" size={18} color="#FFFFFF" />
            </View>
          </LinearGradient>
        </Pressable>
      </ScrollView>

      {/* PERSON SELECTOR MODAL */}
      <Modal
        visible={showPersonPicker}
        transparent
        animationType="fade"
        onRequestClose={() => setShowPersonPicker(false)}
      >
        <Pressable style={styles.modalOverlay} onPress={() => setShowPersonPicker(false)}>
          <View style={styles.modalContent}>
            <Text style={styles.modalTitle}>Select Care Recipient</Text>
            <Text style={styles.modalSub}>
              Switch whose care episode, tasks, and updates you are managing.
            </Text>

            <View style={styles.membersList}>
              {allPersons.map((p) => {
                const isSelected = p.id === selectedPersonId;
                const name =
                  p.relationship === 'self'
                    ? 'Myself'
                    : p.relationship === 'parent'
                      ? p.firstName.toLowerCase().includes('mom') || p.gender === 'female'
                        ? 'Mom'
                        : 'Dad'
                      : p.firstName;

                return (
                  <Pressable
                    key={p.id}
                    style={[styles.memberItem, isSelected && styles.memberItemSelected]}
                    onPress={() => {
                      Haptics.trigger('impactMedium');
                      selectPerson(p.id);
                      setShowPersonPicker(false);
                    }}
                  >
                    <View style={styles.memberAvatar}>
                      <Text style={styles.memberAvatarText}>{name.charAt(0).toUpperCase()}</Text>
                    </View>
                    <View style={styles.memberInfoCol}>
                      <Text style={styles.memberName}>{name}</Text>
                      <Text style={styles.memberRel}>{p.relationship}</Text>
                    </View>
                    {isSelected ? <AppIcon name="check" size={20} color={colors.accent} /> : null}
                  </Pressable>
                );
              })}
            </View>

            <Pressable
              style={styles.addPersonButton}
              onPress={() => {
                setShowPersonPicker(false);
                navigation.navigate('MainTabs', { screen: 'Family' });
              }}
            >
              <Text style={styles.addPersonButtonText}>+ Add Loved One or Manage Family</Text>
            </Pressable>
          </View>
        </Pressable>
      </Modal>

      {/* LOG UPDATE MODAL */}
      <Modal
        visible={showAddUpdateModal}
        transparent
        animationType="slide"
        onRequestClose={() => setShowAddUpdateModal(false)}
      >
        <Pressable style={styles.modalOverlay} onPress={() => setShowAddUpdateModal(false)}>
          <Pressable style={styles.updateModalContent} onPress={(e) => e.stopPropagation()}>
            <Text style={styles.modalTitle}>Log Care Update</Text>
            <Text style={styles.modalSub}>
              Record a check-in, symptom note, or recovery observation for {displayName}.
            </Text>

            <View style={styles.categoryPills}>
              {(['symptom', 'mood', 'general'] as const).map((cat) => (
                <Pressable
                  key={cat}
                  style={[styles.catPill, updateCategory === cat && styles.catPillSelected]}
                  onPress={() => setUpdateCategory(cat)}
                >
                  <Text
                    style={[
                      styles.catPillText,
                      updateCategory === cat && styles.catPillTextSelected,
                    ]}
                  >
                    {cat.toUpperCase()}
                  </Text>
                </Pressable>
              ))}
            </View>

            <TextInput
              style={styles.updateTextInput}
              placeholder={`e.g. ${displayName} took morning medication with no issue, rested well.`}
              placeholderTextColor={colors.textTertiary}
              value={updateText}
              onChangeText={setUpdateText}
              multiline
              numberOfLines={4}
            />

            <View style={styles.modalBtnRow}>
              <Pressable style={styles.cancelBtn} onPress={() => setShowAddUpdateModal(false)}>
                <Text style={styles.cancelBtnText}>Cancel</Text>
              </Pressable>
              <Pressable
                style={[styles.saveBtn, !updateText.trim() && styles.saveBtnDisabled]}
                onPress={handleSaveUpdate}
                disabled={!updateText.trim()}
              >
                <Text style={styles.saveBtnText}>Save Update</Text>
              </Pressable>
            </View>
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
  headerLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.md,
  },
  personSelector: {
    paddingVertical: 2,
    paddingHorizontal: 4,
  },
  caringForLabel: {
    fontSize: 10,
    fontWeight: '700',
    color: colors.textTertiary,
    letterSpacing: 0.8,
  },
  personRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
  },
  personName: {
    fontSize: 18,
    fontWeight: '700',
    color: colors.textPrimary,
  },
  headerRight: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  avatarButton: {
    width: 38,
    height: 38,
    borderRadius: 19,
    overflow: 'hidden',
  },
  avatarGradient: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  avatarText: {
    color: '#FFFFFF',
    fontWeight: '700',
    fontSize: 14,
  },
  scrollView: {
    flex: 1,
  },
  scrollContent: {
    padding: spacing.lg,
    gap: spacing.lg,
  },
  episodeCard: {
    backgroundColor: '#FFFFFF',
    borderRadius: radius.lg,
    padding: spacing.lg,
    borderWidth: 1,
    borderColor: '#E2E8F0',
    ...shadows.card,
  },
  episodeHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: spacing.sm,
  },
  badgeRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.sm,
  },
  episodeTypeBadge: {
    backgroundColor: '#CCFBF1',
    paddingHorizontal: 8,
    paddingVertical: 3,
    borderRadius: 4,
  },
  episodeTypeBadgeText: {
    fontSize: 10,
    fontWeight: '800',
    color: '#0D4F52',
    letterSpacing: 0.5,
  },
  statusPill: {
    backgroundColor: '#E2E8F0',
    paddingHorizontal: 8,
    paddingVertical: 3,
    borderRadius: 4,
  },
  statusPillProgress: {
    backgroundColor: '#E0F2FE',
  },
  statusPillAlert: {
    backgroundColor: '#FEE2E2',
  },
  statusPillText: {
    fontSize: 10,
    fontWeight: '600',
    color: '#0369A1',
  },
  statusPillTextAlert: {
    color: '#B91C1C',
  },
  episodeDuration: {
    fontSize: 12,
    fontWeight: '500',
    color: colors.textSecondary,
  },
  episodeTitle: {
    fontSize: 17,
    fontWeight: '700',
    color: colors.textPrimary,
    marginBottom: 4,
  },
  episodeDescription: {
    fontSize: 13,
    color: colors.textSecondary,
    lineHeight: 18,
    marginBottom: spacing.md,
  },
  episodeFooter: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    borderTopWidth: 1,
    borderTopColor: '#F1F5F9',
    paddingTop: spacing.sm,
  },
  episodeSummaryCount: {
    fontSize: 12,
    fontWeight: '600',
    color: colors.accent,
  },
  viewPlanLink: {
    fontSize: 12,
    fontWeight: '700',
    color: colors.accent,
  },
  noEpisodeCard: {
    backgroundColor: '#FFFFFF',
    borderRadius: radius.lg,
    padding: spacing.lg,
    flexDirection: 'row',
    alignItems: 'center',
    borderWidth: 1,
    borderColor: '#E2E8F0',
    gap: spacing.md,
  },
  noEpisodeIconWrap: {
    width: 44,
    height: 44,
    borderRadius: 22,
    backgroundColor: '#CCFBF1',
    justifyContent: 'center',
    alignItems: 'center',
  },
  noEpisodeContent: {
    flex: 1,
  },
  noEpisodeTitle: {
    fontSize: 14,
    fontWeight: '700',
    color: colors.textPrimary,
  },
  noEpisodeSub: {
    fontSize: 12,
    color: colors.textSecondary,
    marginTop: 2,
  },
  startEpisodeBtn: {
    backgroundColor: colors.accent,
    paddingHorizontal: 12,
    paddingVertical: 8,
    borderRadius: radius.md,
  },
  startEpisodeBtnText: {
    color: '#FFFFFF',
    fontSize: 12,
    fontWeight: '700',
  },
  overdueBanner: {
    backgroundColor: '#FEF2F2',
    borderWidth: 1,
    borderColor: '#FECACA',
    borderRadius: radius.md,
    padding: spacing.md,
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  overdueLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.sm,
  },
  overdueTitle: {
    fontSize: 13,
    fontWeight: '700',
    color: '#991B1B',
  },
  overdueAction: {
    fontSize: 13,
    fontWeight: '700',
    color: '#991B1B',
  },
  sectionHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  sectionTitle: {
    fontSize: 11,
    fontWeight: '800',
    color: colors.textTertiary,
    letterSpacing: 0.8,
  },
  sectionLink: {
    fontSize: 12,
    fontWeight: '600',
    color: colors.accent,
  },
  tasksList: {
    gap: spacing.sm,
  },
  taskItem: {
    backgroundColor: '#FFFFFF',
    borderRadius: radius.md,
    padding: spacing.md,
    flexDirection: 'row',
    alignItems: 'flex-start',
    borderWidth: 1,
    borderColor: '#E2E8F0',
    gap: spacing.md,
  },
  taskItemDone: {
    backgroundColor: '#F8FAFC',
    borderColor: '#E2E8F0',
    opacity: 0.7,
  },
  checkbox: {
    width: 22,
    height: 22,
    borderRadius: 6,
    borderWidth: 2,
    borderColor: colors.textTertiary,
    marginTop: 2,
    justifyContent: 'center',
    alignItems: 'center',
  },
  checkboxDone: {
    backgroundColor: colors.success,
    borderColor: colors.success,
  },
  taskContent: {
    flex: 1,
  },
  taskTitle: {
    fontSize: 14,
    fontWeight: '600',
    color: colors.textPrimary,
  },
  taskTitleDone: {
    textDecorationLine: 'line-through',
    color: colors.textTertiary,
  },
  taskDesc: {
    fontSize: 12,
    color: colors.textSecondary,
    marginTop: 2,
  },
  taskMetaRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.sm,
    marginTop: spacing.xs,
  },
  ownerBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#F1F5F9',
    paddingHorizontal: 6,
    paddingVertical: 2,
    borderRadius: 4,
    gap: 4,
  },
  ownerBadgeText: {
    fontSize: 10,
    fontWeight: '500',
    color: colors.textSecondary,
  },
  urgentBadge: {
    backgroundColor: '#FEE2E2',
    paddingHorizontal: 6,
    paddingVertical: 2,
    borderRadius: 4,
  },
  urgentBadgeText: {
    fontSize: 10,
    fontWeight: '700',
    color: '#DC2626',
  },
  emptyTasksCard: {
    backgroundColor: '#FFFFFF',
    borderRadius: radius.md,
    padding: spacing.xl,
    alignItems: 'center',
    borderWidth: 1,
    borderColor: '#E2E8F0',
  },
  emptyTasksTitle: {
    fontSize: 14,
    fontWeight: '700',
    color: colors.textPrimary,
    marginTop: spacing.sm,
  },
  emptyTasksSub: {
    fontSize: 12,
    color: colors.textSecondary,
    textAlign: 'center',
    marginTop: 2,
  },
  serviceExecutionCard: {
    backgroundColor: '#F0FDFA',
    borderRadius: radius.md,
    borderWidth: 1,
    borderColor: '#99F6E4',
    padding: spacing.md,
  },
  serviceHeaderRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.sm,
  },
  serviceIconWrap: {
    width: 32,
    height: 32,
    borderRadius: 16,
    backgroundColor: '#CCFBF1',
    justifyContent: 'center',
    alignItems: 'center',
  },
  serviceTitleCol: {
    flex: 1,
  },
  serviceActionTag: {
    fontSize: 10,
    fontWeight: '800',
    color: '#0F766E',
    letterSpacing: 0.5,
  },
  serviceTitle: {
    fontSize: 14,
    fontWeight: '700',
    color: colors.textPrimary,
  },
  serviceStatusMsg: {
    fontSize: 12,
    color: colors.textSecondary,
    marginTop: spacing.xs,
  },
  serviceCardActionRow: {
    flexDirection: 'row',
    gap: spacing.sm,
    marginTop: spacing.md,
  },
  resolveBtn: {
    flex: 1,
    backgroundColor: colors.accent,
    paddingVertical: 8,
    borderRadius: radius.md,
    alignItems: 'center',
  },
  resolveBtnText: {
    color: '#FFFFFF',
    fontSize: 12,
    fontWeight: '700',
  },
  askBowBtn: {
    flex: 1,
    backgroundColor: '#FFFFFF',
    paddingVertical: 8,
    borderRadius: radius.md,
    alignItems: 'center',
    borderWidth: 1,
    borderColor: '#99F6E4',
  },
  askBowBtnText: {
    color: colors.accent,
    fontSize: 12,
    fontWeight: '700',
  },
  recentUpdateCard: {
    backgroundColor: '#FFFFFF',
    borderRadius: radius.md,
    padding: spacing.md,
    borderWidth: 1,
    borderColor: '#E2E8F0',
  },
  recentUpdateTop: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: spacing.xs,
  },
  recentUpdateAuthor: {
    fontSize: 12,
    fontWeight: '700',
    color: colors.textPrimary,
  },
  recentUpdateTime: {
    fontSize: 11,
    color: colors.textTertiary,
  },
  recentUpdateNote: {
    fontSize: 13,
    color: colors.textSecondary,
    lineHeight: 18,
  },
  recentUpdateActions: {
    marginTop: spacing.sm,
    flexDirection: 'row',
  },
  updateActionChip: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    backgroundColor: '#F0FDFA',
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: radius.full,
  },
  updateActionChipText: {
    fontSize: 11,
    fontWeight: '600',
    color: colors.accent,
  },
  emptyUpdateCard: {
    backgroundColor: '#FFFFFF',
    borderRadius: radius.md,
    padding: spacing.lg,
    borderWidth: 1,
    borderColor: '#E2E8F0',
    alignItems: 'center',
  },
  emptyUpdateText: {
    fontSize: 12,
    color: colors.textSecondary,
  },
  addFirstUpdateBtn: {
    marginTop: spacing.sm,
  },
  addFirstUpdateBtnText: {
    fontSize: 12,
    fontWeight: '700',
    color: colors.accent,
  },
  askEntryCard: {
    borderRadius: radius.lg,
    overflow: 'hidden',
    ...shadows.card,
  },
  askGradient: {
    padding: spacing.lg,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  askContent: {
    flex: 1,
    paddingRight: spacing.md,
  },
  askSparkleBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    marginBottom: spacing.xs,
  },
  askBadgeText: {
    color: '#CCFBF1',
    fontSize: 11,
    fontWeight: '700',
    letterSpacing: 0.5,
  },
  askTitle: {
    fontSize: 15,
    fontWeight: '700',
    color: '#FFFFFF',
    marginBottom: 2,
  },
  askSubtitle: {
    fontSize: 12,
    color: '#CCFBF1',
    lineHeight: 16,
  },
  askArrow: {
    width: 32,
    height: 32,
    borderRadius: 16,
    backgroundColor: 'rgba(255,255,255,0.2)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.5)',
    justifyContent: 'center',
    alignItems: 'center',
    padding: spacing.lg,
  },
  modalContent: {
    backgroundColor: '#FFFFFF',
    borderRadius: radius.lg,
    padding: spacing.lg,
    width: '100%',
    maxWidth: 400,
  },
  updateModalContent: {
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
  membersList: {
    gap: spacing.sm,
    marginBottom: spacing.md,
  },
  memberItem: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: spacing.md,
    borderRadius: radius.md,
    borderWidth: 1,
    borderColor: '#E2E8F0',
    gap: spacing.md,
  },
  memberItemSelected: {
    borderColor: colors.accent,
    backgroundColor: '#F0FDFA',
  },
  memberAvatar: {
    width: 36,
    height: 36,
    borderRadius: 18,
    backgroundColor: '#CCFBF1',
    justifyContent: 'center',
    alignItems: 'center',
  },
  memberAvatarText: {
    fontSize: 14,
    fontWeight: '700',
    color: colors.accent,
  },
  memberInfoCol: {
    flex: 1,
  },
  memberName: {
    fontSize: 14,
    fontWeight: '700',
    color: colors.textPrimary,
  },
  memberRel: {
    fontSize: 12,
    color: colors.textSecondary,
  },
  addPersonButton: {
    paddingVertical: spacing.sm,
    alignItems: 'center',
  },
  addPersonButtonText: {
    fontSize: 13,
    fontWeight: '700',
    color: colors.accent,
  },
  categoryPills: {
    flexDirection: 'row',
    gap: spacing.sm,
    marginBottom: spacing.md,
  },
  catPill: {
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: radius.full,
    backgroundColor: '#F1F5F9',
  },
  catPillSelected: {
    backgroundColor: colors.accent,
  },
  catPillText: {
    fontSize: 11,
    fontWeight: '700',
    color: colors.textSecondary,
  },
  catPillTextSelected: {
    color: '#FFFFFF',
  },
  updateTextInput: {
    borderWidth: 1,
    borderColor: '#E2E8F0',
    borderRadius: radius.md,
    padding: spacing.md,
    fontSize: 14,
    color: colors.textPrimary,
    minHeight: 90,
    textAlignVertical: 'top',
    marginBottom: spacing.md,
  },
  modalBtnRow: {
    flexDirection: 'row',
    gap: spacing.md,
    justifyContent: 'flex-end',
  },
  cancelBtn: {
    paddingHorizontal: 16,
    paddingVertical: 10,
    borderRadius: radius.md,
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
});
