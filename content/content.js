(() => {
  'use strict';

  // theme.css is injected by the manifest. Every rule is scoped under classes
  // on <html>, so this script only has to toggle those classes and tag
  // dashboard cards. <html> exists at document_start, so there's no flash.
  const root = document.documentElement;
  const OPTION_KEYS = Object.keys(CT_DEFAULTS).filter((key) => key !== 'enabled');
  const CARD_THEME_COUNT = 6; // must match the [data-ct-theme] rules in theme.css

  let settings = { ...CT_DEFAULTS };

  function applyClasses() {
    // classList.toggle with a force argument is a no-op when nothing changes,
    // so this is safe to call from the class observer below.
    root.classList.toggle('ct-theme-active', !!settings.enabled);
    for (const key of OPTION_KEYS) {
      root.classList.toggle(`ct-opt-${key}`, !!(settings.enabled && settings[key]));
    }
  }

  function hasBackgroundImage(el) {
    const bg = el && el.style.backgroundImage;
    return !!bg && bg !== 'none' && !bg.includes('""');
  }

  // Assigns each card a palette slot and flags heroes without a cover image so
  // the CSS can give them a gradient. Styling lives entirely in CSS, so turning
  // the toggle off reverts cleanly.
  function tagCards() {
    document.querySelectorAll('.ic-DashboardCard').forEach((card, index) => {
      const theme = String(index % CARD_THEME_COUNT);
      if (card.dataset.ctTheme !== theme) card.dataset.ctTheme = theme;

      const hero = card.querySelector('.ic-DashboardCard__header_hero');
      if (!hero) return;
      const hasImage =
        hasBackgroundImage(hero.querySelector('.ic-DashboardCard__header_image')) ||
        hasBackgroundImage(hero) ||
        !!hero.querySelector('img');
      hero.toggleAttribute('data-ct-plain', !hasImage);
    });
  }

  // Dashboard cards are rendered by React after load, so watch for DOM
  // changes, but batch them into at most one pass per animation frame.
  let frameQueued = false;
  const cardObserver = new MutationObserver(() => {
    if (frameQueued) return;
    frameQueued = true;
    requestAnimationFrame(() => {
      frameQueued = false;
      tagCards();
    });
  });
  let cardObserverActive = false;

  // Re-apply our classes if Canvas ever rewrites <html class>.
  new MutationObserver(applyClasses).observe(root, {
    attributes: true,
    attributeFilter: ['class']
  });

  function update(next) {
    settings = next;
    applyClasses();

    const wantCards = !!(settings.enabled && settings.cards);
    if (wantCards && !cardObserverActive) {
      cardObserver.observe(root, { childList: true, subtree: true });
      tagCards();
    } else if (!wantCards && cardObserverActive) {
      cardObserver.disconnect();
    }
    cardObserverActive = wantCards;
  }

  update(settings);

  browser.storage.local.get(CT_DEFAULTS).then(update, (err) => {
    console.warn('[CanvasTheme] Failed to load settings, using defaults:', err);
  });

  browser.storage.onChanged.addListener((changes, area) => {
    if (area !== 'local') return;
    const next = { ...settings };
    for (const [key, { newValue }] of Object.entries(changes)) {
      if (key in CT_DEFAULTS) next[key] = newValue ?? CT_DEFAULTS[key];
    }
    update(next);
  });
})();
