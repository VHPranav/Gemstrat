// Copy for the shared scroll scene (ClarityScene). Plain data, so server
// components can read and reuse it.

export interface ClarityContent {
  /** Hero heading, one array of words per line */
  heroLines: string[][];
  heroSubtext: string;
  /** Three statements that blur through while the Z forms */
  statements: string[];
  /** Two closing lines under the finished Z */
  closing: [string, string];
  belief: { title: string; body: string; link: { label: string; href: string } };
  practice: { title: string; cards: { title: string; body: string; href: string; label?: string }[] };
}

export const ABOUT_CONTENT: ClarityContent = {
  heroLines: [['Different'], ['perspectives.'], ['One', 'connected'], ['practice.']],
  heroSubtext: 'Strategy, technology, brand and people. Connected.',
  statements: ['Different perspectives.', 'A clearer picture.', 'One direction forward.'],
  closing: ['Strategy. Technology. Brand. People.', 'One connected practice.'],
  belief: {
    title: 'Good thinking becomes useful when it moves.',
    body: 'We begin with your priorities and the realities of your business. Together, we define the problem, agree the work and build the capabilities needed to carry it forward.',
    link: { label: 'Discover our approach', href: '/our-approach' },
  },
  practice: {
    title: 'Get to know our practice.',
    cards: [
      { title: 'Our purpose', body: 'Why we exist, and the difference we want to make for the businesses we work with.', href: '/our-purpose' },
      { title: 'Our approach', body: 'How we turn priorities into a clear direction, and direction into practical work.', href: '/our-approach' },
      { title: 'Leadership', body: 'The people who bring business, technology, creative and people thinking together.', href: '/about/leadership' },
      { title: 'Our global presence', body: 'Different markets, connected thinking. Where we work and how we show up locally.', href: '/our-global-presence' },
    ],
  },
};
