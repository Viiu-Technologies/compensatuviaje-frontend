/**
 * usePolling Hook
 * 
 * A generic polling hook for status checks. Used by both KYB verification
 * and Project Certification flows to poll the backend while AI evaluation
 * is in progress.
 * 
 * The hook will:
 * 1. Immediately fetch data on mount
 * 2. Continue polling at the specified interval while shouldContinue returns true
 * 3. Stop polling when shouldContinue returns false or component unmounts
 * 4. Handle errors gracefully without breaking the polling cycle
 * 
 * @example
 * // KYB status polling
 * const { data, loading, error, refetch } = usePolling(
 *   () => kybApi.getStatus(),
 *   (res) => res.latest_evaluation?.ai_status === 'pending',
 *   30000
 * );
 * 
 * @example
 * // Certification status polling
 * const { data, loading, error, refetch } = usePolling(
 *   () => certificationApi.getStatus(projectId),
 *   (res) => res.latest_evaluation?.status === 'pending',
 *   30000
 * );
 */

import { useState, useEffect, useCallback, useRef } from 'react';

interface UsePollingResult<T> {
  /** The latest data from the fetch function */
  data: T | null;
  /** Whether the initial fetch is in progress */
  loading: boolean;
  /** Any error that occurred during fetching */
  error: Error | null;
  /** Whether polling is currently active */
  isPolling: boolean;
  /** Manually trigger a refetch */
  refetch: () => Promise<void>;
  /** Stop polling manually */
  stopPolling: () => void;
  /** Start polling manually (useful after stopPolling) */
  startPolling: () => void;
}

interface UsePollingOptions {
  /** Whether to start polling immediately on mount (default: true) */
  enabled?: boolean;
  /** Callback when data is received */
  onSuccess?: (data: any) => void;
  /** Callback when an error occurs */
  onError?: (error: Error) => void;
  /** Callback when polling stops (condition met or manual) */
  onPollingComplete?: () => void;
}

/**
 * Generic polling hook for status checks
 * 
 * @param fetchFn - Async function that fetches the data
 * @param shouldContinue - Function that returns true if polling should continue
 * @param intervalMs - Polling interval in milliseconds (default: 30000)
 * @param options - Additional options for the hook
 * @returns Polling state and control functions
 */
export function usePolling<T>(
  fetchFn: () => Promise<T>,
  shouldContinue: (data: T) => boolean,
  intervalMs: number = 30000,
  options: UsePollingOptions = {}
): UsePollingResult<T> {
  const { 
    enabled = true, 
    onSuccess, 
    onError, 
    onPollingComplete 
  } = options;

  const [data, setData] = useState<T | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<Error | null>(null);
  const [isPolling, setIsPolling] = useState(false);

  // Use refs to track mounted state and timer
  const isMountedRef = useRef(true);
  const timerRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const isPollingRef = useRef(false);

  // Clear any existing timer
  const clearTimer = useCallback(() => {
    if (timerRef.current) {
      clearTimeout(timerRef.current);
      timerRef.current = null;
    }
  }, []);

  // Stop polling
  const stopPolling = useCallback(() => {
    clearTimer();
    isPollingRef.current = false;
    setIsPolling(false);
    onPollingComplete?.();
  }, [clearTimer, onPollingComplete]);

  // Core polling function
  const poll = useCallback(async () => {
    if (!isMountedRef.current || !isPollingRef.current) return;

    try {
      const result = await fetchFn();
      
      if (!isMountedRef.current) return;

      setData(result);
      setError(null);
      setLoading(false);
      onSuccess?.(result);

      // Check if we should continue polling
      if (shouldContinue(result)) {
        // Schedule next poll
        timerRef.current = setTimeout(poll, intervalMs);
      } else {
        // Condition met, stop polling
        stopPolling();
      }
    } catch (err) {
      if (!isMountedRef.current) return;

      const error = err instanceof Error ? err : new Error(String(err));
      setError(error);
      setLoading(false);
      onError?.(error);

      // On error, continue polling (the status endpoint might be temporarily unavailable)
      // but increase the interval slightly to avoid hammering the server
      if (isPollingRef.current) {
        timerRef.current = setTimeout(poll, intervalMs * 1.5);
      }
    }
  }, [fetchFn, shouldContinue, intervalMs, onSuccess, onError, stopPolling]);

  // Start polling
  const startPolling = useCallback(() => {
    if (isPollingRef.current) return; // Already polling
    
    clearTimer();
    isPollingRef.current = true;
    setIsPolling(true);
    setLoading(true);
    poll();
  }, [clearTimer, poll]);

  // Manual refetch (one-time fetch without affecting polling state)
  const refetch = useCallback(async () => {
    setLoading(true);
    try {
      const result = await fetchFn();
      if (isMountedRef.current) {
        setData(result);
        setError(null);
        setLoading(false);
        onSuccess?.(result);
      }
    } catch (err) {
      if (isMountedRef.current) {
        const error = err instanceof Error ? err : new Error(String(err));
        setError(error);
        setLoading(false);
        onError?.(error);
      }
    }
  }, [fetchFn, onSuccess, onError]);

  // Effect to start polling on mount (if enabled)
  useEffect(() => {
    isMountedRef.current = true;

    if (enabled) {
      startPolling();
    }

    return () => {
      isMountedRef.current = false;
      clearTimer();
      isPollingRef.current = false;
    };
  }, [enabled]); // eslint-disable-line react-hooks/exhaustive-deps

  return {
    data,
    loading,
    error,
    isPolling,
    refetch,
    stopPolling,
    startPolling,
  };
}

export default usePolling;
