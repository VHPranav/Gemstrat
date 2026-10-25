import type { Metadata } from 'next';
import SubPage from '@/components/pages/SubPage';
import ApproachSteps from '@/components/pages/ApproachSteps';
import ApproachHeroVisual from '@/components/pages/ApproachHeroVisual';
import ApproachMore from '@/components/pages/ApproachMore';

export const metadata: Metadata = {
  title: 'Approach — Gemstrat',
  description:
    'How Gemstrat works: diagnose, design, deliver and sustain. Senior-led strategy that goes all the way to execution.',
};

const STEPS = [
  {
    n: '01',
    title: 'Diagnose',
    body: 'We start by listening — to leadership, to teams, to customers and to the numbers. Interviews, data reviews and operating walkthroughs show where value is leaking and what is really holding growth back.',
  },
  {
    n: '02',
    title: 'Design',
    body: 'Together we shape a clear direction: the few bets worth making, the architecture to support them and the order to do things in. Every recommendation is tied to an owner, a cost and a measurable outcome.',
  },
  {
    n: '03',
    title: 'Deliver',
    body: 'We work alongside your teams to build what was designed — systems, automation, brand, campaigns — in short cycles, so results show up early and the plan keeps learning from them.',
  },
  {
    n: '04',
    title: 'Sustain',
    body: 'Lasting change needs people who own it. We hand over playbooks, dashboards and skills, then check in so momentum doesn’t fade once we step back.',
  },
];

export default function ApproachPage() {
  return (
    <SubPage
      title={['Clarity first.', 'Then execution.', 'Then momentum.']}
      next={{ label: 'How we work', href: '#how-we-work' }}
      aside={<ApproachHeroVisual />}
      centered
      pinned={0.6}
      intro="Gemstrat is a boutique strategic consultancy. We help leadership teams see their business clearly, decide what matters most, and turn that decision into results that last."
    >
      <ApproachSteps steps={STEPS} />
      <ApproachMore />
    </SubPage>
  );
}
