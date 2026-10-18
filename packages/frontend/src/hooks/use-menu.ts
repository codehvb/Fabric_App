import { useCallback, useEffect, useState } from 'react';

import {
  describeLoadError,
  fetchMenu,
  fetchMonthly,
  fetchPortfolioMonthly,
  type MonthlyPoint,
  type Smoothie,
} from '@/data/menu';
import type { MonthlyRevenue } from '@/data/strategy';

export type LoadState<T> =
  | { status: 'loading' }
  | { status: 'error'; message: string }
  | { status: 'ready'; data: T };

/** Loads the menu once; `retry` reloads after a failure. */
export function useMenu() {
  const [state, setState] = useState<LoadState<Smoothie[]>>({ status: 'loading' });
  const [attempt, setAttempt] = useState(0);

  useEffect(() => {
    let cancelled = false;
    fetchMenu().then(
      (data) => !cancelled && setState({ status: 'ready', data }),
      (error: unknown) =>
        !cancelled && setState({ status: 'error', message: describeLoadError(error) })
    );
    return () => {
      cancelled = true;
    };
  }, [attempt]);

  const retry = useCallback(() => {
    setState({ status: 'loading' });
    setAttempt((n) => n + 1);
  }, []);

  return { state, retry };
}

/** Loads a smoothie's monthly history while its details are open. */
export function useMonthly(smoothieId: string | null) {
  const [state, setState] = useState<LoadState<MonthlyPoint[]> & { id?: string }>({
    status: 'loading',
  });

  useEffect(() => {
    if (!smoothieId) return;
    let cancelled = false;
    fetchMonthly(smoothieId).then(
      (data) => !cancelled && setState({ status: 'ready', data, id: smoothieId }),
      (error: unknown) =>
        !cancelled &&
        setState({ status: 'error', message: describeLoadError(error), id: smoothieId })
    );
    return () => {
      cancelled = true;
    };
  }, [smoothieId]);

  // Until the requested smoothie's rows arrive, report loading rather than
  // showing the previous smoothie's history.
  if (!smoothieId || state.id !== smoothieId) return { status: 'loading' } as const;
  return state;
}

/** Loads every smoothie's monthly revenue for the strategy room. */
export function usePortfolioMonthly() {
  const [state, setState] = useState<LoadState<MonthlyRevenue[]>>({ status: 'loading' });

  useEffect(() => {
    let cancelled = false;
    fetchPortfolioMonthly().then(
      (data) => !cancelled && setState({ status: 'ready', data }),
      (error: unknown) =>
        !cancelled && setState({ status: 'error', message: describeLoadError(error) })
    );
    return () => {
      cancelled = true;
    };
  }, []);

  return state;
}
