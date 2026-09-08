import React from 'react';
import Hero from '@/components/Hero';
import Statement from '@/components/Statement';
import AboutIntro from '@/components/AboutIntro';
import GemstratAdvantage from '@/components/GemstratAdvantage';
import ScalingExpertise from '@/components/ScalingExpertise';
import ReviewsSection from '@/components/ReviewsSection';

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


