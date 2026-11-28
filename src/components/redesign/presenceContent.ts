import { regions, services } from '@/data/redesign/content';

// Replace before launch: the office addresses and phone numbers need verification.
const contact = { address: '[Office address to be confirmed]', phone: '[Local phone to be confirmed]', email: 'ask@gemstrat.com' };
// Each office: its city (which sets the clock, the distances and the schema
// address), the region card's "Local focus" line, two "Why Gemstrat" points
// and two FAQs. The slugs stay as they were, since links point at them.
const offices = [
  {
    slug: 'toronto', source: 'canada', city: 'Toronto', country: 'Canada', landmark: 'Maple leaf', image: 'toronto', timezone: 'America/Toronto', lat: 43.65, lon: -79.38, industries: ['Financial services', 'Retail', 'Technology', 'Manufacturing'],
    focus: 'From Toronto, we help Canadian businesses turn enterprise architecture, digital solutions and brand strategy into practical transformation roadmaps.',
    why: ['AI adoption is grounded in the processes that make it pay.', 'Practical roadmaps that turn productivity goals into results.'],
    faqs: [
      { question: 'How can businesses in Canada plan a digital transformation?', answer: 'We start by mapping your enterprise architecture, then help your team prioritize the changes that deliver the most value.' },
      { question: 'Why do AI pilots stall in many Canadian businesses?', answer: 'Results depend on more than the tool. Our AI consulting in Canada aligns processes, data and skills first, so AI improves productivity.' },
    ],
  },
  {
    slug: 'new-york', source: 'united-states', city: 'Chicago', country: 'United States', landmark: 'Statue of Liberty', image: 'new-york', timezone: 'America/Chicago', lat: 41.88, lon: -87.63, industries: ['Financial services', 'Healthcare', 'Retail', 'Technology'],
    focus: 'From Chicago, we partner with US leadership teams on business transformation, AI strategy and digital solutions that scale with confidence.',
    why: ['AI strategy built around measurable return, not experimentation.', 'Business cases your board and CFO can stand behind.'],
    faqs: [
      { question: 'How can teams in the USA assess where to use AI?', answer: 'We identify high-value workflows, set a performance baseline and define a focused AI pilot with human review.' },
      { question: 'How do you make sure AI investments in the USA deliver measurable ROI?', answer: 'Every AI strategy we build for US businesses starts with a business case, a performance baseline and agreed KPIs, so returns show from the first pilot.' },
    ],
  },
  {
    slug: 'nairobi', source: 'africa', city: 'Kampala', country: 'Uganda', landmark: 'Feathered headdress emblem', image: 'nairobi', timezone: 'Africa/Kampala', lat: 0.35, lon: 32.58, industries: ['Financial services', 'Logistics', 'Technology', 'Consumer goods'],
    focus: 'From Kampala, we help businesses across Africa build strong foundations, combining enterprise architecture, digital solutions and brand strategy designed for local markets and future growth.',
    why: ['Mobile-first thinking for markets that lead in digital payments.', 'Architecture ready to scale across borders and regulations.'],
    faqs: [
      { question: 'What digital product support is available for businesses in Africa?', answer: 'We map customer journeys, test service prototypes and plan digital delivery around local user needs and infrastructure.' },
      { question: 'Can Gemstrat help us expand into other African markets?', answer: 'Yes, we design digital solutions and brands for Africa that adapt to each market’s payments, regulations and customers, ready to scale across borders.' },
    ],
  },
  {
    slug: 'dubai', source: 'middle-east', city: 'Dubai', country: 'United Arab Emirates', landmark: 'Arabic calligraphic emblem', image: 'dubai', timezone: 'Asia/Dubai', lat: 25.20, lon: 55.27, industries: ['Hospitality', 'Retail', 'Logistics', 'Financial services'],
    focus: 'From Dubai, we support ambitious businesses across the Middle East with business transformation, 360° branding and leadership development shaped by regional culture and regulation.',
    why: ['Strategy aligned with Vision 2030 and We the UAE 2031.', 'Delivery measured by outcomes, not announcements.'],
    faqs: [
      { question: 'How can businesses in the Middle East improve customer experience during a transformation?', answer: 'We align brand, service design and technology with the operating model needed to deliver them.' },
      { question: 'How do you align business transformation in the Middle East with national vision goals?', answer: 'We map your priorities to national agendas such as Saudi Vision 2030 and We the UAE 2031, then track delivery against measurable milestones.' },
    ],
  },
  {
    slug: 'mumbai', source: 'india', city: 'Bangalore', country: 'India', landmark: 'India Gate', image: 'india', timezone: 'Asia/Kolkata', lat: 12.97, lon: 77.59, industries: ['Manufacturing', 'Financial services', 'Technology', 'Consumer goods'],
    focus: 'From Bangalore, we help Indian businesses scale with business transformation, AI and intelligent automation, and 360° branding, from strategy through to execution.',
    why: ['Growth plans built on India’s digital public infrastructure.', 'Scale-ready systems for Indian businesses going global.'],
    faqs: [
      { question: 'How can businesses in India use automation as they scale?', answer: 'We identify repeatable processes, clarify ownership and set clear KPIs for an automation pilot before scaling it.' },
      { question: 'How can businesses in India use digital public infrastructure to scale?', answer: 'Our business transformation work in India integrates rails such as UPI and Aadhaar-based verification, then automates the processes that slow growth.' },
    ],
  },
];

// Gemstrat's own short headlines per region. The hero shows them whenever
// the live industry feed (/api/news, worker/news.ts) has nothing clean to
// show, or can't be reached (for example on the local dev server).
const perspectives: Record<string, string[]> = {
  'toronto': [
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
    keyServices: services.filter(service => region.services.includes(service.slug)),
    contact,
    perspectives: perspectives[office.slug],
  };
});

export type PresenceOffice = (typeof presence)[number];
