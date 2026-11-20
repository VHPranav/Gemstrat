import type { Metadata } from 'next';
import { notFound } from 'next/navigation';
import { regions } from '@/data/redesign/content';
import LocationPage from '@/components/redesign/LocationPage';
export const dynamicParams = false;
export function generateStaticParams() { return regions.map(r => ({ slug: r.slug })); }
export async function generateMetadata({ params }: { params: Promise<{ slug: string }> }): Promise<Metadata> {
 const { slug } = await params; const region = regions.find(r => r.slug === slug);
 return { title: `${region?.name ?? 'Global Presence'} — Gemstrat`, description: region?.intro };
}
export default async function Page({ params }: { params: Promise<{ slug: string }> }) {
 const { slug } = await params; const region = regions.find(r => r.slug === slug); if (!region) notFound();
 return <LocationPage key={slug} region={region} />;
}
