'use client';

import dynamic from 'next/dynamic';
import { usePerfLite } from '@/lib/usePerfLite';
import type { BlueprintData } from '@/lib/blueprintGuides';
import taj from '@/data/blueprint/taj-mahal.json';

// three.js loads on its own, after the page is interactive
const SkeletonMorph = dynamic(() => import('@/components/ui/SkeletonMorph'), { ssr: false });

// The Approach hero's visual: the menu's wireframe S, in the same place and
// size, which comes apart on scroll and flies onto the blueprint's
// construction lines below (SkeletonMorph). In lite mode, as in the menu,
// there's none, and the blueprint draws its construction lines itself.
export default function ApproachHeroVisual({ heroOnly = false, centerOnScroll = false, centerBeforeContent = false }: { heroOnly?: boolean; centerOnScroll?: boolean; centerBeforeContent?: boolean }) {
  const lite = usePerfLite();
  if (lite) return null;
  return <SkeletonMorph data={taj as BlueprintData} heroOnly={heroOnly} centerOnScroll={centerOnScroll} centerBeforeContent={centerBeforeContent} />;
}
