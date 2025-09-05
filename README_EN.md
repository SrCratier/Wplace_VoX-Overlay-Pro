# VoX - Overlay Pro: Complete User Guide -_- /
**Based on shinkonet’s code, adapted and enhanced for Wplace.**

Welcome to **VoX - Overlay Pro**!  
This guide will help you master all the tools the script provides, from placing your first design to using advanced features for coordination and planning.

---

**<p align="center"><strong>TRANSLATIONS</strong></p>**
<p align="center">
    <a href="README.md"><img src="https://flagcdn.com/48x36/es.png" alt="Spain Flag"></a>
  &nbsp;
    <a href="README_FR.md"><img src="https://flagcdn.com/48x36/fr.png" alt="French Flag"></a>
</p>

---

## **1. Installation**

To use the script, you first need a browser extension called **Tampermonkey**.

1. Install Tampermonkey:
   
**IMPORTANT, FOR PHONES IT ONLY WORKS WITH MICROSOFT EDGE BROWSER - ADD EXTENSION FROM THE MENU**

   - [Tampermonkey for Chrome](https://chrome.google.com/webstore/detail/tampermonkey/dhdgffkkebhmkfjojejmpbldmpobfkfo)
   - [Tampermonkey for Firefox](https://addons.mozilla.org/es/firefox/addon/tampermonkey/)
   - [Other browsers](https://www.tampermonkey.net/)

3. Install the Script:  
   Once you have Tampermonkey, simply go to the [Release](https://github.com/SrCratier/Wplace_VoX-Overlay-Pro/releases) page on GitHub and click on https://github.com/SrCratier/Wplace_VoX-Overlay-Pro/releases/download/v4.9.2/WplacePro-VoX.user.js or the file **WplacePro-VoX.user.js**.  
   Tampermonkey will automatically open and prompt you to install the script.

---

## **2. Your First Overlay: Essential Steps**

This is the main function of the script. Follow these steps to place your first design on the canvas.

**Step 1: Create a New Overlay**  
In the script panel, go to the **Overlays** tab and click the **+ Add** button. This will create a new space for your image.

**Step 2: Add Your Image**  
With the new overlay selected, go to the **Editor** tab. You have two ways to add your image:
- **From a URL:** Paste a direct link to an image (.png, .jpg, etc.) in the text field and click **Load**.
- **From a Local File:** Click the dotted box or drag and drop an image file from your computer.  
  *(Note: overlays with local images cannot be exported or shared with others).*

**Step 3: Set the Position (The Most Important Step!)**  
Once the image is loaded, the script needs to know where to place it on the canvas.
1. Click the **Set Position: OFF** button to activate it. It will change to **Set Position: ON**.  
2. Go to the game canvas and click the exact pixel that corresponds to the top-left corner (0,0) of your image.  
3. Done! The script will fix the image at that coordinate. The **Set Position** mode will automatically deactivate.

---

## **3. The Main Panel: An Overview**

The interface is designed to be powerful yet intuitive. Here’s a summary of the main controls:

- **Overlay: ON/OFF** → Enables or disables the display of all your overlays.  
- **Mode: Minify** → Changes how the overlay is displayed:  
  - *Minify (Recommended):* Shows your design as a grid of dots, allowing you to see the canvas underneath.  
  - *Behind/Above:* Displays the full image behind or in front of the canvas.  
  - *Original:* Does not modify the canvas, ideal for viewing the mural’s real state.  
- **Show Errors: ON/OFF** → Highlights in red the pixels on the canvas that don’t match your design.  
- **Set Position: ON/OFF** → Activates the mode to set the position of your image on the canvas.  

---

## **4. Detailed Features by Tab**

### **Overlays Tab**
Here you manage all your images.

- **Activate an Overlay:** Click the radio button next to the name to select it as the active overlay (only one can be active at a time).  
- **Enable/Disable:** Use the checkbox to show or hide a specific overlay without deleting it.  
- **Preview:** When selecting an overlay with an image, a preview will appear at the bottom.  
- **Import/Export:** Share your designs with others using the **Import** and **Export** buttons.  

### **Editor Tab**
Here you adjust the active overlay.

- **Name:** Change the name of your overlay for better organization.  
- **Image Tools:**  
  - **Save:** Download the current version of the overlay image to your computer.  
  - **Resize:** Open an advanced menu to change the size of your image.  
  - **Color Tools:** Adjust the colors of your image to the official game palette.  
- **Opacity:** Adjust the transparency of your overlay.  
- **Fine Adjustment (Nudge):** Use the arrows to move your overlay pixel by pixel.  

### **Tools Tab**
Here you’ll find the script’s most powerful utilities.

- **Copy Canvas:**  
  1. Click **Set Point A** and then click a pixel on the canvas.  
  2. Click **Set Point B** to mark the opposite corner.  
  3. Use **View Area** to check the selection.  
  4. Click **Detect and Download** to save the selected area.  

- **Show Overlay Progress:**  
  - When enabled, a floating panel appears with the real-time progress of your overlay.  
  - **Highlight Missing:** Marks in cyan the pixels that are still missing.  
  - **Settings (⚙️):** Options to sort by amount, highlight available colors, and adjust transparency.  
  - **Collapse Panel:** Minimizes the panel so it doesn’t interfere while painting.  

---

## **5. Settings and Support**

- **General Settings:**  
  - Interface theme (light/dark).  
  - Transparency of the main panel.  

- **Support the Project:**  
  This project is free and made with dedication. If you find it useful, consider supporting its development with a donation (you’ll find the option in the settings menus).  

---

Enjoy creating and coordinating your projects on **wplace.live**!
