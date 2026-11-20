'use client';

import Link from 'next/link';
import { useEffect } from 'react';

export default function LegacyFocusRedirect() {
  useEffect(() => {
    window.location.replace('/what-we-do' + window.location.search + window.location.hash);
  }, []);
  return <main style={{ minHeight: '100svh', display: 'grid', placeItems: 'center', background: '#fff', color: '#111' }}>
    <Link href="/what-we-do">Explore what we do →</Link>
  </main>;
}
