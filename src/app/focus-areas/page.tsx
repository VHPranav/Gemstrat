import type { Metadata } from 'next';
import LegacyFocusRedirect from '@/components/redesign/LegacyFocusRedirect';

export const metadata: Metadata = {
  title: 'What We Do — Gemstrat',
  alternates: { canonical: '/what-we-do' },
  robots: { index: false },
};

export default LegacyFocusRedirect;
