/* SunSaver case study — scroll-reveal, telleeffekt og lesefremdrift.
   Fra handoff-designet (~/Desktop/handoff/sunsaver.js), uendret. Ingen avhengigheter,
   ingen globale navn som kolliderer med shared.js (alt kjører i én IIFE). Uten JS
   vises hele siden normalt. */
(function () {
  'use strict';

  var reduced = window.matchMedia && window.matchMedia('(prefers-reduced-motion: reduce)').matches;
  var supported = 'IntersectionObserver' in window;

  /* --- Fade-up når elementet kommer inn i skjermen --- */
  if (!reduced && supported) {
    var items = Array.prototype.slice.call(document.querySelectorAll('[data-reveal]'));

    items.forEach(function (el) { el.classList.add('is-hidden'); });

    var io = new IntersectionObserver(function (entries) {
      entries.forEach(function (entry) {
        if (!entry.isIntersecting) return;
        var el = entry.target;
        var siblings = Array.prototype.slice.call(el.parentElement ? el.parentElement.children : [])
          .filter(function (n) { return n.hasAttribute && n.hasAttribute('data-reveal'); });
        var delay = Math.max(Math.min(siblings.indexOf(el), 4), 0) * 90;
        window.setTimeout(function () { el.classList.remove('is-hidden'); }, delay);
        io.unobserve(el);
      });
    }, { rootMargin: '0px 0px -12% 0px', threshold: 0.12 });

    items.forEach(function (el) { io.observe(el); });
  }

  /* --- Tall som teller opp --- */
  if (!reduced && supported) {
    var counters = Array.prototype.slice.call(document.querySelectorAll('[data-count]'));

    var co = new IntersectionObserver(function (entries) {
      entries.forEach(function (entry) {
        if (!entry.isIntersecting) return;
        var el = entry.target;
        var target = parseInt(el.getAttribute('data-count'), 10) || 0;
        var prefix = el.getAttribute('data-prefix') || '';
        var suffix = el.getAttribute('data-suffix') || '';
        var start = performance.now();
        var duration = 900;

        (function tick(now) {
          var p = Math.min((now - start) / duration, 1);
          var eased = 1 - Math.pow(1 - p, 3);
          el.textContent = prefix + Math.round(target * eased) + suffix;
          if (p < 1) requestAnimationFrame(tick);
        })(start);

        co.unobserve(el);
      });
    }, { threshold: 0.6 });

    counters.forEach(function (el) { co.observe(el); });
  }

  /* --- Lesefremdrift i toppen --- */
  var bar = document.querySelector('[data-progress]');
  if (bar) {
    var onScroll = function () {
      var h = document.documentElement.scrollHeight - window.innerHeight;
      var p = h > 0 ? (window.scrollY / h) * 100 : 0;
      bar.style.width = Math.max(0, Math.min(100, p)) + '%';
    };
    onScroll();
    window.addEventListener('scroll', onScroll, { passive: true });
    window.addEventListener('resize', onScroll);
  }
})();
