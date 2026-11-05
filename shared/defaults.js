// Default settings, shared by the content script and the popup.
//
// To add a component toggle:
//   1. Add a key here (e.g. `grades: true`).
//   2. Add a row to popup/popup.html with `data-setting="grades"`.
//   3. Scope its rules in content/theme.css under `&.ct-opt-grades { ... }`.
globalThis.CT_DEFAULTS = Object.freeze({
  enabled: true,
  nav: true,
  cards: true,
  sidebar: true,
  content: true
});
