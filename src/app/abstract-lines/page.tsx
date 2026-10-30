import type { Metadata } from 'next';
import AbstractGallery from '@/components/abstract/AbstractGallery';

export const metadata: Metadata = {
  title: 'Abstract Lines — Gemstrat',
  description: 'Eleven abstract forms from the Gemstrat profile, named and collected for reference.',
  robots: { index: false, follow: false },
};

export default function AbstractLinesPage() {
  return <main><AbstractGallery /></main>;
}
