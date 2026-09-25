import React from 'react';
import {
  Hero,
  Statement,
  AboutIntro,
  GemstratAdvantage,
  ScalingExpertise,
  ReviewsSection,
} from '@/components/sections';
import ImageFormationGrid from '@/components/ImageFormationGrid';
import HeroBackdrop from '@/components/sections/HeroBackdrop';

export default function HomePage() {
  return (
    <main className="bg-[#090909] min-h-screen">
      {/* Hero + Statement share one sticky sculpture background */}
      <HeroBackdrop>
        <Hero />
        <Statement />
      </HeroBackdrop>
      <ImageFormationGrid />
      <AboutIntro />
      <GemstratAdvantage />
      <ScalingExpertise />
      <ReviewsSection />
    </main>
  );
}


