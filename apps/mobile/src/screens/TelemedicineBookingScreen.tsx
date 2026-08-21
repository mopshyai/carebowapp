import React from 'react';
import { StyleSheet, Text, TouchableOpacity, View } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { useNavigation } from '@react-navigation/native';
import Icon from 'react-native-vector-icons/Ionicons';
import type { AppNavigationProp } from '../navigation/types';
import { colors, radius, spacing, typography } from '../theme';

export default function TelemedicineBookingScreen() {
  const insets = useSafeAreaInsets();
  const navigation = useNavigation() as AppNavigationProp;
  return (
    <View style={[styles.container, { paddingTop: insets.top + spacing.md }]}>
      <TouchableOpacity style={styles.back} onPress={() => navigation.goBack()}>
        <Icon name="arrow-back" size={24} color={colors.textPrimary} />
      </TouchableOpacity>
      <View style={styles.content}>
        <View style={styles.icon}>
          <Icon name="videocam-outline" size={36} color={colors.accent} />
        </View>
        <Text style={styles.title}>Find a live consultation</Text>
        <Text style={styles.body}>
          CareBow does not publish unverified doctors or appointment slots. Browse the live catalog
          to see consultations currently offered by the care team.
        </Text>
        <TouchableOpacity
          style={styles.button}
          onPress={() => navigation.navigate('Services', { category: 'video-consult' })}
        >
          <Text style={styles.buttonText}>Browse live consultations</Text>
        </TouchableOpacity>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: colors.surface2, paddingHorizontal: spacing.lg },
  back: { width: 44, height: 44, alignItems: 'center', justifyContent: 'center' },
  content: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    gap: spacing.md,
    paddingHorizontal: spacing.lg,
  },
  icon: {
    width: 72,
    height: 72,
    borderRadius: 36,
    backgroundColor: colors.accentMuted,
    alignItems: 'center',
    justifyContent: 'center',
  },
  title: { ...typography.h2, textAlign: 'center' },
  body: { ...typography.body, color: colors.textSecondary, textAlign: 'center' },
  button: {
    marginTop: spacing.sm,
    backgroundColor: colors.accent,
    borderRadius: radius.md,
    paddingHorizontal: spacing.xl,
    paddingVertical: spacing.md,
  },
  buttonText: { ...typography.labelLarge, color: colors.textInverse },
});
