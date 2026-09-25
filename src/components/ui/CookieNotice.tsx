'use client';

import React, { useSyncExternalStore } from 'react';

// ---------------------------------------------------------------------------
// CookieNotice
// Small dark badge, bottom centre, with a white Accept button. Appears after
// the hero intro; once accepted it's remembered in localStorage (per browser)
// and never shown again. Storage failures (private mode, blocked site data)
// just mean it shows again next visit.
// ---------------------------------------------------------------------------

const STORAGE_KEY = 'gemstrat-cookies-accepted';
const listeners = new Set<() => void>();

function readAccepted() {
  try {
    return window.localStorage.getItem(STORAGE_KEY) === '1';
  } catch {
    return false;
  }
}

let acceptedThisSession = false;

function subscribe(listener: () => void) {
  listeners.add(listener);
  return () => listeners.delete(listener);
}

function accept() {
  acceptedThisSession = true;
  try {
    window.localStorage.setItem(STORAGE_KEY, '1');
  } catch {
    // Storage unavailable: hidden for this visit only
  }
  listeners.forEach((l) => l());
}

export default function CookieNotice() {
  const accepted = useSyncExternalStore(
    subscribe,
    () => acceptedThisSession || readAccepted(),
    () => true // server render: nothing, avoids a flash before we can check storage
  );

  if (accepted) return null;

  return (
    <div
      role="region"
      aria-label="Cookie notice"
      className="hero-fade-up fixed bottom-5 sm:bottom-6 left-1/2 -translate-x-1/2 z-[950] flex items-center gap-5 pl-5 pr-2 py-2 bg-[#141416] border border-white/10 shadow-[0_12px_40px_rgba(0,0,0,0.5)]"
      style={{ animationDelay: '2.6s' }}
    >
      <p className="m-0 font-sans text-[11px] sm:text-xs uppercase tracking-[0.03em] text-white/45 whitespace-nowrap">
        This website uses <span className="text-white">cookies</span>
      </p>
      <button
        type="button"
        onClick={accept}
        className="h-8 px-3.5 bg-white text-black font-sans text-[11px] sm:text-xs uppercase tracking-[0.03em] hover:bg-zinc-200 transition-colors cursor-pointer"
      >
        Accept
      </button>
    </div>
  );
}
