import { services } from '@/data/redesign/content';

export const capabilities = [
  {
    id: 'transform', name: 'Transform', title: 'Give change a clear direction.',
    body: 'Connect business priorities with the processes, systems and responsibilities needed to deliver them.',
    image: '/images/case-studies/logistics.jpg', alt: 'A container ship alongside a working cargo terminal',
    outputs: 'Operating models, capability maps and practical transformation roadmaps.',
  },
  {
    id: 'intelligence', name: 'Intelligence', title: 'Make intelligence useful.',
    body: 'Find where AI and automation can improve the work. Test a focused use case, measure what changes and build from the evidence.',
    image: '/images/case-studies/financial-services.jpg', alt: 'An aisle of modern data centre server racks',
    outputs: 'AI strategies, evaluated pilots and automation workflows.',
  },
  {
    id: 'experience', name: 'Experience', title: 'Connect every customer touchpoint.',
    body: 'Bring positioning, identity, digital products and communication together around the people who use them.',
    image: '/images/case-studies/retail.jpg', alt: 'A carefully considered contemporary retail interior',
    outputs: 'Brand systems, digital experiences, websites and campaigns.',
  },
  {
    id: 'people-growth', name: 'People & Growth', title: 'Equip people for what comes next.',
    body: 'Connect leadership, skills and team structure with your next phase of growth, so people can put the plan into practice.',
    image: '/images/case-studies/healthcare.jpg', alt: 'Healthcare leaders discussing their work together',
    outputs: 'People strategies, leadership programmes and learning built around real work.',
  },
].map(capability => ({
  ...capability,
  services: services.filter(service => service.group === capability.name),
}));

export const challenges = [
  { id: 'scale', question: 'How do we scale?', body: 'Connect your operating model, systems and people plan with the next phase of the business.', services: ['business-transformation', 'enterprise-architecture', 'people-strategy', 'growth-partnership'] },
  { id: 'ai', question: 'Where can AI help?', body: 'Start with a specific task and a measurable pilot, supported by a clear direction for adoption.', services: ['ai-consulting', 'ai-strategy', 'ai-intelligent-automation', 'technical-training'] },
  { id: 'customer', question: 'How do we connect our customer experience?', body: 'Align the promise of your brand with what customers encounter across digital and physical touchpoints.', services: ['brand-strategy', 'brand-identity', 'digital-solutions', 'brand-experience'] },
  { id: 'change', question: 'How do we prepare our people for change?', body: 'Bring business priorities, leadership capability and relevant learning into one delivery plan.', services: ['business-transformation', 'people-strategy', 'leadership-development', 'hr-leadership-training'] },
];
