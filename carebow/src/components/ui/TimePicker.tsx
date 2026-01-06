/**
 * TimePicker Component
 * Time slot selector with horizontal scroll
 */

import React, { useRef, useEffect } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, ScrollView } from 'react-native';
import { formatTime } from '../../data/services';
import { colors, spacing, radius, typography } from '../../theme';

interface TimePickerProps {
  availableSlots: string[];
  selectedTime: string | null;
  onSelectTime: (time: string) => void;
  label?: string;
  disabledSlots?: string[];
}

export function TimePicker({
  availableSlots,
  selectedTime,
  onSelectTime,
  label,
  disabledSlots = [],
}: TimePickerProps) {
  const scrollViewRef = useRef<ScrollView>(null);

  // Scroll to selected time on mount
  useEffect(() => {
    if (selectedTime && scrollViewRef.current) {
      const selectedIndex = availableSlots.findIndex((t) => t === selectedTime);
      if (selectedIndex > 0) {
        setTimeout(() => {
          scrollViewRef.current?.scrollTo({
            x: selectedIndex * 90,
            animated: true,
          });
        }, 100);
      }
    }
  }, []);

  return (
    <View style={styles.container}>
      {label && <Text style={styles.label}>{label}</Text>}
      <ScrollView
        ref={scrollViewRef}
        horizontal
        showsHorizontalScrollIndicator={false}
        contentContainerStyle={styles.scrollContent}
      >
        {availableSlots.map((time) => {
          const isSelected = selectedTime === time;
          const isDisabled = disabledSlots.includes(time);

          return (
            <TouchableOpacity
              key={time}
              style={[
                styles.timeSlot,
                isSelected && styles.timeSlotSelected,
                isDisabled && styles.timeSlotDisabled,
              ]}
              onPress={() => !isDisabled && onSelectTime(time)}
              activeOpacity={isDisabled ? 1 : 0.7}
              disabled={isDisabled}
            >
              <Text
                style={[
                  styles.timeText,
                  isSelected && styles.timeTextSelected,
                  isDisabled && styles.timeTextDisabled,
                ]}
              >
                {formatTime(time)}
              </Text>
            </TouchableOpacity>
          );
        })}
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    width: '100%',
  },
  label: {
    ...typography.labelSmall,
    color: colors.textSecondary,
    marginBottom: spacing.sm,
  },
  scrollContent: {
    paddingVertical: spacing.xxs,
    gap: spacing.xs,
  },
  timeSlot: {
    paddingVertical: spacing.sm,
    paddingHorizontal: spacing.md,
    borderRadius: radius.md,
    backgroundColor: colors.surface2,
    borderWidth: 1,
    borderColor: colors.border,
    minWidth: 80,
    alignItems: 'center',
  },
  timeSlotSelected: {
    backgroundColor: colors.accent,
    borderColor: colors.accent,
  },
  timeSlotDisabled: {
    backgroundColor: colors.surface2,
    borderColor: colors.borderLight,
    opacity: 0.5,
  },
  timeText: {
    ...typography.label,
    color: colors.textPrimary,
  },
  timeTextSelected: {
    color: colors.white,
  },
  timeTextDisabled: {
    color: colors.textTertiary,
  },
});
