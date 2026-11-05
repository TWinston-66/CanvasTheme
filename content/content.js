(() => {
  const browserAPI = typeof browser !== 'undefined' ? browser : chrome;

  console.log('[CanvasTheme] Content script initialized on:', window.location.href);

  const DEFAULT_SETTINGS = {
    enabled: true,
    nav: true,
    cards: true,
    sidebar: true,
    content: true
  };

  let currentSettings = { ...DEFAULT_SETTINGS };

  function ensureStyleElement() {
    if (!currentSettings.enabled) {
      const existing = document.getElementById('ct-theme-link');
      if (existing) existing.remove();
      return;
    }

    const target = document.head || document.documentElement;
    if (!target) return;

    let link = document.getElementById('ct-theme-link');
    if (!link) {
      link = document.createElement('link');
      link.id = 'ct-theme-link';
      link.rel = 'stylesheet';
      link.type = 'text/css';
      link.href = browserAPI.runtime.getURL('content/theme.css');
      target.appendChild(link);
      console.log('[CanvasTheme] Attached stylesheet to <head>');
    } else if (link.parentElement && link.nextElementSibling) {
      link.parentElement.appendChild(link);
    }
  }

  const ONE_DARK_CARD_THEMES = [
    {
      accent: '#61afef', // One Dark Blue
      gradient: 'linear-gradient(135deg, rgba(97, 175, 239, 0.4) 0%, rgba(86, 182, 194, 0.18) 55%, #21252b 100%)'
    },
    {
      accent: '#98c379', // One Dark Green
      gradient: 'linear-gradient(135deg, rgba(152, 195, 121, 0.4) 0%, rgba(86, 182, 194, 0.18) 55%, #21252b 100%)'
    },
    {
      accent: '#c678dd', // One Dark Purple
      gradient: 'linear-gradient(135deg, rgba(198, 120, 221, 0.4) 0%, rgba(97, 175, 239, 0.18) 55%, #21252b 100%)'
    },
    {
      accent: '#e5c07b', // One Dark Yellow
      gradient: 'linear-gradient(135deg, rgba(229, 192, 123, 0.4) 0%, rgba(209, 154, 102, 0.18) 55%, #21252b 100%)'
    },
    {
      accent: '#e06c75', // One Dark Coral Red
      gradient: 'linear-gradient(135deg, rgba(224, 108, 117, 0.4) 0%, rgba(209, 154, 102, 0.18) 55%, #21252b 100%)'
    },
    {
      accent: '#56b6c2', // One Dark Cyan
      gradient: 'linear-gradient(135deg, rgba(86, 182, 194, 0.4) 0%, rgba(97, 175, 239, 0.18) 55%, #21252b 100%)'
    }
  ];

  function harmonizeCards() {
    if (!currentSettings.enabled || !currentSettings.cards) return;

    const cards = document.querySelectorAll('.ic-DashboardCard');
    cards.forEach((card, index) => {
      const theme = ONE_DARK_CARD_THEMES[index % ONE_DARK_CARD_THEMES.length];
      card.style.setProperty('--ct-card-accent', theme.accent);

      const hero = card.querySelector('.ic-DashboardCard__header_hero');
      if (!hero) return;

      const imgEl = hero.querySelector('.ic-DashboardCard__header_image');
      const hasImgStyle = imgEl && (
        imgEl.style.backgroundImage &&
        imgEl.style.backgroundImage !== 'none' &&
        !imgEl.style.backgroundImage.includes('""')
      );
      const hasHeroBgImg = hero.style.backgroundImage &&
        hero.style.backgroundImage !== 'none' &&
        !hero.style.backgroundImage.includes('""');
      const hasImgTag = !!hero.querySelector('img');

      const hasCustomImage = hasImgStyle || hasHeroBgImg || hasImgTag;

      // For solid-color course cards (no cover image), harmonize harsh Canvas colors into Catppuccin dual-tone gradients
      if (!hasCustomImage) {
        hero.style.setProperty('background', theme.gradient, 'important');
      }
    });
  }

  function applyThemeClasses() {
    const root = document.documentElement;
    const body = document.body;

    const targets = [root];
    if (body) targets.push(body);

    if (!currentSettings.enabled) {
      targets.forEach((el) => {
        el.classList.remove('ct-theme-active', 'ct-opt-nav', 'ct-opt-cards', 'ct-opt-sidebar', 'ct-opt-content');
        el.removeAttribute('data-ct-active');
        el.removeAttribute('data-ct-nav');
        el.removeAttribute('data-ct-cards');
        el.removeAttribute('data-ct-sidebar');
        el.removeAttribute('data-ct-content');
      });
      ensureStyleElement();
      return;
    }

    targets.forEach((el) => {
      el.classList.add('ct-theme-active');
      el.setAttribute('data-ct-active', 'true');

      el.classList.toggle('ct-opt-nav', !!currentSettings.nav);
      el.toggleAttribute('data-ct-nav', !!currentSettings.nav);

      el.classList.toggle('ct-opt-cards', !!currentSettings.cards);
      el.toggleAttribute('data-ct-cards', !!currentSettings.cards);

      el.classList.toggle('ct-opt-sidebar', !!currentSettings.sidebar);
      el.toggleAttribute('data-ct-sidebar', !!currentSettings.sidebar);

      el.classList.toggle('ct-opt-content', !!currentSettings.content);
      el.toggleAttribute('data-ct-content', !!currentSettings.content);
    });

    ensureStyleElement();
    harmonizeCards();
  }

  // Immediate synchronous application at document_start
  applyThemeClasses();

  // Load stored preferences
  browserAPI.storage.local.get(DEFAULT_SETTINGS).then((settings) => {
    currentSettings = settings;
    applyThemeClasses();
    console.log('[CanvasTheme] Settings loaded from storage:', currentSettings);
  }).catch((err) => {
    console.warn('[CanvasTheme] Error loading settings, using defaults:', err);
    applyThemeClasses();
  });

  // Persistent MutationObserver to prevent React/Canvas from stripping theme classes
  const observer = new MutationObserver(() => {
    const root = document.documentElement;
    const link = document.getElementById('ct-theme-link');

    const needsClasses = currentSettings.enabled && (
      !root.classList.contains('ct-theme-active') ||
      (document.body && !document.body.classList.contains('ct-theme-active'))
    );
    const needsLink = currentSettings.enabled && (!link || (link.parentElement && link.nextElementSibling));

    if (needsClasses || needsLink) {
      applyThemeClasses();
    } else if (currentSettings.enabled && currentSettings.cards) {
      harmonizeCards();
    }
  });

  observer.observe(document.documentElement, {
    childList: true,
    subtree: true,
    attributes: true,
    attributeFilter: ['class', 'data-ct-active']
  });

  // Handle SPA transitions in Canvas
  const handleNav = () => {
    console.log('[CanvasTheme] Navigation event detected:', window.location.pathname);
    applyThemeClasses();
    setTimeout(applyThemeClasses, 50);
    setTimeout(applyThemeClasses, 250);
  };

  window.addEventListener('popstate', handleNav);
  window.addEventListener('hashchange', handleNav);
  document.addEventListener('DOMContentLoaded', applyThemeClasses);
  window.addEventListener('load', applyThemeClasses);

  // Storage listener for popup changes
  browserAPI.storage.onChanged.addListener((changes, area) => {
    if (area !== 'local') return;
    browserAPI.storage.local.get(DEFAULT_SETTINGS).then((settings) => {
      currentSettings = settings;
      applyThemeClasses();
      console.log('[CanvasTheme] Settings updated via popup:', currentSettings);
    });
  });
})();
