import React from 'react';
import {
  Hero,
  Statement,
  FilmSection,
  AboutIntro,
  GemstratAdvantage,
  ScalingExpertise,
  ReviewsSection,
} from '@/components/sections';

export default function HomePage() {
  return (
    <main className="bg-[#090909] min-h-screen">
      {/* The Statement scrolls in over the hero's 3D scene */}
      <Hero>
        <Statement />
      </Hero>
      <FilmSection />
      <AboutIntro />
      <GemstratAdvantage />
      <ScalingExpertise />
      <ReviewsSection />
    </main>
  );
}


