import ClarityScene from './ClarityScene';
import { ABOUT_CONTENT, type ClarityContent } from './clarityContent';
import Image from 'next/image';
import Link from 'next/link';
import { groups, process, services, values, regions } from '@/data/redesign/content';
import { Arrow, ContactCTA, Eyebrow, JumpNav, PageFooter, PageFrame, SectionHead, ServiceCards, styles } from './PageParts';

// Our purpose: the same scroll scene as About, 1:1, with its own copy
const PURPOSE_CONTENT: ClarityContent = {
  heroLines: ABOUT_CONTENT.heroLines,
  heroSubtext: ABOUT_CONTENT.heroSubtext,
  statements: ['Make progress that matters.', 'Clarity in our thinking.', 'Purpose in our work.'],
  closing: ['Clarity. Responsibility. Collaboration.', 'Progress that lasts.'],
  belief: {
    title: 'Our purpose is progress on the things that matter.',
    body: 'Our vision is for every business, from startup to enterprise, to run on an architecture that scales and adapts. Our mission is to combine enterprise architecture, AI and automation, and creative strategy into transformation that actually goes live.',
    link: { label: 'See how we work', href: '/our-approach' },
    links: [
      { text: 'enterprise architecture', href: '/services/enterprise-architecture' },
      { text: 'AI and automation', href: '/services/ai-intelligent-automation' },
    ],
  },
  practice: {
    title: 'Our values, made practical.',
    cards: values.map(v => ({ title: v.title, body: v.body, href: '/our-approach', label: 'See it in practice' })),
  },
};

// Structured data for Our purpose: the page, and the organization it's about
const SITE = 'https://gemstrat.com';
const PURPOSE_SCHEMA = {
  '@context': 'https://schema.org',
  '@graph': [
    {
      '@type': 'AboutPage',
      '@id': `${SITE}/our-purpose#page`,
      url: `${SITE}/our-purpose`,
      name: 'Our Purpose & Values | Gemstrat Consulting',
      description: 'Our purpose is progress on the things that matter. Explore the values behind Gemstrat, an enterprise architecture and strategy consultancy.',
      about: { '@id': `${SITE}/#organization` },
    },
    {
      '@type': 'Organization',
      '@id': `${SITE}/#organization`,
      name: 'Gemstrat',
      url: SITE,
      logo: `${SITE}/gemstrat-logo.png`,
      email: 'ask@gemstrat.com',
      founder: { '@type': 'Person', name: 'Deepak Suresh' },
      areaServed: ['United States', 'Canada', 'India', 'Middle East', 'Africa'].map(name => ({ '@type': 'Place', name })),
    },
  ],
};

export function PurposePage() {
  return <PageFrame about hero={<ClarityScene content={PURPOSE_CONTENT} label="Our purpose: different perspectives, one connected practice" />} ctaTitle="Let’s put purpose into practice." ctaText="Bring us the challenge. Let’s build what’s next, together." category="Our purpose" title="Different perspectives. One connected practice." intro="We bring strategy, technology and brand together to help businesses move forward with clarity." art="interlocking-loops">
    <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(PURPOSE_SCHEMA).replaceAll('<', '\\u003c') }} />
  </PageFrame>;
}

// Our approach: the same scroll language as Our purpose, but a different
// story — four method steps build the Z wireframe-first, and the later
// layouts are mirrored
const APPROACH_CONTENT: ClarityContent = {
  variant: 'approach',
  heroLines: [['Different'], ['minds.'], ['Shared'], ['direction.']],
  heroSubtext: 'Strategy and execution, connected in one way of working.',
  statements: [],
  steps: process,
  closing: ['Understand. Define. Make. Move forward.', 'A visible path, together.'],
  belief: {
    title: 'Our approach keeps us close to the challenge.',
    body: 'We don’t hand over a slide deck and leave. Our strategy and execution consulting keeps us embedded with your teams, through clear scope, visible decisions, agreed checkpoints and hands-on knowledge transfer.',
    link: { label: 'Start a conversation', href: '/contact' },
  },
  practice: {
    title: 'A multidisciplinary consulting approach.',
    // This page's own lines for the cards (the services' headlines stay on their pages)
    cards: ([
      [services[0], 'Rethink, rebuild and future-proof your business.'],
      [services[2], 'Identify where AI and automation create measurable impact.'],
      [services[6], 'Distinctive brand systems built to evolve.'],
    ] as const).map(([sv, body]) => ({ title: sv.title, body, href: `/services/${sv.slug}`, label: 'Explore' })),
  },
};

// Structured data for Our approach: the page, and its four steps as a HowTo
const APPROACH_SCHEMA = {
  '@context': 'https://schema.org',
  '@graph': [
    {
      '@type': 'WebPage',
      '@id': `${SITE}/our-approach#page`,
      url: `${SITE}/our-approach`,
      name: 'Our Approach | Strategy & Execution Consulting | Gemstrat',
      description: 'Our approach moves from deep discovery to architecture-led strategy and hands-on execution. See how our consulting approach delivers results.',
      about: { '@id': `${SITE}/#organization` },
    },
    {
      '@type': 'HowTo',
      '@id': `${SITE}/our-approach#howto`,
      name: 'Our approach',
      description: 'From deep discovery to architecture-led strategy and hands-on execution.',
      step: process.map((p, i) => ({ '@type': 'HowToStep', position: i + 1, name: p.title, text: p.body })),
    },
  ],
};

export function ApproachPage() {
  return <PageFrame about hero={<ClarityScene content={APPROACH_CONTENT} label="Our approach: different minds, shared direction" />} ctaTitle="Let’s find the way forward together." ctaText="Start with a discovery call. No pressure, no obligation." category="Our approach" title="Different minds. Shared direction." intro="Progress starts when the right perspectives come together." art="interlocking-loops">
    <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(APPROACH_SCHEMA).replaceAll('<', '\\u003c') }} />
  </PageFrame>;
}

export function PurposeBody() {
  return <div className={styles.page}>
    <JumpNav items={[{ id: 'purpose', title: 'Why we exist' }, { id: 'direction', title: 'Vision & mission' }, { id: 'values', title: 'Our values' }]} />
    <section className={styles.section} id="purpose" data-nav-light><Eyebrow>Why we exist</Eyebrow><h2 className={styles.manifesto}>Make progress on the things that matter.<br /><span className={styles.muted}>Leave people equipped to keep going.</span></h2></section>
    <section className={`${styles.section} ${styles.dark}`} id="direction"><div className={styles.split}><div className={styles.imageWrap}><Image className={styles.image} src="/images/about/clarity-lighthouse.webp" alt="A lighthouse marking a clear direction" width={900} height={1100} /></div><div><Eyebrow>A direction to believe in</Eyebrow><h2 style={{ marginTop: 30 }}>Clarity in our thinking.<br />Purpose in our work.</h2><p>Our vision is for every business, from startup to enterprise, to run on an architecture that scales and adapts.</p><p>Our mission is to combine <Link href="/services/enterprise-architecture">enterprise architecture</Link>, <Link href="/services/ai-intelligent-automation">AI and automation</Link>, and creative strategy into transformation that actually goes live.</p></div></div></section>
    <section className={styles.section} id="values" data-nav-light><SectionHead label="What guides us" title="Our values, made practical." description="The way we work matters as much as the work itself." /><div className={styles.values}>{values.map((v, i) => <article className={styles.value} key={v.title}><span className={styles.number}>0{i + 1}</span><h3>{v.title}</h3><p>{v.body}</p></article>)}</div></section>
    <ContactCTA title="Let’s put purpose into practice." text="Bring us the challenge. Let’s build what’s next, together." /><PageFooter />
  </div>;
}

export function ApproachBody() {
  return <div className={styles.page}><JumpNav items={[{ id: 'our-approach', title: 'How we work' }, { id: 'together', title: 'Working together' }, { id: 'expertise', title: 'Connected expertise' }]} />
    <section className={styles.section} id="our-approach" data-nav-light><SectionHead label="Our approach" title="A shared direction. A visible path." description="Every engagement is different. These are the questions and habits that keep the work connected to your business." /><div className={styles.steps}>{process.map((p, i) => <article className={styles.step} key={p.title}><span className={styles.number}>0{i + 1}</span><h3>{p.title}</h3><div><p>{p.body}</p><small>{p.detail}</small></div></article>)}</div></section>
    <section className={`${styles.section} ${styles.dark}`} id="together"><div className={styles.split}><div><Eyebrow>Working together</Eyebrow><h2 style={{ marginTop: 30 }}>Close to the challenge.<br /><span className={styles.muted}>Part of the work.</span></h2><p>We work alongside your teams to understand the realities of delivery. A clear scope, visible decisions and agreed checkpoints give everyone a common reference.</p><p>Useful documentation and knowledge transfer help your team carry the work forward.</p></div><Image className={styles.image} src="/images/scaling/leadership-window.webp" alt="Light and perspective through an architectural window" width={900} height={1100} /></div></section>
    <section className={styles.section} id="expertise" data-nav-light><SectionHead label="Connected thinking" title="The right perspectives, together." /><ServiceCards items={[services[0], services[2], services[6]]} /></section><ContactCTA /><PageFooter />
  </div>;
}

export function ExpertiseBody() {
  return <div className={styles.page}><JumpNav items={groups.map(g => ({ id: g.toLowerCase().replaceAll(/[^a-z]+/g, '-'), title: g }))} />{groups.map((g, i) => <section key={g} className={styles.section} id={g.toLowerCase().replaceAll(/[^a-z]+/g, '-')} data-nav-light><SectionHead label={`0${i + 1} / ${g}`} title={['Shape the business ahead.', 'Put intelligence to work.', 'Build what people experience.', 'Equip people for progress.'][i]} /><ServiceCards items={services.filter(s => s.group === g && !s.specialty)} /></section>)}<section className={`${styles.section} ${styles.dark}`} id="overview"><SectionHead label="Specialist support" title="More ways to move forward." /><div className={styles.directoryGrid}>{services.filter(s => s.specialty).map(s => <Link key={s.slug} href={`/services/${s.slug}`}>{s.title}<Arrow /></Link>)}</div></section><ContactCTA /><PageFooter /></div>;
}

export function GlobalBody() {
  return <div className={styles.page}><section className={styles.section} id="overview" data-nav-light><SectionHead label="Global presence" title="Different markets. Connected thinking." description="Start with your local priorities and bring the relevant perspectives into the same plan." /><div className={styles.regionLinks}>{regions.map((r, i) => <Link className={styles.regionLink} key={r.slug} href={`/locations/${r.slug}`}><small>0{i + 1}</small><span>{r.name}</span><Arrow /></Link>)}</div></section><ContactCTA /><PageFooter /></div>;
}

// Leadership: five perspectives, one per piece of the Z, pulled into focus
// in turn before they join (sample perspectives until team profiles arrive)
const LEADERSHIP_CONTENT: ClarityContent = {
  variant: 'leadership',
  heroLines: [['The', 'minds'], ['behind', 'the', 'work.']],
  heroSubtext: 'Our leadership. Five perspectives, one direction.',
  statements: [],
  perspectives: [
    { title: 'Strategy & transformation', body: 'Business blueprints, operating models and transformation roadmaps that turn ambition into measurable results.' },
    { title: 'Technology & intelligence', body: 'Enterprise architecture, AI and automation, aligned to how your business operates.' },
    { title: 'Brand & experience', body: 'Positioning, identity and brand systems that shape how the world sees you.' },
    { title: 'People & capability', body: 'Leadership development, upskilling and change management that help transformation take hold and last.' },
    { title: 'Delivery & partnership', body: 'Partners, not vendors. Embedded teams and fractional CXOs who deliver alongside yours.' },
  ],
  closing: ['Our leadership.', 'Five perspectives, one direction.'],
  belief: {
    title: 'Close to the business. Open to a better answer.',
    body: 'Our leadership starts with founder Deepak Suresh, an enterprise architecture consultant and marketing leader with decades of transformation experience.',
    link: { label: 'Talk to our team', href: '/contact' },
  },
  practice: {
    title: 'How we lead.',
    cards: [
      { title: 'Create clarity', body: 'We cut through the noise to find the signal, then make every trade-off visible.', href: '/our-approach', label: 'Our approach' },
      { title: 'Listen widely', body: 'We don’t show up with solutions. We show up with ears.', href: '/what-we-do', label: 'What we do' },
      { title: 'Stay close to the work', body: 'Hands-on leadership with high-level thinking, embedded in every engagement from strategy to execution.', href: '/our-purpose', label: 'Our purpose' },
      { title: 'Leave teams stronger', body: 'We measure success by the capability your teams keep long after we step back.', href: '/contact', label: 'Start a conversation' },
    ],
  },
};

// Structured data for Leadership: the page, and the founder, linked to the
// organization (the same @id as on Our purpose)
const LEADERSHIP_SCHEMA = {
  '@context': 'https://schema.org',
  '@graph': [
    {
      '@type': 'AboutPage',
      '@id': `${SITE}/about/leadership#page`,
      url: `${SITE}/about/leadership`,
      name: 'Our Leadership | Enterprise Architecture | Gemstrat',
      description: 'Meet our leadership. Founder Deepak Suresh leads Gemstrat’s enterprise architecture, business transformation and marketing expertise worldwide.',
      about: { '@id': `${SITE}/#organization` },
      mainEntity: { '@id': `${SITE}/about/leadership#deepak-suresh` },
    },
    {
      '@type': 'Person',
      '@id': `${SITE}/about/leadership#deepak-suresh`,
      name: 'Deepak Suresh',
      jobTitle: 'Founder & Chief Enterprise Architect',
      worksFor: { '@id': `${SITE}/#organization` },
    },
    {
      '@type': 'Organization',
      '@id': `${SITE}/#organization`,
      name: 'Gemstrat',
      url: SITE,
      founder: { '@id': `${SITE}/about/leadership#deepak-suresh` },
    },
  ],
};

export function LeadershipPage() {
  return <PageFrame about hero={<ClarityScene content={LEADERSHIP_CONTENT} label="Leadership: the minds behind the work" />} ctaTitle="Meet the minds behind the work." ctaText="Big moves deserve experienced leadership. Let’s make yours count." category="Who we are / Leadership" title="The minds behind the work." intro="Connected perspectives make a stronger plan." art="wire-figure">
    <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(LEADERSHIP_SCHEMA).replaceAll('<', '\\u003c') }} />
  </PageFrame>;
}
