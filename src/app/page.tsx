import React from 'react';
import Hero from '@/components/Hero';
import Statement from '@/components/Statement';
import AboutIntro from '@/components/AboutIntro';

export default function HomePage() {
  return (
    <main className="bg-[#090909] min-h-screen">
      <Hero />
      <Statement />
      <AboutIntro />
    </main>
  );
}


