# Canvas One Dark Pro 🎨

An authentic, developer-focused **One Dark Pro** theme for **Canvas LMS**, built as a local, lightweight Firefox WebExtension. Inspired by the iconic Atom & Zed One Dark editor aesthetics.

---

## ✨ Features

* **Authentic One Dark Pro Palette**:
  * Base editor canvas (`#282c34`)
  * Elevated panels, cards, and sidebars (`#21252b`)
  * Crisp `#2c313a` borders and dividers
  * Standard readable syntax foreground (`#abb2bf`) and comment meta (`#5c6370`)
  * Vivid accents: Function Blue (`#61afef`), String Green (`#98c379`), Class Gold (`#e5c07b`), and Coral Red (`#e06c75`).
* **Cover Image Harmonization**: Smooth bottom-vignette gradients on course cover images to prevent harsh visual cuts while preserving photo clarity.
* **Curated Course Gradients**: Automatically assigns rich, dual-tone One Dark Pro gradients to sandbox and non-image course cards.
* **Refined Modules & Pages**: Clean, unified module cards with no double borders, sharp white lines, or nested container clutter.
* **Unread Notification Pips**: Sleek notification badges pinned to action icons without accessibility parenthesis segmentation (`( 1 )`).
* **Zero Tracking & Completely Offline**: No external telemetry, no remote scripts, and no analytics. Works entirely locally on your machine.
* **Component-Level Toggles**: Configure exactly which parts of Canvas you want styled directly from the toolbar popup.

---

## 🚀 Installation & Development

### Option A: Temporary Add-on (Firefox Release / Beta / Nightly)
1. Clone this repository:
   ```bash
   git clone git@github.com:TWinston-66/CanvasTheme.git
   cd CanvasTheme
   ```
2. Open Firefox and navigate to `about:debugging#/runtime/this-firefox`.
3. Click **"Load Temporary Add-on..."**.
4. Select the [`manifest.json`](manifest.json) file in this repository.
5. Navigate to your Canvas LMS dashboard (e.g., `canvas.colorado.edu`) — the theme activates immediately.

> [!NOTE]
> Firefox unloads temporary extensions when the browser is fully quit and restarted. For permanent installation, see Option B.

### Option B: Permanent Installation (Firefox Developer Edition / Nightly)
1. In `about:config`, toggle `xpinstall.signatures.required` to `false`.
2. Package the extension:
   ```bash
   zip -r canvas-one-dark-pro.xpi manifest.json content/ icons/ popup/
   ```
3. Drag and drop the `.xpi` file directly into Firefox to install permanently.

---

## 🗂 Project Structure

```text
CanvasTheme/
├── manifest.json         # Extension configuration (Manifest V2 for automatic permissions)
├── content/
│   ├── theme.css         # Complete One Dark Pro design tokens and component overrides
│   └── content.js        # Dynamic injection, card color harmonization, and DOM mutation guards
├── popup/
│   ├── popup.html        # Settings popup UI
│   ├── popup.css         # Popup styles
│   └── popup.js          # Synchronizes toggle states with browser.storage.local
└── icons/
    └── icon.svg          # Extension logo
```

---

## 🛠 Configuration Toggles

Click the extension icon in your browser toolbar to toggle overrides on or off:

| Toggle | Description |
| :--- | :--- |
| **Enable Theme** | Master switch to turn the entire One Dark Pro theme on or off. |
| **Global Left Nav** | Restyles the main Canvas global navigation sidebar. |
| **Dashboard Cards** | Toggles card backgrounds, cover photo vignettes, and custom gradients. |
| **Sidebar & To-Do** | Controls styles for the To-Do, Coming Up, and Recent Feedback sidebar. |
| **Modules & Content**| Controls course module cards, tables, headers, and breadcrumbs. |

---

## 📦 Releases

Download pre-packaged `.xpi` and `.zip` bundles from the [GitHub Releases](https://github.com/TWinston-66/CanvasTheme/releases) page.

---

## 📄 License

MIT License. Feel free to modify and customize for your own school or Canvas institution!
