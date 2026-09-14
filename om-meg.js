/* ============================================================
   OM MEG PAGE — page-specific interactivity (Om Meg only).
   Ported from the "om_meg_updated" reference mockup (originally a React prototype) into
   plain DOM/vanilla JS, matching the rest of this site's no-framework approach.
   ============================================================ */

/* Fixed 2px bar at the very top whose width tracks how far down the page you've scrolled. */
function initScrollProgress() {
  const bar = document.querySelector('.scroll-progress');
  if (!bar) return;

  function update() {
    const h = document.documentElement;
    const max = h.scrollHeight - h.clientHeight;
    const pct = max > 0 ? (h.scrollTop / max) * 100 : 0;
    bar.style.width = pct.toFixed(1) + '%';
  }

  window.addEventListener('scroll', update, { passive: true });
  window.addEventListener('resize', update);
  update();
}

/* Cycles the "jeg er ___" role word every 2.2s. */
function initRoleCycle() {
  const word = document.querySelector('.role-word');
  if (!word) return;
  const roles = ['UX designer', 'utvikler', 'prototyper', 'youth advocate'];
  let i = 0;
  setInterval(() => {
    i = (i + 1) % roles.length;
    word.textContent = roles[i];
  }, 2200);
}

/* Subtle 3D tilt on the intro photo, following the cursor while it's hovered. */
function initPhotoTilt() {
  const wrap = document.querySelector('.intro-photo-wrap');
  const photo = document.querySelector('.intro-photo');
  if (!wrap || !photo) return;

  wrap.addEventListener('mousemove', (e) => {
    const r = wrap.getBoundingClientRect();
    const x = (e.clientX - r.left) / r.width - 0.5;
    const y = (e.clientY - r.top) / r.height - 0.5;
    photo.style.transform = `rotateY(${(x * 7).toFixed(2)}deg) rotateX(${(-y * 7).toFixed(2)}deg) translateY(-4px)`;
  });

  wrap.addEventListener('mouseleave', () => {
    photo.style.transform = 'none';
  });
}

/* The "brygg en islatte" cup: 5 clicks fill it (with a status note per click and ice
   appearing near the top once it's mostly full), then a "drikk den opp" button appears
   and resets everything. At 5/5 the built cup also fades out in favor of the real
   islatte.png illustration as a small reward. */
function initLatteWidget() {
  const root = document.querySelector('.latte');
  if (!root) return;

  const brewBtn = root.querySelector('.latte-brew-btn');
  const drinkBtn = root.querySelector('.latte-drink-btn');
  const status = root.querySelector('.latte-status');
  const count = root.querySelector('.latte-count');
  const fill = root.querySelector('.latte-fill');
  const ice = root.querySelector('.latte-ice');

  const notes = ['espresso: sjekk', 'is: sjekk', 'salt karamell: sjekk', 'melk: sjekk', 'full kopp — skål'];
  let brews = 0;

  function paint() {
    fill.style.height = (brews / 5) * 100 + '%';
    ice.classList.toggle('is-visible', brews >= 4);
    count.textContent = brews + ' / 5';
    status.textContent = brews === 0 ? 'trykk fem ganger' : notes[brews - 1];
    status.classList.toggle('is-active', brews > 0);
    drinkBtn.classList.toggle('is-visible', brews >= 5);
    brewBtn.disabled = brews >= 5;
    root.classList.toggle('is-full', brews >= 5);
  }

  brewBtn.addEventListener('click', () => {
    if (brews >= 5) return;
    brews += 1;
    paint();
  });

  drinkBtn.addEventListener('click', () => {
    brews = 0;
    paint();
    status.textContent = 'tom igjen — klar for neste runde';
    status.classList.add('is-active');
  });

  paint();
}

/* Click-drag horizontal scroll for the photo strip, plus a caption above it that shows
   which photo is currently hovered (falling back to a default label otherwise). */
function initPhotoStrip() {
  const strip = document.querySelector('.photo-strip');
  const label = document.querySelector('.strip-label');
  if (!strip) return;

  const defaultLabel = label ? label.textContent : '';
  let isDown = false, startX, scrollLeft;

  strip.addEventListener('mousedown', (e) => {
    isDown = true;
    startX = e.pageX - strip.offsetLeft;
    scrollLeft = strip.scrollLeft;
  });
  strip.addEventListener('mouseleave', () => { isDown = false; });
  strip.addEventListener('mouseup', () => { isDown = false; });
  strip.addEventListener('mousemove', (e) => {
    if (!isDown) return;
    e.preventDefault();
    strip.scrollLeft = scrollLeft - (e.pageX - strip.offsetLeft - startX);
  });

  if (label) {
    strip.querySelectorAll('figure[data-note]').forEach((figure) => {
      figure.addEventListener('mouseenter', () => {
        label.textContent = figure.getAttribute('data-note');
      });
      figure.addEventListener('mouseleave', () => {
        label.textContent = defaultLabel;
      });
    });
  }
}

initScrollProgress();
initRoleCycle();
initPhotoTilt();
initLatteWidget();
initPhotoStrip();
