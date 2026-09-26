'use client';

import { useEffect, useState } from 'react';
import { getGpuName, getGpuProbeMs, getGpuTier, isLowEndDevice } from '@/lib/device';
import { getPerfMode, getPerfReason, startPerfWatchdog } from '@/lib/perf';
import { useDebugFlag, usePerfLite } from '@/lib/usePerfLite';

// Starts the frame-rate watchdog (perf.ts). With ?debug in the URL it also
// shows a small readout — GPU, tier, mode and live fps — so a slow machine
// can report exactly what it is.
export default function PerfWatchdog() {
  const lite = usePerfLite();
  const debug = useDebugFlag();
  const [fps, setFps] = useState(0);

  useEffect(() => {
    getPerfMode();
    return startPerfWatchdog(debug ? setFps : undefined);
  }, [debug]);

  if (!debug) return null;
  return (
    <div
      style={{
        position: 'fixed',
        left: 8,
        bottom: 8,
        zIndex: 9999,
        padding: '8px 10px',
        maxWidth: 360,
        font: '11px/1.4 ui-monospace, monospace',
        color: '#fff',
        background: 'rgba(0,0,0,0.8)',
        borderRadius: 6,
        pointerEvents: 'none',
      }}
    >
      <div>gpu: {getGpuName() || 'unknown'}</div>
      <div>
        tier: {getGpuTier()} (probe {getGpuProbeMs().toFixed(0)}ms) · low-end: {String(isLowEndDevice())} · cores:{' '}
        {navigator.hardwareConcurrency ?? '?'}
      </div>
      <div>
        mode: {lite ? 'lite' : 'full'}
        {getPerfReason() ? ` (${getPerfReason()})` : ''} · fps: {fps ? fps.toFixed(0) : '…'}
      </div>
    </div>
  );
}
