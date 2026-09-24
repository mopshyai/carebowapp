/**
 * HorizontalDatePicker Component
 * Horizontal scrollable date selector showing 14 days
 */

import React, { useMemo, useRef, useEffect, useState } from 'react';
import {
  Text,
  StyleSheet,
  TouchableOpacity,
  ScrollView,
  AppState,
  type AppStateStatus,
} from 'react-native';
import { colors, spacing, radius, typography, shadows } from '../../theme';

export interface HorizontalDatePickerProps {
  selectedDate: string | null;
  onSelectDate: (date: string) => void;
  daysToShow?: number;
  baseDate?: Date | string;
}

export interface CalendarDateInfo {
  dayName: string;
  dayNumber: number;
  monthName: string;
  isoDate: string;
}

export const parseCalendarDate = (val: Date | string): Date => {
  if (val instanceof Date) return val;
  if (typeof val === 'string' && /^\d{4}-\d{2}-\d{2}/.test(val)) {
    const parts = val.split('T')[0].split('-').map(Number);
    if (parts.length === 3 && !isNaN(parts[0]) && !isNaN(parts[1]) && !isNaN(parts[2])) {
      return new Date(parts[0], parts[1] - 1, parts[2]);
    }
  }
  return new Date(val);
};

export const getCalendarDayKey = (date: Date | string = new Date()): string => {
  const d = parseCalendarDate(date);
  const year = d.getFullYear();
  const month = String(d.getMonth() + 1).padStart(2, '0');
  const day = String(d.getDate()).padStart(2, '0');
  return `${year}-${month}-${day}`;
};

export const generateDates = (
  daysToShow: number,
  baseDate: Date | string = new Date()
): CalendarDateInfo[] => {
  const dates: CalendarDateInfo[] = [];
  const parsed = parseCalendarDate(baseDate);
  const start = new Date(parsed.getFullYear(), parsed.getMonth(), parsed.getDate());

  for (let i = 0; i < daysToShow; i++) {
    const date = new Date(start.getFullYear(), start.getMonth(), start.getDate() + i);
    const year = date.getFullYear();
    const month = String(date.getMonth() + 1).padStart(2, '0');
    const day = String(date.getDate()).padStart(2, '0');
    dates.push({
      dayName: ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'][date.getDay()],
      dayNumber: date.getDate(),
      monthName: [
        'Jan',
        'Feb',
        'Mar',
        'Apr',
        'May',
        'Jun',
        'Jul',
        'Aug',
        'Sep',
        'Oct',
        'Nov',
        'Dec',
      ][date.getMonth()],
      isoDate: `${year}-${month}-${day}`,
    });
  }

  return dates;
};

export function HorizontalDatePicker({
  selectedDate,
  onSelectDate,
  daysToShow = 14,
  baseDate,
}: HorizontalDatePickerProps) {
  const scrollViewRef = useRef<React.ElementRef<typeof ScrollView>>(null);

  const [activeDayKey, setActiveDayKey] = useState(() =>
    baseDate ? getCalendarDayKey(baseDate) : getCalendarDayKey()
  );

  useEffect(() => {
    setActiveDayKey(baseDate ? getCalendarDayKey(baseDate) : getCalendarDayKey());
  }, [baseDate]);

  useEffect(() => {
    if (baseDate) return;

    const handleAppStateChange = (nextState: AppStateStatus) => {
      if (nextState === 'active') {
        const todayKey = getCalendarDayKey();
        setActiveDayKey((prev) => (prev !== todayKey ? todayKey : prev));
      }
    };

    const subscription = AppState.addEventListener('change', handleAppStateChange);
    return () => {
      subscription.remove();
    };
  }, [baseDate]);

  const currentTodayKey = baseDate ? getCalendarDayKey(baseDate) : getCalendarDayKey();
  const effectiveDayKey = baseDate
    ? currentTodayKey
    : activeDayKey !== currentTodayKey
      ? currentTodayKey
      : activeDayKey;

  const dates = useMemo(() => {
    const base = baseDate ? parseCalendarDate(baseDate) : new Date();
    return generateDates(daysToShow, base);
  }, [daysToShow, effectiveDayKey, baseDate]);

  // If the currently selected date is no longer within the refreshed allowed dates
  // (e.g. overnight app rollover removed yesterday), clear the selection in the parent.
  useEffect(() => {
    if (!selectedDate) return;
    const isAllowed = dates.some((d) => d.isoDate === selectedDate);
    if (!isAllowed) {
      onSelectDate('');
    }
  }, [dates, selectedDate, onSelectDate]);

  useEffect(() => {
    if (!selectedDate || !scrollViewRef.current) return;

    const selectedIndex = dates.findIndex((date) => date.isoDate === selectedDate);
    if (selectedIndex <= 0) return;

    const timer = setTimeout(() => {
      scrollViewRef.current?.scrollTo({
        x: selectedIndex * 70,
        animated: true,
      });
    }, 100);

    return () => clearTimeout(timer);
  }, [dates, selectedDate]);

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
