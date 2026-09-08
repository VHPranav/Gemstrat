import React from 'react';
import {
  Hero,
  Statement,
  AboutIntro,
  GemstratAdvantage,
  ScalingExpertise,
  ReviewsSection,
} from '@/components/sections';

export default function HomePage() {
  return (
    <main className="bg-[#090909] min-h-screen">
      <Hero />
      <Statement />
      <AboutIntro />
      <GemstratAdvantage />
      <ScalingExpertise />
      <ReviewsSection />
    </main>
  );
}


