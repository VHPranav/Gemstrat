import type { Metadata } from 'next';
import { notFound } from 'next/navigation';
import { articles } from '@/data/redesign/content';
import { ArticlePage } from '@/components/redesign/EditorialPages';
export const dynamicParams = false;
export function generateStaticParams() { return articles.map(a => ({ slug: a.slug })); }
export async function generateMetadata({ params }: { params: Promise<{ slug: string }> }): Promise<Metadata> {
 const { slug } = await params; const article = articles.find(a => a.slug === slug);
 return { title: `${article?.title ?? 'Insight'} — Gemstrat`, description: article?.summary };
}
export default async function Page({ params }: { params: Promise<{ slug: string }> }) {
 const { slug } = await params; const article = articles.find(a => a.slug === slug); if (!article) notFound();
 return <ArticlePage key={slug} article={article} />;
}
