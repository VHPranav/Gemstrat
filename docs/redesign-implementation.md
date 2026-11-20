# Sample page layouts

This is the first design pass for later page-by-page refinement. The palette is strictly monochrome: black, white and neutral grays. Media is displayed in grayscale. Existing inner-page hero compositions and homepage sections are retained. Navigation now links to the new page collection.

## Page families

- Company: `/about`, `/our-purpose`, `/our-approach`, `/about/leadership`. The sheet URLs `/about/our-purpose` and `/about/our-approach` are also available.
- Services: 22 pages under `/services/`, with separate content in `src/data/redesign/services.json`. Browse all through `/focus-areas` or `/sitemap`.
- Regions: United States, Canada, India, Middle East and Africa under `/locations/`. Existing map opening remains at `/our-global-presence`.
- Perspectives: `/perspectives/insights`, four readable articles, `/perspectives/case-studies`, `/perspectives/industries`.
- Utilities: `/contact`, `/privacy-policy`, `/terms-and-conditions`, `/sitemap`.

## Interaction and content notes

Insights have topic filters. Service questions and sample case-study scenarios expand. Related-service cards, regional links, page anchors and footer links connect the site.

Contact prepares a mailto draft for the existing address ask@gemstrat.com. The user reviews and sends it from their email app; no submission service is connected.

Case-study scenarios are explicitly illustrative. Leadership uses practice-profile layout samples without invented people. Legal pages are marked as drafts awaiting company text. No invented office addresses, case-study metrics, clients, leader biographies or certifications were added.

Shared visual components are in `src/components/redesign/`. Content is in `src/data/redesign/`. The research source remains `docs/redesign-content-bank.md`.

## Validation

Production static export checked with `npx next build --webpack`. The default Turbopack build had a local sandbox port restriction in the previous task. Local link and image checks cover the exported page collection. Desktop and mobile representative layouts, insights filtering and the contact draft flow are checked in browser.
