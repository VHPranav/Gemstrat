import HorizonScene from './HorizonScene';
import RegionIndex from './RegionIndex';
import { PageFrame } from './PageParts';
import { presence } from './presenceContent';

export default function PresencePage() {
  const structuredData = [
    { '@context': 'https://schema.org', '@type': 'Organization', name: 'Gemstrat', location: presence.map(office => ({
      '@type': 'Place', name: office.region, address: { '@type': 'PostalAddress', addressLocality: office.city, addressCountry: office.country },
    })) },
    { '@context': 'https://schema.org', '@type': 'FAQPage', mainEntity: presence.flatMap(office => office.faqs.map(faq => ({
      '@type': 'Question', name: faq.question, acceptedAnswer: { '@type': 'Answer', text: faq.answer },
    }))) },
  ];
  return <PageFrame about hero={<HorizonScene />} category="Our global presence"
    regionLinks={presence.map(office => ({ title: office.region, href: `#${office.slug}` }))}
    title="Five regions. One way of working." intro="Global perspective, local relevance. Core teams across five regions, serving clients worldwide." ctaTitle="Work with a team near you." ctaText="Global reach, local pulse. We’re closer than you think.">
    {structuredData.map(data => <script key={data['@type']} type="application/ld+json"
      dangerouslySetInnerHTML={{ __html: JSON.stringify(data).replaceAll('<', '\\u003c') }} />)}
    <RegionIndex />
  </PageFrame>;
}
