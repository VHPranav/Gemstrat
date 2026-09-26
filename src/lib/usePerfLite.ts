'use client';

import { useSyncExternalStore } from 'react';
import { isLowEndDevice } from '@/lib/device';
import { getPerfMode, onPerfModeChange } from '@/lib/perf';

const noSubscribe = () => () => {};

// True when the page runs in lite mode (see perf.ts). Always false during SSR
// and hydration, then flips on the client — effects gated on it stay off.
export function usePerfLite(): boolean {
  return useSyncExternalStore(
    onPerfModeChange,
    () => getPerfMode() === 'lite',
    () => false
  );
}

// isLowEndDevice() as render state: false on the server, the real value on
// the client (it never changes after the first read).
export function useLowEndDevice(): boolean {
  return useSyncExternalStore(noSubscribe, isLowEndDevice, () => false);
}

// ?debug in the URL (client only)
export function useDebugFlag(): boolean {
  return useSyncExternalStore(
    noSubscribe,
    () => new URLSearchParams(window.location.search).has('debug'),
    () => false
  );
}
