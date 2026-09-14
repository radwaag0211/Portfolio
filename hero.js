/* ============================================================
   HERO / HJEM PAGE (Radwa.html only)

   STEP 1 — HERO
   Pinned scroll-jack: .hero-pin is tall (see hero.css), .hero sticks to the top inside
   it. While .hero-pin's top is scrolling past, the section stays pinned in the viewport;
   scroll position within that range drives the ascii/video crossfade 1:1 (no easing, no
   timers) via requestAnimationFrame — scroll fast or slow, the fade tracks exactly, and
   scrolling back up reverses it since progress is recomputed from scratch every frame.

   STEPS 2 & 3 — HEADER REVEAL, GROWTH, AND CENTERING
   Computed in this same function, from this same `scrolled` value, instead of a separate
   observer: the spec asks for the header's appearance to read as "one continuous movement
   with the hero", so it has to ride the exact same scroll-driven progress.
     - `progress` fades the header + nav in early, all together, as one unit, at the
       enlarged size (--header-scale, a constant HEADER_SCALE_LARGE) — kept large
       permanently rather than easing back to normal, since a smaller size made the nav
       links hard to read once centered.
     - `centerT` remaps a *later* slice of the same scroll range (20%–80% of `give`) to
       drive `--center-t`, which slides the header from top to vertical-center — read by
       hero.css's transform, so this stays a genuinely continuous, scrubbable motion
       (scroll up and it reverses), not a class-swap jump.
   ============================================================ */
function initHero() {
  const siteHeader = document.querySelector('header');
  const heroPin = document.querySelector('.hero-pin');
  const heroAscii = document.querySelector('.hero__ascii');
  const heroContent = document.querySelector('.hero__content');
  const heroImage = document.querySelector('.hero__bg-image');
  const heroVideo = document.querySelector('.hero__bg-video');
  const heroScroll = document.querySelector('.hero__scroll');
  let heroVideoStarted = false;
  let ticking = false;

  // `give` is the total pinned scroll distance (.hero-pin's height minus one viewport) —
  // exactly the point at which CSS position:sticky lets go on its own. FADE_END reserves
  // only the first 70% of that for the crossfade, leaving the remaining 30% as a genuine
  // still-pinned "dead zone" where the arrow invites a click through to Om meg.
  const FADE_END = 0.7;
  // The header-growth-and-centering slice of the same scroll range (step 3): starts a
  // little after the reveal (step 2) has already kicked in, ends a little before release,
  // so the two stages read as sequential even though both come from one continuous value.
  const CENTER_START = 0.2;
  const CENTER_END = 0.8;
  // Font-size stays at this enlarged scale permanently once revealed — it does NOT ease
  // back down to normal size while centering, since a smaller size made the nav links
  // hard to read once they'd moved to the middle of the screen.
  const HEADER_SCALE_LARGE = 1.5;

  function updateHero() {
    ticking = false;

    const give = heroPin.offsetHeight - window.innerHeight;
    const scrolled = give > 0
      ? Math.min(Math.max(-heroPin.getBoundingClientRect().top, 0), give)
      : 0;
    const progress = give > 0 ? Math.min(scrolled / (give * FADE_END), 1) : 1;
    const released = give <= 0 || scrolled >= give - 0.5;
    const rawCenterT = give > 0 ? scrolled / give : 1;
    const centerT = Math.min(Math.max((rawCenterT - CENTER_START) / (CENTER_END - CENTER_START), 0), 1);

    heroAscii.style.opacity = 0.35 * (1 - progress);
    heroContent.style.opacity = 1 - progress;
    heroImage.style.opacity = 1 - progress;
    heroVideo.style.opacity = progress;
    siteHeader.classList.toggle('is-visible', progress > 0.05);
    siteHeader.style.setProperty('--center-t', centerT);
    siteHeader.style.setProperty('--header-scale', HEADER_SCALE_LARGE);
    // "Keep scrolling" cue: only once the crossfade above is fully done, but before the
    // pin has actually released.
    heroScroll.classList.toggle('is-visible', progress >= 0.999 && !released);

    if (progress > 0 && !heroVideoStarted) {
      heroVideoStarted = true;
      heroVideo.preload = 'auto';
      heroVideo.play().catch(() => {});
    }
  }

  function onHeroScroll() {
    if (!ticking) {
      ticking = true;
      requestAnimationFrame(updateHero);
    }
  }

  window.addEventListener('scroll', onHeroScroll, { passive: true });
  window.addEventListener('resize', onHeroScroll, { passive: true });
  updateHero();
}

initHero();
