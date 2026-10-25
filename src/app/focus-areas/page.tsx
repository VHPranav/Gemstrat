import type { Metadata } from 'next';
import Image from 'next/image';
import SubPage from '@/components/pages/SubPage';

export const metadata: Metadata = {
  title: 'Focus areas — Gemstrat',
  description:
    'Enterprise architecture, AI & automation, 360° branding, neo marketing & digital, and advertising.',
};

const AREAS = [
  {
    title: 'Enterprise Architecture & Mapping',
    line: 'Align goals, operations, and systems for future-ready growth.',
    body: 'We map how your business really runs — capabilities, processes, data and technology — and design the target state that lets strategy flow into everyday operations without friction.',
    services: ['Capability & process mapping', 'Target operating models', 'Technology & data roadmaps', 'Org design'],
    image: '/images/about/enterprise-architecture.webp',
  },
  {
    title: 'AI & Automation',
    line: 'Integrate intelligence, streamline outcomes across the business.',
    body: 'From finding the right use cases to putting them into production, we help teams adopt AI and automation where it moves the needle — with governance built in from day one.',
    services: ['AI opportunity assessment', 'Workflow automation', 'Agents & copilots', 'AI governance'],
    image: '/images/about/ai-automation.webp',
  },
  {
    title: '360° Branding',
    line: 'Craft distinctive brand systems that evolve with your business.',
    body: 'Positioning, identity and voice designed as one system, so every touchpoint — from the boardroom deck to the product screen — tells the same story.',
    services: ['Brand strategy & positioning', 'Visual identity', 'Naming & messaging', 'Brand guidelines'],
    image: '/images/about/branding.webp',
  },
  {
    title: 'Neo Marketing & Digital',
    line: 'Websites, apps and digital-first marketing designed to deliver results.',
    body: 'We build the digital products and growth engines that turn attention into customers: fast websites, useful apps and performance marketing measured against real business outcomes.',
    services: ['Websites & apps', 'Performance marketing', 'Content & social', 'Analytics & CRO'],
    image: '/images/about/neo-marketing-digital.webp',
  },
  {
    title: 'Advertising',
    line: 'Build identities and campaigns that move markets.',
    body: 'Big ideas, carefully placed. We create campaigns across film, print, outdoor and digital, and plan the media so the work reaches the people who matter.',
    services: ['Campaign concepts', 'Film & photography', 'Media planning', 'Launch campaigns'],
    image: '/images/about/advertising.webp',
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
      <section id="areas" className="px-6 sm:px-10 lg:px-16 xl:px-20 py-12 sm:py-20">
        {AREAS.map((a, i) => (
          <article
            key={a.title}
            className="grid gap-8 lg:gap-16 lg:grid-cols-2 items-center py-12 sm:py-16 border-b border-white/10 last:border-b-0"
          >
            <div className={`relative aspect-[4/3] overflow-hidden ${i % 2 ? 'lg:order-2' : ''}`}>
              <Image src={a.image} alt={a.title} fill sizes="(min-width: 1024px) 50vw, 100vw" className="object-cover" />
            </div>
            <div>
              <span className="font-sans text-[13px] text-white/40">0{i + 1}</span>
              <h2 className="mt-4 font-archivo text-[clamp(2rem,4vw,60px)] font-normal tracking-[-0.035em] leading-[1.05] m-0">
                {a.title}
              </h2>
              <p className="mt-6 font-archivo text-[18px] sm:text-[21px] leading-[1.45] text-white/85">“{a.line}”</p>
              <p className="mt-4 font-archivo text-[16px] sm:text-[17px] leading-[1.55] text-white/55">{a.body}</p>
              <ul className="mt-8 list-none p-0 grid grid-cols-1 sm:grid-cols-2 gap-x-6 gap-y-2">
                {a.services.map((s) => (
                  <li key={s} className="font-sans text-[12px] sm:text-[13px] uppercase tracking-[0.04em] text-white/80 border-t border-white/15 pt-2">
                    {s}
                  </li>
                ))}
              </ul>
            </div>
          </article>
        ))}
      </section>
    </SubPage>
  );
}
