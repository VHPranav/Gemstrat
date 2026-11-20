import type { Metadata } from 'next';
import { PolicyPage } from '@/components/redesign/UtilityPages';
export const metadata: Metadata = { title: 'Privacy Policy — Gemstrat', robots: { index: false, follow: true } };
export default function Page() { return <PolicyPage type="privacy" />; }
