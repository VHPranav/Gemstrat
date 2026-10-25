'use client';

import PinnedSteps, { type PinnedStep } from '@/components/pages/PinnedSteps';
import BlueprintDrawing, { type BlueprintData } from '@/components/ui/BlueprintDrawing';
import taj from '@/data/blueprint/taj-mahal.json';

// "How we work": the Taj Mahal blueprint pinned on the right, where the hero's
// S was, builds itself as the four steps blur in and out on the left
// (PinnedSteps, BlueprintDrawing).

export type ApproachStep = PinnedStep;

export default function ApproachSteps({ steps }: { steps: ApproachStep[] }) {
  return (
    <PinnedSteps
      id="how-we-work"
      steps={steps}
      aspect={taj.w / taj.h}
      renderVisual={(progress) => (
        <BlueprintDrawing
          data={taj as BlueprintData}
          src="/images/blueprint/taj-mahal.webp"
          progress={progress}
          label="An architectural elevation of the Taj Mahal that draws itself as you scroll"
        />
      )}
    />
  );
}
