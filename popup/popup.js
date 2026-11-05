(() => {
  'use strict';

  const inputs = document.querySelectorAll('input[data-setting]');
  const subToggles = document.getElementById('sub-toggles');

  function render(settings) {
    for (const input of inputs) {
      input.checked = !!settings[input.dataset.setting];
    }
    const enabled = !!settings.enabled;
    subToggles.classList.toggle('disabled', !enabled);
    subToggles.inert = !enabled; // also blocks keyboard focus, not just clicks
  }

  browser.storage.local.get(CT_DEFAULTS).then(render, () => render(CT_DEFAULTS));

  for (const input of inputs) {
    input.addEventListener('change', () => {
      const key = input.dataset.setting;
      if (key === 'enabled') {
        subToggles.classList.toggle('disabled', !input.checked);
        subToggles.inert = !input.checked;
      }
      browser.storage.local.set({ [key]: input.checked });
    });
  }

  document.getElementById('reset-btn').addEventListener('click', () => {
    browser.storage.local.set(CT_DEFAULTS).then(() => render(CT_DEFAULTS));
  });
})();
