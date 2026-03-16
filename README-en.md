![Main Banner](social-preview.png)

🌍[Español](README.md) | [English](README-en.md) | [Français](README-fr.md)

# VoX - Overlay Pro for Wplace
**Based on the original code by shinkonet, modified and maintained by @SrCratier.**

An advanced userscript for `wplace.live` that allows you to load, position, and manage templates (overlays) on the canvas. This version has been optimized to offer higher performance, color conversion accuracy, and built-in tools to facilitate art creation and improve user comfort.

---

## 1. Installation

To use this script, you first need to install a userscript manager in your browser.

### Supported Browsers

| Platform | Recommended Browsers |
| :--- | :--- |
| **PC / Mac** | Chrome, Firefox, Brave, Edge, Opera GX |
| **Mobile (Android/iOS)** | **Microsoft Edge (Recommended)**, Kiwi Browser |

### Installation Steps
1. **Install Tampermonkey** from your browser's extension store:
   -[Tampermonkey for Chrome/Brave/Edge](https://chrome.google.com/webstore/detail/tampermonkey/dhdgffkkebhmkfjojejmpbldmpobfkfo)
   - [Tampermonkey for Firefox](https://addons.mozilla.org/en-US/firefox/addon/tampermonkey/)
   > *Note for mobile users: If you use Edge on mobile, you can install the extension directly from the browser's "Extensions" menu.*

2. [**Click here to install the script (v5.2.5)**](https://raw.githubusercontent.com/SrCratier/Wplace_VoX-Overlay-Pro/main/WplacePro-VoX.user.js).
3. Tampermonkey will automatically open a tab asking for confirmation. Click **Install** or **Update**.

---

## 2. User Guide

Follow these steps to place your design on the canvas with the best possible visual quality.

### A. Create and load an Overlay
1. Open the VoX panel in Wplace and go to the **Overlays** tab.
2. Click **+ Add**, the **Editor** tab will open.
3. Choose your **Rendering Mode** (see section below) or use the default one (recommended).
4. Load your image: you can paste a **direct URL** and click "Load", or click on the dotted area to upload a **local file**.

### B. Color Rendering Modes
When loading an image, the script automatically converts it to the official Wplace palette. You can choose how these colors are processed:
*   **Standard (Recommended):** Uses a closest-color algorithm without generating visual noise. Ideal for the vast majority of designs, logos, and flat shapes.
*   **Enhanced (Pixel Art):** Forces direct mathematical color mapping (Euclidean distance). It is the most accurate mode for strict Pixel Art and sharp edges.
*   **Photorealistic (Dithering):** Distributes the color conversion error among adjacent pixels to simulate soft transitions and gradients. Mainly useful for photographs or complex images.

### C. Set Position (Anchor)
1. With the image loaded, click the top button **Set Position: OFF** (it will change to **ON**).
2. Click on the game canvas, exactly on the pixel where you want the top-left corner (0,0) of your image to be placed.
3. The script will automatically anchor the image. You can make micro-adjustments using the displacement arrows in the "Offset X / Y" section within the Editor.
   > *Note: The image will only be anchored if you have the color palette closed.*

### D. Main Panel and View Modes
From the buttons at the top of the panel, you can control how your template is projected:
*   **Overlay (ON/OFF):** Shows or hides all your loaded designs.
*   **Mode:** Changes the display style of the template:
    *   *Minify (Recommended):* Shows the image as a pattern of spaced dots, allowing you to see the original canvas underneath.
    *   *Behind / Above:* Projects the completely solid image behind or on top of the map's pixels.
    *   *Original:* Temporarily hides the overlay to observe the real map.
*   **Show Errors (ON/OFF):** Highlights the pixels on the map that do not match your design in contrasting colors.

> **💡 Performance note:** If you change the opacity, position, or apply filters, simply move the map slightly or place a pixel to refresh the screen and reflect the changes.

![Render Output Photo](EJEMPLOS.png)

---

## 3. Additional Tools

The script includes management and editing functions in their respective tabs.

### Tools Tab
*   **Copy Canvas:** Downloads an exact and clean cutout of the current map in PNG format.
    1. Set **Point A** by clicking on a corner.
    2. Set **Point B** on the opposite corner.
    3. Enable "Preview Area" and click "Download".
*   **Color Analysis (Overlay Progress):** Opens a floating panel for real-time tracking of your project.
    *   Calculates the total progress percentage of your overlay.
    *   Shows a list of how many pixels are missing, sorted by color.
    *   Allows you to apply visual filters to show or hide specific colors, making teamwork by zones or shades easier.

### Editor Tab
*   **Color Tools:** Adjusts and replaces the colors of your template with others from the official Wplace palette before you start drawing.
*   **Resize:** Built-in tool to scale your design internally without needing external software.

---

## 4. Technical Features

This version has been rewritten to offer a smoother and more stable experience:

*   **Asynchronous Processing (Web Workers):** Complex image conversion runs in the background, preventing the browser from freezing (Anti-Lag) during loading.
*   **High-Resolution Support:** The size limit for overlays has been increased, supporting images up to **3000x3000px**.
*   **Independent Multi-Overlay Management:** You can keep multiple templates loaded at the same time. Each overlay saves its own position, opacity, and color filter settings without conflicting with the others.
*   **Memory Optimization:** Implementation of a map data cache limit, significantly reducing RAM consumption during long sessions.
*   **Improved Error Detection:** Logic for detecting dark/black pixels has been fixed and adjusted, ensuring a clear display of errors in any shade.

---

## 5. Support and Acknowledgements

In the header of the main panel, you will find the **Settings (⚙️)** button, where you can:
*   Toggle the interface between **Light** and **Dark** themes.
*   Adjust the overall transparency of the panel.

This project is open source (GPLv3) and its maintenance takes time. If the script has been useful to organize your community or defend your art, consider supporting the developer.

You will find the donation details (Binance / PayPal) and the list of acknowledgements to recent contributors inside the settings menu.