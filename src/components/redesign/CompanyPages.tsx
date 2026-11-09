import ClarityScene from './ClarityScene';
import { ABOUT_CONTENT, type ClarityContent } from './clarityContent';
import Image from 'next/image';
import Link from 'next/link';
import AbstractArtwork from '@/components/abstract/AbstractArtwork';
import { groups, process, services, values, regions } from '@/data/redesign/content';
import { Arrow, ContactCTA, Eyebrow, JumpNav, PageFooter, PageFrame, SectionHead, ServiceCards, styles } from './PageParts';

// Our purpose: the same scroll scene as About, 1:1, with its own copy
const PURPOSE_CONTENT: ClarityContent = {
  heroLines: ABOUT_CONTENT.heroLines,
  heroSubtext: ABOUT_CONTENT.heroSubtext,
  statements: ['Make progress that matters.', 'Clarity in our thinking.', 'Purpose in our work.'],
  closing: ['Clarity. Responsibility. Collaboration.', 'Progress that lasts.'],
  belief: {
    title: 'Make progress on the things that matter.',
    body: 'Our vision is a world of businesses equipped to respond to change with clear direction and the confidence to act. Our mission is to bring business, technology and creative perspectives together to turn complex challenges into practical progress.',
    link: { label: 'See how we work', href: '/our-approach' },
  },
  practice: {
    title: 'Principles made practical.',
    cards: values.map(v => ({ title: v.title, body: v.body, href: '/our-approach', label: 'See it in practice' })),
  },
};

export function PurposePage() {
  return <PageFrame about hero={<ClarityScene content={PURPOSE_CONTENT} label="Our purpose: different perspectives, one connected practice" />} ctaTitle="Let’s put purpose into practice." category="Our purpose" title="Different perspectives. One connected practice." intro="We bring strategy, technology and brand together to help businesses move forward with clarity." art="interlocking-loops">{null}</PageFrame>;
}

export function PurposeBody() {
  return <div className={styles.page}>
    <JumpNav items={[{ id: 'purpose', title: 'Why we exist' }, { id: 'direction', title: 'Vision & mission' }, { id: 'values', title: 'Our values' }]} />
    <section className={styles.section} id="purpose" data-nav-light><Eyebrow>Why we exist</Eyebrow><h2 className={styles.manifesto}>Make progress on the things that matter.<br /><span className={styles.muted}>Leave people equipped to keep going.</span></h2></section>
    <section className={`${styles.section} ${styles.dark}`} id="direction"><div className={styles.split}><div className={styles.imageWrap}><Image className={styles.image} src="/images/about/clarity-lighthouse.webp" alt="A lighthouse marking a clear direction" width={900} height={1100} /></div><div><Eyebrow>A direction to believe in</Eyebrow><h2 style={{ marginTop: 30 }}>Clarity in our thinking.<br />Purpose in our work.</h2><p>Our vision is a world of businesses equipped to respond to change with clear direction and the confidence to act.</p><p>Our mission is to bring business, technology and creative perspectives together to turn complex challenges into practical progress.</p></div></div></section>
    <section className={styles.section} id="values" data-nav-light><SectionHead label="What guides us" title="Principles made practical." description="The way we work matters as much as the work itself." /><div className={styles.values}>{values.map((v, i) => <article className={styles.value} key={v.title}><span className={styles.number}>0{i + 1}</span><h3>{v.title}</h3><p>{v.body}</p></article>)}</div></section>
    <ContactCTA title="Let’s put purpose into practice." /><PageFooter />
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

export function LeadershipPage() {
  return <PageFrame category="Who we are / Leadership" title="The minds behind the work." intro="Connected perspectives make a stronger plan. Our leadership brings business, technology, creative and people thinking into the same conversation." art="wire-figure">
    <section className={styles.section} id="overview" data-nav-light><SectionHead label="Leadership perspectives" title="Expertise with a shared direction." description="Our practice connects these disciplines around the needs of your business." /><span className={styles.sampleLabel}>Sample profile layout · team details to follow</span><div className={styles.cardGrid}>{[{ title: 'Strategy & transformation', art: 'angular-convergence', body: 'Business direction, operating models and a clear path from ambition to execution.' }, { title: 'Technology & intelligence', art: 'wire-figure', body: 'Architecture, digital products and practical decisions about AI and automation.' }, { title: 'Brand & experience', art: 'contour-ribbon', body: 'Positioning, identity and experiences that express what a business stands for.' }].map(p => <article className={styles.profile} key={p.title}><div className={styles.profileArt}><AbstractArtwork name={p.art} /></div><Eyebrow>Practice perspective</Eyebrow><h3>{p.title}</h3><p>{p.body}</p></article>)}</div></section>
    <section className={`${styles.section} ${styles.dark}`}><SectionHead label="How we lead" title="Close to the business. Open to a better answer." description="We believe leadership means creating clarity, listening to different perspectives and staying connected to the people doing the work." /></section>
  </PageFrame>;
}
