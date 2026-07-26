import React from 'react';
import { StyleSheet, Text, TouchableOpacity, View } from 'react-native';
import { useNavigation } from '@react-navigation/native';
import Icon from 'react-native-vector-icons/Ionicons';
import type { AppNavigationProp } from '../navigation/types';
import { colors, radius, spacing, typography } from '../theme';

export default function OrderSuccessScreen() {
  const navigation = useNavigation() as AppNavigationProp;
  return (
    <View style={styles.container}>
      <Icon name="checkmark-circle-outline" size={64} color={colors.success} />
      <Text style={styles.title}>Request received</Text>
      <Text style={styles.body}>
        Open My Bookings to see the status saved by CareBow. This screen does not invent a
        confirmation number or payment result.
      </Text>
      <TouchableOpacity style={styles.button} onPress={() => navigation.navigate('Orders')}>
        <Text style={styles.buttonText}>View My Bookings</Text>
      </TouchableOpacity>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    gap: spacing.md,
    padding: spacing.xl,
    backgroundColor: colors.surface2,
  },
  title: { ...typography.h2, textAlign: 'center' },
  body: { ...typography.body, color: colors.textSecondary, textAlign: 'center' },
  button: {
    backgroundColor: colors.accent,
    borderRadius: radius.md,
    paddingHorizontal: spacing.xl,
    paddingVertical: spacing.md,
  },
  buttonText: { ...typography.labelLarge, color: colors.textInverse },
});
