import Image from 'next/image';
import Link from 'next/link';
import { PageFrame } from './PageParts';
import ExpertiseScene from './ExpertiseScene';
import ExpertiseCapabilities from './ExpertiseCapabilities';
import ExpertiseExplorer from './ExpertiseExplorer';
import { CASES } from './theoryContent';
import css from './expertise.module.css';

export default function WhatWeDoPage() {
  return <PageFrame about theme="dark" category="What we do" title="Different disciplines. One connected practice."
    intro="Business, technology, brand and people, connected around your priorities."
    hero={<ExpertiseScene />} ctaTitle="What would you like to move forward?">
    <ExpertiseCapabilities />
    <ExpertiseExplorer />
    <section className={css.work}>
      <div className={css.workHeading}><h2>See the thinking<br />in practice.</h2>
        <p>Explore our illustrative case studies across business, technology, brand and people.</p></div>
      <div className={css.caseGrid}>{CASES.filter(study => study.featured).slice(0, 3).map(study => <Link
        href={`/theory-by-gemstrat#${study.slug}`} className={css.case} key={study.slug}>
        <div className={css.caseImage}><Image src={study.image} alt="" width={800} height={500} sizes="(max-width: 700px) 88vw, 30vw" /></div>
        <span className={css.caseMeta}>Illustrative case</span>
        <h3>{study.title}<span aria-hidden="true">↗</span></h3>
      </Link>)}</div>
      <Link className={css.textLink} href="/theory-by-gemstrat">Explore Theory by Gemstrat <span aria-hidden="true">↗</span></Link>
    </section>
  </PageFrame>;
}
