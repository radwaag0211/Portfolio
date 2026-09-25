/* ============================================================
   PROSJEKTER — CATEGORY FILTER
   Shows one category of project cards at a time (cards carry data-category, tabs carry
   data-filter). UX-design is the default; a URL hash (#utvikling, #grafisk) opens that
   tab directly, so a specific category can be linked to. Follows the WAI-ARIA tabs
   pattern: only the active tab is in the Tab order, and arrow keys move between tabs.
   ============================================================ */
function initProjectFilter() {
  const tabs = Array.from(document.querySelectorAll('.project-filter [role="tab"]'));
  const panel = document.getElementById('projects-grid');
  const cards = document.querySelectorAll('.project-card[data-category]');
  if (!tabs.length || !panel) return;

  const DEFAULT = 'ux';
  const valid = tabs.map((tab) => tab.dataset.filter);

  function select(filter, { focus = false, updateHash = false } = {}) {
    tabs.forEach((tab) => {
      const active = tab.dataset.filter === filter;
      tab.setAttribute('aria-selected', String(active));
      tab.tabIndex = active ? 0 : -1;
      if (active) {
        panel.setAttribute('aria-labelledby', tab.id);
        if (focus) tab.focus();
      }
    });
    cards.forEach((card) => {
      card.hidden = card.dataset.category !== filter;
    });
    if (updateHash) {
      // replaceState: switching tabs shouldn't pile up Back-button entries.
      history.replaceState(null, '', filter === DEFAULT ? location.pathname : '#' + filter);
    }
  }

  tabs.forEach((tab, i) => {
    tab.addEventListener('click', () => select(tab.dataset.filter, { updateHash: true }));
    tab.addEventListener('keydown', (event) => {
      let next = null;
      if (event.key === 'ArrowRight') next = tabs[(i + 1) % tabs.length];
      if (event.key === 'ArrowLeft') next = tabs[(i - 1 + tabs.length) % tabs.length];
      if (event.key === 'Home') next = tabs[0];
      if (event.key === 'End') next = tabs[tabs.length - 1];
      if (!next) return;
      event.preventDefault();
      select(next.dataset.filter, { focus: true, updateHash: true });
    });
  });

  const fromHash = location.hash.slice(1);
  select(valid.includes(fromHash) ? fromHash : DEFAULT);
}

initProjectFilter();
