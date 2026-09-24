import React from 'react';
import { render, fireEvent, act } from '@testing-library/react-native';
import { AppState, type AppStateStatus } from 'react-native';
import { HorizontalDatePicker, generateDates } from './HorizontalDatePicker';

describe('HorizontalDatePicker', () => {
  it('generates expected count of dates with correct formatting', () => {
    const base = new Date('2026-09-24T12:00:00');
    const dates = generateDates(7, base);

    expect(dates).toHaveLength(7);
    expect(dates[0].isoDate).toBe('2026-09-24');
    expect(dates[0].dayName).toBe('Thu');
    expect(dates[0].dayNumber).toBe(24);
    expect(dates[0].monthName).toBe('Sep');

    expect(dates[6].isoDate).toBe('2026-09-30');
    expect(dates[6].dayName).toBe('Wed');
    expect(dates[6].dayNumber).toBe(30);
  });

  it('renders index 0 as Today and fires onSelectDate when tapped', () => {
    const onSelectDate = jest.fn();
    const { getByText } = render(
      <HorizontalDatePicker
        selectedDate={null}
        onSelectDate={onSelectDate}
        daysToShow={7}
        baseDate="2026-09-24"
      />
    );

    expect(getByText('Today')).toBeTruthy();
    expect(getByText('24')).toBeTruthy();

    fireEvent.press(getByText('Today'));
    expect(onSelectDate).toHaveBeenCalledWith('2026-09-24');
  });

  it('refreshes dates when AppState resumes on a new calendar day without background timers', () => {
    let appStateListener: ((state: AppStateStatus) => void) | undefined;
    jest.spyOn(AppState, 'addEventListener').mockImplementation((event, listener) => {
      if (event === 'change') {
        appStateListener = listener as (state: AppStateStatus) => void;
      }
      return { remove: jest.fn() } as never;
    });

    const mockToday = new Date('2026-09-24T23:30:00');
    jest.useFakeTimers();
    jest.setSystemTime(mockToday);

    const onSelectDate = jest.fn();
    const { getByText, queryByText } = render(
      <HorizontalDatePicker selectedDate="2026-09-24" onSelectDate={onSelectDate} daysToShow={3} />
    );

    expect(getByText('Today')).toBeTruthy();
    expect(getByText('24')).toBeTruthy();
    expect(getByText('25')).toBeTruthy();
    expect(getByText('26')).toBeTruthy();
    expect(queryByText('27')).toBeNull();

    // Advance time past midnight into next day (2026-09-25)
    jest.setSystemTime(new Date('2026-09-25T08:00:00'));

    // App resumes to active
    act(() => {
      appStateListener?.('active');
    });

    // Yesterday (24) is no longer Today or in the 3-day window
    expect(queryByText('24')).toBeNull();
    // Today is now 25
    expect(getByText('Today')).toBeTruthy();
    expect(getByText('25')).toBeTruthy();
    expect(getByText('26')).toBeTruthy();
    expect(getByText('27')).toBeTruthy();

    jest.useRealTimers();
  });

  it('updates calendar dates when baseDate prop changes', () => {
    const onSelectDate = jest.fn();
    const { getByText, queryByText, rerender } = render(
      <HorizontalDatePicker
        selectedDate={null}
        onSelectDate={onSelectDate}
        daysToShow={3}
        baseDate="2026-09-24"
      />
    );

    expect(getByText('24')).toBeTruthy();
    expect(queryByText('25')).toBeTruthy();
    expect(queryByText('27')).toBeNull();

    rerender(
      <HorizontalDatePicker
        selectedDate={null}
        onSelectDate={onSelectDate}
        daysToShow={3}
        baseDate="2026-09-25"
      />
    );

    expect(queryByText('24')).toBeNull();
    expect(getByText('25')).toBeTruthy();
    expect(getByText('27')).toBeTruthy();
  });

  it('clears selection when refreshed date window rolls over and excludes the selected date', () => {
    let appStateListener: ((state: AppStateStatus) => void) | undefined;
    jest.spyOn(AppState, 'addEventListener').mockImplementation((event, listener) => {
      if (event === 'change') {
        appStateListener = listener as (state: AppStateStatus) => void;
      }
      return { remove: jest.fn() } as never;
    });

    const mockToday = new Date('2026-09-24T22:00:00');
    jest.useFakeTimers();
    jest.setSystemTime(mockToday);

    const onSelectDate = jest.fn();
    const { getByText, queryByText } = render(
      <HorizontalDatePicker selectedDate="2026-09-24" onSelectDate={onSelectDate} daysToShow={3} />
    );

    expect(getByText('24')).toBeTruthy();
    expect(onSelectDate).not.toHaveBeenCalled();

    // Advance to next day past midnight
    jest.setSystemTime(new Date('2026-09-25T07:00:00'));
    act(() => {
      appStateListener?.('active');
    });

    // Yesterday is excluded from the new window; parent draft must be cleared
    expect(queryByText('24')).toBeNull();
    expect(onSelectDate).toHaveBeenCalledWith('');

    jest.useRealTimers();
  });

  it('preserves selection when selected date is still within the refreshed window', () => {
    let appStateListener: ((state: AppStateStatus) => void) | undefined;
    jest.spyOn(AppState, 'addEventListener').mockImplementation((event, listener) => {
      if (event === 'change') {
        appStateListener = listener as (state: AppStateStatus) => void;
      }
      return { remove: jest.fn() } as never;
    });

    const mockToday = new Date('2026-09-24T22:00:00');
    jest.useFakeTimers();
    jest.setSystemTime(mockToday);

    const onSelectDate = jest.fn();
    // User selected 2 days ahead (2026-09-26)
    const { getByText } = render(
      <HorizontalDatePicker selectedDate="2026-09-26" onSelectDate={onSelectDate} daysToShow={5} />
    );

    expect(getByText('26')).toBeTruthy();
    expect(onSelectDate).not.toHaveBeenCalled();

    // Advance to next day (2026-09-25)
    jest.setSystemTime(new Date('2026-09-25T07:00:00'));
    act(() => {
      appStateListener?.('active');
    });

    // 2026-09-26 is still in the 5-day window; onSelectDate must NOT be called with ''
    expect(getByText('26')).toBeTruthy();
    expect(onSelectDate).not.toHaveBeenCalledWith('');

    jest.useRealTimers();
  });
});
