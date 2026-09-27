import React from 'react';
import { render, fireEvent, waitFor } from '@testing-library/react-native';
import { Alert } from 'react-native';
import { AskCareActionCard } from './AskCareActionCard';
import { useCareStore } from '../../store/useCareStore';

jest.mock('@react-navigation/native', () => ({
  useNavigation: () => ({
    navigate: jest.fn(),
  }),
}));

jest.mock('react-native-haptic-feedback', () => ({
  trigger: jest.fn(),
}));

jest.spyOn(Alert, 'alert').mockImplementation(() => {});

describe('AskCareActionCard Certification Tests', () => {
  const mockCreateTask = jest.fn();
  const mockAddCareUpdate = jest.fn();

  beforeEach(() => {
    jest.clearAllMocks();
    useCareStore.setState({
      createTask: mockCreateTask,
      addCareUpdate: mockAddCareUpdate,
    } as any);
  });

  describe('Requirement 1: Zero Fabricated +24h Due Date', () => {
    it('creates task with dueAt === null when no timing is provided in conversation', async () => {
      mockCreateTask.mockResolvedValueOnce({
        id: 'task_1',
        title: 'Follow up: Care review',
        dueAt: null,
        syncStatus: 'SERVER_CONFIRMED',
      });

      const { getByText } = render(
        <AskCareActionCard
          personId="person_123"
          personName="Alice"
          lastMessageSnippet="Check blood pressure every morning"
        />
      );

      const createTaskBtn = getByText('Create Care Task');
      fireEvent.press(createTaskBtn);

      await waitFor(() => {
        expect(mockCreateTask).toHaveBeenCalledWith(
          expect.objectContaining({
            personId: 'person_123',
            dueAt: null, // ZERO manufactured tomorrow date
            taskType: 'GENERAL',
            source: 'ASK_CAREBOW',
          })
        );
      });
    });

    it('preserves explicit suggestedDueAt when provided with source timing', async () => {
      mockCreateTask.mockResolvedValueOnce({
        id: 'task_1',
        title: 'Follow up: Lab appointment',
        dueAt: '2026-10-01T09:00:00.000Z',
        syncStatus: 'SERVER_CONFIRMED',
      });

      const { getByText } = render(
        <AskCareActionCard
          personId="person_123"
          personName="Alice"
          suggestedDueAt="2026-10-01T09:00:00.000Z"
          lastMessageSnippet="Follow up appointment"
        />
      );

      const createTaskBtn = getByText('Create Care Task');
      fireEvent.press(createTaskBtn);

      await waitFor(() => {
        expect(mockCreateTask).toHaveBeenCalledWith(
          expect.objectContaining({
            dueAt: '2026-10-01T09:00:00.000Z',
          })
        );
      });
    });
  });

  describe('Requirement 2: Explicit Mutation Sync Status & Truthful Copy', () => {
    it('shows truthful confirmation copy when task is SERVER_CONFIRMED', async () => {
      mockCreateTask.mockResolvedValueOnce({
        id: 'task_server',
        syncStatus: 'SERVER_CONFIRMED',
      });

      const { getByText } = render(
        <AskCareActionCard
          personId="person_123"
          personName="Alice"
          lastMessageSnippet="Need medication refill"
        />
      );

      fireEvent.press(getByText('Create Care Task'));

      await waitFor(() => {
        expect(Alert.alert).toHaveBeenCalledWith('Task Created', 'Task created.');
      });
    });

    it('shows truthful offline copy when task is PENDING_SYNC (offline)', async () => {
      mockCreateTask.mockResolvedValueOnce({
        id: 'task_offline',
        syncStatus: 'PENDING_SYNC',
      });

      const { getByText } = render(
        <AskCareActionCard
          personId="person_123"
          personName="Alice"
          lastMessageSnippet="Need medication refill"
        />
      );

      fireEvent.press(getByText('Create Care Task'));

      await waitFor(() => {
        expect(Alert.alert).toHaveBeenCalledWith(
          'Saved Offline',
          "Saved on this device. It will sync when you're back online."
        );
        // Must NEVER claim the entire care team can see it while offline
        const callArgs = (Alert.alert as jest.Mock).mock.calls[0];
        expect(callArgs[1]).not.toContain('the entire care team can see it');
      });
    });

    it('shows truthful confirmation copy when update is SERVER_CONFIRMED', async () => {
      mockAddCareUpdate.mockResolvedValueOnce({
        id: 'update_server',
        syncStatus: 'SERVER_CONFIRMED',
      });

      const { getByText } = render(
        <AskCareActionCard
          personId="person_123"
          personName="Alice"
          lastMessageSnippet="Patient walked 15 minutes today"
        />
      );

      fireEvent.press(getByText('Log This Update'));

      await waitFor(() => {
        expect(Alert.alert).toHaveBeenCalledWith('Update Logged', 'Update logged.');
      });
    });

    it('shows truthful offline copy when update is PENDING_SYNC (offline)', async () => {
      mockAddCareUpdate.mockResolvedValueOnce({
        id: 'update_offline',
        syncStatus: 'PENDING_SYNC',
      });

      const { getByText } = render(
        <AskCareActionCard
          personId="person_123"
          personName="Alice"
          lastMessageSnippet="Patient walked 15 minutes today"
        />
      );

      fireEvent.press(getByText('Log This Update'));

      await waitFor(() => {
        expect(Alert.alert).toHaveBeenCalledWith(
          'Saved Offline',
          "Saved on this device. It will sync when you're back online."
        );
        const callArgs = (Alert.alert as jest.Mock).mock.calls[0];
        expect(callArgs[1]).not.toContain('the entire care team can see it');
      });
    });

    it('shows failure alert when mutation returns FAILED', async () => {
      mockCreateTask.mockResolvedValueOnce({
        id: 'task_failed',
        syncStatus: 'FAILED',
      });

      const { getByText } = render(
        <AskCareActionCard
          personId="person_123"
          personName="Alice"
          lastMessageSnippet="Need follow up"
        />
      );

      fireEvent.press(getByText('Create Care Task'));

      await waitFor(() => {
        expect(Alert.alert).toHaveBeenCalledWith('Save Failed', "Couldn't save this task.");
      });
    });
  });
});
