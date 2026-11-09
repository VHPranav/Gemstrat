import Image from 'next/image';
import Link from 'next/link';
import type { ReactNode } from 'react';
import SubPage from '@/components/pages/SubPage';
import AbstractArtwork from '@/components/abstract/AbstractArtwork';
import { navigation, services, type Service } from '@/data/redesign/content';
import styles from './redesign.module.css';

export { styles };

export function Eyebrow({ children }: { children: ReactNode }) { return <div className={styles.eyebrow}>{children}</div>; }
export function Arrow() { return <span className={styles.arrow} aria-hidden="true">↗</span>; }

export function SectionHead({ label, title, description }: { label: string; title: string; description?: string }) {
  return <div className={styles.sectionHead}><Eyebrow>{label}</Eyebrow><div><h2>{title}</h2>{description && <p>{description}</p>}</div></div>;
}

export function PageHero({ category, title, intro, art = 'angular-convergence', image, clean = false }: { clean?: boolean; category: string; title: string; intro: string; art?: string; image?: string }) {
  return <header className={styles.hero}>
    {image && <div className={styles.heroPhoto}><Image src={image} alt="" fill priority sizes="100vw" /></div>}
    <div className={styles.heroCopy}>{!clean && <Eyebrow>{category}</Eyebrow>}<h1>{title}</h1><p>{intro}</p></div>
    {!image && <div className={styles.heroArt} aria-hidden="true"><AbstractArtwork name={art} priority /></div>}
    {!clean && <div className={styles.heroBottom}><span>Independent thinking. Connected expertise.</span><a href="#overview">Explore below ↓</a></div>}
  </header>;
}

export function JumpNav({ items }: { items: { id: string; title: string }[] }) {
  return <nav className={styles.anchorNav} aria-label="On this page" data-nav-light>{items.map(i => <a key={i.id} href={`#${i.id}`}>{i.title}</a>)}</nav>;
}

export function ContactCTA({ title = 'What would you like to move forward?' }: { title?: string }) {
  return <section className={styles.cta} data-nav-light><h2>{title}</h2><div><p>Bring us the challenge. Let’s find a clear direction together.</p><Link className={styles.button} href="/contact">Start a conversation <Arrow /></Link></div></section>;
}

export function PageFooter() {
  return <footer className={styles.footer}>
    <div className={styles.footerTop}><Link className={styles.wordmark} href="/">GEMSTRAT</Link><p>Solving what matters.<br />Building what lasts.<br /><a href="mailto:ask@gemstrat.com">ask@gemstrat.com ↗</a></p></div>
    <div className={styles.footerGrid}>{navigation.map(group => <div key={group.title}><h3>{group.title}</h3><ul className={group.title === 'What we do' ? styles.serviceLinks : undefined}>{group.links.map(link => <li key={link.href}><Link href={link.href}>{link.title}</Link></li>)}</ul></div>)}</div>
    <div className={styles.footerBottom}><span>© {new Date().getFullYear()} Gemstrat</span><div className={styles.footerLegal}><Link href="/privacy-policy">Privacy policy</Link><Link href="/terms-and-conditions">Terms & conditions</Link><Link href="/sitemap">Sitemap</Link><Link href="/contact">Contact</Link></div></div>
  </footer>;
}

export function PageFrame({ title, category, intro, art, image, children, cta = true, about = false, hero, ctaTitle }: { ctaTitle?: string; hero?: ReactNode; about?: boolean; title: string; category: string; intro: string; art?: string; image?: string; children: ReactNode; cta?: boolean }) {
  return <SubPage bare title={[]} intro="" next={{ label: 'Explore', href: '#overview' }} closing={false}><div className={`${styles.page} ${about ? styles.about : ''}`}>{hero ?? <PageHero clean={about} title={title} category={category} intro={intro} art={art} image={image} />}{children}{about ? <div className={styles.endcap}>{cta && <ContactCTA title={ctaTitle} />}<PageFooter /></div> : <>{cta && <ContactCTA />}<PageFooter /></>}</div></SubPage>;
}

export function ServiceCards({ items }: { items: Service[] }) {
  return <div className={styles.cardGrid}>{items.map((s) => <Link className={styles.card} key={s.slug} href={`/services/${s.slug}`}><div className={styles.cardMedia}><Image src={s.image} alt="" width={720} height={560} sizes="(max-width:640px) 90vw, (max-width:950px) 45vw, 30vw" /></div><Eyebrow>{s.group}</Eyebrow><div className={styles.cardTitle}><h3>{s.title}</h3><Arrow /></div><p>{s.headline}</p></Link>)}</div>;
}

export function ServicePage({ service }: { service: Service }) {
  const related = services.filter(s => s.slug !== service.slug && s.group === service.group).slice(0, 3);
  return <PageFrame category={`${service.group} / ${service.title}`} title={service.headline} intro={service.intro} art={service.art}>
    <JumpNav items={[{ id: 'overview', title: 'The opportunity' }, { id: 'capabilities', title: 'How we help' }, { id: 'outputs', title: 'What you take forward' }, { id: 'questions', title: 'Your questions' }]} />
    <section className={styles.section} id="overview" data-nav-light><div className={styles.split}><div><Eyebrow>{service.title}</Eyebrow><h2 style={{ marginTop: 30 }}>A clear starting point.<br /><span className={styles.muted}>A practical way forward.</span></h2><p>{service.intro}</p><Link href="/contact" className={styles.link}>Discuss your priorities <Arrow /></Link></div><div className={styles.imageWrap}><Image className={styles.image} src={service.image} alt="" width={900} height={1100} sizes="(max-width:640px) 90vw, 45vw" /><div className={styles.imageCaption}><span>{service.group}</span><span>Gemstrat / {service.title}</span></div></div></div></section>
    <section className={`${styles.section} ${styles.dark}`} id="capabilities"><SectionHead label="How we help" title="From understanding to action." /><div className={styles.steps}>{service.steps.map((s, i) => <article className={styles.step} key={s.title}><span className={styles.number}>0{i + 1}</span><h3>{s.title}</h3><p>{s.body}</p></article>)}</div></section>
    <section className={styles.output} id="outputs" data-nav-light><Eyebrow>What you take forward</Eyebrow><div><h2>Useful work. Clear next steps.</h2><p>{service.outputs.charAt(0).toUpperCase() + service.outputs.slice(1)}.</p></div></section>
    <section className={styles.section} id="questions" data-nav-light><SectionHead label="A little more clarity" title="Before we begin." /><div className={styles.faq}>{service.faq && <details><summary>{service.faq.question}</summary><p>{service.faq.answer}</p></details>}<details><summary>How do we define the scope?</summary><p>We start with your priorities, the context and the decisions you need to make. Together, we agree the activities, responsibilities and useful outputs for the engagement.</p></details><details><summary>Can this connect with other Gemstrat services?</summary><p>Yes. We can bring relevant strategy, technology, brand and people perspectives into the same plan, with the scope shaped around your challenge.</p></details></div></section>
    {related.length > 0 && <section className={styles.section} data-nav-light><SectionHead label="Connected expertise" title="Explore what comes next." /><ServiceCards items={related} /></section>}
  </PageFrame>;
}
