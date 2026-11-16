import FocusScene from './FocusScene';
import CaseIndex from './CaseIndex';
import { PageFrame } from './PageParts';

// Theory by Gemstrat: one page of case studies. The pinned "Into focus"
// stories come first, then every case in a filterable index
export function TheoryPage() {
  return <PageFrame about hero={<FocusScene />} ctaTitle="Discuss a similar challenge." category="Theory by Gemstrat" title="Thinking, put to work." intro="Real challenges. Connected thinking. Measurable progress."><CaseIndex /></PageFrame>;
}
