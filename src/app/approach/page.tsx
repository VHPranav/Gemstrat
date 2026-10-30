'use client';

import { useEffect } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';

// Client-side redirect also works with the site's static export.
export default function FormerApproachPage() {
  const router = useRouter();
  useEffect(() => { router.replace('/our-purpose'); }, [router]);
  return <main className="min-h-screen bg-[#090909] px-6 pt-32 text-white"><Link href="/our-purpose">Continue to Our Purpose →</Link></main>;
}
