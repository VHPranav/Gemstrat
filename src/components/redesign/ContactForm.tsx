'use client';

import { useState } from 'react';
import type { FormEvent } from 'react';
import { groups, regions } from '@/data/redesign/content';
import styles from './redesign.module.css';

export default function ContactForm() {
  const [prepared, setPrepared] = useState(false);
  const [emailLink, setEmailLink] = useState('');
  function submit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    const values = new FormData(event.currentTarget);
    const body = `Name: ${values.get('name')}\nEmail: ${values.get('email')}\nCompany: ${values.get('company') || 'Not specified'}\nRegion: ${values.get('region')}\nArea of interest: ${values.get('interest')}\n\n${values.get('message')}`;
    setEmailLink(`mailto:ask@gemstrat.com?subject=${encodeURIComponent(`Project enquiry: ${values.get('interest')}`)}&body=${encodeURIComponent(body)}`);
    setPrepared(true);
  }
  return <form className={styles.form} onSubmit={submit} onChange={() => setPrepared(false)}>
    <label className={styles.field}>Your name *<input required name="name" autoComplete="name" maxLength={100} /></label>
    <label className={styles.field}>Work email *<input required name="email" type="email" autoComplete="email" maxLength={200} /></label>
    <label className={styles.field}>Company<input name="company" autoComplete="organization" maxLength={200} /></label>
    <label className={styles.field}>Location<select name="region" defaultValue="Not specified"><option>Not specified</option>{regions.map(r => <option key={r.slug}>{r.name}</option>)}<option>Other</option></select></label>
    <label className={`${styles.field} ${styles.full}`}>Area of interest<select name="interest"><option>Let’s explore it together</option>{groups.map(g => <option key={g}>{g}</option>)}</select></label>
    <label className={`${styles.field} ${styles.full}`}>What would you like to move forward? *<textarea required name="message" maxLength={4000} placeholder="Your challenge, priorities and what you have in mind…" /></label>
    <p className={`${styles.formNote} ${styles.full}`}>Prepare your enquiry, then open it in your email app to review and send to ask@gemstrat.com. This form does not send or save your details on a server.</p>
    <div className={styles.full}><button className={styles.button} type="submit">Prepare enquiry <span aria-hidden="true">↗</span></button></div>
    {prepared && <div className={`${styles.full} ${styles.formNote}`} role="status"><p>Your email draft is ready. Nothing has been sent.</p><a className={styles.link} href={emailLink}>Open email draft ↗</a></div>}
  </form>;
}
