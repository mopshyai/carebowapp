/**
 * AskCareActionCard
 * Converts conversational intelligence into structured real-world care actions:
 * - Log this care update
 * - Create structured care task
 * - Request / find professional care
 * - Share update with care team
 * - Deterministic emergency escalation
 */

import React, { useState, useCallback } from 'react';
import { View, Text, StyleSheet, Pressable, Alert, Linking } from 'react-native';
import * as Haptics from 'react-native-haptic-feedback';
import { useNavigation } from '@react-navigation/native';
import { useCareStore } from '../../store/useCareStore';
import { AppIcon } from '../icons/AppIcon';
import { colors, radius, spacing } from '../../theme';

export interface AskCareActionCardProps {
  personId: string;
  personName: string;
  episodeId?: string;
  lastMessageSnippet?: string;
  isEmergency?: boolean;
  suggestedDueAt?: string | null;
}

export function AskCareActionCard({
  personId,
  personName,
  episodeId,
  lastMessageSnippet = '',
  isEmergency = false,
  suggestedDueAt = null,
}: AskCareActionCardProps) {
  const navigation = useNavigation<any>();
  const createTask = useCareStore((state) => state.createTask);
  const addCareUpdate = useCareStore((state) => state.addCareUpdate);

  const [committedActions, setCommittedActions] = useState<Record<string, boolean>>({});

  // 1. Log Care Update
  const handleLogUpdate = useCallback(async () => {
    Haptics.trigger('notificationSuccess');
    try {
      const result = await addCareUpdate({
        personId,
        authorId: 'caregiver',
        authorName: 'Primary Caregiver',
        note: lastMessageSnippet.slice(0, 180) || `Consultation note logged for ${personName}`,
        category: 'symptom',
      });

      if (result.syncStatus === 'SERVER_CONFIRMED') {
        setCommittedActions((prev) => ({ ...prev, update: true }));
        Alert.alert('Update Logged', 'Update logged.');
      } else if (result.syncStatus === 'PENDING_SYNC') {
        setCommittedActions((prev) => ({ ...prev, update: true }));
        Alert.alert('Saved Offline', "Saved on this device. It will sync when you're back online.");
      } else {
        Alert.alert('Save Failed', "Couldn't save this update.");
      }
    } catch {
      Alert.alert('Save Failed', "Couldn't save this update.");
    }
  }, [personId, personName, lastMessageSnippet, addCareUpdate]);

  // 2. Create Care Task
  const handleCreateTask = useCallback(async () => {
    Haptics.trigger('notificationSuccess');
    try {
      const result = await createTask({
        personId,
        episodeId,
        title: `Follow up: ${lastMessageSnippet.slice(0, 45) || 'Care review'}`,
        description: `Action item created from CareBow conversation: "${lastMessageSnippet.slice(0, 120)}"`,
        taskType: 'GENERAL',
        ownerType: 'CAREGIVER',
        ownerName: 'Primary Caregiver',
        dueAt: suggestedDueAt ?? null,
        status: 'PENDING',
        priority: 'HIGH',
        source: 'ASK_CAREBOW',
      });

      if (result.syncStatus === 'SERVER_CONFIRMED') {
        setCommittedActions((prev) => ({ ...prev, task: true }));
        Alert.alert('Task Created', 'Task created.');
      } else if (result.syncStatus === 'PENDING_SYNC') {
        setCommittedActions((prev) => ({ ...prev, task: true }));
        Alert.alert('Saved Offline', "Saved on this device. It will sync when you're back online.");
      } else {
        Alert.alert('Save Failed', "Couldn't save this task.");
      }
    } catch {
      Alert.alert('Save Failed', "Couldn't save this task.");
    }
  }, [personId, episodeId, personName, lastMessageSnippet, suggestedDueAt, createTask]);

  // 3. Request Professional Care
  const handleFindService = useCallback(() => {
    Haptics.trigger('impactMedium');
    navigation.navigate('Services');
  }, [navigation]);

  // Emergency Call Action
  const handleEmergencyCall = useCallback(() => {
    Haptics.trigger('notificationWarning');
    Linking.openURL('tel:911').catch(() => {
      Alert.alert('Emergency', 'Please dial 911 immediately.');
    });
  }, []);

  if (isEmergency) {
    return (
      <View style={styles.emergencyCard}>
        <View style={styles.emergencyHeader}>
          <AppIcon name="warning" size={24} color="#DC2626" />
          <Text style={styles.emergencyTitle}>Immediate Medical Attention May Be Required</Text>
        </View>

        <Text style={styles.emergencyDisclaimer}>
          CareBow is not an emergency service and cannot dispatch emergency responders. If this is a
          life-threatening emergency, please call 911 or visit the nearest emergency room
          immediately.
        </Text>

        <View style={styles.emergencyBtnRow}>
          <Pressable
            style={styles.call911Btn}
            onPress={handleEmergencyCall}
            accessibilityRole="button"
            accessibilityLabel="Call 911 emergency services immediately"
          >
            <AppIcon name="phone" size={16} color="#FFFFFF" />
            <Text style={styles.call911BtnText}>Call 911</Text>
          </Pressable>

          <Pressable
            style={styles.safetyInfoBtn}
            onPress={() => navigation.navigate('Safety', { screen: 'SafetyIndex' })}
          >
            <Text style={styles.safetyInfoBtnText}>Emergency Contacts</Text>
          </Pressable>
        </View>
      </View>
    );
  }

  return (
    <View style={styles.cardContainer}>
      <View style={styles.cardHeader}>
        <View style={styles.headerLeft}>
          <AppIcon name="sparkles" size={14} color={colors.accent} />
          <Text style={styles.headerTitle}>CARE ACTION RECOMMENDATIONS</Text>
        </View>
        <Text style={styles.forPersonText}>For {personName}</Text>
      </View>

      <Text style={styles.cardSub}>Turn this conversation into structured care coordination:</Text>

      <View style={styles.actionsGrid}>
        {/* Action 1: Log Update */}
        <Pressable
          style={[styles.actionBtn, committedActions.update && styles.actionBtnDone]}
          onPress={handleLogUpdate}
          disabled={committedActions.update}
        >
          <AppIcon
            name={committedActions.update ? 'check-circle' : 'document'}
            size={16}
            color={committedActions.update ? colors.success : colors.accent}
          />
          <Text style={[styles.actionBtnText, committedActions.update && styles.actionBtnTextDone]}>
            {committedActions.update ? 'Update Logged' : 'Log This Update'}
          </Text>
        </Pressable>

        {/* Action 2: Create Task */}
        <Pressable
          style={[styles.actionBtn, committedActions.task && styles.actionBtnDone]}
          onPress={handleCreateTask}
          disabled={committedActions.task}
        >
          <AppIcon
            name={committedActions.task ? 'check-circle' : 'check'}
            size={16}
            color={committedActions.task ? colors.success : colors.accent}
          />
          <Text style={[styles.actionBtnText, committedActions.task && styles.actionBtnTextDone]}>
            {committedActions.task ? 'Task Created' : 'Create Care Task'}
          </Text>
        </Pressable>

        {/* Action 3: Professional Care */}
        <Pressable style={styles.actionBtn} onPress={handleFindService}>
          <AppIcon name="physio" size={16} color={colors.accent} />
          <Text style={styles.actionBtnText}>Find Professional Care</Text>
        </Pressable>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  cardContainer: {
    backgroundColor: '#FFFFFF',
    borderRadius: radius.md,
    borderWidth: 1,
    borderColor: '#CCFBF1',
    padding: spacing.md,
    marginVertical: spacing.sm,
  },
  cardHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 4,
  },
  headerLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
  },
  headerTitle: {
    fontSize: 10,
    fontWeight: '800',
    color: colors.accent,
    letterSpacing: 0.8,
  },
  forPersonText: {
    fontSize: 11,
    fontWeight: '600',
    color: colors.textSecondary,
  },
  cardSub: {
    fontSize: 12,
    color: colors.textSecondary,
    marginBottom: spacing.sm,
  },
  actionsGrid: {
    gap: spacing.xs,
  },
  actionBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.sm,
    backgroundColor: '#F0FDFA',
    borderWidth: 1,
    borderColor: '#99F6E4',
    paddingHorizontal: 12,
    paddingVertical: 10,
    borderRadius: radius.md,
  },
  actionBtnDone: {
    backgroundColor: '#ECFDF5',
    borderColor: '#A7F3D0',
  },
  actionBtnText: {
    fontSize: 13,
    fontWeight: '700',
    color: colors.accent,
  },
  actionBtnTextDone: {
    color: colors.success,
  },
  emergencyCard: {
    backgroundColor: '#FEF2F2',
    borderWidth: 2,
    borderColor: '#DC2626',
    borderRadius: radius.lg,
    padding: spacing.lg,
    marginVertical: spacing.md,
  },
  emergencyHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.sm,
    marginBottom: spacing.xs,
  },
  emergencyTitle: {
    fontSize: 15,
    fontWeight: '800',
    color: '#991B1B',
    flex: 1,
  },
  emergencyDisclaimer: {
    fontSize: 12,
    color: '#7F1D1D',
    lineHeight: 17,
    marginBottom: spacing.md,
  },
  emergencyBtnRow: {
    flexDirection: 'row',
    gap: spacing.md,
  },
  call911Btn: {
    flex: 1,
    backgroundColor: '#DC2626',
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
    gap: 8,
    paddingVertical: 12,
    borderRadius: radius.md,
  },
  call911BtnText: {
    color: '#FFFFFF',
    fontSize: 14,
    fontWeight: '800',
  },
  safetyInfoBtn: {
    flex: 1,
    backgroundColor: '#FFFFFF',
    borderWidth: 1,
    borderColor: '#DC2626',
    justifyContent: 'center',
    alignItems: 'center',
    paddingVertical: 12,
    borderRadius: radius.md,
  },
  safetyInfoBtnText: {
    color: '#DC2626',
    fontSize: 13,
    fontWeight: '700',
  },
});
