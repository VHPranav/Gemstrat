'use client';

import PinnedSteps, { type PinnedStep } from '@/components/pages/PinnedSteps';
import StatueBuild from '@/components/ui/StatueBuild';
import type { BlueprintData } from '@/lib/blueprintGuides';
import statue from '@/data/blueprint/statue-of-liberty.json';

// The five focus areas: the Statue of Liberty pinned on the right is built
// from the ground up, one band per area, each in that discipline's own way,
// while the areas blur in and out on the left (PinnedSteps, StatueBuild).

export default function FocusSteps({ steps }: { steps: PinnedStep[] }) {
  return (
    <PinnedSteps
      id="areas"
      steps={steps}
      aspect={statue.w / statue.h}
      renderVisual={(progress) => (
        <StatueBuild
          data={statue as BlueprintData}
          src="/images/blueprint/statue-of-liberty.webp"
          progress={progress}
          label="The Statue of Liberty, built from the ground up in five ways as you scroll"
        />
      )}
    />
  );
}
