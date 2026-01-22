/**
 * useLoadingState Hook
 * Unified loading state management for data fetching operations
 * Combines loading, error, success states with network awareness
 */

import { useState, useCallback, useRef, useEffect } from 'react';
import { useNetwork } from '@/utils/NetworkProvider';
import { ScreenStateStatus } from '@/components/ui/ScreenState';

// ============================================
// TYPES
// ============================================

export type LoadingState = 'idle' | 'loading' | 'success' | 'error';

export interface LoadingStateResult<T> {
  /** Current loading state */
  state: LoadingState;
  /** Fetched data */
  data: T | null;
  /** Error if any */
  error: Error | null;
  /** Is currently loading */
  isLoading: boolean;
  /** Has successfully loaded */
  isSuccess: boolean;
  /** Has errored */
  isError: boolean;
  /** Is idle (not yet started) */
  isIdle: boolean;
  /** Screen state status for ScreenState component */
  screenStatus: ScreenStateStatus;
  /** Execute the async operation */
  execute: () => Promise<T | null>;
  /** Reset to idle state */
  reset: () => void;
  /** Retry the last operation */
  retry: () => Promise<T | null>;
  /** Set data directly (useful for optimistic updates) */
  setData: (data: T | null) => void;
}

export interface UseLoadingStateOptions<T> {
  /** Async function to execute */
  asyncFn: () => Promise<T>;
  /** Initial data value */
  initialData?: T | null;
  /** Auto-execute on mount */
  autoExecute?: boolean;
  /** Consider empty array as empty state */
  treatEmptyAsEmpty?: boolean;
  /** Dependencies that trigger re-fetch when changed */
  deps?: unknown[];
  /** Callback on success */
  onSuccess?: (data: T) => void;
  /** Callback on error */
  onError?: (error: Error) => void;
}

// ============================================
// HOOK IMPLEMENTATION
// ============================================

export function useLoadingState<T>({
  asyncFn,
  initialData = null,
  autoExecute = true,
  treatEmptyAsEmpty = true,
  deps = [],
  onSuccess,
  onError,
}: UseLoadingStateOptions<T>): LoadingStateResult<T> {
  const [state, setState] = useState<LoadingState>('idle');
  const [data, setData] = useState<T | null>(initialData);
  const [error, setError] = useState<Error | null>(null);
  const { isConnected } = useNetwork();
  const asyncFnRef = useRef(asyncFn);
  const mountedRef = useRef(true);

  // Keep asyncFn ref up to date
  useEffect(() => {
    asyncFnRef.current = asyncFn;
  }, [asyncFn]);

  // Track mounted state
  useEffect(() => {
    mountedRef.current = true;
    return () => {
      mountedRef.current = false;
    };
  }, []);

  const execute = useCallback(async (): Promise<T | null> => {
    // Check network connectivity first
    if (!isConnected) {
      if (mountedRef.current) {
        setState('error');
        setError(new Error('No internet connection'));
      }
      return null;
    }

    try {
      if (mountedRef.current) {
        setState('loading');
        setError(null);
      }

      const result = await asyncFnRef.current();

      if (mountedRef.current) {
        setData(result);
        setState('success');
        onSuccess?.(result);
      }

      return result;
    } catch (err) {
      const errorObj = err instanceof Error ? err : new Error(String(err));

      if (mountedRef.current) {
        setError(errorObj);
        setState('error');
        onError?.(errorObj);
      }

      return null;
    }
  }, [isConnected, onSuccess, onError]);

  const reset = useCallback(() => {
    setState('idle');
    setData(initialData);
    setError(null);
  }, [initialData]);

  const retry = useCallback(async (): Promise<T | null> => {
    return execute();
  }, [execute]);

  // Auto-execute on mount and when deps change
  useEffect(() => {
    if (autoExecute) {
      execute();
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [...deps, autoExecute]);

  // Derive screen status
  const getScreenStatus = (): ScreenStateStatus => {
    if (!isConnected && state !== 'success') {
      return 'offline';
    }

    if (state === 'loading') {
      return 'loading';
    }

    if (state === 'error') {
      return 'error';
    }

    // Check for empty state
    if (state === 'success' && treatEmptyAsEmpty) {
      if (data === null || data === undefined) {
        return 'empty';
      }
      if (Array.isArray(data) && data.length === 0) {
        return 'empty';
      }
    }

    if (state === 'success') {
      return 'content';
    }

    // Idle state - treat as loading for initial render
    return 'loading';
  };

  return {
    state,
    data,
    error,
    isLoading: state === 'loading',
    isSuccess: state === 'success',
    isError: state === 'error',
    isIdle: state === 'idle',
    screenStatus: getScreenStatus(),
    execute,
    reset,
    retry,
    setData,
  };
}

// ============================================
// SIMPLIFIED VARIANTS
// ============================================

/**
 * Simple fetch hook with minimal configuration
 */
export function useFetch<T>(
  asyncFn: () => Promise<T>,
  deps: unknown[] = []
): LoadingStateResult<T> {
  return useLoadingState({
    asyncFn,
    deps,
    autoExecute: true,
    treatEmptyAsEmpty: true,
  });
}

/**
 * Manual fetch hook - doesn't auto-execute
 */
export function useManualFetch<T>(
  asyncFn: () => Promise<T>
): LoadingStateResult<T> {
  return useLoadingState({
    asyncFn,
    autoExecute: false,
    treatEmptyAsEmpty: true,
  });
}

/**
 * Mutation hook for POST/PUT/DELETE operations
 */
export function useMutation<T, TVariables = void>(
  mutationFn: (variables: TVariables) => Promise<T>,
  options?: {
    onSuccess?: (data: T) => void;
    onError?: (error: Error) => void;
  }
) {
  const [state, setState] = useState<LoadingState>('idle');
  const [data, setData] = useState<T | null>(null);
  const [error, setError] = useState<Error | null>(null);
  const { isConnected } = useNetwork();

  const mutate = useCallback(
    async (variables: TVariables): Promise<T | null> => {
      if (!isConnected) {
        const netError = new Error('No internet connection');
        setError(netError);
        setState('error');
        options?.onError?.(netError);
        return null;
      }

      try {
        setState('loading');
        setError(null);

        const result = await mutationFn(variables);

        setData(result);
        setState('success');
        options?.onSuccess?.(result);

        return result;
      } catch (err) {
        const errorObj = err instanceof Error ? err : new Error(String(err));
        setError(errorObj);
        setState('error');
        options?.onError?.(errorObj);
        return null;
      }
    },
    [isConnected, mutationFn, options]
  );

  const reset = useCallback(() => {
    setState('idle');
    setData(null);
    setError(null);
  }, []);

  return {
    mutate,
    reset,
    state,
    data,
    error,
    isLoading: state === 'loading',
    isSuccess: state === 'success',
    isError: state === 'error',
    isIdle: state === 'idle',
  };
}

// ============================================
// COMBINED LOADING STATES
// ============================================

/**
 * Combine multiple loading states into one
 */
export function combineLoadingStates(
  ...states: { isLoading: boolean; isError: boolean; error?: Error | null }[]
): {
  isLoading: boolean;
  isError: boolean;
  errors: Error[];
} {
  const isLoading = states.some((s) => s.isLoading);
  const isError = states.some((s) => s.isError);
  const errors = states
    .filter((s) => s.error)
    .map((s) => s.error as Error);

  return { isLoading, isError, errors };
}

/**
 * Derive combined screen status from multiple states
 */
export function combineScreenStatus(
  ...statuses: ScreenStateStatus[]
): ScreenStateStatus {
  // Priority: loading > error > offline > empty > content
  if (statuses.some((s) => s === 'loading')) return 'loading';
  if (statuses.some((s) => s === 'error')) return 'error';
  if (statuses.some((s) => s === 'offline')) return 'offline';
  if (statuses.every((s) => s === 'empty')) return 'empty';
  return 'content';
}

export default useLoadingState;
