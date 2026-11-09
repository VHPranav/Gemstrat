import Link from 'next/link';
import { navigation } from '@/data/redesign/content';
import ContactForm from './ContactForm';
import { Arrow, Eyebrow, PageFrame, SectionHead, styles } from './PageParts';

export function ContactPage() {
  return <PageFrame category="Connect with us" title="What would you like to move forward?" intro="Tell us about your business, the challenge you are working on and where you need support." art="contour-ribbon" cta={false}><section className={styles.section} id="overview" data-nav-light><div className={styles.contactGrid}><div><Eyebrow>Every conversation starts somewhere</Eyebrow><h2 className={styles.largeHeading} style={{ marginTop: 30 }}>Let’s begin<br />with your ambition.</h2><a className={styles.link} href="mailto:ask@gemstrat.com">ask@gemstrat.com <Arrow /></a><p className={styles.notice}>Prefer a direct conversation? Email us with your location and a short introduction to your project.</p></div><ContactForm /></div></section></PageFrame>;
}

export function SitemapPage() {
  const extra = [{ title: 'Explore', links: [{ title: 'Home', href: '/' }, { title: 'All capabilities', href: '/focus-areas' }, { title: 'Global presence', href: '/our-global-presence' }, { title: 'Connect with us', href: '/contact' }, { title: 'Privacy policy', href: '/privacy-policy' }, { title: 'Terms & conditions', href: '/terms-and-conditions' }] }];
  return <PageFrame category="Explore Gemstrat" title="Find your way forward." intro="All our pages, in one place. Find the thinking, expertise and perspectives you are looking for." art="angular-convergence"><section className={styles.section} id="overview" data-nav-light><div className={styles.directoryGrid}>{[...navigation, ...extra].map(g => <section key={g.title}><h2>{g.title}</h2>{g.links.map(l => <Link href={l.href} key={l.href}>{l.title}<Arrow /></Link>)}</section>)}</div></section></PageFrame>;
}

export function PolicyPage({ type }: { type: 'privacy' | 'terms' }) {
  const privacy = type === 'privacy';
  const sections = privacy ? [
    { title: 'Contacting Gemstrat', body: 'The sample enquiry form prepares a draft in your email app. It does not submit the form to a website server. You can review the message before sending it to ask@gemstrat.com.' },
    { title: 'Cookie preference', body: 'The website stores your cookie-notice acceptance in your browser using local storage. Clearing your browser storage removes that saved choice.' },
    { title: 'Information practices', body: 'The final policy will describe the actual information collected, its purposes, the service providers involved, retention periods and how to make a privacy request. These details are being prepared for review.' },
    { title: 'Questions', body: 'For a question about information shared with Gemstrat, contact ask@gemstrat.com.' },
  ] : [
    { title: 'About this website', body: 'This website introduces Gemstrat and its proposed service areas. Service scope, responsibilities, deliverables and commercial terms are agreed separately for each engagement.' },
    { title: 'Sample content', body: 'Illustrative scenarios on the case-studies page demonstrate possible approaches and outputs. They are not representations of completed client projects or measured client outcomes. Leadership profile layouts do not identify actual team members.' },
    { title: 'Terms under review', body: 'The final website terms will address the website operator, permitted use, intellectual property, external links, responsibilities and applicable jurisdiction. These provisions require company review before they are finalised.' },
    { title: 'Questions', body: 'For questions about the website or an engagement, contact ask@gemstrat.com.' },
  ];
  return <PageFrame category="Website information" title={privacy ? 'Privacy policy.' : 'Terms & conditions.'} intro="Clear information about this website and how to get in touch." art="interlocking-loops" cta={false}><section className={styles.section} id="overview" data-nav-light><SectionHead label="Draft for review" title={privacy ? 'Your information matters.' : 'A clear basis for using this website.'} description="This sample page is awaiting the company’s final policy and terms. It is not a final legal document." /><article className={styles.article}>{sections.map(s => <section key={s.title}><h2>{s.title}</h2><p>{s.body}</p></section>)}</article></section></PageFrame>;
}
