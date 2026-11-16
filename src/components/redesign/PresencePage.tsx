import HorizonScene from './HorizonScene';
import RegionIndex from './RegionIndex';
import { PageFrame } from './PageParts';
import { presence } from './presenceContent';

export default function PresencePage() {
  const structuredData = [
    { '@context': 'https://schema.org', '@type': 'Organization', name: 'Gemstrat', location: presence.map(office => ({
      '@type': 'Place', name: office.region, address: { '@type': 'PostalAddress', addressLocality: office.city, addressCountry: office.timezone === 'Africa/Nairobi' ? 'Kenya' : office.timezone === 'Asia/Dubai' ? 'United Arab Emirates' : office.source === 'united-states' ? 'United States' : office.region },
    })) },
    { '@context': 'https://schema.org', '@type': 'FAQPage', mainEntity: presence.flatMap(office => office.faqs.map(faq => ({
      '@type': 'Question', name: faq.question, acceptedAnswer: { '@type': 'Answer', text: faq.answer },
    }))) },
  ];
  return <PageFrame about hero={<HorizonScene />} category="Our global presence"
    regionLinks={presence.map(office => ({ title: office.region, href: `#${office.slug}` }))}
    title="Five regions. One way of working." intro="Connected expertise across five regions." ctaTitle="Work with a team near you.">
    {structuredData.map(data => <script key={data['@type']} type="application/ld+json"
      dangerouslySetInnerHTML={{ __html: JSON.stringify(data).replaceAll('<', '\\u003c') }} />)}
    <RegionIndex />
  </PageFrame>;
}
