import { regions, services } from '@/data/redesign/content';

// Replace before launch: the office addresses and phone numbers need verification.
const contact = { address: '[Office address to be confirmed]', phone: '[Local phone to be confirmed]', email: 'ask@gemstrat.com' };
const offices = [
  { slug: 'toronto', source: 'canada', city: 'Toronto', landmark: 'CN Tower', image: 'toronto', timezone: 'America/Toronto', lat: 43.65, lon: -79.38, industries: ['Financial services', 'Retail', 'Technology', 'Manufacturing'], question: 'How can businesses in Canada plan a digital transformation?', answer: 'We start with the processes and systems that matter most, then help your team prioritise changes it can deliver.' },
  { slug: 'new-york', source: 'united-states', city: 'New York', landmark: 'Statue of Liberty', image: 'new-york', timezone: 'America/New_York', lat: 40.71, lon: -74.01, industries: ['Financial services', 'Healthcare', 'Retail', 'Technology'], question: 'How can teams in the USA assess where to use AI?', answer: 'We help teams identify a specific workflow, measure the current effort and define a pilot with human review.' },
  { slug: 'nairobi', source: 'africa', city: 'Nairobi', landmark: 'Kenyatta International Convention Centre', image: 'nairobi', timezone: 'Africa/Nairobi', lat: -1.29, lon: 36.82, industries: ['Financial services', 'Logistics', 'Technology', 'Consumer goods'], question: 'What digital product support is available for businesses in Africa?', answer: 'We can help map customer journeys, test a service prototype and plan delivery around local user needs.' },
  { slug: 'dubai', source: 'middle-east', city: 'Dubai', landmark: 'Burj Khalifa', image: 'dubai', timezone: 'Asia/Dubai', lat: 25.20, lon: 55.27, industries: ['Hospitality', 'Retail', 'Logistics', 'Financial services'], question: 'How can businesses in the Middle East improve customer experience during a transformation?', answer: 'We connect brand, service design and technology decisions with the operating changes needed to deliver them.' },
  { slug: 'mumbai', source: 'india', city: 'Mumbai', landmark: 'Taj Mahal', image: 'india', timezone: 'Asia/Kolkata', lat: 19.08, lon: 72.88, industries: ['Manufacturing', 'Financial services', 'Technology', 'Consumer goods'], question: 'How can businesses in India use automation as they scale?', answer: 'We identify repeatable tasks, clarify process ownership and agree how to measure an automation pilot before expanding it.' },
];

// Gemstrat's own short headlines per region. The hero shows them whenever
// the live industry feed (/api/news, worker/news.ts) has nothing clean to
// show, or can't be reached (for example on the local dev server).
const perspectives: Record<string, string[]> = {
  'toronto': [
    'Why Canadian firms are moving from AI pilots to everyday operations.',
    'Connecting brand, data and service as Canada’s mid-market scales.',
    'Workforce planning for a tighter Canadian talent market.',
  ],
  'new-york': [
    'Turning AI ambition into measurable results for US enterprises.',
    'Operating models built for faster decisions in American businesses.',
    'Leadership development for teams leading constant change.',
  ],
  'nairobi': [
    'Digital services shaped around how Kenyan customers really live and pay.',
    'Building the skills Africa’s fast-growing businesses need next.',
    'Practical first steps into automation for growing African firms.',
  ],
  'dubai': [
    'Customer experience as the next advantage for UAE businesses.',
    'From AI strategy to adoption across the Gulf.',
    'Brands built to travel across the Middle East’s many markets.',
  ],
  'mumbai': [
    'Automation that scales with India’s growing businesses.',
    'Connecting technology and people as Indian firms expand abroad.',
    'Brand and digital experience for India’s next wave of customers.',
  ],
};

export const presence = offices.map(office => {
  const region = regions.find(r => r.slug === office.source)!;
  const name = office.source === 'united-states' ? 'USA' : region.name;
  return {
    ...office,
    image: `/images/presence/${office.image}.png`,
    region: name,
    focus: region.intro,
    keyServices: services.filter(service => region.services.includes(service.slug)),
    why: ['A shared plan across business, technology, brand and people.', 'Practical milestones and clear ownership from the start.'],
    contact,
    perspectives: perspectives[office.slug],
    faqs: [
      { question: office.question, answer: office.answer },
      { question: `How does Gemstrat support cross-market projects for its ${name} clients?`, answer: 'Yes. We agree working hours, decision owners and handovers with your team at the start of the engagement.' },
    ],
  };
});

export type PresenceOffice = (typeof presence)[number];
