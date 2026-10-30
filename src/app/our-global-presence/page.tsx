import type { Metadata } from 'next';
import SubPage from '@/components/pages/SubPage';
import { Regions } from '@/components/pages/ApproachMore';

export const metadata: Metadata = {
  title: 'Our Global Presence — Gemstrat',
  description: 'Connected across the USA, Canada, India, the Middle East and Africa.',
};

export default function GlobalPresencePage() {
  return (
    <SubPage bare title={[]} intro="" next={{ label: 'Start a conversation', href: '#contact' }}>
      <Regions />
    </SubPage>
  );
}
