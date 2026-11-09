'use client';

import { useState } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { articles, groups } from '@/data/redesign/content';
import styles from './redesign.module.css';

export default function InsightGrid() {
  const [category, setCategory] = useState('All');
  const visible = articles.filter(a => category === 'All' || a.category === category);
  return <><div className={styles.filterBar} role="group" aria-label="Filter insights by topic">{['All', ...groups].map(g => <button type="button" className={`${styles.pill} ${category === g ? styles.activePill : ''}`} aria-pressed={category === g} onClick={() => setCategory(g)} key={g}>{g}</button>)}</div><div className={styles.cardGrid} aria-live="polite">{visible.map(a => <Link className={styles.card} href={`/perspectives/insights/${a.slug}`} key={a.slug}><div className={styles.cardMedia}><Image src={a.image} alt="" width={720} height={560} sizes="(max-width:640px) 90vw, 30vw" /></div><div className={styles.eyebrow}>{a.category} / Perspective</div><div className={styles.cardTitle}><h3>{a.title}</h3><span className={styles.arrow} aria-hidden="true">↗</span></div><p>{a.summary}</p></Link>)}</div></>;
}
