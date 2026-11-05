(() => {
  'use strict';

  // theme.css is injected by the manifest. Every rule is scoped under classes
  // on <html>, so this script toggles those classes and tags a few elements
  // that CSS can't target on its own. <html> exists at document_start, so
  // there's no flash.
  const root = document.documentElement;
  const OPTION_KEYS = Object.keys(CT_DEFAULTS).filter((key) => key !== 'enabled');
  const CARD_THEME_COUNT = 6; // must match the [data-ct-theme] rules in theme.css

  // InstUI (Canvas's React UI library) styles everything with hashed emotion
  // classes (`css-<hash>-<label>`), so e.g. a white secondary button and a blue
  // primary button are indistinguishable in CSS. We read each element's real
  // colors once and tag the ones that need darkening:
  //   data-ct-tone="light"  light surface (button face, toolbar, panel, pill)
  //   data-ct-ink           neutral dark text, unreadable on our background
  //   data-ct-line          light gray borders (row dividers, frames)
  // Checkbox facades change color when checked, so theme.css handles them
  // with :checked instead.
  const INSTUI_SELECTOR = '[class^="css-"]:not([class*="checkboxFacade"]), [class*=" css-"]:not([class*="checkboxFacade"])';
  const inspected = new WeakSet();

  let settings = { ...CT_DEFAULTS };

  function applyClasses() {
    // classList.toggle with a force argument is a no-op when nothing changes,
    // so this is safe to call from the class observer below.
    root.classList.toggle('ct-theme-active', !!settings.enabled);
    for (const key of OPTION_KEYS) {
      root.classList.toggle(`ct-opt-${key}`, !!(settings.enabled && settings[key]));
    }
  }

  // Returns [r, g, b, a] for an rgb()/rgba() string, or null.
  function parseColor(value) {
    const m = /rgba?\(([^)]+)\)/.exec(value);
    if (!m) return null;
    const [r, g, b, a = 1] = m[1].split(/[\s,/]+/).filter(Boolean).map(Number);
    return [r, g, b, a];
  }

  const brightness = ([r, g, b]) => (r * 299 + g * 587 + b * 114) / 1000;
  // Grays only; leaves colored text (red "missing" pills, links) alone.
  const isNeutral = ([r, g, b]) => Math.max(r, g, b) - Math.min(r, g, b) < 40;

  function tagInstUI() {
    for (const el of document.querySelectorAll(INSTUI_SELECTOR)) {
      if (inspected.has(el)) continue;
      inspected.add(el);
      const cs = getComputedStyle(el);
      const bg = parseColor(cs.backgroundColor);
      if (bg && bg[3] > 0.5 && brightness(bg) > 200) el.dataset.ctTone = 'light';
      const fg = parseColor(cs.color);
      if (fg && brightness(fg) < 110 && isNeutral(fg)) el.toggleAttribute('data-ct-ink', true);
      if (hasLightBorder(cs)) el.toggleAttribute('data-ct-line', true);
    }
  }

  function hasLightBorder(cs) {
    for (const side of ['Top', 'Right', 'Bottom', 'Left']) {
      if (cs[`border${side}Style`] === 'none' || parseFloat(cs[`border${side}Width`]) === 0) continue;
      const c = parseColor(cs[`border${side}Color`]);
      if (c && c[3] > 0.5 && brightness(c) > 120 && isNeutral(c)) return true;
    }
    return false;
  }

  // Assigns each dashboard card a palette slot (see theme.css section 4).
  function tagCards() {
    document.querySelectorAll('.ic-DashboardCard').forEach((card, index) => {
      const theme = String(index % CARD_THEME_COUNT);
      if (card.dataset.ctTheme !== theme) card.dataset.ctTheme = theme;
    });
  }

  function tagAll() {
    if (!settings.enabled) return;
    tagInstUI();
    if (settings.cards) tagCards();
  }

  // Canvas renders most UI with React after load, so watch for DOM changes,
  // but batch them into at most one pass per animation frame.
  let frameQueued = false;
  const domObserver = new MutationObserver(() => {
    if (frameQueued) return;
    frameQueued = true;
    requestAnimationFrame(() => {
      frameQueued = false;
      tagAll();
    });
  });
  let domObserverActive = false;

  // Re-apply our classes if Canvas ever rewrites <html class>.
  new MutationObserver(applyClasses).observe(root, {
    attributes: true,
    attributeFilter: ['class']
  });

  function update(next) {
    settings = next;
    applyClasses();

    const wantObserver = !!settings.enabled;
    if (wantObserver && !domObserverActive) {
      domObserver.observe(root, { childList: true, subtree: true });
    } else if (!wantObserver && domObserverActive) {
      domObserver.disconnect();
    }
    domObserverActive = wantObserver;
    tagAll();
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
