import type { Metadata } from 'next';
import SubPage from '@/components/pages/SubPage';
import FocusSteps from '@/components/pages/FocusSteps';

export const metadata: Metadata = {
  title: 'Focus areas — Gemstrat',
  description: 'Enterprise architecture, AI & automation, 360° branding, neo marketing & digital, and advertising.',
};

const AREAS = [
  {
    title: 'Enterprise Architecture & Mapping',
    body: 'We map how your business really runs — capabilities, processes, data and technology — and design the target state that lets strategy flow into everyday operations without friction.',
  },
  {
    title: 'AI & Automation',
    body: 'From finding the right use cases to putting them into production, we help teams adopt AI and automation where it moves the needle — with governance built in from day one.',
  },
  {
    title: '360° Branding',
    body: 'Positioning, identity and voice designed as one system, so every touchpoint — from the boardroom deck to the product screen — tells the same story.',
  },
  {
    title: 'Neo Marketing & Digital',
    body: 'We build the digital products and growth engines that turn attention into customers: fast websites, useful apps and performance marketing measured against real business outcomes.',
  },
  {
    title: 'Advertising',
    body: 'Big ideas, carefully placed. We create campaigns across film, print, outdoor and digital, and plan the media so the work reaches the people who matter.',
  },
];

export default function FocusAreasPage() {
  return (
    <SubPage
      eyebrow="Focus areas"
      title={['Five disciplines.', 'One connected', 'practice.']}
      next={{ label: 'See the five', href: '#areas' }}
      intro="Strategy, technology and brand usually live in separate firms. We bring them under one roof, so the plan, the systems and the story are built to work together."
    >
      <FocusSteps steps={AREAS.map((a, i) => ({ n: `0${i + 1}`, title: a.title, body: a.body }))} />
    </SubPage>
  );
}
