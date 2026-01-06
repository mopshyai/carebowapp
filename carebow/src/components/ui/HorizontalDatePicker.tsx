/**
 * HorizontalDatePicker Component
 * Horizontal scrollable date selector showing 14 days
 */

import React, { useRef, useEffect } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, ScrollView } from 'react-native';
import { colors, spacing, radius, typography, shadows } from '../../theme';

interface HorizontalDatePickerProps {
  selectedDate: string | null; // ISO date string (YYYY-MM-DD)
  onSelectDate: (date: string) => void;
  daysToShow?: number;
}

// Helper to format date parts
const formatDate = (date: Date) => {
  const days = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];
  const months = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];

  return {
    dayName: days[date.getDay()],
    dayNumber: date.getDate(),
    monthName: months[date.getMonth()],
    isoDate: date.toISOString().split('T')[0],
  };
};

// Generate array of dates starting from today
const generateDates = (daysToShow: number): ReturnType<typeof formatDate>[] => {
  const dates: ReturnType<typeof formatDate>[] = [];
  const today = new Date();

  for (let i = 0; i < daysToShow; i++) {
    const date = new Date(today);
    date.setDate(today.getDate() + i);
    dates.push(formatDate(date));
  }

  return dates;
};

export function HorizontalDatePicker({
  selectedDate,
  onSelectDate,
  daysToShow = 14,
}: HorizontalDatePickerProps) {
  const scrollViewRef = useRef<ScrollView>(null);
  const dates = generateDates(daysToShow);

  // Scroll to selected date on mount
  useEffect(() => {
    if (selectedDate && scrollViewRef.current) {
      const selectedIndex = dates.findIndex((d) => d.isoDate === selectedDate);
      if (selectedIndex > 0) {
        setTimeout(() => {
          scrollViewRef.current?.scrollTo({
            x: selectedIndex * 70,
            animated: true,
          });
        }, 100);
      }
    }
  }, []);

  return (
    <ScrollView
      ref={scrollViewRef}
      horizontal
      showsHorizontalScrollIndicator={false}
      contentContainerStyle={styles.container}
    >
      {dates.map((dateInfo, index) => {
        const isSelected = selectedDate === dateInfo.isoDate;
        const isToday = index === 0;

        return (
          <TouchableOpacity
            key={dateInfo.isoDate}
            style={[styles.dateTile, isSelected && styles.dateTileSelected]}
            onPress={() => onSelectDate(dateInfo.isoDate)}
            activeOpacity={0.7}
          >
            <Text style={[styles.dayName, isSelected && styles.textSelected]}>
              {isToday ? 'Today' : dateInfo.dayName}
            </Text>
            <Text style={[styles.dayNumber, isSelected && styles.textSelected]}>
              {dateInfo.dayNumber}
            </Text>
            <Text style={[styles.monthName, isSelected && styles.textSelected]}>
              {dateInfo.monthName}
            </Text>
          </TouchableOpacity>
        );
      })}
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    paddingVertical: spacing.xxs,
    gap: spacing.xs,
  },
  dateTile: {
    width: 62,
    paddingVertical: spacing.sm,
    paddingHorizontal: spacing.xs,
    borderRadius: radius.md,
    backgroundColor: colors.surface2,
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 1,
    borderColor: colors.border,
  },
  dateTileSelected: {
    backgroundColor: colors.accent,
    borderColor: colors.accent,
    ...shadows.subtle,
  },
  dayName: {
    ...typography.tiny,
    color: colors.textTertiary,
    marginBottom: spacing.xxs,
  },
  dayNumber: {
    fontSize: 20,
    fontWeight: '700',
    color: colors.textPrimary,
    marginBottom: 2,
  },
  monthName: {
    ...typography.tiny,
    color: colors.textTertiary,
  },
  textSelected: {
    color: colors.white,
  },
});
