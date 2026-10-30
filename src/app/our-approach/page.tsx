import type { Metadata } from 'next';
import SubPage from '@/components/pages/SubPage';
import ApproachHeroVisual from '@/components/pages/ApproachHeroVisual';
import OurApproachSections from '@/components/pages/OurApproachSections';

export const metadata: Metadata = {
  title: 'Our Approach — Gemstrat',
  description: 'A shared direction. Connected thinking. Practical progress. Discover how Gemstrat brings strategy, technology and brand together.',
};

export default function OurApproachPage() {
  return (
    <SubPage
      title={['Different minds.', 'Shared direction.']}
      intro="Progress starts when the right perspectives come together. We connect strategy, technology and brand to find a clear direction — and work alongside your people to bring it to life."
      next={{ label: 'Discover our approach', href: '#our-approach' }}
      aside={<ApproachHeroVisual heroOnly centerOnScroll centerBeforeContent />}
      centered
      pinned={1.75}
      closing={false}
    >
      <OurApproachSections />
    </SubPage>
  );
}
