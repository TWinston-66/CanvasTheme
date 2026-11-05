(() => {
  const browserAPI = typeof browser !== 'undefined' ? browser : chrome;

  const DEFAULT_SETTINGS = {
    enabled: true,
    nav: true,
    cards: true,
    sidebar: true,
    content: true
  };

  const elements = {
    enabled: document.getElementById('toggle-enabled'),
    nav: document.getElementById('toggle-nav'),
    cards: document.getElementById('toggle-cards'),
    sidebar: document.getElementById('toggle-sidebar'),
    content: document.getElementById('toggle-content'),
    subToggles: document.getElementById('sub-toggles'),
    resetBtn: document.getElementById('reset-btn')
  };

  function updateSubTogglesState(isEnabled) {
    if (isEnabled) {
      elements.subToggles.classList.remove('disabled');
    } else {
      elements.subToggles.classList.add('disabled');
    }
  }

  function setFormValues(settings) {
    elements.enabled.checked = !!settings.enabled;
    elements.nav.checked = !!settings.nav;
    elements.cards.checked = !!settings.cards;
    elements.sidebar.checked = !!settings.sidebar;
    elements.content.checked = !!settings.content;

    updateSubTogglesState(settings.enabled);
  }

  function saveCurrentValues() {
    const newSettings = {
      enabled: elements.enabled.checked,
      nav: elements.nav.checked,
      cards: elements.cards.checked,
      sidebar: elements.sidebar.checked,
      content: elements.content.checked
    };

    updateSubTogglesState(newSettings.enabled);
    browserAPI.storage.local.set(newSettings);
  }

  // Load saved settings on popup open
  browserAPI.storage.local.get(DEFAULT_SETTINGS).then((settings) => {
    setFormValues(settings);
  }).catch(() => {
    setFormValues(DEFAULT_SETTINGS);
  });

  // Attach change listeners to all checkboxes
  [elements.enabled, elements.nav, elements.cards, elements.sidebar, elements.content].forEach((input) => {
    input.addEventListener('change', saveCurrentValues);
  });

  // Reset button
  elements.resetBtn.addEventListener('click', () => {
    browserAPI.storage.local.set(DEFAULT_SETTINGS).then(() => {
      setFormValues(DEFAULT_SETTINGS);
    });
  });
})();
