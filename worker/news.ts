// ---------------------------------------------------------------------------
// GET /api/news: regional industry headlines for the Our global presence page.
//
// For each Gemstrat region, the Worker asks Bing News (RSS) for recent
// stories about the topics Gemstrat works on (AI, digital transformation,
// automation, brand and marketing, people and leadership) in that market.
// Every headline then passes two filters before it can appear next to the
// Gemstrat brand:
//   1. it must mention one of Gemstrat's subjects (TOPIC), be in English and
//      be less than three weeks old, and
//   2. it must not mention anything off-brand: conflict, crime, disaster,
//      politics, markets, sport, layoffs, competitors… (BLOCK), or come from a press-release
//      wire (BLOCKED_SOURCES).
// The result is cached at the edge for an hour, so visitors never contact a
// news site themselves and the page gets one small same-origin JSON file.
// If nothing clean comes back for a region, the page shows Gemstrat's own
// curated headlines instead (src/components/redesign/presenceContent.ts).
// ---------------------------------------------------------------------------

export interface NewsStory { title: string; source: string; href: string; published: string }
export type NewsFeed = { updated: string; regions: Record<string, NewsStory[]> };

/** Two short searches per region: technology and transformation, then
 *  brand and people */
const SEARCHES = [
  '("artificial intelligence" OR "digital transformation" OR automation) business',
  '(branding OR marketing OR workforce OR "customer experience") business',
];

/** Each region: its Bing News market and the place to search for */
const REGIONS: Record<string, { edition: string; place: string }> = {
  'toronto': { edition: 'CA', place: 'Canada' },
  'new-york': { edition: 'US', place: '"U.S."' },
  'nairobi': { edition: 'KE', place: 'Kenya' },
  'dubai': { edition: 'AE', place: 'UAE' },
  'mumbai': { edition: 'IN', place: 'India' },
};

/** A headline must clearly be about one of Gemstrat's subjects… */
const TOPIC = /\b(AI|GenAI|artificial intelligence|generative|automation|automate[sd]?|digital|digiti[sz]\w*|transformation|technology|tech|fintech|cloud|data|software|startups?|innovation|brands?|branding|marketing|advertising|customer experience|workforce|talent|skills|upskill\w*|reskill\w*|leadership development|productivity)\b/i;

/** …and never about anything that shouldn't sit next to the brand */
const BLOCK = new RegExp('\\b(' + [
  // conflict, crime and disaster
  'war', 'wars', 'attacks?', 'killed', 'kills?', 'dead', 'deaths?', 'dies', 'died', 'murder\\w*', 'shooting', 'gun\\w*', 'terror\\w*', 'bomb\\w*',
  'missiles?', 'military', 'army', 'troops', 'strikes?', 'protests?', 'riots?', 'crash\\w*', 'accidents?', 'fire', 'floods?', 'earthquake', 'disaster',
  'abuse\\w*', 'assault\\w*', 'arrest\\w*', 'police', 'court', 'lawsuits?', 'sued?', 'fraud\\w*', 'scams?', 'scandal\\w*', 'probe', 'investigation',
  'hack\\w*', 'breach\\w*', 'ransomware', 'cyberattacks?', 'leak\\w*',
  // politics and geopolitics
  'election\\w*', 'vote\\w*', 'polls?', 'president', 'prime minister', 'minister', 'parliament', 'senate', 'congress', 'governor', 'politic\\w*',
  'trump', 'biden', 'modi', 'tariffs?', 'sanctions?', 'israel\\w*', 'gaza', 'iran\\w*', 'ukrain\\w*', 'russia\\w*', 'china', 'pakistan\\w*',
  // bad business news
  'geopolit\\w*',
  // markets and sport (not what Gemstrat does)
  'stocks?', 'shares', 'sensex', 'nifty', 'nasdaq', 'dow', 'earnings', 'ipo', 'cricket', 'football', 'soccer', 'match', 'tournament', 'olympic\\w*', 'coach', 'captain', 'ipl', 'nba', 'nfl',
  'layoffs?', 'laid off', 'slash\\w*', 'cuts?', 'resign\\w*', 'shockwaves?', 'crack\\w* down', 'crackdown', 'curbs?', 'bans?', 'banned', 'moratorium', 'restructur\\w*', 'outages?', 'downtime', 'pulls? out', 'warns?', 'threat\\w*', 'fears?', 'job cuts?', 'cuts jobs', 'fired', 'bankrupt\\w*', 'collapse\\w*', 'crisis', 'recession', 'slump\\w*', 'plunge\\w*', 'losses',
  // adult, religion, gambling, misc
  'sex\\w*', 'porn\\w*', 'deepfakes?', 'religio\\w*', 'church', 'mosque', 'temple', 'betting', 'gambling', 'casino', 'crypto\\w*', 'bitcoin',
  // competitors
  'deloitte', 'accenture', 'mckinsey', 'pwc', 'kpmg', 'ey', 'bcg', 'bain', 'capgemini', 'infosys', 'wipro', 'tcs', 'cognizant',
].join('|') + ')\\b', 'i');

/** Press-release wires: promotional rather than news */
const BLOCKED_SOURCES = /(newswire|presswire|globe ?newswire|business ?wire|pr ?web|openpr|einpresswire|accesswire|issuewire|prlog|press release)/i;

const CACHE_SECONDS = 60 * 60;
const PER_REGION = 6;
/** Older stories are dropped, so the page never shows stale news */
const MAX_AGE_DAYS = 21;
/** Sources in other scripts (the page is in English) */
const LATIN = /^[\x20-\x7E\u00C0-\u017F\u2019\u2013\u2014]+$/;

const decode = (text: string) => text
  .replace(/<!\[CDATA\[([\s\S]*?)\]\]>/g, '$1')
  .replace(/&#(\d+);/g, (_, n) => String.fromCharCode(Number(n)))
  .replace(/&quot;/g, '"').replace(/&#39;|&apos;/g, "'").replace(/&lt;/g, '<').replace(/&gt;/g, '>').replace(/&amp;/g, '&')
  .trim();

const tag = (item: string, name: string) => {
  const match = new RegExp(`<${name}[^>]*>([\\s\\S]*?)</${name}>`).exec(item);
  return match ? decode(match[1]) : '';
};

async function search(market: string, query: string): Promise<NewsStory[]> {
  // Bing News RSS (Google News refuses requests from Cloudflare's network).
  // qft interval 8 = the past week
  const url = new URL('https://www.bing.com/news/search');
  url.search = new URLSearchParams({
    q: query, format: 'rss', cc: market, setlang: 'en', qft: 'interval="8"',
  }).toString();
  const response = await fetch(url, { headers: { 'User-Agent': 'Mozilla/5.0 (compatible; news-reader)' } });
  if (!response.ok) return [];
  const xml = await response.text();

  const seen = new Set<string>();
  const stories: NewsStory[] = [];
  for (const [, item] of xml.matchAll(/<item>([\s\S]*?)<\/item>/g)) {
    // "Khaleej Times on MSN" → "Khaleej Times"
    const source = tag(item, 'News:Source').replace(/\s+on MSN$/i, '');
    const title = tag(item, 'title');
    const summary = tag(item, 'description');
    // Bing wraps the article address in a click-tracking link
    let href = tag(item, 'link');
    try { href = new URL(href).searchParams.get('url') ?? href; } catch { continue; }
    href = href.replace(/^http:\/\//, 'https://');
    const key = title.toLowerCase().slice(0, 60);
    if (!source || !href.startsWith('https://') || seen.has(key)) continue;
    if (title.length < 30 || title.length > 170) continue;
    // The topic must be in the headline; nothing off-brand in the headline or its summary
    if (!TOPIC.test(title) || BLOCK.test(`${title} ${summary}`) || BLOCK.test(source) || BLOCKED_SOURCES.test(source) || BLOCKED_SOURCES.test(href) || !LATIN.test(source)) continue;
    const published = new Date(tag(item, 'pubDate'));
    if (!(Date.now() - published.getTime() < MAX_AGE_DAYS * 864e5)) continue;
    seen.add(key);
    stories.push({ title, source, href, published: published.toISOString() });
  }
  return stories;
}

/** Both searches for a region, merged: newest first, no repeats */
async function regionStories(edition: string, place: string): Promise<NewsStory[]> {
  const results = await Promise.all(SEARCHES.map(topics => search(edition, `${place} ${topics}`).catch(() => [])));
  const seen = new Set<string>();
  return results.flat()
    .filter(story => !seen.has(story.title) && !!seen.add(story.title))
    .sort((a, b) => b.published.localeCompare(a.published))
    .slice(0, PER_REGION);
}

export async function handleNews(request: Request, ctx: { waitUntil(promise: Promise<unknown>): void }): Promise<Response> {
  const cache = (caches as unknown as { default: Cache }).default;
  const key = new Request(new URL('/api/news', request.url).toString());
  const cached = await cache.match(key);
  if (cached) return cached;

  const entries = await Promise.all(Object.entries(REGIONS).map(async ([slug, { edition, place }]) => {
    try {
      return [slug, await regionStories(edition, place)] as const;
    } catch {
      return [slug, []] as const;
    }
  }));
  const feed: NewsFeed = { updated: new Date().toISOString(), regions: Object.fromEntries(entries) };
  const found = entries.some(([, stories]) => stories.length > 0);

  const response = new Response(JSON.stringify(feed), {
    headers: {
      'Content-Type': 'application/json; charset=utf-8',
      // A failed fetch is only kept briefly, so the next visitor retries
      'Cache-Control': `public, max-age=${found ? CACHE_SECONDS : 60}`,
      // Public data; lets the local dev server (another port) read it too
      'Access-Control-Allow-Origin': '*',
    },
  });
  if (found) ctx.waitUntil(cache.put(key, response.clone()));
  return response;
}
