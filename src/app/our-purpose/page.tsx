import type { Metadata } from 'next';
import SubPage from '@/components/pages/SubPage';
import ApproachHeroVisual from '@/components/pages/ApproachHeroVisual';
import PurposeSections from '@/components/pages/PurposeSections';

export const metadata: Metadata = {
  title: 'Our Purpose — Gemstrat',
  description: 'We bring strategy, technology and brand together to turn complex challenges into practical solutions and lasting value.',
};

export default function OurPurposePage() {
  return (
    <SubPage
      title={['Purpose in action.', 'Progress that lasts.']}
      intro="We bring strategy, technology and brand together to help businesses move forward with clarity. Working alongside your teams, we turn complex challenges into practical solutions and lasting value for people and organisations."
      next={{ label: 'Explore our purpose', href: '#purpose' }}
      aside={<ApproachHeroVisual heroOnly centerOnScroll />}
      centered
      pinned={1}
      closing={false}
    >
      <PurposeSections />
    </SubPage>
  );
}
