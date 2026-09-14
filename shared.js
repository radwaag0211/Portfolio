/* ============================================================
   SHARED — NAV CLICK -> PAGE TRANSITION (curtain)
   Reused by every page (Radwa.html, prosjekter.html, om-meg.html, cv.html). See
   .page-transition-curtain / @keyframes curtain-sweep / curtain-reveal in style.css.
   One consistent transition for all real page-to-page navigation: a gold sheet sweeps up
   to fully cover the screen, the navigation happens underneath at that exact midpoint
   (initNavTransitions, "leaving"), then on the destination page the sheet starts already
   covering and finishes sweeping off (initEntryReveal, "entering") — so the motion reads
   as one continuous sweep split across two page loads instead of a hard cut. Elements opt
   in via the .curtain-link class (the header's nav links, plus Radwa.html's hero scroll
   arrow).

   The "did we arrive via a curtain nav?" signal is sessionStorage's CURTAIN_NAV_KEY, set
   here right before navigating and consumed by the inline anti-FOUC script each page's
   <head> runs before body paints (see that script for why it has to live there rather
   than here). A direct load, refresh, or back/forward navigation never sets that flag, so
   those don't get an unearned entry animation.
   ============================================================ */
const CURTAIN_NAV_KEY = 'curtainNav';

function prefersReducedMotion() {
  return window.matchMedia('(prefers-reduced-motion: reduce)').matches;
}

// Single source of truth for timing lives in style.css's --curtain-duration; read it
// instead of keeping a second hardcoded copy in sync by hand.
function readCurtainDurationMs() {
  const FALLBACK_MS = 520;
  const raw = getComputedStyle(document.documentElement)
    .getPropertyValue('--curtain-duration')
    .trim();
  if (!raw) return FALLBACK_MS;
  const value = parseFloat(raw);
  if (Number.isNaN(value)) return FALLBACK_MS;
  return raw.endsWith('ms') ? value : value * 1000;
}

function initNavTransitions() {
  const curtain = document.querySelector('.page-transition-curtain');
  if (!curtain) return;
  const reducedMotion = prefersReducedMotion();
  const fullDuration = reducedMotion ? 0 : readCurtainDurationMs();
  const links = document.querySelectorAll('.curtain-link');

  links.forEach((link) => {
    link.addEventListener('click', (event) => {
      if (curtain.classList.contains('is-active')) {
        event.preventDefault();
        return;
      }

      const href = link.getAttribute('href');
      const isSamePageAnchor = href.startsWith('#') && href.length > 1;
      const targetSection = isSamePageAnchor ? document.querySelector(href) : null;

      event.preventDefault();
      curtain.classList.add('is-active');
      document.body.classList.add('curtain-blocking');

      // Only a real page navigation should trigger the entry reveal on the next page —
      // an in-page anchor scroll stays on this document, so it doesn't set the flag.
      if (!targetSection) {
        try {
          sessionStorage.setItem(CURTAIN_NAV_KEY, '1');
        } catch (e) {
          // sessionStorage unavailable (e.g. private mode) — destination just skips the
          // entry reveal, which is a fine degradation.
        }
      }

      setTimeout(() => {
        if (targetSection) {
          targetSection.scrollIntoView({ behavior: 'auto', block: 'start' });
        } else {
          window.location.href = href;
        }
      }, fullDuration / 2); // the keyframe's 50% point, when the curtain fully covers the screen

      curtain.addEventListener('animationend', () => {
        curtain.classList.remove('is-active');
        document.body.classList.remove('curtain-blocking');
      }, { once: true });
    });
  });
}

// Destination half of the curtain-nav motion: if the inline <head> script marked <html>
// with .curtain-entering (see there), the curtain is already sitting fully closed with
// zero flash-of-unstyled-content risk — this just starts the sweep-off animation and
// cleans the marker class up once it finishes.
function initEntryReveal() {
  const curtain = document.querySelector('.page-transition-curtain');
  const html = document.documentElement;
  if (!curtain || !html.classList.contains('curtain-entering')) return;

  document.body.classList.add('curtain-blocking');
  curtain.classList.add('is-entering');

  curtain.addEventListener('animationend', () => {
    curtain.classList.remove('is-entering');
    document.body.classList.remove('curtain-blocking');
    html.classList.remove('curtain-entering');
  }, { once: true });
}

initEntryReveal();
initNavTransitions();
