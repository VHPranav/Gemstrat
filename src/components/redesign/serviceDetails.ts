// Extra content for the service page template (ServiceTemplate.tsx).
// The basics (title, headline, intro, steps, image…) live in
// src/data/redesign/services.json; this adds what the template needs on
// top. Every service has an entry, so every service page uses the template.
// The new copy (areas, deliverables, most FAQs, specialist steps) is written
// for client review before launch.

export interface ServiceDetails {
  /** What we cover: the areas of work, each with one line */
  covers: { title: string; body: string }[];
  /** What you get: each deliverable and what it contains */
  deliverables: { title: string; body: string }[];
  /** A Theory by Gemstrat case to show as the result (its slug) */
  caseSlug?: string;
  faqs: { question: string; answer: string }[];
  /** One related service from another practice, to show the connection */
  connected?: string;
  /** How we work: one key word per step (in order), zoomed through on scroll */
  stepWords?: string[];
  /** Replaces the steps in services.json (used where those are placeholders) */
  steps?: { title: string; body: string }[];
}

export const serviceDetails: Record<string, ServiceDetails> = {
  'business-transformation': {
    covers: [
      { title: 'Transformation strategy', body: 'Agree where the business needs to go, why it matters now and what success looks like.' },
      { title: 'Operating model transformation', body: 'Redesign how the organisation is structured, governed and run to deliver its strategy.' },
      { title: 'Process transformation', body: 'Map how work really flows, remove friction and redesign the processes that matter most.' },
      { title: 'Digital transformation', body: 'Connect digital channels, products and data with the way the business operates.' },
      { title: 'Technology transformation', body: 'Align systems and platforms with business priorities, and plan the changes in a practical order.' },
      { title: 'Organisational change', body: 'Prepare people, roles and responsibilities for new ways of working.' },
      { title: 'Transformation roadmap', body: 'Sequence initiatives with owners, milestones and measures, so change can be delivered and tracked.' },
      { title: 'Implementation support', body: 'Stay alongside your teams as plans become work, adjusting to what delivery reveals.' },
      { title: 'Performance improvement', body: 'Set baselines, track the measures that matter and keep improving after launch.' },
    ],
    deliverables: [
      { title: 'Current-state assessment', body: 'How the business works today: processes, capabilities, systems and pain points, in one shared picture.' },
      { title: 'Future operating model', body: 'How the business will be organised, governed and run, with clear responsibilities.' },
      { title: 'Prioritised initiatives', body: 'The changes that matter most, ranked by value, effort and dependency.' },
      { title: 'Transformation roadmap', body: 'A sequenced plan with owners, milestones and checkpoints.' },
      { title: 'Measurement plan', body: 'Baselines, targets and the measures that show whether the change is working.' },
    ],
    caseSlug: 'connected-operating-model',
    faqs: [
      { question: 'Where should transformation begin?', answer: 'Start with the business problem, its baseline and the decisions that need to change. A clear starting point makes every later choice easier to make and to explain.' },
      { question: 'How long does a business transformation take?', answer: 'Defining the direction and roadmap usually takes eight to twelve weeks. Delivery then runs in phases, so the business sees progress early rather than waiting for one large launch.' },
      { question: 'Do we need to change everything at once?', answer: 'No. We help you choose the few changes that matter most, sequence them sensibly and build from the results.' },
      { question: 'How do you involve our teams?', answer: 'Through workshops, interviews and shared working sessions with the people who do the work. Plans built with teams are easier to deliver and more likely to last.' },
      { question: 'How will we know the transformation is working?', answer: 'We agree a baseline and a small set of measures at the start, then review them at each checkpoint, adjusting the plan where the evidence suggests.' },
    ],
    connected: 'people-strategy',
    stepWords: ['Direction', 'Design', 'Delivery'],
  },

  // ---------- Transform ----------
  'enterprise-architecture': {
    covers: [
      { title: 'Enterprise architecture assessment', body: 'Review how well today’s architecture supports the business, and where it holds it back.' },
      { title: 'Business architecture', body: 'Describe what the business does, how it creates value and how it is organised to deliver.' },
      { title: 'Technology architecture', body: 'Understand the platforms, infrastructure and integrations the business depends on.' },
      { title: 'Application and systems landscape', body: 'See every application, what it supports and where systems overlap or leave gaps.' },
      { title: 'Business capability mapping', body: 'Name what the business needs to be able to do, and how well it does each today.' },
      { title: 'Process mapping', body: 'Follow critical workflows end to end, including the hand-offs between teams and systems.' },
      { title: 'Technology–business alignment', body: 'Connect technology decisions to the priorities and capabilities they are meant to serve.' },
      { title: 'Current-state assessment', body: 'One shared, evidence-based picture of how things work now.' },
      { title: 'Future-state architecture', body: 'A practical target that supports the strategy, with the principles that guide it.' },
      { title: 'Architecture roadmap', body: 'The changes in a sensible order, by value, feasibility and dependency.' },
    ],
    deliverables: [
      { title: 'Capability map', body: 'What the business needs to do, rated by importance and current strength.' },
      { title: 'Process maps', body: 'Critical workflows end to end, with hand-offs and pain points marked.' },
      { title: 'Application landscape', body: 'Every system, what it supports and where it overlaps.' },
      { title: 'Current and future-state views', body: 'Where the architecture is today, and where it needs to be.' },
      { title: 'Architecture principles', body: 'The agreed rules that guide technology investment decisions.' },
      { title: 'Transition roadmap', body: 'The sequence of changes from today to the target state.' },
    ],
    caseSlug: 'connected-operating-model',
    faqs: [
      { question: 'How is this different from an IT review?', answer: 'An IT review looks at technology on its own. Enterprise architecture connects technology decisions to business capabilities, processes and operating needs, so investment follows business priorities.' },
      { question: 'Do we need detailed documentation already?', answer: 'No. We build the picture with your teams through workshops, interviews and the systems information you already have.' },
      { question: 'How long does an architecture engagement take?', answer: 'A current-state view and target architecture typically take eight to twelve weeks, depending on the size of the business and the number of systems involved.' },
      { question: 'Will the roadmap tell us which systems to buy?', answer: 'It sets out the capabilities and requirements each change must meet. Product selection can follow as a separate, better-informed decision.' },
      { question: 'How do we keep the architecture up to date?', answer: 'We agree simple ownership and review points, so the maps are maintained as part of planning rather than as a one-off exercise.' },
    ],
    connected: 'ai-strategy',
    stepWords: ['Landscape', 'Target', 'Roadmap'],
  },

  // ---------- Intelligence ----------
  'ai-consulting': {
    covers: [
      { title: 'AI opportunity assessment', body: 'Review tasks and decisions with the people doing them to find where AI could genuinely help.' },
      { title: 'AI use-case identification', body: 'Turn opportunities into specific, testable use cases with clear owners.' },
      { title: 'AI readiness', body: 'Check the data, systems, skills and safeguards each use case depends on.' },
      { title: 'AI adoption', body: 'Plan how people will use the solution day to day, and what changes for them.' },
      { title: 'AI implementation advisory', body: 'Guide pilots and rollouts so they are scoped, evaluated and integrated properly.' },
      { title: 'Business applications of AI', body: 'Apply AI to real work: documents, service, analysis, planning and operations.' },
    ],
    deliverables: [
      { title: 'Opportunity assessment', body: 'Where AI could help, rated by value, feasibility and risk.' },
      { title: 'Use-case shortlist', body: 'The few use cases worth taking forward, each with an owner.' },
      { title: 'Readiness review', body: 'Data, systems, skills and safeguards: what is in place and what is missing.' },
      { title: 'Pilot recommendation', body: 'A focused pilot with a baseline, evaluation criteria and human review.' },
    ],
    caseSlug: 'first-step-into-ai',
    faqs: [
      { question: 'Do we need to choose a model first?', answer: 'No. Begin with the task and how you will judge the result. The choice of tool or model follows from those needs.' },
      { question: 'What if our data is not ready?', answer: 'The readiness review shows exactly what is missing. Many useful first steps need less data than expected, and some data work can run alongside a pilot.' },
      { question: 'How do we judge whether a pilot worked?', answer: 'We agree a baseline and evaluation criteria before the pilot starts, covering quality and errors as well as time saved.' },
      { question: 'Will AI replace people in our teams?', answer: 'The focus is on making work better. We design where people review, decide and handle exceptions, and plan how roles change.' },
      { question: 'How quickly can we start?', answer: 'An opportunity assessment typically takes four to six weeks, and a focused pilot can follow straight after.' },
    ],
    connected: 'people-strategy',
    stepWords: ['Opportunity', 'Test', 'Adoption'],
  },
  'ai-strategy': {
    covers: [
      { title: 'AI roadmap', body: 'Sequence pilots, integration work and skills development into a practical plan.' },
      { title: 'Generative AI strategy', body: 'Decide where generative AI fits the business, and where it does not.' },
      { title: 'AI adoption strategy', body: 'Plan how teams will take up AI, with the support and change they need.' },
      { title: 'AI governance', body: 'Set ownership, review criteria and safeguards for how AI is used.' },
      { title: 'AI operating model', body: 'Define who builds, runs and oversees AI across the organisation.' },
      { title: 'AI transformation planning', body: 'Connect AI to the wider changes in processes, systems and roles.' },
    ],
    deliverables: [
      { title: 'AI ambition', body: 'What AI should achieve for the business, in plain terms.' },
      { title: 'Prioritised portfolio', body: 'The opportunities to pursue, ranked by value and readiness.' },
      { title: 'Adoption roadmap', body: 'Pilots, integration and skills work, sequenced with owners.' },
      { title: 'Proposed governance', body: 'Ownership, review criteria, oversight and escalation routes.' },
      { title: 'Capability plan', body: 'The skills and roles needed to deliver and sustain the strategy.' },
    ],
    caseSlug: 'first-step-into-ai',
    faqs: [
      { question: 'What makes an AI roadmap usable?', answer: 'Clear dependencies, accountable owners, review points and agreed measures, so teams can plan delivery from it.' },
      { question: 'We already run AI experiments. Do we still need a strategy?', answer: 'A strategy gives those experiments a common direction, shared safeguards and a way to decide which to scale.' },
      { question: 'How do you approach AI governance?', answer: 'Proportionately. We match oversight to the consequences of each use, rather than slowing every idea down with the same process.' },
      { question: 'How often should the strategy be revisited?', answer: 'We build in review points, typically every six to twelve months, as the technology and your results evolve.' },
      { question: 'Who should be involved?', answer: 'Business leaders, technology, data, risk and the teams whose work will change. Strategy works best when it is shaped together.' },
    ],
    connected: 'leadership-development',
    stepWords: ['Focus', 'Decisions', 'Roadmap'],
  },
  'ai-intelligent-automation': {
    covers: [
      { title: 'Intelligent automation', body: 'Combine rules, AI and people so routine work runs reliably.' },
      { title: 'Workflow automation', body: 'Automate the repeatable steps of a process, end to end.' },
      { title: 'AI-powered processes', body: 'Use AI where judgement, language or documents are involved.' },
      { title: 'Process optimisation', body: 'Simplify the process first, so automation does not lock in waste.' },
      { title: 'Generative AI applications', body: 'Draft, summarise and classify content inside real workflows, with review.' },
      { title: 'Automation strategy', body: 'Decide which processes to automate first, and how to scale what works.' },
    ],
    deliverables: [
      { title: 'Workflow assessment', body: 'Inputs, hand-offs, decisions and exceptions, documented.' },
      { title: 'Automation design', body: 'Where rules, AI and people each do the work, and how they connect.' },
      { title: 'Pilot scope', body: 'A focused first workflow with a baseline to measure against.' },
      { title: 'Operating procedures', body: 'Approvals, exception handling and monitoring for live use.' },
      { title: 'Evaluation plan', body: 'Completion time, error rates, rework and adoption, tracked.' },
    ],
    caseSlug: 'first-step-into-ai',
    faqs: [
      { question: 'Can every step be automated?', answer: 'No. It depends on the data, the consequences of mistakes and the need for judgement. We design human review where it matters.' },
      { question: 'Rules-based automation or AI?', answer: 'Use rules where the logic is clear and stable, and AI where the work involves language, documents or variation. Most workflows combine both.' },
      { question: 'What does a good first process look like?', answer: 'Frequent, well understood, with a clear owner and a result you can measure. That makes the pilot easier to judge.' },
      { question: 'How do you handle errors and exceptions?', answer: 'They are designed in from the start: what triggers a review, who handles it and how failures are monitored.' },
      { question: 'Will you build it or advise?', answer: 'Either. We can design the automation for your team to build, or design and deliver it with you.' },
    ],
    connected: 'people-strategy',
    stepWords: ['Workflow', 'Design', 'Pilot'],
  },

  // ---------- Experience ----------
  'digital-solutions': {
    covers: [
      { title: 'Digital platforms', body: 'Plan and build platforms that support customers, partners or teams at scale.' },
      { title: 'Web solutions', body: 'Websites that inform, persuade and convert, built to be maintained.' },
      { title: 'App solutions', body: 'Applications shaped around the tasks people need to complete.' },
      { title: 'Digital products', body: 'Define, design and launch products that solve a real problem.' },
      { title: 'Technology solutions', body: 'Choose and connect the right technology for the job, not the trendiest.' },
      { title: 'Digital experience', body: 'Make every digital touchpoint clear, accessible and consistent.' },
    ],
    deliverables: [
      { title: 'Discovery brief', body: 'Users, tasks, business priorities and success criteria.' },
      { title: 'Product requirements', body: 'What the product must do, prioritised for the first release.' },
      { title: 'UX/UI designs', body: 'Journeys, prototypes and interface designs, tested with users.' },
      { title: 'Implementation scope', body: 'The technical approach, integrations and delivery plan.' },
      { title: 'Launch plan', body: 'Testing, handover and how the product will improve after launch.' },
    ],
    caseSlug: 'digital-customer-journey',
    faqs: [
      { question: 'Website or application?', answer: 'A website mainly communicates and supports enquiries. An application also needs workflows, data and permissions so people can complete tasks.' },
      { question: 'Do you build, or only design?', answer: 'Both. We can take a product from discovery through design and build, or work alongside your own development team.' },
      { question: 'How do you keep projects on budget?', answer: 'By agreeing requirements and success criteria before the build, and prioritising a focused first release over a long feature list.' },
      { question: 'Is accessibility included?', answer: 'Yes. Accessibility, performance and maintainability are part of the design and build, not extras at the end.' },
      { question: 'What happens after launch?', answer: 'We plan the handover and the first improvements together. Ongoing support can be agreed separately.' },
    ],
    connected: 'ai-intelligent-automation',
    stepWords: ['Discover', 'Build', 'Launch'],
  },
  'brand-strategy': {
    covers: [
      { title: 'Brand positioning', body: 'Define the distinct place the brand should hold in people’s minds.' },
      { title: 'Brand purpose', body: 'Articulate why the business exists beyond what it sells.' },
      { title: 'Brand architecture', body: 'Organise brands, sub-brands and offerings so they work together.' },
      { title: 'Market positioning', body: 'Understand the market and where the brand can win within it.' },
      { title: 'Brand strategy', body: 'Bring audience, proposition and narrative into one clear direction.' },
      { title: 'Competitive differentiation', body: 'Find what genuinely sets the business apart, and prove it.' },
    ],
    deliverables: [
      { title: 'Audience insights', body: 'Who the brand serves, what they need and how they decide.' },
      { title: 'Positioning', body: 'The brand’s distinct place in the market, in one clear statement.' },
      { title: 'Value proposition', body: 'Why people should choose this business over the alternatives.' },
      { title: 'Brand architecture', body: 'How brands and offerings relate, where several need to work together.' },
      { title: 'Messaging framework', body: 'The core narrative and priority messages for each audience.' },
    ],
    caseSlug: 'one-brand-every-touchpoint',
    faqs: [
      { question: 'Is a rebrand always necessary?', answer: 'No. First we establish the gap. Often the answer is clearer positioning or more consistent delivery rather than a new look.' },
      { question: 'How is brand strategy different from marketing?', answer: 'Brand strategy decides what the business stands for and why people should choose it. Marketing then communicates that to drive action.' },
      { question: 'Who should be involved?', answer: 'Leadership, plus the teams closest to customers. Customer and market research grounds the decisions in evidence.' },
      { question: 'How long does it take?', answer: 'Typically six to ten weeks, from research through to a positioning and messaging framework your teams can use.' },
      { question: 'What happens after the strategy?', answer: 'It guides identity, campaigns and customer experience. We can help with each of those, or brief your existing partners.' },
    ],
    connected: 'business-transformation',
    stepWords: ['Market', 'Position', 'Usable'],
  },
  'brand-identity': {
    covers: [
      { title: 'Visual identity', body: 'The look of the brand: logo, colour, type, imagery and layout.' },
      { title: 'Logo and identity systems', body: 'A logo designed as part of a flexible system, not on its own.' },
      { title: 'Brand guidelines', body: 'Clear rules and examples so anyone can use the identity well.' },
      { title: 'Visual language', body: 'The patterns, graphics and imagery style that make the brand recognisable.' },
      { title: 'Brand assets', body: 'Ready-to-use files and templates for everyday work.' },
      { title: 'Identity development', body: 'Evolve an existing identity or create a new one from the strategy.' },
    ],
    deliverables: [
      { title: 'Identity system', body: 'Logo, typography, colour, imagery and layout working together.' },
      { title: 'Asset library', body: 'Logos, graphics and files in every format teams need.' },
      { title: 'Usage guidelines', body: 'How to apply the identity, with examples of what to do and avoid.' },
      { title: 'Rollout templates', body: 'Presentations, documents, social and signage, ready to use.' },
    ],
    caseSlug: 'one-brand-every-touchpoint',
    faqs: [
      { question: 'Is identity just a logo?', answer: 'No. The identity is the whole system of visual and verbal choices that make the brand recognisable across touchpoints.' },
      { question: 'Do we need a brand strategy first?', answer: 'It helps. An identity expresses a strategy, so if the positioning is unclear we start there.' },
      { question: 'Can you evolve our current identity?', answer: 'Yes. Often the best answer keeps what people already recognise and fixes what is not working.' },
      { question: 'How do you test the identity?', answer: 'On real applications, such as the website, documents, signage and social, before it is finalised.' },
      { question: 'Will our team be able to use it?', answer: 'That is the aim. Guidelines, templates and assets are designed so teams can apply the identity without specialist help.' },
    ],
    connected: 'digital-solutions',
    stepWords: ['System', 'Apply', 'Rollout'],
  },
  '360-branding': {
    covers: [
      { title: 'Integrated brand development', body: 'Develop strategy, identity and communication as one connected piece of work.' },
      { title: 'Brand campaigns', body: 'Launch and campaign ideas that express the brand clearly.' },
      { title: 'Customer touchpoints', body: 'Map and improve the moments where customers meet the brand.' },
      { title: 'Digital and offline brand presence', body: 'Keep the brand consistent across web, social, print and physical spaces.' },
      { title: 'Campaign communication', body: 'Plan messages and materials across channels, in the right order.' },
      { title: 'Brand experience', body: 'Make sure what people experience matches what the brand promises.' },
    ],
    deliverables: [
      { title: 'Integrated brand plan', body: 'Strategy, identity and communication, connected in one plan.' },
      { title: 'Priority touchpoint map', body: 'The moments that matter most, and the gaps to close.' },
      { title: 'Campaign direction', body: 'The creative idea and how it runs across channels.' },
      { title: 'Rollout toolkit', body: 'Templates, assets and guidance so teams stay consistent.' },
    ],
    caseSlug: 'one-brand-every-touchpoint',
    faqs: [
      { question: 'How does this differ from brand identity?', answer: 'Identity defines how the brand looks and sounds. 360° branding connects that expression to strategy, campaigns and the customer experience.' },
      { question: 'Do we need to change everything at once?', answer: 'No. We prioritise the touchpoints that matter most to customers and roll out in phases.' },
      { question: 'Can you work with our existing agencies?', answer: 'Yes. We can lead the brand direction and brief other partners so everyone works from the same plan.' },
      { question: 'How do we keep the brand consistent as we grow?', answer: 'With practical tools, clear ownership and simple review points, so consistency does not depend on one person.' },
      { question: 'Which touchpoints do you cover?', answer: 'Digital, print, physical spaces, campaigns and the service people receive. We focus on the ones customers notice most.' },
    ],
    connected: 'people-strategy',
    stepWords: ['Foundations', 'Experience', 'Activate'],
  },
  'advertising-marketing': {
    covers: [
      { title: 'Advertising', body: 'Campaign ideas and creative that earn attention and drive action.' },
      { title: 'Marketing strategy', body: 'Connect audience, offer and channel to a clear business objective.' },
      { title: 'Digital marketing', body: 'Search, social, email and content, planned to work together.' },
      { title: 'Performance marketing', body: 'Paid activity measured against enquiries, sales and return.' },
      { title: 'Campaign strategy', body: 'Decide the role, timing and shape of each campaign.' },
      { title: 'Paid media', body: 'Plan and buy media across the channels your audience uses.' },
      { title: 'Audience targeting', body: 'Reach the right people with the right message at the right moment.' },
    ],
    deliverables: [
      { title: 'Campaign brief', body: 'Audience, offer, desired action and how success will be measured.' },
      { title: 'Channel plan', body: 'The mix of paid, owned and offline channels, with budgets.' },
      { title: 'Creative assets', body: 'Campaign creative adapted for each agreed channel.' },
      { title: 'Measurement plan', body: 'What will be tracked, how, and what good looks like.' },
      { title: 'Optimisation recommendations', body: 'What the results say, and what to change next.' },
    ],
    caseSlug: 'one-brand-every-touchpoint',
    faqs: [
      { question: 'Which channel should we start with?', answer: 'It depends on where your audience is, your objective, your budget and how well you can measure the response.' },
      { question: 'How do you measure success?', answer: 'Against business outcomes such as qualified enquiries, conversion quality and revenue, alongside channel metrics.' },
      { question: 'Do you need a large budget?', answer: 'No. We size the plan to the budget and focus spend where it is most likely to work, then scale what performs.' },
      { question: 'Do you produce the creative?', answer: 'Yes, within the agreed scope, from campaign idea to assets adapted for each channel.' },
      { question: 'How often do you report?', answer: 'We agree a reporting rhythm at the start, typically weekly during a campaign with a fuller review at the end.' },
    ],
    connected: 'ai-intelligent-automation',
    stepWords: ['Direction', 'Creative', 'Learn'],
  },

  // ---------- People & Growth ----------
  'people-strategy': {
    covers: [
      { title: 'People strategy', body: 'Connect the business plan to the people, skills and culture it depends on.' },
      { title: 'Workforce planning', body: 'Forecast the roles and skills the business will need, and when.' },
      { title: 'Organisation design', body: 'Shape structures, roles and responsibilities around how work flows.' },
      { title: 'Employee development', body: 'Grow the capabilities the strategy needs from within.' },
      { title: 'People transformation', body: 'Lead people through new ways of working, with care and clarity.' },
      { title: 'HR strategy', body: 'Align HR priorities, policies and services with the business direction.' },
    ],
    deliverables: [
      { title: 'People priorities', body: 'The few people issues that matter most to the strategy.' },
      { title: 'Organisation recommendations', body: 'Structure, roles and responsibilities, redesigned where needed.' },
      { title: 'Workforce capability plan', body: 'The skills and roles needed, and how to build or hire them.' },
      { title: 'Change roadmap', body: 'Communication, manager involvement and learning, sequenced.' },
    ],
    caseSlug: 'workforce-plan-for-growth',
    faqs: [
      { question: 'Where should a people strategy start?', answer: 'With the business direction and evidence about the capabilities needed to deliver it.' },
      { question: 'How is this different from HR planning?', answer: 'It starts from the business strategy rather than HR processes, and connects people decisions to what the business needs to achieve.' },
      { question: 'Do you work with our HR team?', answer: 'Closely. HR, leaders and managers shape the work together, so the recommendations are practical to deliver.' },
      { question: 'Can you help with restructuring?', answer: 'We help design organisation changes thoughtfully, with clear reasoning and attention to the people affected.' },
      { question: 'How do we know it is working?', answer: 'We agree capability and adoption measures at the start and review them over time.' },
    ],
    connected: 'business-transformation',
    stepWords: ['Implications', 'Design', 'Adoption'],
  },
  'leadership-development': {
    covers: [
      { title: 'Leadership development', body: 'Programmes built around the real decisions leaders face.' },
      { title: 'Executive development', body: 'Support senior leaders in setting direction and leading change.' },
      { title: 'Management development', body: 'Equip managers to lead teams, give feedback and deliver results.' },
      { title: 'Leadership capability', body: 'Define what good leadership looks like in your organisation.' },
      { title: 'Coaching and mentoring', body: 'One-to-one and peer support that turns learning into habit.' },
      { title: 'Future leadership', body: 'Identify and prepare the next generation of leaders.' },
    ],
    deliverables: [
      { title: 'Capability assessment', body: 'The leadership behaviours and skills needed, and the gaps today.' },
      { title: 'Programme outline', body: 'Workshops, practice and coaching, shaped for each group.' },
      { title: 'Learning materials', body: 'Practical tools and exercises built around real work.' },
      { title: 'Application review plan', body: 'How learning is used in the role, and what to adjust.' },
    ],
    caseSlug: 'leaders-ready-for-whats-next',
    faqs: [
      { question: 'Can a programme be tailored?', answer: 'Yes. We define the participant group, business context and desired changes before choosing the content.' },
      { question: 'Who are the programmes for?', answer: 'Emerging managers, experienced leaders and executives, each with a different focus.' },
      { question: 'Is coaching included?', answer: 'Coaching and mentoring can be part of the programme where they are agreed in the scope.' },
      { question: 'How do you measure impact?', answer: 'Through feedback from participants and their teams, and by reviewing how the learning shows up in day-to-day work.' },
      { question: 'Online or in person?', answer: 'Either, or a mix. We choose the format that suits the group and the skills being practised.' },
    ],
    connected: 'business-transformation',
    stepWords: ['Capability', 'Practise', 'Review'],
  },
  'hr-leadership-training': {
    covers: [
      { title: 'Training needs analysis', body: 'Agree which skills matter most for your managers and HR teams.' },
      { title: 'Manager essentials', body: 'Practical skills for leading people well day to day.' },
      { title: 'Difficult conversations', body: 'Feedback, performance and change, handled with confidence and care.' },
      { title: 'HR capability', body: 'Strengthen the HR team’s advisory and partnering skills.' },
      { title: 'Workplace exercises', body: 'Practice built around the situations people actually face.' },
      { title: 'Application and feedback', body: 'Follow up on how learning is used, and adjust.' },
    ],
    deliverables: [
      { title: 'Learning needs summary', body: 'The skills to build, agreed with leaders and HR.' },
      { title: 'Training programme', body: 'Sessions, exercises and materials, shaped to your context.' },
      { title: 'Practice toolkit', body: 'Guides and scenarios people can use back at work.' },
      { title: 'Feedback review', body: 'How the training is being applied, and what to change.' },
    ],
    caseSlug: 'leaders-ready-for-whats-next',
    faqs: [
      { question: 'How is this different from leadership development?', answer: 'It is focused, practical training on specific skills, while leadership development is a broader, longer programme.' },
      { question: 'Can training use our own policies and situations?', answer: 'Yes. Exercises are built around your policies and the situations your people meet.' },
      { question: 'How long is a programme?', answer: 'From a single focused session to a series over several months, depending on the needs agreed.' },
      { question: 'How do you check the training worked?', answer: 'We follow up with participants and their managers to review how the skills are being applied.' },
      { question: 'Can you train our trainers?', answer: 'Yes. We can prepare internal facilitators to run the programme themselves.' },
    ],
    connected: 'people-strategy',
    steps: [
      { title: 'Agree the learning needs', body: 'Talk to leaders, HR and participants about the situations they face. Agree the skills to build and what good looks like.' },
      { title: 'Practise real situations', body: 'Run focused sessions built around workplace exercises, scenarios and the organisation’s own policies.' },
      { title: 'Review application', body: 'Follow up on how the learning is used in the role, gather feedback and adjust the next sessions.' },
    ],
    stepWords: ['Needs', 'Practise', 'Review'],
  },
  'technical-training': {
    covers: [
      { title: 'Skills assessment', body: 'Understand each role’s starting point before planning any training.' },
      { title: 'Role-based learning paths', body: 'Learning goals tied to what each role needs to do.' },
      { title: 'Hands-on workshops', body: 'Explanation combined with practice on realistic tasks.' },
      { title: 'Digital and AI skills', body: 'Build confidence with the tools and technology teams use.' },
      { title: 'Systems adoption training', body: 'Help people use new systems well from day one.' },
      { title: 'Progress tracking', body: 'See how skills develop and where support is still needed.' },
    ],
    deliverables: [
      { title: 'Skills assessment', body: 'Current skill levels by role, and the gaps to close.' },
      { title: 'Learning goals', body: 'Clear, role-based goals for each group.' },
      { title: 'Training sessions', body: 'Hands-on workshops with realistic exercises.' },
      { title: 'Progress review', body: 'What has improved, and the next steps for each team.' },
    ],
    faqs: [
      { question: 'Which technical skills do you cover?', answer: 'Digital tools, data, AI and new systems, scoped to what your teams need for their roles.' },
      { question: 'Do people need prior experience?', answer: 'No. The skills assessment sets the starting point, and learning is pitched for each group.' },
      { question: 'Is the training hands-on?', answer: 'Yes. Every session combines short explanation with practice on realistic tasks.' },
      { question: 'Can you train on our own systems?', answer: 'Yes, where access can be arranged. Practising on real systems makes the learning stick.' },
      { question: 'How do you measure progress?', answer: 'With a skills check at the start and end, plus feedback on how confidently people use the skills at work.' },
    ],
    connected: 'ai-intelligent-automation',
    steps: [
      { title: 'Assess the starting point', body: 'Review each role’s current skills and the tools it uses. Agree where training will make the most difference.' },
      { title: 'Set role-based goals', body: 'Define clear learning goals for each group, tied to the tasks they need to do.' },
      { title: 'Practise hands-on', body: 'Combine short explanation with practice on realistic work, then review progress and next steps.' },
    ],
    stepWords: ['Assess', 'Goals', 'Practice'],
  },
  'startup-support': {
    covers: [
      { title: 'Proposition development', body: 'Sharpen what the business offers and to whom.' },
      { title: 'Audience understanding', body: 'Learn what early customers need and how they decide.' },
      { title: 'Business model', body: 'Test how the business will make money and grow.' },
      { title: 'Validation and MVP brief', body: 'Define the smallest product that proves the idea.' },
      { title: 'Brand foundations', body: 'A name, story and look that are ready for launch.' },
      { title: 'Go-to-market planning', body: 'Plan the first customers, channels and milestones.' },
    ],
    deliverables: [
      { title: 'Proposition statement', body: 'What you offer, for whom and why it is different.' },
      { title: 'Validation plan', body: 'The assumptions to test, and how to test them cheaply.' },
      { title: 'MVP brief', body: 'The first version of the product, scoped and prioritised.' },
      { title: 'Go-to-market plan', body: 'First customers, channels, messages and milestones.' },
    ],
    faqs: [
      { question: 'What stage of startup do you work with?', answer: 'From early idea to first customers and growth, focused on the next milestone.' },
      { question: 'Can you help us prepare for investors?', answer: 'We can sharpen the proposition, business model and go-to-market plan that investors will ask about.' },
      { question: 'Do you build the product?', answer: 'We define the MVP and can design and build it with our digital team, or brief your developers.' },
      { question: 'How long does support last?', answer: 'From a short focused sprint to ongoing support, depending on what the next milestone needs.' },
      { question: 'Is this only for technology startups?', answer: 'No. Any early-stage business working towards a launch or growth milestone.' },
    ],
    connected: 'brand-strategy',
    steps: [
      { title: 'Sharpen the proposition', body: 'Clarify the audience, the problem and what makes the offer different. Test the business model behind it.' },
      { title: 'Validate and scope', body: 'Test the key assumptions with real people, then define the MVP that proves the idea.' },
      { title: 'Plan the launch', body: 'Agree the first customers, channels, messages and milestones, with clear owners.' },
    ],
    stepWords: ['Proposition', 'Validate', 'Launch'],
  },
  'growth-partnership': {
    covers: [
      { title: 'Growth assessment', body: 'Understand where growth will come from and what limits it.' },
      { title: 'Growth priorities', body: 'Agree the few priorities that matter most this year.' },
      { title: 'Operating plan', body: 'Translate priorities into owners, budgets and milestones.' },
      { title: 'Leadership forum', body: 'A regular space for the decisions that shape growth.' },
      { title: 'Progress reviews', body: 'Track results, remove blockers and adjust the plan.' },
      { title: 'Specialist support', body: 'Bring in Gemstrat expertise as new needs arise.' },
    ],
    deliverables: [
      { title: 'Growth assessment', body: 'Opportunities, constraints and the starting baseline.' },
      { title: 'Operating priorities', body: 'The priorities for the period, with owners and measures.' },
      { title: 'Review rhythm', body: 'A regular schedule of reviews with the people accountable.' },
      { title: 'Progress reports', body: 'What has moved, what is blocked and what to decide next.' },
    ],
    caseSlug: 'workforce-plan-for-growth',
    faqs: [
      { question: 'What is a growth partnership?', answer: 'An ongoing relationship where we help leadership set growth priorities, plan delivery and review progress regularly.' },
      { question: 'How often do we meet?', answer: 'Typically monthly for reviews, with a fuller planning session each quarter, adjusted to your needs.' },
      { question: 'How is this different from a consulting project?', answer: 'A project ends with a deliverable. A partnership continues, so plans adapt as the business learns.' },
      { question: 'Which areas can it cover?', answer: 'Strategy, operations, brand, digital and people, drawing on Gemstrat specialists when needed.' },
      { question: 'Is there a minimum term?', answer: 'We agree the term together, usually starting with an initial period and a review point.' },
    ],
    connected: 'business-transformation',
    steps: [
      { title: 'Assess growth', body: 'Review where growth can come from, what limits it and where the business stands today.' },
      { title: 'Set operating priorities', body: 'Agree the priorities for the period and translate them into owners, budgets and milestones.' },
      { title: 'Review regularly', body: 'Meet with the people accountable to review progress, remove blockers and adjust the plan.' },
    ],
    stepWords: ['Assess', 'Priorities', 'Review'],
  },

  // ---------- Experience: specialist services ----------
  'brand-experience': {
    covers: [
      { title: 'Customer journeys', body: 'Map how customers move from first contact to loyal use.' },
      { title: 'Experience principles', body: 'Turn the brand promise into rules for how experiences should feel.' },
      { title: 'Touchpoint design', body: 'Improve the moments that matter most, digital and physical.' },
      { title: 'Service experience', body: 'Help teams deliver the brand in every conversation.' },
      { title: 'Spaces and environments', body: 'Make physical spaces express the brand.' },
      { title: 'Experience measurement', body: 'Track how customers feel and where the experience falls short.' },
    ],
    deliverables: [
      { title: 'Customer journey maps', body: 'Priority journeys, with moments of truth and pain points marked.' },
      { title: 'Experience principles', body: 'Clear principles that guide how every touchpoint should work.' },
      { title: 'Touchpoint improvements', body: 'The changes to make, prioritised by impact.' },
      { title: 'Measurement plan', body: 'How experience quality will be tracked over time.' },
    ],
    caseSlug: 'digital-customer-journey',
    faqs: [
      { question: 'What is brand experience?', answer: 'It is how the brand feels in practice: every interaction a customer has, digital, physical and human.' },
      { question: 'Where do you start?', answer: 'With the journeys that matter most to customers and the business, rather than every touchpoint at once.' },
      { question: 'Do you involve frontline teams?', answer: 'Yes. The people who serve customers know where experiences break, and they make the improvements stick.' },
      { question: 'How is it measured?', answer: 'Through customer feedback, behaviour and a few agreed measures for each priority journey.' },
      { question: 'How does it connect to our brand strategy?', answer: 'Experience principles translate the brand promise into how each touchpoint should work, so strategy shows up in practice.' },
    ],
    connected: 'people-strategy',
    steps: [
      { title: 'Map the journeys', body: 'Follow priority customer journeys end to end and find where the experience falls short of the brand promise.' },
      { title: 'Set the principles', body: 'Turn the brand promise into experience principles that guide how every touchpoint should work.' },
      { title: 'Improve the touchpoints', body: 'Prioritise and deliver the changes that matter most, with owners and measures.' },
    ],
    stepWords: ['Journeys', 'Principles', 'Touchpoints'],
  },
  'neo-marketing': {
    covers: [
      { title: 'Audience and channel planning', body: 'Find where your audience pays attention, and plan around it.' },
      { title: 'Search', body: 'Be found when people look for what you offer.' },
      { title: 'Social media', body: 'Content and communities that build attention and trust.' },
      { title: 'Content marketing', body: 'Useful content that brings the right people to you.' },
      { title: 'Paid media', body: 'Targeted spend that turns attention into action.' },
      { title: 'Measurement and testing', body: 'Track what works and improve with every test.' },
    ],
    deliverables: [
      { title: 'Audience and channel plan', body: 'Who to reach, where, and with what objective.' },
      { title: 'Content plan', body: 'Themes, formats and a publishing rhythm across channels.' },
      { title: 'Measurement framework', body: 'The numbers that show progress towards the objective.' },
      { title: 'Testing roadmap', body: 'The experiments to run, and how to read the results.' },
    ],
    faqs: [
      { question: 'What is neo marketing?', answer: 'A connected approach where search, social, content and paid media work together around one growth objective.' },
      { question: 'Which channels do you cover?', answer: 'Search, social, content, email and paid media, chosen for where your audience is.' },
      { question: 'How soon will we see results?', answer: 'Paid activity can show results within weeks. Search and content build over months. We plan for both.' },
      { question: 'How do you measure success?', answer: 'Against the agreed objective, such as enquiries or sales, alongside channel metrics.' },
      { question: 'Can you work with our in-house team?', answer: 'Yes. We can plan and run the work, or plan it with your team running the channels.' },
    ],
    connected: 'ai-intelligent-automation',
    steps: [
      { title: 'Plan around the audience', body: 'Understand audience behaviour and agree the growth objective, then choose the channels that fit.' },
      { title: 'Connect the channels', body: 'Plan search, social, content and paid media to work together around one message.' },
      { title: 'Measure and test', body: 'Track progress against the objective and use regular tests to improve the next decision.' },
    ],
    stepWords: ['Audience', 'Connect', 'Measure'],
  },
  'web-development': {
    covers: [
      { title: 'Content strategy', body: 'Decide what the site needs to say, and to whom.' },
      { title: 'User experience', body: 'Structure and journeys that help people find what they need.' },
      { title: 'Web design', body: 'Interfaces that express the brand and are easy to use.' },
      { title: 'Development', body: 'Fast, secure and accessible sites built to last.' },
      { title: 'CMS and integrations', body: 'Editing tools and connections to the systems you already use.' },
      { title: 'Launch and maintenance', body: 'Testing, launch and a plan for keeping the site healthy.' },
    ],
    deliverables: [
      { title: 'Site structure', body: 'The pages, content and journeys the site needs.' },
      { title: 'Designs', body: 'Page designs and interactions, ready for build.' },
      { title: 'Built website', body: 'A fast, accessible site with an easy-to-use CMS.' },
      { title: 'Launch and maintenance plan', body: 'Testing, go-live and how the site will be looked after.' },
    ],
    caseSlug: 'digital-customer-journey',
    faqs: [
      { question: 'How long does a website take?', answer: 'Typically eight to sixteen weeks, depending on the size of the site, the content and the integrations.' },
      { question: 'Can we update the site ourselves?', answer: 'Yes. We set up a content management system your team can use without developers.' },
      { question: 'Is accessibility included?', answer: 'Yes. Accessibility and performance are designed and tested as part of the build.' },
      { question: 'Do you write the content?', answer: 'We can plan the content and write it, or work with your team’s copy.' },
      { question: 'What happens after launch?', answer: 'We agree a maintenance plan covering updates, security and improvements.' },
    ],
    connected: 'brand-identity',
    steps: [
      { title: 'Plan content and experience', body: 'Agree what the site must say and do, then shape the structure and journeys around your audience.' },
      { title: 'Design and develop', body: 'Design the pages and build a fast, accessible site with an easy-to-use content system.' },
      { title: 'Launch and maintain', body: 'Test, go live and agree how the site will be updated, secured and improved.' },
    ],
    stepWords: ['Content', 'Develop', 'Launch'],
  },
  'app-development': {
    covers: [
      { title: 'Product discovery', body: 'Understand the users, the problem and the business case.' },
      { title: 'Journeys and prototypes', body: 'Design the core tasks and test them before building.' },
      { title: 'App design', body: 'Interfaces that make complex tasks feel simple.' },
      { title: 'Development', body: 'Reliable apps for web and mobile, built to scale.' },
      { title: 'Data and integrations', body: 'Connect the app to the systems and data it depends on.' },
      { title: 'Release planning', body: 'Ship a focused first version, then grow it with evidence.' },
    ],
    deliverables: [
      { title: 'Product brief', body: 'Users, problems, goals and how success will be measured.' },
      { title: 'Prototypes', body: 'Clickable core journeys, tested with real users.' },
      { title: 'Release plan', body: 'What goes in the first version, and what follows.' },
      { title: 'Built application', body: 'The app, tested and ready for launch.' },
    ],
    caseSlug: 'digital-customer-journey',
    faqs: [
      { question: 'Web app or mobile app?', answer: 'It depends on how and where people will use it. Discovery answers that before any build starts.' },
      { question: 'How do you control cost?', answer: 'By validating the core tasks with prototypes and launching a focused first version before expanding.' },
      { question: 'Can you integrate with our systems?', answer: 'Yes. Integrations and data needs are planned during discovery, not discovered late in the build.' },
      { question: 'Who owns the code?', answer: 'You do. Ownership and handover are agreed at the start.' },
      { question: 'Do you support the app after launch?', answer: 'Yes. Ongoing support and new releases can be agreed separately.' },
    ],
    connected: 'ai-intelligent-automation',
    steps: [
      { title: 'Discover the product', body: 'Understand the users, the problem and the business case, and define what the app must do first.' },
      { title: 'Prototype the journeys', body: 'Design the core tasks and test them as clickable prototypes before committing to a build.' },
      { title: 'Plan and build releases', body: 'Build a focused first version, launch it and grow the product with evidence.' },
    ],
    stepWords: ['Discover', 'Prototype', 'Release'],
  },
  'film-content-production': {
    covers: [
      { title: 'Creative brief', body: 'Agree the objective, the audience and where the content will be used.' },
      { title: 'Scriptwriting', body: 'Stories and scripts written for the screen and the channel.' },
      { title: 'Production planning', body: 'Locations, crew, schedules and budgets, organised.' },
      { title: 'Filming', body: 'Brand films, interviews, product and event content.' },
      { title: 'Editing and post-production', body: 'Edit, sound, graphics and colour, finished to a high standard.' },
      { title: 'Content for every channel', body: 'Cut-downs and formats for web, social and presentations.' },
    ],
    deliverables: [
      { title: 'Creative brief', body: 'Objective, audience, message and distribution plan.' },
      { title: 'Script and storyboard', body: 'The story, shot by shot.' },
      { title: 'Finished film', body: 'The main film, edited and graded.' },
      { title: 'Channel cut-downs', body: 'Shorter versions and formats for each channel.' },
    ],
    faqs: [
      { question: 'What kind of films do you make?', answer: 'Brand films, case study and interview films, product films, event content and social formats.' },
      { question: 'How long does production take?', answer: 'Typically four to eight weeks from brief to final edit, depending on scale.' },
      { question: 'Do you handle everything?', answer: 'Yes: brief, script, production, filming and editing, or any part of it.' },
      { question: 'Can you film internationally?', answer: 'Yes. We plan production wherever the story needs to be filmed.' },
      { question: 'Will we get versions for social media?', answer: 'Yes. Cut-downs and formats for each channel are planned from the start.' },
    ],
    connected: 'advertising-marketing',
    steps: [
      { title: 'Write the brief and script', body: 'Agree the objective, audience and channels, then develop the story and script.' },
      { title: 'Plan and produce', body: 'Organise locations, crew and schedule, then film with the edit already in mind.' },
      { title: 'Edit and deliver', body: 'Edit, finish and deliver the film with versions for every channel it will run on.' },
    ],
    stepWords: ['Script', 'Produce', 'Deliver'],
  },
  'gemstrat-luxe': {
    covers: [
      { title: 'Understanding your brief', body: 'A private conversation to understand what matters to you.' },
      { title: 'Lifestyle requirements', body: 'Define the experiences and arrangements you are looking for.' },
      { title: 'Asset considerations', body: 'Clarify the requirements around significant personal assets.' },
      { title: 'Specialist coordination', body: 'Bring the right specialists into the conversation.' },
      { title: 'Discretion', body: 'Every conversation handled privately and with care.' },
      { title: 'A tailored next step', body: 'A clear, considered plan for what happens next.' },
    ],
    deliverables: [
      { title: 'Brief summary', body: 'Your requirements and priorities, in one place.' },
      { title: 'Specialist introductions', body: 'The relevant specialists, briefed and coordinated.' },
      { title: 'Tailored plan', body: 'A considered next step, shaped around you.' },
    ],
    faqs: [
      { question: 'What is Gemstrat Luxe?', answer: 'A considered starting point for private lifestyle and asset requirements, coordinated around what matters to you.' },
      { question: 'Is the service confidential?', answer: 'Yes. Every conversation is handled privately and with discretion.' },
      { question: 'Who will I work with?', answer: 'A single point of contact, who coordinates the relevant specialists for your brief.' },
      { question: 'How do we begin?', answer: 'With a private conversation to understand your requirements and priorities.' },
      { question: 'Is there a cost for the first conversation?', answer: 'Please get in touch to discuss your requirements and how the service works.' },
    ],
    steps: [
      { title: 'Understand your brief', body: 'Begin with a private conversation about your requirements, priorities and preferences.' },
      { title: 'Coordinate the specialists', body: 'Bring the relevant specialists into the conversation and keep everything connected.' },
      { title: 'Shape the next step', body: 'Agree a considered, tailored plan for what happens next.' },
    ],
    stepWords: ['Brief', 'Specialists', 'Next'],
  },
};
