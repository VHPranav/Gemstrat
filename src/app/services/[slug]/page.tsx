import type { Metadata } from 'next';
import { notFound } from 'next/navigation';
import { services } from '@/data/redesign/content';
import { PageFrame, ServicePage } from '@/components/redesign/PageParts';
import ServiceTemplate, { ServiceHero } from '@/components/redesign/ServiceTemplate';
import { serviceDetails } from '@/components/redesign/serviceDetails';
export const dynamicParams = false;
export function generateStaticParams() { return services.map(s => ({ slug: s.slug })); }
export async function generateMetadata({ params }: { params: Promise<{ slug: string }> }): Promise<Metadata> {
 const { slug } = await params; const service = services.find(s => s.slug === slug);
 return { title: `${service?.title ?? 'Service'} — Gemstrat`, description: service?.intro };
}
export default async function Page({ params }: { params: Promise<{ slug: string }> }) {
 const { slug } = await params; const service = services.find(s => s.slug === slug); if (!service) notFound();
 // Services with their extra content written use the new template; the rest keep the older page for now
 const details = serviceDetails[slug];
 if (details) return <PageFrame key={slug} about hero={<ServiceHero service={service} />} category={service.group} title={service.headline} intro={service.intro} ctaTitle={service.cta}>
  <ServiceTemplate service={service} details={details} />
 </PageFrame>;
 return <ServicePage key={slug} service={service} />;
}
