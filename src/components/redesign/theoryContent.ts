// Theory by Gemstrat: case studies (plain data, so server and client
// components can both import it).
//
// SAMPLE CONTENT: these are illustrative cases written to show the page
// layout. They are not real Gemstrat client projects, and every figure is a
// placeholder. Replace them with approved cases (and approved results)
// before launch.

export type Practice = 'Transform' | 'Intelligence' | 'Experience' | 'People';

export interface CaseFigure { value: number; decimals?: number; prefix?: string; suffix?: string; label: string }

export interface CaseStudy {
  slug: string;
  title: string;
  practice: Practice;
  industry: string;
  location: string;
  image: string;
  /** Shown as a full-screen scroll story (the rest appear in the index only) */
  featured?: boolean;
  challenge: string;
  approach: string;
  tags: string[];
  figures: CaseFigure[];
  result: string;
  /** Detail panel */
  scope: string;
  delivered: string[];
  quote?: { text: string; by: string };
  services: { title: string; href: string }[];
}

export const PRACTICES: Practice[] = ['Transform', 'Intelligence', 'Experience', 'People'];

export const HERO_PROBLEMS = [
  'Fragmented', 'Unclear', 'Disconnected', 'Slow', 'Siloed', 'Stuck',
  'Overcomplicated', 'Inconsistent', 'Uncertain', 'Scattered', 'Manual', 'Misaligned',
  'Reactive', 'Outdated', 'Unfocused', 'Overloaded',
  'Duplicated', 'Unmeasured', 'Delayed', 'Inflexible', 'Opaque', 'Brittle',
  'Overlapping', 'Unprioritized', 'Undocumented', 'Uncoordinated', 'Blocked', 'Drifting',
];

export const CASES: CaseStudy[] = [
  {
    slug: 'connected-operating-model',
    title: 'Rebuilding a fintech for scale',
    practice: 'Transform',
    industry: 'Fintech',
    location: 'India',
    image: '/images/case-studies/logistics.jpg',
    featured: true,
    challenge: 'A fast-growing fintech startup in India was ready to scale. Its leadership wanted to rethink its operating model, systems and brand before the next growth stage.',
    approach: 'We mapped the current-state architecture, simplified complex processes into clear visual structures and sequenced the rebuild into fast, focused sprints.',
    tags: ['Business transformation', 'Enterprise architecture'],
    figures: [
      { value: 1, prefix: 'Day ', label: 'strategic clarity on priorities' },
      { value: 6, prefix: '3–', suffix: ' months', label: 'from current-state map to rebuilt model' },
    ],
    result: 'Clarity from day one, and a business rebuilt to scale.',
    scope: 'Twelve-week engagement across operations, finance and technology.',
    delivered: ['Current-state process and capability map', 'Target operating model and responsibilities', 'Sequenced transformation roadmap', 'Governance and checkpoint plan'],
    quote: { text: 'For the first time, every team could see how their work connected to the rest of the business.', by: 'Chief Operating Officer (sample)' },
    services: [{ title: 'Business Transformation', href: '/services/business-transformation' }, { title: 'Enterprise Architecture', href: '/services/enterprise-architecture' }],
  },
  {
    slug: 'first-step-into-ai',
    title: 'A responsible first step into AI',
    practice: 'Intelligence',
    industry: 'Financial services',
    location: 'Canada',
    image: '/images/case-studies/financial-services.jpg',
    featured: true,
    challenge: 'A financial services team wanted to use AI to reduce manual document work, with a safe starting point and clear quality standards.',
    approach: 'We identified the highest-value use case, set a performance baseline and ran a focused pilot with human review and agreed evaluation criteria.',
    tags: ['AI consulting', 'Intelligent automation'],
    figures: [
      { value: 60, suffix: '%', label: 'less time on document review' },
      { value: 6, suffix: ' weeks', label: 'from first idea to a working pilot' },
    ],
    result: 'A proven AI use case, and a clear decision on what to scale next.',
    scope: 'Discovery, pilot design and an eight-week supervised pilot.',
    delivered: ['AI opportunity assessment', 'Prioritised use case and pilot brief', 'Evaluation criteria and review workflow', 'Scale-up recommendation'],
    services: [{ title: 'AI Consulting', href: '/services/ai-consulting' }, { title: 'AI & Intelligent Automation', href: '/services/ai-intelligent-automation' }],
  },
  {
    slug: 'one-brand-every-touchpoint',
    title: 'A sharper brand, inside and out',
    practice: 'Experience',
    industry: 'D2C lifestyle',
    location: 'Dubai',
    image: '/images/case-studies/retail.jpg',
    featured: true,
    challenge: 'A growing D2C lifestyle brand in Dubai wanted one clear voice across its products, channels and internal teams.',
    approach: 'We ran a brand audit, defined positioning and tone of voice, built a visual identity system and aligned internal operations around the brand.',
    tags: ['Brand strategy', 'Brand identity', '360° branding'],
    figures: [
      { value: 2.4, decimals: 1, suffix: '×', label: 'campaign engagement' },
      { value: 120, suffix: '+', label: 'touchpoints aligned to one brand' },
    ],
    result: 'From brand voice to internal operations, everything is sharper and aligned.',
    scope: 'Positioning, identity and a phased rollout across channels.',
    delivered: ['Brand positioning and messaging framework', 'Identity system and guidelines', 'Rollout templates for stores, web and campaigns'],
    quote: { text: 'Our teams finally have one story to tell, and the tools to tell it well.', by: 'Marketing Director (sample)' },
    services: [{ title: 'Brand Strategy', href: '/services/brand-strategy' }, { title: 'Brand Identity', href: '/services/brand-identity' }, { title: '360° Branding', href: '/services/360-branding' }],
  },
  {
    slug: 'leaders-ready-for-whats-next',
    title: 'Leaders ready for what comes next',
    practice: 'People',
    industry: 'Healthcare',
    location: 'United States',
    image: '/images/case-studies/healthcare.jpg',
    featured: true,
    challenge: 'A healthcare provider was preparing to transform how its services ran, and wanted its managers ready to lead teams through the change.',
    approach: 'We designed a leadership development program around real decisions, combining coaching, peer groups and practical tools.',
    tags: ['Leadership development', 'People strategy'],
    figures: [
      { value: 85, suffix: '%', label: 'of managers completed the program' },
      { value: 18, prefix: '+', suffix: ' pts', label: 'team engagement score' },
    ],
    result: 'Managers equipped to lead the change, not just announce it.',
    scope: 'Six-month program for 140 managers in three cohorts.',
    delivered: ['Leadership capability framework', 'Program design and facilitation', 'Coaching and peer-learning groups', 'Progress measures'],
    services: [{ title: 'Leadership Development', href: '/services/leadership-development' }, { title: 'People Strategy', href: '/services/people-strategy' }],
  },
  {
    slug: 'digital-customer-journey',
    title: 'Rebuilding the digital customer journey',
    practice: 'Experience',
    industry: 'Hospitality',
    location: 'Middle East',
    image: '/images/case-studies/hospitality.jpg',
    challenge: 'Guests had to use three separate systems to book, check in and request services, and many gave up part way through.',
    approach: 'We mapped the end-to-end journey, designed one connected digital experience and delivered it in phases alongside the in-house team.',
    tags: ['Digital solutions'],
    figures: [{ value: 41, suffix: '%', label: 'more bookings completed online' }],
    result: 'One journey from booking to check-out.',
    scope: 'Journey design, product build and phased launch.',
    delivered: ['Customer journey map', 'Digital product design', 'Phased build and launch support'],
    services: [{ title: 'Digital Solutions', href: '/services/digital-solutions' }],
  },
  {
    slug: 'workforce-plan-for-growth',
    title: 'A workforce plan built for growth',
    practice: 'People',
    industry: 'Technology',
    location: 'India',
    image: '/images/case-studies/workforce.jpg',
    challenge: 'A fast-growing technology business was hiring quickly, but roles, skills and structure were not keeping up with its plans.',
    approach: 'We linked the business plan to the skills it needs, redesigned the structure and built a three-year workforce plan.',
    tags: ['People strategy'],
    figures: [{ value: 3, suffix: '-year', label: 'workforce plan linked to the business plan' }],
    result: 'Hiring that follows the strategy, not the other way round.',
    scope: 'Organisation design and workforce planning over ten weeks.',
    delivered: ['Skills and capability assessment', 'Organisation design', 'Three-year workforce plan'],
    services: [{ title: 'People Strategy', href: '/services/people-strategy' }],
  },
];

export const formatFigure = (f: CaseFigure, t = 1) =>
  `${f.prefix ?? ''}${(f.value * t).toFixed(f.decimals ?? 0)}${f.suffix ?? ''}`;
