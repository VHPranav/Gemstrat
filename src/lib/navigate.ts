// ---------------------------------------------------------------------------
// Site navigation
// Menu links are either sections of the home page ('#advantage') or pages of
// their own ('/approach'). goTo() handles both: a section scrolls into view
// when it's on this page, otherwise we go to the home page at that section.
// The Navbar registers Next's router so page changes stay client-side.
// ---------------------------------------------------------------------------

type Push = (href: string) => void;
let push: Push | null = null;

export function setRouterPush(fn: Push | null) {
  push = fn;
}

export function goTo(href: string) {
  if (href.startsWith('#')) {
    const el = document.querySelector(href);
    if (el) {
      el.scrollIntoView({ behavior: 'smooth' });
      return;
    }
    href = `/${href}`;
  }
  if (push) push(href);
  else window.location.assign(href);
}
