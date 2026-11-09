import serviceData from './services.json';

export const services = serviceData;
export type Service = (typeof services)[number];
export const groups = ['Transform', 'Intelligence', 'Experience', 'People & Growth'];

export const regions = [
  { slug: 'united-states', name: 'United States', city: 'New York', image: '/images/monuments/one-world-trade-center.webp', intro: 'Bring your next business challenge into focus. Connect strategic priorities with the systems, experiences and team capabilities needed to deliver them.', focus: ['Business transformation', 'AI adoption', 'Digital experiences'], services: ['business-transformation', 'ai-strategy', 'digital-solutions'] },
  { slug: 'canada', name: 'Canada', city: 'Toronto', image: '/images/monuments/cn-tower.webp', intro: 'Connect your business direction with practical plans for change. Bring strategic, technical and creative perspectives together around your priorities.', focus: ['Process clarity', 'Digital products', 'Brand consistency'], services: ['enterprise-architecture', 'digital-solutions', 'brand-strategy'] },
  { slug: 'india', name: 'India', city: 'Mumbai', image: '/images/monuments/gateway-of-india.webp', intro: 'Build the foundations for your next phase of growth. Connect business planning, technology, brand and people to move from ambition to execution.', focus: ['Operating processes', 'Useful automation', 'Brand development'], services: ['business-transformation', 'ai-intelligent-automation', '360-branding'] },
  { slug: 'middle-east', name: 'Middle East', city: 'Dubai', image: '/images/monuments/burj-khalifa.webp', intro: 'Bring clear direction to your next phase of change. Connect business priorities with digital experiences, brand development and the people who will deliver them.', focus: ['Transformation planning', 'Customer experience', 'Leadership capability'], services: ['business-transformation', '360-branding', 'leadership-development'] },
  { slug: 'africa', name: 'Africa', city: 'Nairobi', image: '/images/monuments/desert-highway.webp', intro: 'Plan the next step around the realities of your business and market. Connect strategy, technology and brand to define priorities and put them into action.', focus: ['Digital products', 'Process improvement', 'Brand clarity'], services: ['digital-solutions', 'enterprise-architecture', 'brand-strategy'] },
];

export const values = [
  { title: 'Clarity', body: 'Understand the problem before defining the solution. Make choices and their implications easy to see.' },
  { title: 'Responsibility', body: 'Make decisions with care for the people affected by them. Be clear about ownership and follow through.' },
  { title: 'Collaboration', body: 'Build shared understanding with the people doing the work. Different perspectives make a stronger plan.' },
  { title: 'Curiosity', body: 'Test assumptions and remain open to a better answer. Ask useful questions before reaching for familiar solutions.' },
  { title: 'Follow-through', body: 'Connect recommendations to action and learning. Leave teams with useful tools and a clear next step.' },
];

export const process = [
  { title: 'Understand', body: 'Listen to leaders, teams and customers. Understand the challenge, its context and the constraints around it.', detail: 'Shared brief / current-state understanding' },
  { title: 'Define', body: 'Bring evidence and different perspectives together. Explore the options, agree priorities and give the work a direction.', detail: 'Priorities / roadmap / accountable owners' },
  { title: 'Make', body: 'Translate direction into designs, systems or campaigns. Use prototypes and focused pilots to test what matters.', detail: 'Prototypes / delivery plan / focused pilots' },
  { title: 'Move forward', body: 'Implement together, review progress and adapt to what the work reveals. Build the capability to keep going.', detail: 'Implementation / review / knowledge transfer' },
];

export const industries = [
  { slug: 'financial-services', name: 'Financial services & fintech', body: 'Connect product propositions, digital journeys and the operating capabilities behind them.', image: '/images/scaling/glass-facade.webp', services: ['enterprise-architecture', 'digital-solutions'] },
  { slug: 'healthcare', name: 'Healthcare', body: 'Make digital journeys easier to use, improve operational coordination and communicate with clarity.', image: '/images/reviews/what-we-enable.webp', services: ['business-transformation', 'digital-solutions'] },
  { slug: 'consumer-lifestyle', name: 'Consumer & lifestyle', body: 'Align audience understanding, brand positioning and campaign experiences across touchpoints.', image: '/images/about/branding.webp', services: ['brand-strategy', 'advertising-marketing'] },
  { slug: 'manufacturing', name: 'Manufacturing', body: 'See the capabilities, process hand-offs and systems dependencies that shape the next phase of change.', image: '/images/about/scalable-scaffolding.webp', services: ['enterprise-architecture', 'ai-intelligent-automation'] },
  { slug: 'hospitality', name: 'Hospitality', body: 'Connect the promise of a brand with booking, service delivery and the experience of every guest.', image: '/images/monuments/chateau-frontenac.webp', services: ['360-branding', 'digital-solutions'] },
];

export const articles = [
  { slug: 'choosing-your-first-ai-use-case', title: 'Choosing your first AI use case', category: 'Intelligence', image: '/images/about/ai-automation.webp', summary: 'Start with a useful task, a meaningful baseline and a way to evaluate what changes.', sections: [
    { title: 'Begin with the work', body: 'Look for a recurring task that people understand well. Document the inputs, the decisions and the exceptions. A task with a clear owner and an observable result is easier to evaluate than a broad promise to transform an entire function.' },
    { title: 'Check the foundations', body: 'Ask whether the necessary data is available and appropriate to use. Identify the systems involved and where a person needs to review the result. These questions help establish whether a focused pilot is practical.' },
    { title: 'Agree what you will measure', body: 'Record the current completion time, quality or rework before starting. Decide what improvement would justify further investment and which failures would require a different approach.' },
    { title: 'Test before expanding', body: 'For an illustrative pilot, a team might test whether AI can prepare an initial document summary for human review. The pilot should check accuracy and omissions alongside time saved. Expand only when the evidence supports the decision.' },
  ] },
  { slug: 'what-a-capability-map-helps-you-decide', title: 'What a capability map helps you decide', category: 'Transform', image: '/images/about/scalable-scaffolding.webp', summary: 'Connect business priorities with the processes, people and systems needed to deliver them.', sections: [
    { title: 'Name what the business needs to do', body: 'A capability describes something a business needs to be able to do, such as manage orders or support customers. Starting with those needs creates a common reference for leaders and delivery teams.' },
    { title: 'Connect the supporting pieces', body: 'Map the processes, roles, information and applications behind each capability. This reveals dependencies that may be difficult to see when each department plans in isolation.' },
    { title: 'Use the map to choose', body: 'Compare the capabilities needed for your priorities with the current state. Identify where improvement matters most, then discuss the investment, sequencing and ownership needed to make it happen.' },
  ] },
  { slug: 'brand-strategy-in-everyday-delivery', title: 'Taking brand strategy into everyday delivery', category: 'Experience', image: '/images/about/branding.webp', summary: 'How positioning becomes a practical guide for the moments people encounter your business.', sections: [
    { title: 'Turn the position into choices', body: 'A useful brand position helps a team choose what to say, how to behave and which experiences to prioritise. Translate the central idea into a small set of principles that people can apply.' },
    { title: 'Test real touchpoints', body: 'Work with the things teams use each day: a proposal, a product page, an onboarding email or a customer conversation. Check whether the message and experience support the same promise.' },
    { title: 'Make consistency easier', body: 'Give people usable examples, assets and templates. Define who maintains them and create a way for teams to ask questions as the business and its channels evolve.' },
  ] },
  { slug: 'planning-for-adoption-before-launch', title: 'Planning for adoption before launch', category: 'People & Growth', image: '/images/scaling/leadership-window.webp', summary: 'New tools need clear responsibilities, relevant learning and a way for people to give feedback.', sections: [
    { title: 'Understand what changes for people', body: 'Identify the tasks, responsibilities and decisions a new system affects. Talk to the people who will use it about constraints, concerns and what support would help.' },
    { title: 'Build learning around the task', body: 'Give teams opportunities to practise realistic work. Explain where to get help and how exceptions should be handled, rather than relying on a launch announcement alone.' },
    { title: 'Keep listening after launch', body: 'Review actual use, recurring questions and points of friction. Give feedback a clear owner and use it to improve both the tool and the way the organisation supports it.' },
  ] },
];

export const navigation = [
  { title: 'Who we are', links: [{ title: 'Our purpose', href: '/our-purpose' }, { title: 'Our approach', href: '/our-approach' }, { title: 'Leadership', href: '/about/leadership' }] },
  { title: 'What we do', links: services.map(s => ({ title: s.title, href: `/services/${s.slug}` })) },
  { title: 'Global presence', links: regions.map(r => ({ title: r.name, href: `/locations/${r.slug}` })) },
  { title: 'Perspectives', links: [{ title: 'Insights', href: '/perspectives/insights' }, { title: 'Case studies', href: '/perspectives/case-studies' }, { title: 'Industries', href: '/perspectives/industries' }] },
];
