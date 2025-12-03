// ==UserScript==
// @name         Wplace Overlay Pro Modified By @SrCratier
// @namespace    http://tampermonkey.net/
// @version      5.0.2
// @description  Overlays tiles on wplace.live. Can also resize, and color-match your overlay to wplace's palette. Make sure to comply with the site's Terms of Service, and rules! This script is not affiliated with Wplace.live in any way, use at your own risk. This script is not affiliated with TamperMonkey. The author of this userscript is not responsible for any damages, issues, loss of data, or punishment that may occur as a result of using this script. This script is provided "as is" under GPLv3.
// @author       shinkonet (Modificado por @SrCratier)
// @updateURL    https://raw.githubusercontent.com/SrCratier/Wplace_VoX-Overlay-Pro/main/WplacePro-VoX.user.js
// @downloadURL  https://raw.githubusercontent.com/SrCratier/Wplace_VoX-Overlay-Pro/main/WplacePro-VoX.user.js
// @match        https://wplace.live/*
// @license      GPLv3
// @grant        GM_setValue
// @grant        GM_getValue
// @grant        GM.setValue
// @grant        GM.getValue
// @grant        GM_xmlhttpRequest
// @grant        unsafeWindow
// @connect      *
// @run-at       document-start
// ==/UserScript==

(function () {
  'use strict';

  const TILE_SIZE = 1000;
  const MAX_OVERLAY_DIM = 3000;
  const MINIFY_SCALE = 3;
  const NATIVE_FETCH = window.fetch;
  const tileDataCache = new Map();

  const gmGet = (key, def) => {
    try {
      if (typeof GM !== 'undefined' && typeof GM.getValue === 'function') return GM.getValue(key, def);
      if (typeof GM_getValue === 'function') return Promise.resolve(GM_getValue(key, def));
    } catch {}
    return Promise.resolve(def);
  };
  const gmSet = (key, value) => {
    try {
      if (typeof GM !== 'undefined' && typeof GM.setValue === 'function') return GM.setValue(key, value);
      if (typeof GM_setValue === 'function') return Promise.resolve(GM_setValue(key, value));
    } catch {}
    return Promise.resolve();
  };

  function gmFetchBlob(url) {
    return new Promise((resolve, reject) => {
      try {
        GM_xmlhttpRequest({
          method: 'GET',
          url,
          responseType: 'blob',
          onload: (res) => {
            if (res.status >= 200 && res.status < 300 && res.response) resolve(res.response);
            else reject(new Error(`GM_xhr failed: ${res.status} ${res.statusText}`));
          },
          onerror: () => reject(new Error('GM_xhr network error')),
          ontimeout: () => reject(new Error('GM_xhr timeout')),
        });
      } catch (e) { reject(e); }
    });
  }
  function blobToDataURL(blob) {
    return new Promise((resolve, reject) => {
      const fr = new FileReader();
      fr.onload = () => resolve(fr.result);
      fr.onerror = reject;
      fr.readAsDataURL(blob);
    });
  }
  async function urlToDataURL(url) {
    const blob = await gmFetchBlob(url);
    if (!blob || !String(blob.type).startsWith('image/')) throw new Error('URL did not return an image blob');
    return await blobToDataURL(blob);
  }
  function fileToDataURL(file) {
    return new Promise((resolve, reject) => {
      const fr = new FileReader();
      fr.onload = () => resolve(fr.result);
      fr.onerror = reject;
      fr.readAsDataURL(file);
    });
  }

  const WPLACE_FREE = [
    [0,0,0], [60,60,60], [120,120,120], [210,210,210], [255,255,255],
    [96,0,24], [237,28,36], [255,127,39], [246,170,9], [249,221,59], [255,250,188],
    [14,185,104], [19,230,123], [135,255,94],
    [12,129,110], [16,174,166], [19,225,190], [96,247,242],
    [40,80,158], [64,147,228],
    [107,80,246], [153,177,251],
    [120,12,153], [170,56,185], [224,159,249],
    [203,0,122], [236,31,128], [243,141,169],
    [104,70,52], [149,104,42], [248,178,119]
  ];
  const WPLACE_PAID = [
    [170,170,170],
    [165,14,30], [250,128,114],
    [228,92,26], [156,132,49], [197,173,49], [232,212,95],
    [74,107,58], [90,148,74], [132,197,115],
    [15,121,159], [187,250,242], [125,199,255],
    [77,49,184], [74,66,132], [122,113,196], [181,174,241],
    [155,82,73], [209,128,120], [250,182,164],
    [219,164,99], [123,99,82], [156,132,107], [214,181,148],
    [209,128,81], [255,197,165],
    [109,100,63], [148,140,107], [205,197,158],
    [51,57,65], [109,117,141], [179,185,209]
  ];
    const WPLACE_NAMES = {
    "0,0,0":"Black","60,60,60":"Dark Gray","120,120,120":"Gray","210,210,210":"Light Gray","255,255,255":"White", "170,170,170":"Medium Gray",
    "96,0,24":"Deep Red","237,28,36":"Red","255,127,39":"Orange","246,170,9":"Gold","249,221,59":"Yellow","255,250,188":"Light Yellow",
    "14,185,104":"Dark Green","19,230,123":"Green","135,255,94":"Light Green",
    "12,129,110":"Dark Teal","16,174,166":"Teal","19,225,190":"Light Teal","96,247,242":"Cyan",
    "40,80,158":"Dark Blue","64,147,228":"Blue",
    "107,80,246":"Indigo","153,177,251":"Light Indigo",
    "120,12,153":"Dark Purple","170,56,185":"Purple","224,159,249":"Light Purple",
    "203,0,122":"Dark Pink","236,31,128":"Pink","243,141,169":"Light Pink",
    "104,70,52":"Dark Brown","149,104,42":"Brown","248,178,119":"Beige",
    "165,14,30":"Dark Red","250,128,114":"Light Red",
    "228,92,26":"Dark Orange","156,132,49":"Dark Goldenrod","197,173,49":"Goldenrod","232,212,95":"Light Goldenrod",
    "74,107,58":"Dark Olive","90,148,74":"Olive","132,197,115":"Light Olive",
    "15,121,159":"Dark Cyan","187,250,242":"Light Cyan","125,199,255":"Light Blue",
    "77,49,184":"Dark Indigo","74,66,132":"Dark Slate Blue","122,113,196":"Slate Blue","181,174,241":"Light Slate Blue",
    "155,82,73":"Dark Peach","209,128,120":"Peach","250,182,164":"Light Peach",
    "219,164,99":"Light Brown","123,99,82":"Dark Tan","156,132,107":"Tan","214,181,148":"Light Tan",
    "209,128,81":"Dark Beige","255,197,165":"Light Beige",
    "109,100,63":"Dark Stone","148,140,107":"Stone","205,197,158":"Light Stone",
    "51,57,65":"Dark Slate","109,117,141":"Slate","179,185,209":"Light Slate"
  };
  const DEFAULT_FREE_KEYS = WPLACE_FREE.map(([r,g,b]) => `${r},${g},${b}`);
  const DEFAULT_PAID_KEYS = [];
  const page = unsafeWindow;

    let lastKnownAvailableColors = new Set();

    // ------------------------------- LISTA DE DONADORES ----------------------------------------

const DONATORS = [

{ name: "kleyder1205 ", contribution: "- Donó 5 USD   :D ❤️" },
{ name: "Nuntius ", contribution: "- Donó 5 USD   :D ❤️" },
{ name: "espressos work ", contribution: "- Donó 5 USD   :D ❤️" },

];

    // ---------------------------- FIN LISTA DE DONADORES ---------------------------------------

  function uid() { return `${Date.now().toString(36)}-${Math.random().toString(36).slice(2, 10)}`; }
      function debounce(func, wait) {
      let timeout;
      return function executedFunction(...args) {
          const later = () => {
              clearTimeout(timeout);
              func(...args);
          };
          clearTimeout(timeout);
          timeout = setTimeout(later, wait);
      };
  }
  function uniqueName(base) {
    const names = new Set(config.overlays.map(o => (o.name || '').toLowerCase()));
    if (!names.has(base.toLowerCase())) return base;
    let i = 1; while (names.has(`${base} (${i})`.toLowerCase())) i++; return `${base} (${i})`;
  }

  function createCanvas(w, h) { if (typeof OffscreenCanvas !== 'undefined') return new OffscreenCanvas(w, h); const c = document.createElement('canvas'); c.width = w; c.height = h; return c; }
  function createHTMLCanvas(w, h) { const c = document.createElement('canvas'); c.width = w; c.height = h; return c; }
  function canvasToBlob(canvas) { if (canvas.convertToBlob) return canvas.convertToBlob(); return new Promise((resolve, reject) => canvas.toBlob(b => b ? resolve(b) : reject(new Error("toBlob failed")), "image/png")); }
  async function canvasToDataURLSafe(canvas) {
    if (canvas && typeof canvas.toDataURL === 'function') return canvas.toDataURL('image/png');
    if (canvas && typeof canvas.convertToBlob === 'function') { const blob = await canvas.convertToBlob(); return await blobToDataURL(blob); }
    if (typeof OffscreenCanvas !== 'undefined' && canvas instanceof OffscreenCanvas) {
      const bmp = canvas.transferToImageBitmap?.();
      if (bmp) { const html = createHTMLCanvas(canvas.width, canvas.height); const ctx = html.getContext('2d'); ctx.drawImage(bmp, 0, 0); return html.toDataURL('image/png'); }
    }
    throw new Error('Cannot export canvas to data URL');
  }
  async function blobToImage(blob) {
    if (typeof createImageBitmap === 'function') { try { return await createImageBitmap(blob); } catch {} }
    return new Promise((resolve, reject) => { const url = URL.createObjectURL(blob); const img = new Image(); img.onload = () => { URL.revokeObjectURL(url); resolve(img); }; img.onerror = (e) => { URL.revokeObjectURL(url); reject(e); }; img.src = url; });
  }
  function loadImage(src) { return new Promise((resolve, reject) => { const img = new Image(); img.crossOrigin = "anonymous"; img.onload = () => resolve(img); img.onerror = reject; img.src = src; }); }
  function extractPixelCoords(pixelUrl) {
    try { const u = new URL(pixelUrl); const parts = u.pathname.split('/'); const sp = new URLSearchParams(u.search);
      return { chunk1: parseInt(parts[3], 10), chunk2: parseInt(parts[4], 10), posX: parseInt(sp.get('x') || '0', 10), posY: parseInt(sp.get('y') || '0', 10) };
    } catch { return { chunk1: 0, chunk2: 0, posX: 0, posY: 0 }; }
  }
  function matchTileUrl(urlStr) {
    try { const u = new URL(urlStr, location.href);
      if (u.hostname !== 'backend.wplace.live' || !u.pathname.startsWith('/files/')) return null;
      const m = u.pathname.match(/\/(\d+)\/(\d+)\.png$/i);
      if (!m) return null;
      return { chunk1: parseInt(m[1], 10), chunk2: parseInt(m[2], 10) };
    } catch { return null; }
  }
  function matchPixelUrl(urlStr) {
    try { const u = new URL(urlStr, location.href);
      if (u.hostname !== 'backend.wplace.live') return null;
      const m = u.pathname.match(/\/s0\/pixel\/(\d+)\/(\d+)$/); if (!m) return null;
      const sp = u.searchParams;
      return { normalized: `https://backend.wplace.live/s0/pixel/${m[1]}/${m[2]}?x=${sp.get('x')||0}&y=${sp.get('y')||0}` };
    } catch { return null; }
  }
  function rectIntersect(ax, ay, aw, ah, bx, by, bw, bh) {
    const x = Math.max(ax, bx), y = Math.max(ay, by);
    const r = Math.min(ax + aw, bx + bw), b = Math.min(ay + ah, by + bh);
    const w = Math.max(0, r - x), h = Math.max(0, b - y);
    return { x, y, w, h };
  }

  const overlayCache = new Map();
  const tooLargeOverlays = new Set();

  function overlaySignature(ov) {
    const imgKey = ov.imageBase64 ? ov.imageBase64.slice(0, 64) + ':' + ov.imageBase64.length : 'none';
    return [imgKey, ov.pixelUrl || 'null', ov.offsetX, ov.offsetY, ov.opacity].join('|');
  }
  function clearOverlayCache() { overlayCache.clear(); }

  async function buildOverlayDataForChunk(ov, targetChunk1, targetChunk2, originalTileImageData = null) {
    if (!ov.enabled || !ov.imageBase64 || !ov.pixelUrl) return null;
    if (tooLargeOverlays.has(ov.id)) return null;
    const sig = overlaySignature(ov);
    const cacheKey = `${ov.id}|${sig}|${targetChunk1}|${targetChunk2}|errors=${config.showErrors}|filter=${ov.filterActive}`;
    if (overlayCache.has(cacheKey)) return overlayCache.get(cacheKey);
    const img = await loadImage(ov.imageBase64);
    if (!img) return null;
    const wImg = img.width, hImg = img.height;
    if (wImg >= MAX_OVERLAY_DIM || hImg >= MAX_OVERLAY_DIM) {
      tooLargeOverlays.add(ov.id);
      showToast(`Overlay "${ov.name}" skipped: image too large (must be smaller than ${MAX_OVERLAY_DIM}×${MAX_OVERLAY_DIM}; got ${wImg}×${hImg}).`);
      return null;
    }
    const base = extractPixelCoords(ov.pixelUrl);
    if (!Number.isFinite(base.chunk1) || !Number.isFinite(base.chunk2)) return null;
    const drawX = (base.chunk1 * TILE_SIZE + base.posX + ov.offsetX) - (targetChunk1 * TILE_SIZE);
    const drawY = (base.chunk2 * TILE_SIZE + base.posY + ov.offsetY) - (targetChunk2 * TILE_SIZE);
    const isect = rectIntersect(0, 0, TILE_SIZE, TILE_SIZE, drawX, drawY, wImg, hImg);
    if (isect.w === 0 || isect.h === 0) { overlayCache.set(cacheKey, null); return null; }
    const canvas = createCanvas(TILE_SIZE, TILE_SIZE);
    const ctx = canvas.getContext('2d', { willReadFrequently: true });
    ctx.drawImage(img, drawX, drawY);
    const imageData = ctx.getImageData(isect.x, isect.y, isect.w, isect.h);
    const data = imageData.data;
    const colorStrength = ov.opacity;
    const whiteStrength = 1 - colorStrength;
    const isErrorCheckMode = config.showErrors && originalTileImageData;

    const filterSet = (ov.filterActive && ov.savedFilters) ? new Set(ov.savedFilters) : null;

    for (let i = 0; i < data.length; i += 4) {
        if (data[i + 3] < 250) {
            continue;
        }

        const r_ov = data[i], g_ov = data[i + 1], b_ov = data[i + 2];
        if (filterSet && !filterSet.has(`${r_ov},${g_ov},${b_ov}`)) {
            data[i + 3] = 0;
            continue;
        }

        const currentX = isect.x + (i / 4) % isect.w;
        const currentY = isect.y + Math.floor((i / 4) / isect.w);
        const originalIndex = (currentY * TILE_SIZE + currentX) * 4;

        if (isErrorCheckMode && originalTileImageData) {
            const r_orig = originalTileImageData.data[originalIndex];
            const g_orig = originalTileImageData.data[originalIndex + 1];
            const b_orig = originalTileImageData.data[originalIndex + 2];
            const isMatch = r_ov === r_orig && g_ov === g_orig && b_ov === b_orig;
            if (isMatch) {
                data[i + 3] = 0;
            } else {
                const bg_r = 237, bg_g = 28, bg_b = 36;
                const alpha = 0.5;
                data[i] = Math.round(r_ov * (1 - alpha) + bg_r * alpha);
                data[i + 1] = Math.round(g_ov * (1 - alpha) + bg_g * alpha);
                data[i + 2] = Math.round(b_ov * (1 - alpha) + bg_b * alpha);
                data[i + 3] = 255;
            }
        } else if (config.highlightMissing && originalTileImageData) {
            const r_orig = originalTileImageData.data[originalIndex];
            const g_orig = originalTileImageData.data[originalIndex + 1];
            const b_orig = originalTileImageData.data[originalIndex + 2];
            const isMatch = r_ov === r_orig && g_ov === g_orig && b_ov === b_orig;
            if (isMatch) {
                data[i + 3] = 0;
            } else {
                data[i] = 0;
                data[i + 1] = 255;
                data[i + 2] = 255;
                data[i + 3] = 150;
            }
        } else {
            data[i] = Math.round(data[i] * colorStrength + 255 * whiteStrength);
            data[i + 1] = Math.round(data[i + 1] * colorStrength + 255 * whiteStrength);
            data[i + 2] = Math.round(data[i + 2] * colorStrength + 255 * whiteStrength);
            data[i + 3] = 255;
        }
    }
    const result = { imageData, dx: isect.x, dy: isect.y };
    overlayCache.set(cacheKey, result);
    return result;
  }

  const PATTERNS = [
      (x, y, c, s) => x === c && y === c,
      (x, y, c, s) => y === c,
      (x, y, c, s) => x === c,
      (x, y, c, s) => x === c || y === c,
  ];

  const GRAYSCALE_KEYS = ["0,0,0", "60,60,60", "120,120,120", "170,170,170", "210,210,210", "255,255,255"];
  const FULL_PALETTE_ORDERED = [...new Set([...WPLACE_FREE, ...WPLACE_PAID].map(rgb => rgb.join(',')))];
  const OTHER_COLORS_ORDERED = FULL_PALETTE_ORDERED.filter(key => !GRAYSCALE_KEYS.includes(key));
  const colorToPatternMap = new Map();

  function getPattern(colorKey, relX, relY, center, scale) {
      if (colorToPatternMap.has(colorKey)) {
          const patternFn = colorToPatternMap.get(colorKey);
          return patternFn(relX, relY, center, scale);
      }
      let bestMatchKey = colorKey;
      let minDistance = Infinity;
      const [r, g, b] = colorKey.split(',').map(Number);
      for (const paletteKey of FULL_PALETTE_ORDERED) {
          const [pr, pg, pb] = paletteKey.split(',').map(Number);
          const distance = Math.abs(r - pr) + Math.abs(g - pg) + Math.abs(b - pb);
          if (distance < minDistance) {
              minDistance = distance;
              bestMatchKey = paletteKey;
          }
          if (distance === 0) break;
      }
      let patternFn;
      switch (bestMatchKey) {
          case "255,255,255": case "0,0,0": patternFn = PATTERNS[0]; break;
          case "210,210,210": case "60,60,60": patternFn = PATTERNS[1]; break;
          case "170,170,170": patternFn = PATTERNS[2]; break;
          case "120,120,120": patternFn = PATTERNS[3]; break;
          default: {
              const colorIndex = OTHER_COLORS_ORDERED.indexOf(bestMatchKey);
              const patternIndex = (colorIndex === -1) ? 0 : colorIndex % PATTERNS.length;
              patternFn = PATTERNS[patternIndex];
              break;
          }
      }
      colorToPatternMap.set(colorKey, patternFn);
      return patternFn(relX, relY, center, scale);
  }

  function isColorSimilar(r1, g1, b1, r2, g2, b2, tolerance = 15) {
      return (Math.abs(r1 - r2) + Math.abs(g1 - g2) + Math.abs(b1 - b2)) <= tolerance;
  }

  async function buildOverlayDataForChunkMinify(ov, targetChunk1, targetChunk2, originalTileImageData = null) {
    if (!ov.enabled || !ov.imageBase64 || !ov.pixelUrl) return null;
    if (tooLargeOverlays.has(ov.id)) return null;

    const scale = MINIFY_SCALE;
    const sig = overlaySignature(ov);
    const cacheKey = `${ov.id}|${sig}|minify|s${scale}|${targetChunk1}|${targetChunk2}|errors=${config.showErrors}|filter=${ov.filterActive}`;
    if (overlayCache.has(cacheKey)) return overlayCache.get(cacheKey);

    const img = await loadImage(ov.imageBase64);
    if (!img) return null;
    const wImg = img.width, hImg = img.height;
    if (wImg >= MAX_OVERLAY_DIM || hImg >= MAX_OVERLAY_DIM) {
      tooLargeOverlays.add(ov.id);
      showToast(`Overlay "${ov.name}" skipped: image too large (must be smaller than ${MAX_OVERLAY_DIM}×${MAX_OVERLAY_DIM}; got ${wImg}×${hImg}).`);
      return null;
    }
    const base = extractPixelCoords(ov.pixelUrl);
    if (!Number.isFinite(base.chunk1) || !Number.isFinite(base.chunk2)) return null;

    const drawX = (base.chunk1 * TILE_SIZE + base.posX + ov.offsetX) - (targetChunk1 * TILE_SIZE);
    const drawY = (base.chunk2 * TILE_SIZE + base.posY + ov.offsetY) - (targetChunk2 * TILE_SIZE);
    const tileW = TILE_SIZE * scale;
    const tileH = TILE_SIZE * scale;
    const drawXScaled = Math.round(drawX * scale);
    const drawYScaled = Math.round(drawY * scale);
    const wScaled = wImg * scale;
    const hScaled = hImg * scale;
    const isect = rectIntersect(0, 0, tileW, tileH, drawXScaled, drawYScaled, wScaled, hScaled);
    if (isect.w === 0 || isect.h === 0) { overlayCache.set(cacheKey, null); return null; }

    const canvas = createCanvas(tileW, tileH);
    const ctx = canvas.getContext('2d', { willReadFrequently: true });
    ctx.imageSmoothingEnabled = false;
    ctx.clearRect(0, 0, tileW, tileH);
    ctx.drawImage(img, 0, 0, wImg, hImg, drawXScaled, drawYScaled, wScaled, hScaled);

    const imageData = ctx.getImageData(isect.x, isect.y, isect.w, isect.h);
    const data = imageData.data;
    const colorStrength = ov.opacity;
    const whiteStrength = 1 - colorStrength;
    const center = Math.floor(scale / 2);
    const width = isect.w;
    const isErrorCheckMode = config.showErrors && originalTileImageData;
    const errorCache = new Map();
    const filterSet = (ov.filterActive && ov.savedFilters) ? new Set(ov.savedFilters) : null;

    for (let i = 0; i < data.length; i += 4) {
      const r_ov = data[i], g_ov = data[i+1], b_ov = data[i+2], a = data[i+3];
      if (a < 250) {
        data[i+3] = 0;
        continue;
      }
      const colorKey = `${r_ov},${g_ov},${b_ov}`;
      if (filterSet && !filterSet.has(colorKey)) {
          data[i+3] = 0;
          continue;
      }

      const px = (i / 4) % width;
      const py = Math.floor((i / 4) / width);
      const absX = isect.x + px;
      const absY = isect.y + py;
      const relX = absX % scale;
      const relY = absY % scale;
      const shouldDrawPattern = getPattern(colorKey, relX, relY, center, scale);

      if (isErrorCheckMode) {
          const originalX = Math.floor(absX / scale);
          const originalY = Math.floor(absY / scale);
          const blockKey = `${originalX},${originalY}`;
          let isMatch = false;
          if (errorCache.has(blockKey)) {
              isMatch = errorCache.get(blockKey);
          } else {
              const originalIndex = (originalY * TILE_SIZE + originalX) * 4;
              const r_orig = originalTileImageData.data[originalIndex];
              const g_orig = originalTileImageData.data[originalIndex+1];
              const b_orig = originalTileImageData.data[originalIndex+2];
              isMatch = isColorSimilar(r_ov, g_ov, b_ov, r_orig, g_orig, b_orig);
              errorCache.set(blockKey, isMatch);
          }
          if (isMatch) {
              data[i+3] = 0;
              continue;
          } else {
              if (shouldDrawPattern) {
                  data[i] = r_ov; data[i+1] = g_ov; data[i+2] = b_ov; data[i+3] = 255;
              } else {
                  data[i] = 237; data[i+1] = 28; data[i+2] = 36; data[i+3] = 255;
              }
          }
      } else {
          if (shouldDrawPattern) {
              data[i] = Math.round(r_ov * colorStrength + 255 * whiteStrength);
              data[i + 1] = Math.round(g_ov * colorStrength + 255 * whiteStrength);
              data[i + 2] = Math.round(b_ov * colorStrength + 255 * whiteStrength);
              data[i + 3] = 255;
          } else {
              data[i+3] = 0;
          }
      }
    }

    const result = { imageData, dx: isect.x, dy: isect.y, scaled: true, scale };
    overlayCache.set(cacheKey, result);
    return result;
  }

  async function mergeOverlaysBehind(originalBlob, overlayDatas) {
    if (!overlayDatas || overlayDatas.length === 0) return originalBlob;
    const originalImage = await blobToImage(originalBlob);
    const w = originalImage.width, h = originalImage.height;
    const canvas = createCanvas(w, h);
    const ctx = canvas.getContext('2d');
    for (const ovd of overlayDatas) { if (!ovd) continue; ctx.putImageData(ovd.imageData, ovd.dx, ovd.dy); }
    ctx.drawImage(originalImage, 0, 0);
    return await canvasToBlob(canvas);
  }

  async function mergeOverlaysAbove(originalBlob, overlayDatas) {
    if (!overlayDatas || overlayDatas.length === 0) return originalBlob;
    const originalImage = await blobToImage(originalBlob);
    const w = originalImage.width, h = originalImage.height;
    const canvas = createCanvas(w, h);
    const ctx = canvas.getContext('2d');
    ctx.drawImage(originalImage, 0, 0);
    for (const ovd of overlayDatas) {
      if (!ovd) continue;
      const data = ovd.imageData.data;
      const ovw = ovd.imageData.width;
      for (let i = 0; i < data.length; i += 4) {
        const alpha = data[i + 3];
        if (alpha > 0) {
          const x = ovd.dx + (i / 4) % ovw;
          const y = ovd.dy + Math.floor((i / 4) / ovw);
          ctx.fillStyle = `rgba(${data[i]}, ${data[i+1]}, ${data[i+2]}, ${alpha/255})`;
          ctx.fillRect(x, y, 1, 1);
        }
      }
    }
    return await canvasToBlob(canvas);
  }

  async function composeMinifiedTile(originalBlob, overlayDatas) {
    if (!overlayDatas || overlayDatas.length === 0) return originalBlob;
    const scale = MINIFY_SCALE;
    const originalImage = await blobToImage(originalBlob);
    const w = originalImage.width, h = originalImage.height;
    const canvas = createCanvas(w * scale, h * scale);
    const ctx = canvas.getContext('2d', { willReadFrequently: true });
    ctx.imageSmoothingEnabled = false;
    ctx.drawImage(originalImage, 0, 0, w * scale, h * scale);
    for (const ovd of overlayDatas) {
      if (!ovd) continue;
      const tw = ovd.imageData.width;
      const th = ovd.imageData.height;
      if (tw === 0 || th === 0) continue;
      const temp = createCanvas(tw, th);
      const tctx = temp.getContext('2d', { willReadFrequently: true });
      tctx.putImageData(ovd.imageData, 0, 0);
      ctx.drawImage(temp, ovd.dx, ovd.dy);
    }
    return await canvasToBlob(canvas);
  }

    async function drawSelectionBoxOnBlob(blob, c1, c2) {
    if (!config.copyPreviewActive || !config.copyPointA || !config.copyPointB) return blob;
    const minX = Math.min(config.copyPointA.absX, config.copyPointB.absX);
    const minY = Math.min(config.copyPointA.absY, config.copyPointB.absY);
    const maxX = Math.max(config.copyPointA.absX, config.copyPointB.absX);
    const maxY = Math.max(config.copyPointA.absY, config.copyPointB.absY);
    const W = maxX - minX + 1;
    const H = maxY - minY + 1;
    const tileAbsX = c1 * TILE_SIZE;
    const tileAbsY = c2 * TILE_SIZE;
    const iSect = rectIntersect(minX, minY, W, H, tileAbsX, tileAbsY, TILE_SIZE, TILE_SIZE);
    if (iSect.w === 0 || iSect.h === 0) return blob;

    const originalImage = await blobToImage(blob);
    const canvas = createCanvas(originalImage.width, originalImage.height);
    const ctx = canvas.getContext('2d');
    ctx.drawImage(originalImage, 0, 0);
    const dx = iSect.x - tileAbsX;
    const dy = iSect.y - tileAbsY;
    ctx.strokeStyle = 'rgba(237, 28, 36, 0.8)';
    ctx.lineWidth = 2;
    ctx.beginPath();
    if (tileAbsY <= minY) {
        ctx.moveTo(dx, dy + 1);
        ctx.lineTo(dx + iSect.w, dy + 1);
    }
    if (tileAbsY + TILE_SIZE >= maxY) {
        ctx.moveTo(dx, dy + iSect.h - 1);
        ctx.lineTo(dx + iSect.w, dy + iSect.h - 1);
    }
    if (tileAbsX <= minX) {
        ctx.moveTo(dx + 1, dy);
        ctx.lineTo(dx + 1, dy + iSect.h);
    }
    if (tileAbsX + TILE_SIZE >= maxX) {
        ctx.moveTo(dx + iSect.w - 1, dy);
        ctx.lineTo(dx + iSect.w - 1, dy + iSect.h);
    }
    ctx.stroke();
    return canvasToBlob(canvas);
}

function showToast(message, duration = 3000) {
    let stack = document.getElementById('op-toast-stack');
    if (!stack) {
      stack = document.createElement('div');
      stack.className = 'op-toast-stack';
      stack.id = 'op-toast-stack';
      document.body.appendChild(stack);
    }
    stack.classList.toggle('op-dark', config.theme === 'dark');
    const t = document.createElement('div');
    t.className = 'op-toast';
    t.textContent = message;
    stack.appendChild(t);
    requestAnimationFrame(() => t.classList.add('show'));
    setTimeout(() => {
      t.classList.remove('show');
      setTimeout(() => t.remove(), 200);
    }, duration);
  }
  let hookInstalled = false;
  let overlayStateBeforePreview = true;

  function overlaysNeedingHook() {
    if (!config.showOverlay && !config.copyPreviewActive) return false;
    const hasImage = config.overlays.some(o => o.enabled && o.imageBase64);
    const placing  = !!config.autoCapturePixelUrl && !!config.activeOverlayId;
    const copying = !!config.isSettingCopyPoint;
    const needsHookMode = (config.overlayMode === 'behind' || config.overlayMode === 'above' || config.overlayMode === 'minify');
    return (needsHookMode && hasImage) || placing || copying || config.copyPreviewActive;
  }
  function ensureHook() { if (overlaysNeedingHook()) attachHook(); else detachHook(); }

  function attachHook() {
    if (hookInstalled) return;
    const originalFetch = NATIVE_FETCH;
    const hookedFetch = async (input, init) => {
        const urlStr = typeof input === 'string' ? input : (input && input.url) || '';
        const pixelMatch = matchPixelUrl(urlStr);
        if (pixelMatch) {
            if (config.autoCapturePixelUrl && config.activeOverlayId) {
                const ov = config.overlays.find(o => o.id === config.activeOverlayId);
                if (ov) {
                    ov.pixelUrl = pixelMatch.normalized; ov.offsetX = 0; ov.offsetY = 0;
                    await saveConfig(['overlays']); clearOverlayCache();
                    config.autoCapturePixelUrl = false; await saveConfig(['autoCapturePixelUrl']);
                    const c = extractPixelCoords(ov.pixelUrl);
                    showToast(`Ancla establecida para "${ov.name}": chunk ${c.chunk1}/${c.chunk2} en (${c.posX}, ${c.posY}).`);
                }
            }
            if (config.isSettingCopyPoint) {
                const coords = extractPixelCoords(pixelMatch.normalized);
                const point = {
                    chunk1: coords.chunk1, chunk2: coords.chunk2,
                    posX: coords.posX, posY: coords.posY,
                    absX: coords.chunk1 * TILE_SIZE + coords.posX,
                    absY: coords.chunk2 * TILE_SIZE + coords.posY,
                };
                const pointBeingSet = config.isSettingCopyPoint;
                config[pointBeingSet === 'A' ? 'copyPointA' : 'copyPointB'] = point;
                showToast(`Punto ${pointBeingSet} fijado en (${point.absX}, ${point.absY})`);
                config.isSettingCopyPoint = null;
                const keysToSave = ['copyPointA', 'copyPointB', 'isSettingCopyPoint'];
                if (config.copyPointA && config.copyPointB) {
                    config.copyPreviewActive = true;
                    keysToSave.push('copyPreviewActive');
                    overlayStateBeforePreview = config.showOverlay;
                    if (config.showOverlay) {
                        config.showOverlay = false;
                        keysToSave.push('showOverlay');
                        showToast('Área de previsualización activada. Overlay desactivado.');
                    } else {
                        showToast('Área de previsualización activada.');
                    }
                    clearOverlayCache();
                }
                await saveConfig(keysToSave);
            }
            updateUI();
            ensureHook();
            const response = await originalFetch(input, init);

            if (response.ok && config.isColorPanelVisible) {
                await updateOverlayProgress();
            }
            if (response.ok && config.showErrors) {
                try {
                    const coords = extractPixelCoords(pixelMatch.normalized);
                    if (Number.isFinite(coords.chunk1) && Number.isFinite(coords.chunk2)) {
                        const chunkId = `|${coords.chunk1}|${coords.chunk2}|`;
                        for (const key of overlayCache.keys()) {
                            if (key.includes(chunkId)) {
                                overlayCache.delete(key);
                            }
                        }
                    }
                } catch (e) {
                    console.error("Overlay Pro: Error invalidating cache after pixel placement.", e);
                }
            }
            return response;
        }

        const tileMatch = matchTileUrl(urlStr);
        if (tileMatch) {
            try {
                const response = await originalFetch(input, init);
                if (!response.ok) return response;
                const ct = (response.headers.get('Content-Type') || '').toLowerCase();
                if (!ct.includes('image')) return response;
                let originalBlob = await response.blob();
                if (originalBlob.size > 15 * 1024 * 1024) return new Response(originalBlob);
                const originalImage = await blobToImage(originalBlob);
                const tempCanvas = createCanvas(originalImage.width, originalImage.height);
                const tempCtx = tempCanvas.getContext('2d', { willReadFrequently: true });
                tempCtx.drawImage(originalImage, 0, 0);
                const originalTileImageData = tempCtx.getImageData(0, 0, originalImage.width, originalImage.height);
                tileDataCache.set(`${tileMatch.chunk1}/${tileMatch.chunk2}`, originalTileImageData);

                if (tileDataCache.size > 50) tileDataCache.delete(tileDataCache.keys().next().value);

                let finalBlob = originalBlob;
                const validModes = ['behind', 'above', 'minify'];
                const enabledOverlays = config.overlays.filter(o => o.enabled && o.imageBase64 && o.pixelUrl);

                if (config.showOverlay && enabledOverlays.length > 0 && validModes.includes(config.overlayMode)) {
                    if (config.overlayMode === 'minify') {
                        const overlayDatas = [];
                        for (const ov of enabledOverlays) {
                            overlayDatas.push(await buildOverlayDataForChunkMinify(ov, tileMatch.chunk1, tileMatch.chunk2, config.showErrors ? originalTileImageData : null));
                        }
                        finalBlob = await composeMinifiedTile(originalBlob, overlayDatas.filter(Boolean));
                    } else {
                        const overlayDatas = [];
                        for (const ov of enabledOverlays) {
                            overlayDatas.push(await buildOverlayDataForChunk(ov, tileMatch.chunk1, tileMatch.chunk2, config.showErrors ? originalTileImageData : null));
                        }
                        finalBlob = await (config.overlayMode === 'behind' ?
                            mergeOverlaysBehind(originalBlob, overlayDatas.filter(Boolean)) :
                            mergeOverlaysAbove(originalBlob, overlayDatas.filter(Boolean)));
                    }
                }
                if (config.copyPreviewActive) {
                    finalBlob = await drawSelectionBoxOnBlob(finalBlob, tileMatch.chunk1, tileMatch.chunk2);
                }
                const headers = new Headers(response.headers);
                headers.set('Content-Type', 'image/png');
                headers.delete('Content-Length');
                return new Response(finalBlob, { status: response.status, statusText: response.statusText, headers });
            } catch (e) {
                if (e.name !== 'AbortError') console.error("Overlay Pro: Error processing tile", e);
                return originalFetch(input, init);
            }
        }
        return originalFetch(input, init);
    };
    page.fetch = hookedFetch;
    window.fetch = hookedFetch;
    hookInstalled = true;
  }
  function detachHook() { if (!hookInstalled) return; page.fetch = NATIVE_FETCH; window.fetch = NATIVE_FETCH; hookInstalled = false; }

  const config = {
    overlays: [],
    activeOverlayId: null,
    overlayMode: 'minify',
    isPanelCollapsed: false,
    autoCapturePixelUrl: false,
    showOverlay: true,
    showErrors: false,
    panelX: null,
    panelY: null,
    theme: 'dark',
    activeTab: 'overlays',
    copyNudgeTarget: 'A',
    isSettingCopyPoint: null,
    copyPointA: null,
    copyPointB: null,
    copyPreviewActive: false,
    ccFreeKeys: DEFAULT_FREE_KEYS.slice(),
    ccPaidKeys: DEFAULT_PAID_KEYS.slice(),
    ccZoom: 1.0,
    ccRealtime: false,
    isColorPanelVisible: false,
    colorPanelX: null,
    colorPanelY: null,
    colorPanelAlpha: 0.0,
    panelAlpha: 0.8,
    highlightMissing: false,
    caSortEnabled: true,
    caHighlightEnabled: true,
    caIsCollapsed: false,
    caFiltersVisible: false,
    caShowColorNames: true,
    caShowProgress: true,
    caShowRemainingOnly: false,
    lastKnownColors: []
  };
  const CONFIG_KEYS = Object.keys(config);

  async function loadConfig() {
    try {
      await Promise.all(CONFIG_KEYS.map(async k => { config[k] = await gmGet(k, config[k]); }));
      if (!Array.isArray(config.ccFreeKeys) || config.ccFreeKeys.length === 0) config.ccFreeKeys = DEFAULT_FREE_KEYS.slice();
      if (!Array.isArray(config.ccPaidKeys)) config.ccPaidKeys = DEFAULT_PAID_KEYS.slice();
      if (!Number.isFinite(config.ccZoom) || config.ccZoom <= 0) config.ccZoom = 1.0;
      if (typeof config.ccRealtime !== 'boolean') config.ccRealtime = false;
        lastKnownAvailableColors = new Set(config.lastKnownColors);
    } catch (e) { console.error("Overlay Pro: Failed to load config", e); }
  }
  async function saveConfig(keys = CONFIG_KEYS) {
    try { await Promise.all(keys.map(k => gmSet(k, config[k]))); }
    catch (e) { console.error("Overlay Pro: Failed to save config", e); }
  }

function injectStyles() {
    const style = document.createElement('style');
    style.textContent = `
      body.op-theme-light {
        --op-bg: #f0f0f5; --op-border: #dcdcec; --op-muted: #6b7280; --op-text: #111827;
        --op-subtle: #ffffff; --op-btn: #eef2f7; --op-btn-border: #d8dee8; --op-btn-hover: #e7ecf5;
        --op-accent: #8A2BE2;
        --op-active-bg: #8A2BE2;
        --op-active-text: #ffffff;
        --op-neon-green: #39FF14;
      }
      body.op-theme-dark {
        --op-bg: #12121c; --op-border: #2a2a4a; --op-muted: #a0a7b4; --op-text: #f5f6f9;
        --op-subtle: #1a1a2e; --op-btn: #2a2a4a; --op-btn-border: #38385a; --op-btn-hover: #3c3c6a;
        --op-accent: #A020F0;
        --op-active-bg: #8A2BE2;
        --op-active-text: #ffffff;
        --op-neon-green: #39FF14;
      }

      .op-scroll-lock { overflow: hidden !important; }

      #overlay-pro-panel, .op-modal {
        position: fixed; z-index: 9999;
        background: rgba(var(--op-bg-rgb), var(--op-panel-alpha, 0.85));
        backdrop-filter: blur(12px) saturate(150%);
        border: 1px solid var(--op-border);
        border-radius: 16px; color: var(--op-text); font-family: Inter, system-ui, -apple-system, Segoe UI, Roboto, Helvetica, Arial, "Apple Color Emoji", "Segoe UI Emoji";
        font-size: 14px;
        box-shadow: 0 10px 30px rgba(0,0,0,0.25), 0 0 0 1px rgba(138, 43, 226, 0.2);
        user-select: none;
      }
      #overlay-pro-panel { width: 340px; }

      .op-header { display: flex; align-items: center; justify-content: space-between; padding: 10px 12px; border-bottom: 1px solid var(--op-border); cursor: grab; touch-action: none; }
      .op-header:active { cursor: grabbing; }
      .op-header h3 { margin: 0; font-size: 15px; font-weight: 600; }
      #overlay-pro-panel.collapsed .op-header { border-bottom-color: transparent; }
      .op-header-actions { display: flex; gap: 6px; }

      .op-toggle-btn, .op-hdr-btn { background: transparent; border: 1px solid var(--op-border); color: var(--op-text); border-radius: 10px; padding: 4px 8px; cursor: pointer; transition: all 0.2s ease; }
      .op-toggle-btn:hover, .op-hdr-btn:hover { background: var(--op-btn); border-color: var(--op-accent); }

      .op-content { padding: 12px; display: flex; flex-direction: column; gap: 12px; }
      .op-global-controls { display: grid; grid-template-columns: 1fr 1fr; gap: 8px; }

      .op-tabs { display: flex; border-bottom: 1px solid var(--op-border); }
      .op-tab-btn {
        flex: 1; padding: 8px 12px; background: transparent;
        border: none; border-bottom: 2px solid transparent;
        cursor: pointer; color: var(--op-muted); font-weight: 500;
        transition: color 0.2s, border-color 0.2s;
      }
      .op-tab-btn:hover { color: var(--op-accent); }
      .op-tab-btn.active { color: var(--op-text); border-bottom-color: var(--op-accent); }
      .op-tab-panes { padding: 12px 0 0 0; }
      .op-tab-pane { display: none; flex-direction: column; gap: 12px; }
      .op-tab-pane.active { display: flex; }

      .op-section {
        display: flex; flex-direction: column; gap: 8px;
        background: var(--op-subtle); border: 1px solid var(--op-border);
        border-radius: 12px; padding: 10px;
      }
      .op-row { display: flex; align-items: center; gap: 8px; }
      .op-row.space { justify-content: space-between; }
      .op-grow { flex: 1; }

      .op-button { background: var(--op-btn); color: var(--op-text); border: 1px solid var(--op-btn-border); border-radius: 10px; padding: 6px 10px; cursor: pointer; transition: all 0.2s ease; }
      .op-button:hover { background: var(--op-btn-hover); border-color: var(--op-accent); }
      .op-button:disabled { opacity: 0.5; cursor: not-allowed; }
      .op-button.icon { width: 30px; height: 30px; padding: 0; display: inline-flex; align-items: center; justify-content: center; font-size: 16px; }

      .op-input { background: var(--op-bg); border: 1px solid var(--op-border); color: var(--op-text); border-radius: 10px; padding: 8px; width: 100%; box-sizing: border-box; transition: all 0.2s ease; }

      .op-select {
        appearance: none; -webkit-appearance: none; -moz-appearance: none;
        background-color: var(--op-bg);
        border: 1px solid var(--op-border);
        color: var(--op-text);
        border-radius: 12px;
        padding: 8px 32px 8px 12px;
        width: 100%;
        cursor: pointer;
        background-image: url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='24' height='24' viewBox='0 0 24 24' fill='none' stroke='%23888888' stroke-width='2' stroke-linecap='round' stroke-linejoin='round'%3E%3Cpolyline points='6 9 12 15 18 9'%3E%3C/polyline%3E%3C/svg%3E");
        background-repeat: no-repeat;
        background-position: right 8px center;
        background-size: 16px;
        transition: all 0.2s ease;
        font-size: 13px;
      }

      .op-input:focus, .op-select:focus { outline: none; border-color: var(--op-accent); box-shadow: 0 0 0 3px color-mix(in srgb, var(--op-accent) 25%, transparent); }

      /* SLIDER STYLES */
      input[type="range"] { -webkit-appearance: none; appearance: none; width: 100%; background: transparent; cursor: pointer; }
      input[type="range"]:focus { outline: none; }
      input[type="range"]::-webkit-slider-runnable-track { height: 8px; background: linear-gradient(90deg, #ff7e5f, #8A2BE2); border-radius: 4px; }
      input[type="range"]::-moz-range-track { height: 8px; background: linear-gradient(90deg, #ff7e5f, #8A2BE2); border-radius: 4px; }
      input[type="range"]::-webkit-slider-thumb { -webkit-appearance: none; appearance: none; margin-top: -6px; height: 20px; width: 20px; background-color: #A020F0; border-radius: 50%; border: 2px solid var(--op-subtle); box-shadow: 0 0 5px #A020F0; }
      input[type="range"]::-moz-range-thumb { height: 20px; width: 20px; background-color: #A020F0; border-radius: 50%; border: 2px solid var(--op-subtle); box-shadow: 0 0 5px #A020F0; }

      .op-list { display: flex; flex-direction: column; gap: 6px; max-height: 200px; overflow-y: auto; border: 1px solid var(--op-border); padding: 6px; border-radius: 10px; background: var(--op-bg); }
      .op-item { display: flex; flex-wrap: wrap; align-items: center; gap: 6px; padding: 6px; border-radius: 8px; border: 1px solid var(--op-border); background: var(--op-subtle); }
      .op-item.active { border-color: var(--op-accent); box-shadow: 0 0 0 1px var(--op-accent); background: var(--op-bg); }
      .op-item-name { flex: 1; overflow: hidden; text-overflow: ellipsis; white-space: nowrap; cursor: pointer; }

      .op-muted { color: var(--op-muted); font-size: 12px; }

      .op-preview { width: 100%; height: 90px; background: var(--op-bg); display: flex; align-items: center; justify-content: center; border: 2px dashed var(--op-border); border-radius: 10px; overflow: hidden; position: relative; cursor: pointer; transition: all 0.2s ease; }
      .op-preview:hover, .op-preview.drop-highlight { border-color: var(--op-accent); background: color-mix(in srgb, var(--op-accent) 8%, transparent); }
      .op-preview img, .op-preview canvas { max-width: 100%; max-height: 100%; display: block; pointer-events: none; image-rendering: pixelated; }
      .op-preview .op-drop-hint { position: absolute; bottom: 6px; right: 8px; font-size: 11px; color: var(--op-muted); pointer-events: none; }

      .op-icon-btn { background: var(--op-btn); color: var(--op-text); border: 1px solid var(--op-btn-border); border-radius: 10px; width: 34px; height: 34px; display: inline-flex; align-items: center; justify-content: center; cursor: pointer; transition: all 0.2s ease; }
      .op-icon-btn:hover { background: var(--op-btn-hover); border-color: var(--op-accent); }

      .op-danger { background: var(--op-active-bg) !important; border-color: var(--op-accent) !important; color: var(--op-active-text) !important; box-shadow: 0 0 8px var(--op-accent); }
      .op-danger-text { color: #dc2626; font-weight: 600; }

      .op-toast-stack { position: fixed; bottom: 20px; left: 50%; transform: translateX(-50%); display: flex; flex-direction: column; align-items: center; gap: 8px; pointer-events: none; z-index: 999999; width: min(92vw, 480px); }
      .op-toast { background: var(--op-subtle); border: 1px solid var(--op-border); color: var(--op-text); padding: 10px 16px; border-radius: 12px; font-size: 14px; box-shadow: 0 6px 16px rgba(0,0,0,0.2); opacity: 0; transform: translateY(10px); transition: all .2s ease; max-width: 100%; text-align: center; }
      .op-toast.show { opacity: 1; transform: translateY(0); }

      .op-backdrop { position: fixed; inset: 0; z-index: 9998; background: rgba(0,0,0,0.5); backdrop-filter: blur(4px); display: none; opacity: 0; transition: opacity 0.2s ease; }
      .op-backdrop.show { display: block; opacity: 1; }
      .op-modal {
        opacity: 0; transform: translate(-50%, -45%); transition: opacity 0.2s ease, transform 0.2s ease; pointer-events: none;
      }
      .op-modal.show {
        opacity: 1; transform: translate(-50%, -50%); pointer-events: auto;
      }

      .op-cc-modal, .op-rs-modal, #op-main-settings-modal, #op-ca-settings-modal { width: min(1280px, 98vw); max-height: 92vh; left: 50%; top: 50%; display: flex; flex-direction: column; }
      #op-main-settings-modal { width: 300px; max-height: auto; padding: 12px; display: flex; flex-direction: column; gap: 12px; }
      .op-cc-header, .op-rs-header { padding: 10px 12px; border-bottom: 1px solid var(--op-border); display: flex; align-items: center; justify-content: space-between; }
      #op-ca-settings-modal { width: 280px; max-height: auto; padding: 12px; display: flex; flex-direction: column; gap: 10px; }
      .op-cc-title, .op-rs-title { font-weight: 600; }
      .op-cc-close, .op-rs-close { border: 1px solid var(--op-border); background: transparent; border-radius: 8px; padding: 4px 8px; cursor: pointer; }
      .op-cc-close:hover, .op-rs-close:hover { background: var(--op-btn); }
      .op-cc-pill { border-radius: 999px; padding: 4px 10px; border: 1px solid var(--op-border); background: var(--op-bg); }
      .op-cc-body { display: grid; grid-template-columns: 2fr 420px; grid-template-areas: "preview controls"; gap: 12px; padding: 12px; overflow: hidden; }
      @media (max-width: 860px) { .op-cc-body { grid-template-columns: 1fr; grid-template-areas: "preview" "controls"; max-height: calc(92vh - 100px); overflow: auto; } }
      .op-cc-preview-wrap { grid-area: preview; background: var(--op-bg); border: 1px solid var(--op-border); border-radius: 12px; position: relative; min-height: 320px; display: flex; align-items: center; justify-content: center; overflow: auto; }
      .op-cc-canvas { image-rendering: pixelated; }
      .op-cc-zoom { position: absolute; top: 8px; right: 8px; display: inline-flex; gap: 6px; }
      .op-cc-zoom .op-icon-btn { width: 34px; height: 34px; }
      .op-cc-controls { grid-area: controls; display: flex; flex-direction: column; gap: 12px; background: var(--op-subtle); border: 1px solid var(--op-border); border-radius: 12px; padding: 10px; overflow: auto; max-height: calc(92vh - 160px); }
      .op-cc-palette { display: flex; flex-direction: column; gap: 8px; background: var(--op-bg); border: 1px dashed var(--op-border); border-radius: 10px; padding: 8px; }
      .op-cc-grid { display: grid; grid-template-columns: repeat(auto-fill, minmax(22px, 22px)); gap: 6px; }
      .op-cc-cell { width: 22px; height: 22px; border-radius: 4px; border: 2px solid color-mix(in srgb, var(--op-border) 50%, transparent); box-shadow: 0 0 0 1px rgba(0,0,0,0.15) inset; cursor: pointer; transition: all 0.2s ease; }
      .op-cc-cell.active { outline: 2px solid var(--op-accent); border-color: var(--op-accent); }
      .op-cc-footer, .op-rs-footer { padding: 10px 12px; border-top: 1px solid var(--op-border); display: flex; align-items: center; justify-content: space-between; gap: 8px; flex-wrap: wrap; }
      .op-cc-actions { display: inline-flex; gap: 8px; }
      .op-cc-ghost { color: var(--op-muted); font-size: 12px; }
      .op-rs-modal { width: min(1200px, 96vw); max-height: 92vh; }
      .op-rs-header { padding: 10px 12px; border-bottom: 1px solid var(--op-border); display: flex; align-items: center; justify-content: space-between; }
      .op-rs-title { font-weight: 600; }
      .op-rs-tabs { display: flex; gap: 6px; padding: 8px 12px 0 12px; }
      .op-rs-tab-btn { background: var(--op-btn); color: var(--op-text); border: 1px solid var(--op-btn-border); border-radius: 10px; padding: 6px 10px; cursor: pointer; }
      .op-rs-tab-btn.active { outline: 2px solid var(--op-accent); background: var(--op-btn-hover); }
      .op-rs-body { padding: 12px; display: grid; grid-template-columns: 1fr; gap: 10px; overflow: auto; }
      .op-rs-pane { display: none; }
      .op-rs-pane.show { display: block; }
      .op-rs-preview-wrap { background: var(--op-subtle); border: 1px solid var(--op-border); border-radius: 12px; position: relative; height: clamp(260px, 36vh, 540px); display: flex; align-items: center; justify-content: center; overflow: hidden; }
      .op-rs-canvas { image-rendering: pixelated; }
      .op-rs-zoom { position: absolute; top: 8px; right: 8px; display: inline-flex; gap: 6px; }
      .op-rs-grid-note { color: var(--op-muted); font-size: 12px; }
      .op-rs-mini { width: 96px; }
      .op-rs-dual { display: grid; grid-template-columns: 1fr 1fr; gap: 8px; width: 100%; height: 100%; padding: 8px; box-sizing: border-box; }
      .op-rs-col { position: relative; background: var(--op-bg); border: 1px dashed var(--op-border); border-radius: 10px; display: flex; flex-direction: column; align-items: center; justify-content: flex-start; overflow: hidden; }
      .op-rs-col .label { position: absolute; top: 2px; left: 0; right: 0; text-align: center; font-size: 12px; color: var(--op-muted); pointer-events: none; }
      .op-rs-col .pad-top { height: 18px; width: 100%; flex: 0 0 auto; }
      .op-rs-thumb { width: 100%; height: calc(100% - 18px); display: block; }
      .op-pan-grab { cursor: grab; }
      .op-pan-grabbing { cursor: grabbing; }

      .op-settings-row {
        display: flex;
        justify-content: space-between;
        align-items: center;
      }

      #op-color-analysis-panel {
        position: fixed; z-index: 9998; width: 280px; max-height: 75vh;
        background: rgba(var(--op-bg-rgb), 0.9); backdrop-filter: blur(12px) saturate(150%);
        border: 1px solid var(--op-border); border-radius: 14px; color: var(--op-text);
        font-family: Inter, system-ui, -apple-system, Segoe UI, Roboto, Helvetica, Arial, "Apple Color Emoji", "Segoe UI Emoji";
        font-size: 13px; box-shadow: 0 10px 25px rgba(0,0,0,0.15), 0 0 0 1px rgba(138, 43, 226, 0.2);
        display: flex; flex-direction: column; transition: opacity 0.2s ease, transform 0.2s ease, max-height 0.3s ease;
        transform: scale(0.95); opacity: 0; pointer-events: none; user-select: none;
      }
      #op-color-analysis-panel.filters-open {
          max-height: 95vh;
      }
      #op-color-analysis-panel.show { transform: scale(1); opacity: 1; pointer-events: auto; }
      .op-ca-header {
        padding: 8px 10px; font-weight: 600;
        border-bottom: 1px solid var(--op-border); flex-shrink: 0;
        display: flex; justify-content: space-between; align-items: center; cursor: grab;
        touch-action: none;
      }
      .op-ca-header:active { cursor: grabbing; }

      #op-color-analysis-panel.collapsed .op-ca-header { border-bottom-color: transparent; }
      .op-ca-settings-wrap { position: relative; display: flex; gap: 4px; }
      .op-ca-settings-btn {
        background: transparent; border: none; font-size: 16px; cursor: pointer;
        padding: 5px; border-radius: 8px; line-height: 1; opacity: 0.7;
        transition: all 0.2s;
      }
      .op-ca-settings-btn:hover { opacity: 1; background: var(--op-btn-hover); }
      .op-ca-settings-btn.active { background: var(--op-accent) !important; color: white !important; opacity: 1; }
      .op-ca-settings-popup {
        position: absolute; top: calc(100% + 8px); right: 0; transform-origin: top right;
        width: 200px; background: var(--op-bg); border: 1px solid var(--op-border);
        padding: 12px; border-radius: 10px; box-shadow: 0 5px 15px rgba(0,0,0,0.15);
        display: none; flex-direction: column; gap: 8px; z-index: 10;
      }
      .op-ca-settings-popup.show { display: flex; }
      .op-ca-settings-popup label { font-size: 13px; font-weight: 500; }
      .op-ca-settings-popup input[type="range"] { margin-top: 4px; }

      .op-ca-list {
        padding: 8px; overflow-y: auto; display: flex; flex-direction: column;
        gap: 6px; flex-grow: 1; flex-shrink: 1; min-height: 0;
        transition: all 0.3s ease-in-out;
      }
      .op-ca-item {
        display: grid; grid-template-columns: auto auto 1fr auto; align-items: center;
        gap: 8px; padding: 5px 8px;
        background: color-mix(in srgb, var(--op-btn) 50%, transparent); border-radius: 8px;
        border-left: 3px solid transparent; transition: all 0.2s ease;
      }
      body.ca-hide-names .op-ca-name {
          display: none;
      }
      .op-ca-swatch { width: 18px; height: 18px; border-radius: 5px; border: 1px solid var(--op-border); flex-shrink: 0; }
      .op-ca-name { white-space: nowrap; overflow: hidden; text-overflow: ellipsis; font-weight: 500;}
      .op-ca-count { font-weight: 500; font-size: 12px; background: var(--op-subtle); padding: 3px 8px; border-radius: 6px; text-align: right; transition: all 0.2s ease; }
      .op-ca-count.completed { color: var(--op-neon-green); background: color-mix(in srgb, var(--op-neon-green) 15%, transparent); }

      .op-ca-footer {
        border-top: 1px solid var(--op-border); padding: 10px 12px; flex-shrink: 0;
        display: flex; flex-direction: column; gap: 8px;
      }
      .op-ca-total-progress { display: flex; justify-content: space-between; align-items: center; font-weight: 600; font-size: 14px; }
      .op-ca-main-actions { display: flex; gap: 8px; width: 100%; }
      .op-ca-main-actions .op-button { flex: 1; }
      .op-ca-filters-pane {
          max-height: 0;
          overflow: hidden;
          transition: max-height 0.3s ease-in-out, padding 0.3s ease-in-out, margin 0.3s ease-in-out;
          padding: 0 4px; margin: 0;
          border-top: 1px solid transparent;
          display: flex; flex-direction: column; gap: 10px;
          flex-shrink: 0;
      }
      .op-ca-filters-pane.show {
          max-height: 500px;
          margin-top: 10px;
          padding-top: 10px;
          border-top-color: var(--op-border);
      }
      .op-ca-filter-actions { display: grid; grid-template-columns: 1fr 1fr; gap: 6px; }
      .op-ca-controls { display: flex; flex-direction: column; gap: 8px; }
      .op-ca-control-row { display: flex; justify-content: space-between; align-items: center; }
      .op-ca-control-row label { font-size: 13px; font-weight: 500; }
      .op-switch {
        position: relative; display: inline-block; width: 40px; height: 22px;
        background-color: var(--op-btn); border: 1px solid var(--op-border);
        border-radius: 22px; cursor: pointer; transition: all 0.3s ease;
      }
      .op-switch::before {
        content: ''; position: absolute; width: 16px; height: 16px;
        border-radius: 50%; top: 2px; left: 2px;
        background-color: var(--op-muted); transition: all 0.3s ease;
      }
      .op-switch.active { background-color: var(--op-accent); box-shadow: 0 0 8px var(--op-accent); }
      .op-switch.active::before { transform: translateX(18px); background-color: white; }
      .op-ca-item.available {
        background: linear-gradient(90deg, color-mix(in srgb, var(--op-accent) 25%, transparent) 0%, transparent 100%);
        border-color: var(--op-accent);
        box-shadow: 0 0 8px color-mix(in srgb, var(--op-accent) 50%, transparent);
      }
      .op-donation-section {
        margin-top: 15px;
        padding-top: 10px;
        border-top: 1px solid var(--op-border);
        text-align: center;
        font-size: 12px;
        color: var(--op-muted);
      }
      .op-donation-section p {
        margin: 0 0 8px 0;
      }
      .op-donation-info {
        display: flex;
        justify-content: space-between;
        align-items: center;
        padding: 4px 8px;
        background: var(--op-subtle);
        border-radius: 6px;
        margin-top: 4px;
      }
      .op-donation-info code {
        font-family: monospace;
        font-weight: bold;
        color: var(--op-text);
        user-select: all;
        background: var(--op-bg);
        padding: 2px 6px;
        border-radius: 4px;
      }
      .op-show-donators {
        width: 100%;
        margin-top: 10px;
      }
      .op-donators-list-wrap {
        max-height: 0;
        overflow: hidden;
        transition: max-height 0.3s ease-in-out;
      }
      .op-donators-list-wrap.show {
        max-height: 150px; /* Altura máxima para la lista */
      }
      .op-donators-list {
        list-style: none;
        padding: 8px 0 0 0;
        margin: 0;
        max-height: 140px;
        overflow-y: auto;
        border-top: 1px solid var(--op-border);
        margin-top: 8px;
      }
      .op-donator-item, .op-donator-item-empty {
        display: flex;
        justify-content: space-between;
        padding: 5px 8px;
        border-radius: 4px;
      }
      .op-donator-item:nth-child(odd) {
        background: var(--op-subtle);
      }
      .op-donator-item-empty {
        justify-content: center;
        font-style: italic;
      }
      .op-donator-contribution {
        font-weight: bold;
        color: var(--op-accent);
      }
      @media (max-width: 480px) {
       #op-color-analysis-panel {
       width: 90vw;
       max-width: 280px;
       left: auto;
       right: 5vw;
      }
     }
`;
    document.head.appendChild(style);
}

  function createUI() {
    if (document.getElementById('overlay-pro-panel')) return;
    const panel = document.createElement('div');
    panel.id = 'overlay-pro-panel';

    const panelW = 340;
    const defaultLeft = Math.max(12, window.innerWidth - panelW - 80);
    panel.style.left = (Number.isFinite(config.panelX) ? config.panelX : defaultLeft) + 'px';
    panel.style.top = (Number.isFinite(config.panelY) ? config.panelY : 120) + 'px';

panel.innerHTML = `
  <div class="op-header" id="op-header">
    <h3>VoX - Overlay Pro<span style="font-size: 13px; color: var(--op-muted); font-weight: 500; margin-left: 8px;">-_-/</span></h3>
    <div class="op-header-actions">
        <button class="op-hdr-btn" id="op-main-settings-btn" title="Ajustes">⚙️</button>
        <button class="op-toggle-btn" id="op-panel-toggle" title="Plegar/Desplegar">▾</button>
    </div>
  </div>
      <div class="op-content" id="op-content">
        <div class="op-global-controls">
            <button class="op-button" id="op-show-overlay-toggle">Overlay: ON</button>
            <button class="op-button" id="op-mode-toggle">Mode: Minify</button>
            <button class="op-button" id="op-show-errors-toggle">Show Errors: OFF</button>
            <button class="op-button" id="op-autocap-toggle">Set Position: OFF</button>

        </div>

        <div class="op-tabs">
            <button class="op-tab-btn active" data-tab="overlays">Overlays</button>
            <button class="op-tab-btn" data-tab="editor">Editor</button>
            <button class="op-tab-btn" data-tab="tools">Herramientas</button>
        </div>

        <div class="op-tab-panes op-section" style="padding-top: 12px; border-top-left-radius: 0;">
            <div class="op-tab-pane active" data-pane="overlays">
                <div class="op-row space">
                    <button class="op-button" id="op-add-overlay" title="Crear una nueva superposición">+ Add</button>
                    <button class="op-button" id="op-import-overlay" title="Importar superposición desde JSON">Import</button>
                    <button class="op-button" id="op-export-overlay" title="Exportar superposición activa a JSON">Export</button>
                </div>
                <div class="op-list" id="op-overlay-list"></div>
                            <div id="op-list-preview-area" style="display: none; margin-top: 8px;">
                <div id="op-list-preview-content" class="op-preview" style="height: 140px; cursor: default;">
                    <img id="op-list-preview-img" alt="Preview">
                </div>
            </div>
            </div>

            <div class="op-tab-pane" data-pane="editor">
                <div id="op-editor-placeholder" class="op-muted" style="text-align:center; padding: 20px;">
                    Selecciona un overlay para editarlo.
                </div>
                <div id="op-editor-content" style="display:none; flex-direction:column; gap: 12px;">
                    <div>
                        <div class="op-row">
                            <label style="width: 60px;">Nombre</label>
                            <input type="text" class="op-input op-grow" id="op-name">
                        </div>
                    </div>
                    <div>
                        <div class="op-row">
                            <label style="width: 60px;">Modo</label>
                            <select class="op-select op-grow" id="op-color-mode" title="Elige cómo se procesan los colores.">
                                <option value="perceptual">Natural (Recomendado para Fotos)</option>
                                <option value="euclidean">Vibrante (Logos y Neón)</option>
                                <option value="hsv">PESADO!💀(Prioridad Color/Anime)</option>
                            </select>
                        </div>
                    </div>
                    <div>
                        <div id="op-image-source">
                            <div class="op-row">
                                <label style="width: 60px;">Imagen</label>
                                <input type="text" class="op-input op-grow" id="op-image-url" placeholder="Pega un enlace de imagen">
                                <button class="op-button" id="op-fetch">Cargar</button>
                            </div>
                            <div class="op-preview" id="op-dropzone" style="margin-top:8px;">
                                <div class="op-drop-hint">Arrastra aquí o haz clic para buscar.</div>
                                <input type="file" id="op-file-input" accept="image/*" style="display:none">
                            </div>
                        </div>
                        <div class="op-preview" id="op-preview-wrap" style="display:none;">
                            <img id="op-image-preview" alt="No image">
                        </div>
                        <div class="op-row" id="op-cc-btn-row" style="display:none; justify-content:space-around; gap:8px; flex-wrap:wrap; margin-top:8px;">
                            <button class="op-button" id="op-download-overlay" title="Download Image">Save 💾</button>
                            <button class="op-button" id="op-open-resize" title="Resize">Resize</button>
                            <button class="op-button" id="op-open-cc" title="Color Tool">Color Tools</button>
                        </div>
                    </div>
                    <div>
                      <div class="op-row"><span class="op-muted" id="op-coord-display"></span></div>
                      <div class="op-row" style="width: 100%; gap: 12px; padding: 6px 0;">
                        <label style="width: 60px;">Opacidad</label>
                        <input type="range" min="0" max="1" step="0.05" class="op-slider op-grow" id="op-opacity-slider">
                        <span id="op-opacity-value" style="width: 36px; text-align: right;">100%</span>
                      </div>
                    </div>
                    <div>
                        <div class="op-row space">
                         <span class="op-muted" id="op-offset-indicator">Offset X 0, Y 0</span>
                          <div class="op-nudge-controls" style="text-align: right;">
                            <button class="op-icon-btn" id="op-nudge-left" title="Izquierda">←</button>
                            <button class="op-icon-btn" id="op-nudge-down" title="Abajo">↓</button>
                            <button class="op-icon-btn" id="op-nudge-up" title="Arriba">↑</button>
                           <button class="op-icon-btn" id="op-nudge-right" title="Derecha">→</button>
                        </div>
                      </div>
                    </div>
                </div>
            </div>

            <div class="op-tab-pane" data-pane="tools">
                <div>
                    <span style="font-weight:600; text-align:center; margin-bottom: 8px;">Copiar Lienzo</span>
                    <div class="op-row space">
                        <button class="op-button" id="op-copy-set-a">Fijar Punto A</button>
                        <span class="op-muted" id="op-copy-a-coords">No fijado</span>
                    </div>
                    <div class="op-row space">
                        <button class="op-button" id="op-copy-set-b">Fijar Punto B</button>
                        <span class="op-muted" id="op-copy-b-coords">No fijado</span>
                    </div>
                    <div class="op-row space" style="margin-top: 8px;">
                        <span id="op-copy-info" class="op-muted" style="text-align:center; width:100%;"></span>
                    </div>
                     <div class="op-section" style="margin-top: 8px;">
                         <div class="op-row space">
                             <span>Ajuste Fino:</span>
                             <div class="op-row">
                                <input type="radio" id="op-nudge-target-a" name="op-nudge-target" value="A" checked>
                                <label for="op-nudge-target-a">Punto A</label>
                                <input type="radio" id="op-nudge-target-b" name="op-nudge-target" value="B">
                                <label for="op-nudge-target-b">Punto B</label>
                             </div>
                         </div>
                         <div class="op-nudge-controls" style="text-align: right;">
                            <button class="op-icon-btn" id="op-nudge-copy-left" title="Izquierda">←</button>
                            <button class="op-icon-btn" id="op-nudge-copy-down" title="Abajo">↓</button>
                            <button class="op-icon-btn" id="op-nudge-copy-up" title="Arriba">↑</button>
                            <button class="op-icon-btn" id="op-nudge-copy-right" title="Derecha">→</button>
                         </div>
                    </div>
                    <div class="op-row space" style="margin-top: 4px;">
                        <button class="op-button" id="op-copy-preview-toggle" style="flex:1;">Visualizar Área</button>
                        <button class="op-button" id="op-copy-create" style="flex:1;" title="Detecta y descarga una imagen del área seleccionada.">Detectar y Descargar</button>
                    </div>
                </div>

                <div id="op-color-analysis-section" class="op-section" style="margin-top: 12px; padding: 12px; align-items: center;">
                    <button class="op-button" id="op-analyze-colors-btn" style="width: 100%;">Mostrar Progreso del Overlay</button>
                </div>

            </div>
        </div>
      </div>
    `;

    document.body.appendChild(panel);

    const settingsModal = document.createElement('div');
    settingsModal.id = 'op-main-settings-modal';
    settingsModal.className = 'op-modal';
    settingsModal.innerHTML = `
        <h3>Ajustes Generales</h3>
        <div class="op-settings-row">
            <span>Tema de la Interfaz</span>
            <button class="op-button" id="op-theme-toggle">Claro / Oscuro</button>
        </div>
        <div class="op-settings-row">
            <label>Transparencia del Panel</label>
        </div>
        <input type="range" id="op-panel-alpha-slider" min="0.4" max="1" step="0.05">
        <div class="op-donation-section">
            <p>Este proyecto es gratuito, pero agradecería una donación para apoyar el desarrollo ❤️</p>
            <div class="op-donation-info">
                <span>Binance ID:</span>
                <code>851390091</code>
            </div>
            <div class="op-donation-info">
                <span>PayPal:</span>
                <code>@srcratier</code>
            </div>
        </div>
         <button class="op-button op-show-donators">❤️ Ver Agradecimientos</button>
         <div class="op-donators-list-wrap"></div>
    `;
    document.body.appendChild(settingsModal);

    const backdrop = document.createElement('div');
    backdrop.id = 'op-main-settings-backdrop';
    backdrop.className = 'op-backdrop';
    document.body.appendChild(backdrop);

    const colorAnalysisPanel = document.createElement('div');
        colorAnalysisPanel.id = 'op-color-analysis-panel';
    colorAnalysisPanel.innerHTML = `
    <div class="op-ca-header" id="op-ca-header-drag">
        <span>Progreso de Colores</span>
        <div class="op-ca-settings-wrap">
            <button class="op-ca-settings-btn" id="op-ca-settings-btn" title="Ajustes de Progreso">⚙️</button>
            <button class="op-ca-settings-btn" id="op-ca-toggle-collapse" title="Plegar/Desplegar" style="margin-left: 5px;">▾</button>
        </div>
    </div>
    <div class="op-ca-list" id="op-ca-list-content">
        <span class="op-muted" style="text-align: center; padding: 20px 0;">Selecciona un overlay y haz clic en "Mostrar Progreso".</span>
    </div>
    <div class="op-ca-footer" id="op-ca-footer">
        <div class="op-ca-total-progress">
            <span>Progreso Total:</span>
            <span id="op-ca-total-percentage">0%</span>
        </div>
        <div class="op-ca-main-actions">
            <button class="op-button" id="op-ca-apply-filter">Apply</button>
            <button class="op-button" id="op-ca-toggle-filters">⚙️ Filtros</button>
        </div>
    </div>
    <div class="op-ca-filters-pane" id="op-ca-filters-pane">
        <div class="op-ca-filter-actions">
            <button class="op-button" id="op-ca-mark-available">Disponibles</button>
            <button class="op-button" id="op-ca-mark-all">Marcar todo</button>
            <button class="op-button" id="op-ca-mark-none">Desmarcar</button>
            <button class="op-button" id="op-ca-show-all">Restaurar</button>
        </div>
        <div class="op-ca-controls">
            <div class="op-ca-control-row">
                <label>Mostrar nombres</label>
                <div class="op-switch" id="op-ca-show-names-toggle"></div>
            </div>
            <div class="op-ca-control-row">
                <label>Mostrar progreso</label>
                <div class="op-switch" id="op-ca-show-progress-toggle"></div>
            </div>
            <div class="op-ca-control-row">
                <label>Solo faltantes</label>
                <div class="op-switch" id="op-ca-show-remaining-toggle"></div>
            </div>
        </div>
    </div>
`;
    document.body.appendChild(colorAnalysisPanel);

    const caSettingsModal = document.createElement('div');
    caSettingsModal.id = 'op-ca-settings-modal';
    caSettingsModal.className = 'op-modal';
    caSettingsModal.innerHTML = `
        <h3>Ajustes de Progreso</h3>
        <div class="op-ca-controls" style="display: flex; flex-direction: column; gap: 12px;">
            <div class="op-ca-control-row">
                <label>Ordenar por cantidad</label>
                <div class="op-switch" id="op-ca-sort-toggle"></div>
            </div>

        </div>
        <hr style="border-color: var(--op-border); margin: 12px 0;">
        <label>Transparencia del Panel</label>
        <input type="range" id="op-ca-alpha-slider" min="0.2" max="1" step="0.05">
        <div class="op-donation-section">
            <p>Este proyecto es gratuito, pero agradecería una donación para apoyar el proyecto ❤️</p>
            <div class="op-donation-info">
                <span>Binance ID:</span>
                <code>851390091</code>
            </div>
            <div class="op-donation-info">
                <span>PayPal:</span>
                <code>@srcratier</code>
            </div>
        </div>
         <button class="op-button op-show-donators">❤️ Ver Agradecimientos</button>
         <div class="op-donators-list-wrap"></div>
    `;
    document.body.appendChild(caSettingsModal);

    const caBackdrop = document.createElement('div');
    caBackdrop.id = 'op-ca-settings-backdrop';
    caBackdrop.className = 'op-backdrop';
    document.body.appendChild(caBackdrop);

    buildCCModal();
    buildRSModal();
    addEventListeners();
    enableDrag(panel, '#op-header', 'panelX', 'panelY');
    enableDrag(colorAnalysisPanel, '#op-ca-header-drag', 'colorPanelX', 'colorPanelY');
    updateUI();
  }

  function getActiveOverlay() { return config.overlays.find(o => o.id === config.activeOverlayId) || null; }

function rebuildOverlayListUI() {
  const list = document.getElementById('op-overlay-list');
  if (!list) return;

  list.innerHTML = '';

  for (const ov of config.overlays) {
    const item = document.createElement('div');
    const isActive = ov.id === config.activeOverlayId;
    item.className = 'op-item' + (isActive ? ' active' : '');
    const localTag = ov.isLocal ? ' (local)' : (!ov.imageBase64 ? ' (sin imagen)' : '');
    const title = (ov.name || '(sin nombre)') + localTag;

    item.innerHTML = `
      <div class="op-row" style="width:100%;">
        <input type="radio" name="op-active" ${isActive ? 'checked' : ''} title="Establecer como activa"/>
        <input type="checkbox" ${ov.enabled ? 'checked' : ''} title="Activar/Desactivar"/>
        <div class="op-item-name" title="${title}">${title}</div>
        <button class="op-icon-btn" title="Eliminar superposición">🗑️</button>
      </div>
    `;

    const [radio, checkbox, nameDiv, trashBtn] = item.querySelector('.op-row').children;

    const selectThisOverlay = async () => {
        if (config.activeOverlayId !== ov.id) {
            config.activeOverlayId = ov.id;
            await saveConfig(['activeOverlayId']);
            updateUI();
            if (config.isColorPanelVisible) {
                await updateOverlayProgress();
            }
        }
    };

    nameDiv.addEventListener('click', selectThisOverlay);
    radio.addEventListener('change', selectThisOverlay);

    checkbox.addEventListener('change', () => { ov.enabled = checkbox.checked; saveConfig(['overlays']); clearOverlayCache(); ensureHook(); });

    trashBtn.addEventListener('click', async (e) => {
      e.stopPropagation();
      if (!confirm(`¿Eliminar la superposición "${ov.name || '(sin nombre)'}"?`)) return;
      const idx = config.overlays.findIndex(o => o.id === ov.id);
      if (idx >= 0) {
        config.overlays.splice(idx, 1);
        if (config.activeOverlayId === ov.id) {
            config.activeOverlayId = config.overlays[0]?.id || null;
            if (config.isColorPanelVisible) {
                await updateOverlayProgress();
            }
        }
        await saveConfig(['overlays', 'activeOverlayId']);
        clearOverlayCache(); ensureHook(); updateUI();
      }
    });

    list.appendChild(item);
  }
}
  async function addBlankOverlay() {
    const name = uniqueName('Overlay');
    const ov = { id: uid(), name, enabled: true, imageUrl: null, imageBase64: null, isLocal: false, pixelUrl: null, offsetX: 0, offsetY: 0, opacity: 1.0 };
    config.overlays.push(ov);
    config.activeOverlayId = ov.id;
    await saveConfig(['overlays', 'activeOverlayId']);
    clearOverlayCache(); ensureHook(); updateUI();
    return ov;
  }

async function processImageToPalette(base64, mode = 'perceptual') {
    const img = await loadImage(base64);
    const canvas = document.createElement('canvas');
    canvas.width = img.width;
    canvas.height = img.height;
    const ctx = canvas.getContext('2d');
    ctx.drawImage(img, 0, 0);
    const imageData = ctx.getImageData(0, 0, canvas.width, canvas.height);
    const data = imageData.data;
    const palette = [...WPLACE_FREE, ...WPLACE_PAID];

    const rgbToHsv = (r, g, b) => {
        r /= 255; g /= 255; b /= 255;
        const max = (r > g && r > b) ? r : (g > b) ? g : b;
        const min = (r < g && r < b) ? r : (g < b) ? g : b;
        let h, s, v = max;
        const d = max - min;
        s = max === 0 ? 0 : d / max;
        if (max === min) h = 0;
        else {
            switch (max) {
                case r: h = (g - b) / d + (g < b ? 6 : 0); break;
                case g: h = (b - r) / d + 2; break;
                case b: h = (r - g) / d + 4; break;
            }
            h /= 6;
        }
        return [h, s, v];
    };

    const paletteHSV = (mode === 'hsv') ? palette.map(c => {
        const [h, s, v] = rgbToHsv(c[0], c[1], c[2]);
        return { rgb: c, h, s, v };
    }) : null;

    const CHUNK_SIZE = 40000;

    for (let i = 0; i < data.length; i += 4) {

      if (i % (CHUNK_SIZE * 4) === 0) await new Promise(r => setTimeout(r, 0));

      if (data[i + 3] < 128) { data[i+3] = 0; continue; }

      const r = data[i], g = data[i+1], b = data[i+2];
      let best = palette[0], min = Infinity;

      if (mode === 'hsv') {
          const [h1, s1, v1] = rgbToHsv(r, g, b);

          for (let j = 0; j < paletteHSV.length; j++) {
              const p = paletteHSV[j];
              let dh = Math.abs(h1 - p.h);
              if (dh > 0.5) dh = 1 - dh;

              const dist = (dh * 4) ** 2 + (Math.abs(s1 - p.s) * 2) ** 2 + (Math.abs(v1 - p.v) * 1) ** 2;
              if (dist < min) { min = dist; best = p.rgb; }
          }
      } else {

          for (let j = 0; j < palette.length; j++) {
              const [pr, pg, pb] = palette[j];
              let dist;
              if (mode === 'euclidean') {
                  const dr = r - pr, dg = g - pg, db = b - pb;
                  dist = dr * dr + dg * dg + db * db;
              } else {
                  const rmean = (r + pr) >> 1;
                  const dr = r - pr, dg = g - pg, db = b - pb;
                  dist = (((512 + rmean) * dr * dr) >> 8) + 4 * dg * dg + (((767 - rmean) * db * db) >> 8);
              }
              if (dist < min) { min = dist; best = palette[j]; }
          }
      }
      data[i] = best[0]; data[i+1] = best[1]; data[i+2] = best[2]; data[i+3] = 255;
    }
    ctx.putImageData(imageData, 0, 0);
    return canvas.toDataURL('image/png');
  }

  async function setOverlayImageFromURL(ov, url) {
    const mode = document.getElementById('op-color-mode').value;
    showToast(`Procesando (${mode === 'euclidean' ? 'Matemático' : 'Natural'})...`);

    const rawBase64 = await urlToDataURL(url);
    const processedBase64 = await processImageToPalette(rawBase64, mode);

    ov.imageUrl = url;
    ov.imageBase64 = processedBase64;
    ov.isLocal = false;

    ov.filterActive = false;
    ov.savedFilters = [];

    await saveConfig(['overlays']); clearOverlayCache();
    config.autoCapturePixelUrl = true; await saveConfig(['autoCapturePixelUrl']);
    ensureHook(); updateUI();

    document.getElementById('op-color-mode').value = 'perceptual';

    showToast(`Imagen procesada y cargada. Haz clic para establecer el ancla.`);
  }

async function setOverlayImageFromFile(ov, file) {
    if (!file || !file.type || !file.type.startsWith('image/')) { alert('Por favor, elige un archivo de imagen.'); return; }
    if (!confirm('¡Los PNG locales no se pueden exportar/compartir! ¿Estás seguro?')) return;

    const mode = document.getElementById('op-color-mode').value;
    showToast(`Procesando local (${mode === 'euclidean' ? 'Matemático' : 'Natural'})...`);

    const rawBase64 = await fileToDataURL(file);
    const processedBase64 = await processImageToPalette(rawBase64, mode);

    ov.imageBase64 = processedBase64;
    ov.imageUrl = null;
    ov.isLocal = true;

    ov.filterActive = false;
    ov.savedFilters = [];

    await saveConfig(['overlays']); clearOverlayCache();
    config.autoCapturePixelUrl = true; await saveConfig(['autoCapturePixelUrl']);
    ensureHook(); updateUI();

    document.getElementById('op-color-mode').value = 'perceptual';

    showToast(`Imagen local procesada. Haz clic para establecer el ancla.`);
  }

  async function importOverlayFromJSON(jsonText) {
    let obj; try { obj = JSON.parse(jsonText); } catch { alert('JSON inválido'); return; }
    const arr = Array.isArray(obj) ? obj : [obj];
    let imported = 0, failed = 0;
    for (const item of arr) {
      const name = uniqueName(item.name || 'Overlay Importado');
      const imageUrl = item.imageUrl;
      const pixelUrl = item.pixelUrl ?? null;
      const offsetX = Number.isFinite(item.offsetX) ? item.offsetX : 0;
      const offsetY = Number.isFinite(item.offsetY) ? item.offsetY : 0;
      const opacity = Number.isFinite(item.opacity) ? item.opacity : 1.0;
      if (!imageUrl) { failed++; continue; }
      try {
        const base64 = await urlToDataURL(imageUrl);
        const ov = { id: uid(), name, enabled: true, imageUrl, imageBase64: base64, isLocal: false, pixelUrl, offsetX, offsetY, opacity };
        config.overlays.push(ov); imported++;
      } catch (e) { console.error('Importación fallida para', imageUrl, e); failed++; }
    }
    if (imported > 0) {
      config.activeOverlayId = config.overlays[config.overlays.length - 1].id;
      await saveConfig(['overlays', 'activeOverlayId']); clearOverlayCache(); ensureHook(); updateUI();
    }
    alert(`Importación finalizada. Importados: ${imported}${failed ? `, Fallidos: ${failed}` : ''}`);
  }

  function exportActiveOverlayToClipboard() {
    const ov = getActiveOverlay();
    if (!ov) { alert('No hay ninguna superposición activa seleccionada.'); return; }
    if (ov.isLocal || !ov.imageUrl) { alert('Esta superposición usa una imagen local y no se puede exportar. Por favor, aloja la imagen en línea y establece una URL.'); return; }
    const payload = { version: 1, name: ov.name, imageUrl: ov.imageUrl, pixelUrl: ov.pixelUrl ?? null, offsetX: ov.offsetX, offsetY: ov.offsetY, opacity: ov.opacity };
    const text = JSON.stringify(payload, null, 2);
    copyText(text).then(() => alert('¡JSON de la superposición copiado al portapapeles!')).catch(() => { prompt('Copia el siguiente JSON:', text); });
  }
  function copyText(text) { if (navigator.clipboard && navigator.clipboard.writeText) return navigator.clipboard.writeText(text); return Promise.reject(new Error('Clipboard API not available')); }

  async function createCanvasCopy() {
    const { copyPointA: pA, copyPointB: pB } = config;
    if (!pA || !pB) {
        showToast('Debes fijar los puntos A y B primero.');
        return;
    }

    if (config.showOverlay && config.overlayMode !== 'original') {
        showToast('Aviso: Se está copiando el lienzo original sin la superposición.', 4000);
    }

    const minX = Math.min(pA.absX, pB.absX);
    const minY = Math.min(pA.absY, pB.absY);
    const maxX = Math.max(pA.absX, pB.absX);
    const maxY = Math.max(pA.absY, pB.absY);

    const W = maxX - minX + 1;
    const H = maxY - minY + 1;

    if (W > 50000 || H > 50000) {
        showToast(`El área es demasiado grande (${W}x${H}). El máximo es 50000px por lado.`);
        return;
    }

    const startChunk1 = Math.floor(minX / TILE_SIZE);
    const endChunk1 = Math.floor(maxX / TILE_SIZE);
    const startChunk2 = Math.floor(minY / TILE_SIZE);
    const endChunk2 = Math.floor(maxY / TILE_SIZE);

    const missingTiles = [];
    for (let c1 = startChunk1; c1 <= endChunk1; c1++) {
        for (let c2 = startChunk2; c2 <= endChunk2; c2++) {
            if (!tileDataCache.has(`${c1}/${c2}`)) {
                missingTiles.push(`${c1}/${c2}`);
            }
        }
    }

    if (missingTiles.length > 0) {
        showToast(`Área incompleta. Por favor, mueva el mapa sobre toda la zona seleccionada para que se carguen los datos y vuelva a intentarlo.`);
        console.log("Faltan los siguientes tiles:", missingTiles);
        return;
    }

    showToast(`Copiando ${W}x${H}px...`);

    const canvas = createHTMLCanvas(W, H);
    const ctx = canvas.getContext('2d');

    for (let c1 = startChunk1; c1 <= endChunk1; c1++) {
        for (let c2 = startChunk2; c2 <= endChunk2; c2++) {
            const tileImageData = tileDataCache.get(`${c1}/${c2}`);
            if (!tileImageData) continue;

            const tempTileCanvas = createCanvas(TILE_SIZE, TILE_SIZE);
            tempTileCanvas.getContext('2d').putImageData(tileImageData, 0, 0);

            const tileAbsX = c1 * TILE_SIZE;
            const tileAbsY = c2 * TILE_SIZE;
            const iSect = rectIntersect(minX, minY, W, H, tileAbsX, tileAbsY, TILE_SIZE, TILE_SIZE);

            if (iSect.w > 0 && iSect.h > 0) {
                const sx = iSect.x - tileAbsX;
                const sy = iSect.y - tileAbsY;
                const dx = iSect.x - minX;
                const dy = iSect.y - minY;
                ctx.drawImage(tempTileCanvas, sx, sy, iSect.w, iSect.h, dx, dy, iSect.w, iSect.h);
            }
        }
    }

    const dataUrl = canvas.toDataURL('image/png');
    const a = document.createElement('a');
    a.href = dataUrl;
    a.download = `wplace_copy_${minX}_${minY}_${W}x${H}.png`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    showToast(`¡Copia del lienzo descargada!`);

    if (config.copyPreviewActive) {
        config.copyPreviewActive = false;
        await saveConfig(['copyPreviewActive']);
        clearOverlayCache();
        ensureHook();
        updateUI();
    }
  }

  async function nudgeCopyPoint(dx, dy) {
      const targetKey = config.copyNudgeTarget === 'A' ? 'copyPointA' : 'copyPointB';
      const point = config[targetKey];
      if (!point) {
          showToast(`El punto ${config.copyNudgeTarget} no está fijado.`);
          return;
      }
      point.absX += dx;
      point.absY += dy;

      point.chunk1 = Math.floor(point.absX / TILE_SIZE);
      point.chunk2 = Math.floor(point.absY / TILE_SIZE);
      point.posX = point.absX % TILE_SIZE;
      point.posY = point.absY % TILE_SIZE;

      await saveConfig([targetKey]);
      updateUI();
      if(config.copyPreviewActive) forceTileRefresh();
  }

function addEventListeners() {
    const $ = (id) => document.getElementById(id);

    $('op-theme-toggle').addEventListener('click', async (e) => {
        e.stopPropagation();
        config.theme = config.theme === 'light' ? 'dark' : 'light';
        await saveConfig(['theme']);
applyTheme();
        updateUI();
    });

    $('op-panel-toggle').addEventListener('click', (e) => { e.stopPropagation(); config.isPanelCollapsed = !config.isPanelCollapsed; saveConfig(['isPanelCollapsed']); updateUI(); });

    $('op-show-overlay-toggle').addEventListener('click', () => {
        config.showOverlay = !config.showOverlay;
        saveConfig(['showOverlay']);
        clearOverlayCache();
        ensureHook();
        updateUI();
        showToast('Cambios aplicados. Mueve el mapa o pon un píxel para verlos.');
    });

    $('op-mode-toggle').addEventListener('click', () => {
        const modes = ['minify', 'behind', 'above', 'original'];
        const current = modes.indexOf(config.overlayMode);
        config.overlayMode = modes[(current + 1) % modes.length];
        saveConfig(['overlayMode']);
        clearOverlayCache();
        ensureHook();
        updateUI();
        showToast('Modo cambiado. Mueve el mapa para actualizar.');
    });

    $('op-autocap-toggle').addEventListener('click', () => {
        config.autoCapturePixelUrl = !config.autoCapturePixelUrl;
        const keysToSave = ['autoCapturePixelUrl'];
        if (config.autoCapturePixelUrl) {
            config.isSettingCopyPoint = null;
            keysToSave.push('isSettingCopyPoint');
            if (!config.showOverlay) {
                config.showOverlay = true;
                keysToSave.push('showOverlay');
                showToast('Set Position enabled. Overlay automatically turned ON.');
                clearOverlayCache();
            } else {
                showToast('Set Position mode enabled.');
            }
        } else {
            showToast('Set Position mode disabled.');
        }
        saveConfig(keysToSave);
        ensureHook();
        updateUI();
    });

    $('op-show-errors-toggle').addEventListener('click', async () => {
        const enabling = !config.showErrors;
        const keysToSave = ['showErrors'];
        if (enabling) {
            if (!config.showOverlay) {
                config.showOverlay = true;
                keysToSave.push('showOverlay');
                showToast('Superposición activada para mostrar errores.');
            }
            if (config.overlayMode === 'original') {
                config.overlayMode = 'minify';
                keysToSave.push('overlayMode');
                showToast("Modo cambiado a 'Minificado' para mostrar errores.");
            }
        }
        config.showErrors = enabling;
        await saveConfig(keysToSave);
        clearOverlayCache();
        ensureHook();
        updateUI();
        showToast('Modo de errores actualizado. Mueve el mapa para ver cambios.');
    });

    document.querySelectorAll('.op-tab-btn').forEach(btn => {
        btn.addEventListener('click', () => setActiveTab(btn.dataset.tab));
    });

    $('op-add-overlay').addEventListener('click', async () => {
        try {
            await addBlankOverlay();
            setActiveTab('editor');
        } catch (e) {
            console.error(e);
        }
    });
    $('op-import-overlay').addEventListener('click', async () => { const text = prompt('Pega el JSON de la superposición (simple o array):'); if (!text) return; await importOverlayFromJSON(text); });
    $('op-export-overlay').addEventListener('click', () => exportActiveOverlayToClipboard());

    $('op-name').addEventListener('change', async (e) => {
        const ov = getActiveOverlay(); if (!ov) return;
        const desired = (e.target.value || '').trim() || 'Overlay';
        if (config.overlays.some(o => o.id !== ov.id && (o.name || '').toLowerCase() === desired.toLowerCase())) { ov.name = uniqueName(desired); showToast(`Nombre en uso. Renombrado a "${ov.name}".`); } else { ov.name = desired; }
        await saveConfig(['overlays']); rebuildOverlayListUI();
    });

    $('op-fetch').addEventListener('click', async () => {
        const ov = getActiveOverlay(); if (!ov) { alert('No hay ninguna superposición activa seleccionada.'); return; }
        if (ov.imageBase64) { alert('Esta superposición ya tiene una imagen. Crea una nueva para cambiarla.'); return; }
        const url = $('op-image-url').value.trim(); if (!url) { alert('Ingresa un enlace de imagen primero.'); return; }
        try { await setOverlayImageFromURL(ov, url); } catch (e) { console.error(e); alert('No se pudo cargar la imagen.'); }
    });

    const dropzone = $('op-dropzone');
    dropzone.addEventListener('click', () => $('op-file-input').click());
    $('op-file-input').addEventListener('change', async (e) => {
        const file = e.target.files && e.target.files[0]; e.target.value = ''; if (!file) return;
        const ov = getActiveOverlay(); if (!ov) return;
        if (ov.imageBase64) { alert('Esta superposición ya tiene una imagen. Crea una nueva para cambiarla.'); return; }
        try { await setOverlayImageFromFile(ov, file); } catch (err) { console.error(err); alert('No se pudo cargar la imagen local.'); }
    });
    ['dragenter', 'dragover'].forEach(evt => dropzone.addEventListener(evt, (e) => { e.preventDefault(); e.stopPropagation(); dropzone.classList.add('drop-highlight'); }));
    ['dragleave', 'drop'].forEach(evt => dropzone.addEventListener(evt, (e) => { e.preventDefault(); e.stopPropagation(); if (evt === 'dragleave' && e.target !== dropzone) return; dropzone.classList.remove('drop-highlight'); }));
    dropzone.addEventListener('drop', async (e) => {
        const dt = e.dataTransfer; if (!dt) return; const file = dt.files && dt.files[0]; if (!file) return;
        const ov = getActiveOverlay(); if (!ov) return;
        if (ov.imageBase64) { alert('Esta superposición ya tiene una imagen. Crea una nueva para cambiarla.'); return; }
        try { await setOverlayImageFromFile(ov, file); } catch (err) { console.error(err); alert('No se pudo cargar la imagen arrastrada.'); }
    });

        const debouncedRefresh = debounce(() => {
        clearOverlayCache();
        showToast('Posición actualizada. Mueve el mapa para ver el cambio.', 2000);
    }, 500);

    const debouncedSave = debounce(() => {
        saveConfig(['overlays']);
    }, 300);

    const nudge = (dx, dy) => {
        const ov = getActiveOverlay();
        if (!ov) return;
        ov.offsetX += dx;
        ov.offsetY += dy;

        updateUI();

        debouncedRefresh();
        debouncedSave();
    };

    $('op-nudge-up').addEventListener('click', () => nudge(0, -1));
    $('op-nudge-down').addEventListener('click', () => nudge(0, 1));
    $('op-nudge-left').addEventListener('click', () => nudge(-1, 0));
    $('op-nudge-right').addEventListener('click', () => nudge(1, 0));

    $('op-opacity-slider').addEventListener('input', (e) => {
        const ov = getActiveOverlay(); if (!ov) return;
        ov.opacity = parseFloat(e.target.value);
        $('op-opacity-value').textContent = Math.round(ov.opacity * 100) + '%';
        if (config.showErrors) {
            config.showErrors = false;
            saveConfig(['showErrors']);
            clearOverlayCache();
            showToast('Modo de errores desactivado para ajustar la opacidad.');
            updateUI();
        }
    });
    $('op-opacity-slider').addEventListener('change', async () => {
        await saveConfig(['overlays']);
        clearOverlayCache();
        showToast('Opacidad guardada. Mueve el mapa para actualizar.');
    });

    $('op-download-overlay').addEventListener('click', () => {
        const ov = getActiveOverlay();
        if (!ov || !ov.imageBase64) { showToast('No hay imagen para descargar.'); return; }
        const a = document.createElement('a');
        a.href = ov.imageBase64;
        a.download = `${(ov.name || 'overlay').replace(/[^\w.-]+/g, '_')}.png`;
        a.click();
        a.remove();
    });

    $('op-open-cc').addEventListener('click', () => {
        const ov = getActiveOverlay(); if (!ov || !ov.imageBase64) { showToast('No hay imagen para editar.'); return; }
        openCCModal(ov);
    });

    $('op-open-resize').addEventListener('click', () => {
        const ov = getActiveOverlay();
        if (!ov || !ov.imageBase64) { showToast('No hay imagen para redimensionar.'); return; }
        openRSModal(ov);
    });

    const setCopyPoint = (point) => {
        config.isSettingCopyPoint = point;
        if (point) config.autoCapturePixelUrl = false;
        saveConfig(['isSettingCopyPoint', 'autoCapturePixelUrl']);
        showToast(`Haz clic en el lienzo para fijar el punto ${point}`);
        updateUI();
        ensureHook();
    };
    $('op-copy-set-a').addEventListener('click', () => setCopyPoint('A'));
    $('op-copy-set-b').addEventListener('click', () => setCopyPoint('B'));
    $('op-copy-create').addEventListener('click', () => { createCanvasCopy(); });
    $('op-copy-preview-toggle').addEventListener('click', () => {
        if (!config.copyPointA || !config.copyPointB) {
            showToast('Primero debes fijar los puntos A y B.');
            return;
        }
        const activating = !config.copyPreviewActive;
        config.copyPreviewActive = activating;

        if (activating) {
            overlayStateBeforePreview = config.showOverlay;
            if (config.showOverlay) {
                config.showOverlay = false;
                showToast('Overlay desactivado para mostrar la previsualización.');
            }
        } else {
            config.showOverlay = overlayStateBeforePreview;
        }

        saveConfig(['copyPreviewActive', 'showOverlay']);
        clearOverlayCache();
        ensureHook();
        updateUI();
        forceTileRefresh();
    });

    document.querySelectorAll('input[name="op-nudge-target"]').forEach(radio => {
        radio.addEventListener('change', async (e) => {
            config.copyNudgeTarget = e.target.value;
            await saveConfig(['copyNudgeTarget']);
        });
    });
    $('op-nudge-copy-up').addEventListener('click', () => nudgeCopyPoint(0, -1));
    $('op-nudge-copy-down').addEventListener('click', () => nudgeCopyPoint(0, 1));
    $('op-nudge-copy-left').addEventListener('click', () => nudgeCopyPoint(-1, 0));
    $('op-nudge-copy-right').addEventListener('click', () => nudgeCopyPoint(1, 0));

    $('op-analyze-colors-btn').addEventListener('click', async () => {
        config.isColorPanelVisible = !config.isColorPanelVisible;
        await saveConfig(['isColorPanelVisible']);

        if (config.isColorPanelVisible) {
            await updateOverlayProgress();
        }
        updateUI();
    });

    const mainSettingsBtn = $('op-main-settings-btn');
    const mainSettingsModal = $('op-main-settings-modal');
    const mainBackdrop = $('op-main-settings-backdrop');
    const panelAlphaSlider = $('op-panel-alpha-slider');

    const toggleMainSettingsModal = (show) => {
        mainSettingsModal.classList.toggle('show', show);
        mainBackdrop.classList.toggle('show', show);
    };

    mainSettingsBtn.addEventListener('click', (e) => {
        e.stopPropagation();
        toggleMainSettingsModal(true);
    });

    mainBackdrop.addEventListener('click', () => toggleMainSettingsModal(false));

    panelAlphaSlider.value = config.panelAlpha;
    panelAlphaSlider.addEventListener('input', (e) => {
        config.panelAlpha = parseFloat(e.target.value);
        document.getElementById('overlay-pro-panel').style.setProperty('--op-panel-alpha', config.panelAlpha);
        updateUI();
    });
    panelAlphaSlider.addEventListener('change', () => {
        saveConfig(['panelAlpha']);
    });

    const caSettingsBtn = $('op-ca-settings-btn');
    const caSettingsModal = $('op-ca-settings-modal');
    const caBackdrop = $('op-ca-settings-backdrop');
    const caAlphaSlider = $('op-ca-alpha-slider');
    const caSortToggle = $('op-ca-sort-toggle');

    const toggleCaSettingsModal = (show) => {
        caSettingsModal.classList.toggle('show', show);
        caBackdrop.classList.toggle('show', show);
    };

    caSettingsBtn.addEventListener('click', (e) => {
        e.stopPropagation();
        toggleCaSettingsModal(true);
    });

    caBackdrop.addEventListener('click', () => toggleCaSettingsModal(false));

    caAlphaSlider.value = config.colorPanelAlpha;
    caAlphaSlider.addEventListener('input', (e) => {
        config.colorPanelAlpha = parseFloat(e.target.value);
        updateUI();
    });
    caAlphaSlider.addEventListener('change', () => {
        saveConfig(['colorPanelAlpha']);
    });

    caSortToggle.classList.toggle('active', config.caSortEnabled);
    caSortToggle.addEventListener('click', async () => {
        config.caSortEnabled = !config.caSortEnabled;
        caSortToggle.classList.toggle('active', config.caSortEnabled);
        await saveConfig(['caSortEnabled']);
        if (config.isColorPanelVisible) await updateOverlayProgress();
    });

    document.querySelectorAll('.op-show-donators').forEach(button => {
        button.addEventListener('click', (e) => {
            e.stopPropagation();
            const parentModal = button.closest('.op-modal');
            const listWrap = parentModal.querySelector('.op-donators-list-wrap');
            if (!listWrap) return;

            if (listWrap.classList.contains('show')) {
                listWrap.classList.remove('show');
                listWrap.innerHTML = '';
            } else {
                let listHTML = '<ul class="op-donators-list">';
                if (DONATORS.length === 0) {
                    listHTML += '<li class="op-donator-item-empty">Aún no hay donaciones. ¡Sé el primero!</li>';
                } else {
                    DONATORS.forEach(d => {
                        listHTML += `<li class="op-donator-item"><span class="op-donator-name">${d.name}</span><span class="op-donator-contribution">${d.contribution}</span></li>`;
                    });
                }
                listHTML += '</ul>';
                listWrap.innerHTML = listHTML;
                listWrap.classList.add('show');
            }
        });
    });

    $('op-ca-toggle-collapse').addEventListener('click', async (e) => {
        e.stopPropagation();
        config.caIsCollapsed = !config.caIsCollapsed;

        if (config.caIsCollapsed) {
            config.caFiltersVisible = false;
        }

        await saveConfig(['caIsCollapsed', 'caFiltersVisible']);
        updateUI();
    });

    $('op-ca-toggle-filters').addEventListener('click', async (e) => {
        e.stopPropagation();
        config.caFiltersVisible = !config.caFiltersVisible;
        await saveConfig(['caFiltersVisible']);
        updateUI();
    });

    const createViewToggleHandler = (key, needsProgressUpdate) => async () => {
        config[key] = !config[key];
        await saveConfig([key]);
        if (needsProgressUpdate) {
            await updateOverlayProgress();
        }
        updateUI();
    };

    $('op-ca-show-names-toggle').addEventListener('click', createViewToggleHandler('caShowColorNames', true));
    $('op-ca-show-progress-toggle').addEventListener('click', createViewToggleHandler('caShowProgress', true));
    $('op-ca-show-remaining-toggle').addEventListener('click', createViewToggleHandler('caShowRemainingOnly', true));

}

    function getAvailableColors() {
    const colorElements = document.querySelectorAll('[id^="color-"]');

    if (colorElements.length === 0) {
        return lastKnownAvailableColors;
    }

    const currentColors = new Set();
    colorElements.forEach(el => {
        if (!el.querySelector("svg")) {
            const rgbStr = el.style.backgroundColor.match(/\d+/g);
            if (rgbStr) {
                const rgb = rgbStr.map(Number);
                currentColors.add(`${rgb[0]},${rgb[1]},${rgb[2]}`);
            }
        }
    });

    if (currentColors.size !== lastKnownAvailableColors.size || ![...currentColors].every(color => lastKnownAvailableColors.has(color))) {
        lastKnownAvailableColors = currentColors;
        config.lastKnownColors = Array.from(currentColors);

        saveConfig(['lastKnownColors']);
    }

    return lastKnownAvailableColors;
}

async function updateOverlayProgress() {
    const panelContent = document.getElementById('op-ca-list-content');
    const totalPercentageEl = document.getElementById('op-ca-total-percentage');
    const ov = getActiveOverlay();

    document.getElementById('op-ca-sort-toggle').classList.toggle('active', !!config.caSortEnabled);
    const mainActions = document.querySelector('.op-ca-main-actions');
    if (mainActions) mainActions.style.display = 'none';

    if (!ov || !ov.imageBase64 || !ov.pixelUrl) {
        panelContent.innerHTML = `<span class="op-muted" style="text-align: center; padding: 20px 0;">Selecciona un overlay con imagen y ancla fijada.</span>`;
        totalPercentageEl.textContent = 'N/A';
        return;
    }

    if (mainActions) mainActions.style.display = 'flex';
    panelContent.innerHTML = `<span class="op-muted" style="text-align: center; padding: 20px 0;">Analizando...</span>`;
    totalPercentageEl.textContent = '0%';

    try {
        const availableColors = getAvailableColors();
        const img = await loadImage(ov.imageBase64);
        const canvas = createHTMLCanvas(img.width, img.height);
        const ctx = canvas.getContext('2d', { willReadFrequently: true });
        ctx.drawImage(img, 0, 0);
        const imageData = ctx.getImageData(0, 0, img.width, img.height);
        const data = imageData.data;
        const colorData = new Map();

        for (let i = 0; i < data.length; i += 4) {
            if (data[i + 3] > 200) {
                const key = `${data[i]},${data[i+1]},${data[i+2]}`;
                if (!colorData.has(key)) colorData.set(key, { needed: 0, placed: 0 });
                colorData.get(key).needed++;
            }
        }

        if (colorData.size === 0) {
            panelContent.innerHTML = `<span class="op-muted" style="text-align: center; padding: 20px 0;">La imagen está vacía.</span>`;
            return;
        }

        const base = extractPixelCoords(ov.pixelUrl);
        const overlayBaseX = base.chunk1 * TILE_SIZE + base.posX + ov.offsetX;
        const overlayBaseY = base.chunk2 * TILE_SIZE + base.posY + ov.offsetY;

        const tileKeys = new Set();
        for (let y = 0; y < img.height; y++) for (let x = 0; x < img.width; x++) {
            if (data[(y * img.width + x) * 4 + 3] < 200) continue;
            const absX = overlayBaseX + x, absY = overlayBaseY + y;
            tileKeys.add(`${Math.floor(absX / TILE_SIZE)}/${Math.floor(absY / TILE_SIZE)}`);
        }

        tileKeys.forEach(tileKey => {
            if (tileDataCache.has(tileKey)) {
                const tileImageData = tileDataCache.get(tileKey);
                for (let y = 0; y < img.height; y++) for (let x = 0; x < img.width; x++) {
                    const i = (y * img.width + x) * 4;
                    if (data[i + 3] < 200) continue;
                    const neededColorKey = `${data[i]},${data[i+1]},${data[i+2]}`;
                    const absX = overlayBaseX + x, absY = overlayBaseY + y;
                    const chunk1 = Math.floor(absX/TILE_SIZE), chunk2 = Math.floor(absY/TILE_SIZE);
                    if (`${chunk1}/${chunk2}` !== tileKey) continue;
                    const tileX = absX % TILE_SIZE, tileY = absY % TILE_SIZE;
                    const tileIdx = (tileY * TILE_SIZE + tileX) * 4;
                    if (tileImageData.data[tileIdx+3] > 200 && `${tileImageData.data[tileIdx]},${tileImageData.data[tileIdx+1]},${tileImageData.data[tileIdx+2]}` === neededColorKey) {
                        colorData.get(neededColorKey).placed++;
                    }
                }
            }
        });

        let totalNeeded = 0, totalPlaced = 0;
        let colorsArray = Array.from(colorData.entries()).map(([key, { needed, placed }]) => {
            totalNeeded += needed; totalPlaced += placed;
            return { key, name: WPLACE_NAMES[key] || 'Desconocido', needed, placed, isAvailable: availableColors.has(key) };
        });

        colorsArray.sort((a, b) => {
            if (config.caHighlightEnabled && a.isAvailable !== b.isAvailable) return a.isAvailable ? -1 : 1;
            if (config.caSortEnabled) return b.needed - a.needed;
            return 0;
        });

        panelContent.innerHTML = '';
        const isFilterActiveForThisOverlay = !!ov.filterActive;
        const savedFiltersSet = new Set(ov.savedFilters || []);

        for (const color of colorsArray) {
            const item = document.createElement('div');
            item.className = 'op-ca-item';
            if (config.caHighlightEnabled && color.isAvailable) item.classList.add('available');

            const isChecked = isFilterActiveForThisOverlay ? savedFiltersSet.has(color.key) : true;
            const remaining = color.needed - color.placed;
            const progressText = config.caShowRemainingOnly ? `${remaining}` : `${color.placed} / ${color.needed}`;

            item.innerHTML = `
                <input type="checkbox" class="op-ca-filter-check" data-color-key="${color.key}" ${isChecked ? 'checked' : ''} style="margin-left: -2px;">
                <div class="op-ca-swatch" style="background-color: rgb(${color.key});"></div>
                <span class="op-ca-name">${color.name}</span>
                <span class="op-ca-count">${progressText}</span>
            `;

            if (remaining === 0 && color.needed > 0) item.querySelector('.op-ca-count')?.classList.add('completed');
            panelContent.appendChild(item);
        }

        totalPercentageEl.textContent = `${totalNeeded > 0 ? ((totalPlaced / totalNeeded) * 100).toFixed(1) : '0.0'}%`;

        const applyAndRefresh = async (isFilter, colors, message) => {
            ov.filterActive = isFilter;
            ov.savedFilters = colors;
            await saveConfig(['overlays']);
            clearOverlayCache();
            showToast(message + ' Mueve el mapa para ver los cambios.');
        };

        document.getElementById('op-ca-apply-filter').onclick = () => {
            const selected = Array.from(panelContent.querySelectorAll('.op-ca-filter-check:checked')).map(cb => cb.dataset.colorKey);
            applyAndRefresh(true, selected, `Filtro aplicado. Mostrando ${selected.length} colores.`);
        };
        document.getElementById('op-ca-show-all').onclick = () => {
            panelContent.querySelectorAll('.op-ca-filter-check').forEach(cb => cb.checked = true);
            applyAndRefresh(false, [], 'Filtro eliminado. Mostrando todos los colores.');
        };
        document.getElementById('op-ca-mark-available').onclick = () => {
            const availableSet = new Set(colorsArray.filter(c => c.isAvailable).map(c => c.key));
            panelContent.querySelectorAll('.op-ca-filter-check').forEach(cb => cb.checked = availableSet.has(cb.dataset.colorKey));
        };
        document.getElementById('op-ca-mark-all').onclick = () => panelContent.querySelectorAll('.op-ca-filter-check').forEach(cb => cb.checked = true);
        document.getElementById('op-ca-mark-none').onclick = () => panelContent.querySelectorAll('.op-ca-filter-check').forEach(cb => cb.checked = false);

    } catch (error) {
        console.error("Error al actualizar progreso del overlay:", error);
        panelContent.innerHTML = `<span class="op-muted op-danger-text" style="text-align: center; padding: 20px 0;">Error al procesar la imagen.</span>`;
        totalPercentageEl.textContent = 'Error';
    }
}

  function enableDrag(panel, headerSelector, xKey, yKey) {
    const header = panel.querySelector(headerSelector);
    if (!header) return;

    let isDragging = false, startX = 0, startY = 0, startLeft = 0, startTop = 0, moved = false;
    const clamp = (v, min, max) => Math.min(Math.max(v, min), max);

    const onPointerDown = (e) => {
        if (e.target.closest('button, input, a, .op-switch')) return;
        isDragging = true;
        moved = false;
        startX = e.clientX;
        startY = e.clientY;
        const rect = panel.getBoundingClientRect();
        startLeft = rect.left;
        startTop = rect.top;
        header.setPointerCapture?.(e.pointerId);
        e.preventDefault();
    };

    const onPointerMove = (e) => {
        if (!isDragging) return;
        const dx = e.clientX - startX;
        const dy = e.clientY - startY;
        const maxLeft = Math.max(8, window.innerWidth - panel.offsetWidth - 8);
        const maxTop = Math.max(8, window.innerHeight - panel.offsetHeight - 8);
        panel.style.left = clamp(startLeft + dx, 8, maxLeft) + 'px';
        panel.style.top = clamp(startTop + dy, 8, maxTop) + 'px';
        moved = true;
    };

    const onPointerUp = (e) => {
        if (!isDragging) return;
        isDragging = false;
        header.releasePointerCapture?.(e.pointerId);
        if (moved) {
            config[xKey] = parseInt(panel.style.left, 10) || 0;
            config[yKey] = parseInt(panel.style.top, 10) || 0;
            saveConfig([xKey, yKey]);
        }
    };

    header.addEventListener('pointerdown', onPointerDown);
    header.addEventListener('pointermove', onPointerMove);
    header.addEventListener('pointerup', onPointerUp);
    header.addEventListener('pointercancel', onPointerUp);

      window.addEventListener('resize', () => {
      const rect = panel.getBoundingClientRect();
      const maxLeft = Math.max(8, window.innerWidth - panel.offsetWidth - 8);
      const maxTop  = Math.max(8, window.innerHeight - panel.offsetHeight - 8);
      const newLeft = Math.min(Math.max(rect.left, 8), maxLeft);
      const newTop  = Math.min(Math.max(rect.top, 8), maxTop);
      panel.style.left = newLeft + 'px';
      panel.style.top = newTop + 'px';
      config[xKey] = newLeft;
      config[yKey] = newTop;
      saveConfig([xKey, yKey]);
    });
}

  function applyTheme() {
    document.body.classList.toggle('op-theme-dark', config.theme === 'dark');
    document.body.classList.toggle('op-theme-light', config.theme !== 'dark');
    const stack = document.getElementById('op-toast-stack');
    if (stack) stack.classList.toggle('op-dark', config.theme === 'dark');
  }
  function setActiveTab(tabName) {
    if (!tabName) return;
    config.activeTab = tabName;
    saveConfig(['activeTab']);

    document.querySelectorAll('.op-tab-btn').forEach(btn => {
        btn.classList.toggle('active', btn.dataset.tab === tabName);
    });
    document.querySelectorAll('.op-tab-pane').forEach(pane => {
        pane.classList.toggle('active', pane.dataset.pane === tabName);
    });
  }

  function updateEditorUI() {
    const $ = (id) => document.getElementById(id);
    const ov = getActiveOverlay();

    const placeholder = $('op-editor-placeholder');
    const content = $('op-editor-content');

    if (!ov) {
        placeholder.style.display = 'block';
        content.style.display = 'none';
        return;
    }

    placeholder.style.display = 'none';
    content.style.display = 'flex';

    $('op-name').value = ov.name || '';

    const srcWrap = $('op-image-source');
    const previewWrap = $('op-preview-wrap');
    const previewImg = $('op-image-preview');
    const ccRow = $('op-cc-btn-row');

    if (ov.imageBase64) {
      srcWrap.style.display = 'none';
      previewWrap.style.display = 'flex';
      previewImg.src = ov.imageBase64;
      ccRow.style.display = 'flex';
    } else {
      srcWrap.style.display = 'block';
      previewWrap.style.display = 'none';
      ccRow.style.display = 'none';
      $('op-image-url').value = ov.imageUrl || '';
    }

    const coords = ov.pixelUrl ? extractPixelCoords(ov.pixelUrl) : { chunk1: '-', chunk2: '-', posX: '-', posY: '-' };
    $('op-coord-display').textContent = ov.pixelUrl
      ? `Ref: chunk ${coords.chunk1}/${coords.chunk2} en (${coords.posX}, ${coords.posY})`
      : `No se ha fijado ancla. Activa "Fijar ancla" y haz clic en un píxel.`;

    $('op-opacity-slider').value = String(ov.opacity);
    $('op-opacity-value').textContent = Math.round(ov.opacity * 100) + '%';
    $('op-opacity-slider').disabled = config.showErrors;

    const indicator = document.getElementById('op-offset-indicator');
    if (indicator) indicator.textContent = `Offset X ${ov.offsetX}, Y ${ov.offsetY}`;
  }
  function updateCopierUI() {
    const $ = (id) => document.getElementById(id);

    const { copyPointA: pA, copyPointB: pB, isSettingCopyPoint, copyPreviewActive } = config;
    $('op-copy-a-coords').textContent = pA ? `(${pA.absX}, ${pA.absY})` : 'No fijado';
    $('op-copy-b-coords').textContent = pB ? `(${pB.absX}, ${pB.absY})` : 'No fijado';

    const btnA = $('op-copy-set-a');
    const btnB = $('op-copy-set-b');
    btnA.classList.toggle('op-danger', isSettingCopyPoint === 'A');
    btnB.classList.toggle('op-danger', isSettingCopyPoint === 'B');
    btnA.textContent = isSettingCopyPoint === 'A' ? 'Fijando A...' : 'Fijar Punto A';
    btnB.textContent = isSettingCopyPoint === 'B' ? 'Fijando B...' : 'Fijar Punto B';

    const info = $('op-copy-info');
    const canCreate = pA && pB;
    if (canCreate) {
        const W = Math.abs(pA.absX - pB.absX) + 1;
        const H = Math.abs(pA.absY - pB.absY) + 1;
        info.textContent = `Tamaño seleccionado: ${W} x ${H} píxeles.`;
    } else {
        info.textContent = 'Selecciona dos puntos para definir un área.';
    }

    const previewBtn = $('op-copy-preview-toggle');
    previewBtn.disabled = !canCreate;
    previewBtn.textContent = copyPreviewActive ? 'Ocultar Área' : 'Visualizar Área';
    previewBtn.classList.toggle('op-danger', copyPreviewActive);

    $('op-copy-create').disabled = !copyPreviewActive;

          const nudgeTargetA = $('op-nudge-target-a');
    if (nudgeTargetA) nudgeTargetA.checked = config.copyNudgeTarget === 'A';
    const nudgeTargetB = $('op-nudge-target-b');
    if (nudgeTargetB) nudgeTargetB.checked = config.copyNudgeTarget === 'B';

  }
    function updateOverlayListPreview() {
    const previewArea = document.getElementById('op-list-preview-area');
    const previewImg = document.getElementById('op-list-preview-img');
    const activeOverlay = getActiveOverlay();

    if (activeOverlay && activeOverlay.imageBase64) {
        previewImg.src = activeOverlay.imageBase64;
        previewArea.style.display = 'block';
    } else {
        previewArea.style.display = 'none';
    }
}

function updateUI() {
    const $ = (id) => document.getElementById(id);
    const panel = $('overlay-pro-panel');
    if (!panel) return;

    panel.classList.toggle('collapsed', !!config.isPanelCollapsed);

    applyTheme();

    const bodyStyles = getComputedStyle(document.body);
    const bgColor = bodyStyles.getPropertyValue('--op-bg').trim();
    const mainRgb = bgColor.startsWith('#')
        ? (bgColor.length === 4 ? `${parseInt(bgColor[1], 16)*17},${parseInt(bgColor[2], 16)*17},${parseInt(bgColor[3], 16)*17}` : `${parseInt(bgColor.slice(1,3), 16)},${parseInt(bgColor.slice(3,5), 16)},${parseInt(bgColor.slice(5,7), 16)}`)
        : bgColor.match(/\d+/g).join(',');

    panel.style.setProperty('--op-bg-rgb', mainRgb);
    panel.style.setProperty('--op-panel-alpha', config.panelAlpha);

    const content = $('op-content');
    const toggle = $('op-panel-toggle');
    const collapsed = !!config.isPanelCollapsed;
    content.style.display = collapsed ? 'none' : 'flex';
    toggle.textContent = collapsed ? '▸' : '▾';
    toggle.title = collapsed ? 'Expandir' : 'Plegar';

    const showOverlayBtn = $('op-show-overlay-toggle');
    showOverlayBtn.textContent = `Overlay: ${config.showOverlay ? 'ON' : 'OFF'}`;
    showOverlayBtn.classList.toggle('op-danger', !config.showOverlay);

    const modeBtn = $('op-mode-toggle');
    const modeMap = { behind: 'Behind', above: 'Above', minify: `Minify ◻`, original: 'Original' };
    modeBtn.textContent = `Mode: ${modeMap[config.overlayMode] || 'Original'}`;
    const autoBtn = $('op-autocap-toggle');
    autoBtn.textContent = `Set Position: ${config.autoCapturePixelUrl ? 'ON' : 'OFF'}`;
    const showErrorBtn = $('op-show-errors-toggle');
    showErrorBtn.textContent = `Show Errors: ${config.showErrors ? 'ON' : 'OFF'}`;
    showErrorBtn.classList.toggle('op-danger', !!config.showErrors);

    setActiveTab(config.activeTab);
    rebuildOverlayListUI();
    updateEditorUI();
    updateCopierUI();
    updateOverlayListPreview();

    const exportBtn = $('op-export-overlay');
    const ov = getActiveOverlay();
    const canExport = !!(ov && ov.imageUrl && !ov.isLocal);
    exportBtn.disabled = !canExport;
    exportBtn.title = canExport ? 'Exportar superposición activa a JSON' : 'Exportación desactivada para imágenes locales';

    const analyzeBtn = $('op-analyze-colors-btn');
    if(analyzeBtn) analyzeBtn.classList.toggle('op-danger', config.isColorPanelVisible);

    const colorPanel = $('op-color-analysis-panel');
    if (colorPanel) {
        colorPanel.classList.toggle('show', config.isColorPanelVisible);
        colorPanel.classList.toggle('collapsed', !!config.caIsCollapsed);
        colorPanel.classList.toggle('filters-open', !!config.caFiltersVisible && !config.caIsCollapsed);

        if (Number.isFinite(config.colorPanelX) && Number.isFinite(config.colorPanelY)) {
            colorPanel.style.left = config.colorPanelX + 'px';
            colorPanel.style.top = config.colorPanelY + 'px';
        } else if (config.isColorPanelVisible) {

            const rect = colorPanel.getBoundingClientRect();
            colorPanel.style.left = `${(window.innerWidth - rect.width) / 2}px`;
            colorPanel.style.top = `${(window.innerHeight - rect.height) / 2}px`;
        }

        colorPanel.style.setProperty('--op-bg-rgb', mainRgb);
        colorPanel.style.background = `rgba(${mainRgb}, ${config.colorPanelAlpha})`;
        const caContent = colorPanel.querySelector('.op-ca-list');
        const caFooter = colorPanel.querySelector('.op-ca-footer');
        const caToggleBtn = colorPanel.querySelector('#op-ca-toggle-collapse');

        if (caContent && caFooter && caToggleBtn) {
            const isCollapsed = !!config.caIsCollapsed;
            caContent.style.display = isCollapsed ? 'none' : 'flex';
            caFooter.style.display = isCollapsed ? 'none' : 'flex';
            caToggleBtn.textContent = isCollapsed ? '▸' : '▾';

            const filtersPane = $('op-ca-filters-pane');
            if(filtersPane) filtersPane.classList.toggle('show', !!config.caFiltersVisible);

            $('op-ca-show-names-toggle')?.classList.toggle('active', !!config.caShowColorNames);
            $('op-ca-show-progress-toggle')?.classList.toggle('active', !!config.caShowProgress);
            $('op-ca-show-remaining-toggle')?.classList.toggle('active', !!config.caShowRemainingOnly);

            const totalProgressEl = colorPanel.querySelector('.op-ca-total-progress');
            if (totalProgressEl) {
                totalProgressEl.style.display = config.caShowProgress ? 'flex' : 'none';
            }
        }

        document.body.classList.toggle('ca-hide-names', !config.caShowColorNames);
    }
}

  let cc = null;

  function buildCCModal() {
    const backdrop = document.createElement('div');
    backdrop.className = 'op-cc-backdrop';
    backdrop.id = 'op-cc-backdrop';
    document.body.appendChild(backdrop);

    const modal = document.createElement('div');
    modal.className = 'op-cc-modal op-modal';
    modal.id = 'op-cc-modal';

    modal.innerHTML = `
      <div class="op-cc-header" id="op-cc-header">
        <div class="op-cc-title">Ajuste de Color</div>
        <div class="op-row" style="gap:6px;">
          <button class="op-button op-cc-pill" id="op-cc-realtime" title="Activa/Desactiva el cálculo en tiempo real al cambiar la paleta.">En vivo: OFF</button>
          <button class="op-cc-close" id="op-cc-close" title="Cerrar">✕</button>
        </div>
      </div>

      <div class="op-cc-body">
        <div class="op-cc-preview-wrap" style="grid-area: preview;">
          <canvas id="op-cc-preview" class="op-cc-canvas"></canvas>
          <div class="op-cc-zoom">
            <button class="op-icon-btn" id="op-cc-zoom-out" title="Alejar">−</button>
            <button class="op-icon-btn" id="op-cc-zoom-in" title="Acercar">+</button>
          </div>
        </div>

        <div class="op-cc-controls" style="grid-area: controls;">
          <div class="op-cc-palette" id="op-cc-free">
            <div class="op-row space">
              <label>Colores Gratuitos</label>
              <button class="op-button" id="op-cc-free-toggle" title="Seleccionar/Deseleccionar todos los colores de esta paleta.">Desmarcar todo</button>
            </div>
            <div id="op-cc-free-grid" class="op-cc-grid"></div>
          </div>

          <div class="op-cc-palette" id="op-cc-paid">
            <div class="op-row space">
              <label>Colores de Pago (2000💧)</label>
              <button class="op-button" id="op-cc-paid-toggle" title="Seleccionar/Deseleccionar todos los colores de esta paleta.">Marcar todo</button>
            </div>
            <div id="op-cc-paid-grid" class="op-cc-grid"></div>
          </div>
        </div>
      </div>

      <div class="op-cc-footer">
        <div class="op-cc-ghost" id="op-cc-meta"></div>
        <div class="op-cc-actions">
          <button class="op-button" id="op-cc-recalc" title="Recalcular el mapeo de colores">Calcular</button>
          <button class="op-button" id="op-cc-apply" title="Aplicar cambios a la superposición">Aplicar</button>
          <button class="op-button" id="op-cc-cancel" title="Cerrar sin guardar">Cancelar</button>
        </div>
      </div>
    `;
    document.body.appendChild(modal);

    modal.querySelector('#op-cc-close').addEventListener('click', closeCCModal);
    backdrop.addEventListener('click', closeCCModal);
    modal.querySelector('#op-cc-cancel').addEventListener('click', closeCCModal);

    cc = {
      backdrop,
      modal,
      previewCanvas: modal.querySelector('#op-cc-preview'),
      previewCtx: modal.querySelector('#op-cc-preview').getContext('2d', { willReadFrequently: true }),
      sourceCanvas: null,
      sourceCtx: null,
      sourceImageData: null,
      processedCanvas: null,
      processedCtx: null,
      freeGrid: modal.querySelector('#op-cc-free-grid'),
      paidGrid: modal.querySelector('#op-cc-paid-grid'),
      freeToggle: modal.querySelector('#op-cc-free-toggle'),
      paidToggle: modal.querySelector('#op-cc-paid-toggle'),
      meta: modal.querySelector('#op-cc-meta'),
      applyBtn: modal.querySelector('#op-cc-apply'),
      recalcBtn: modal.querySelector('#op-cc-recalc'),
      realtimeBtn: modal.querySelector('#op-cc-realtime'),
      zoom: 1.0,
      selectedFree: new Set(config.ccFreeKeys),
      selectedPaid: new Set(config.ccPaidKeys),
      realtime: !!config.ccRealtime,
      overlay: null,
      lastColorCounts: {},
      isStale: false
    };

    cc.realtimeBtn.addEventListener('click', async () => {
      cc.realtime = !cc.realtime;
      cc.realtimeBtn.textContent = `En vivo: ${cc.realtime ? 'ON' : 'OFF'}`;
      cc.realtimeBtn.classList.toggle('op-danger', cc.realtime);
      config.ccRealtime = cc.realtime; await saveConfig(['ccRealtime']);
      if (cc.realtime && cc.isStale) recalcNow();
    });

    const zoomIn = async () => { cc.zoom = Math.min(8, (cc.zoom || 1) * 1.25); config.ccZoom = cc.zoom; await saveConfig(['ccZoom']); applyPreview(); updateMeta(); };
    const zoomOut = async () => { cc.zoom = Math.max(0.1, (cc.zoom || 1) / 1.25); config.ccZoom = cc.zoom; await saveConfig(['ccZoom']); applyPreview(); updateMeta(); };
    modal.querySelector('#op-cc-zoom-in').addEventListener('click', zoomIn);
    modal.querySelector('#op-cc-zoom-out').addEventListener('click', zoomOut);

    cc.recalcBtn.addEventListener('click', () => { recalcNow(); });

    cc.applyBtn.addEventListener('click', async () => {
      const ov = cc.overlay; if (!ov) return;
      const activePalette = getActivePalette();
      if (activePalette.length === 0) { showToast('Selecciona al menos un color.'); return; }
      if (cc.isStale) recalcNow();
      if (!cc.processedCanvas) { showToast('No hay nada que aplicar.'); return; }
      if (cc.processedCanvas.width >= MAX_OVERLAY_DIM || cc.processedCanvas.height >= MAX_OVERLAY_DIM) {
        showToast(`La imagen es demasiado grande para aplicar (debe ser < ${MAX_OVERLAY_DIM}×${MAX_OVERLAY_DIM}).`); return;
      }
      const dataUrl = cc.processedCanvas.toDataURL('image/png');
      ov.imageBase64 = dataUrl; ov.imageUrl = null; ov.isLocal = true;
      await saveConfig(['overlays']); clearOverlayCache(); ensureHook(); updateUI();
      const uniqueColors = Object.keys(cc.lastColorCounts).length;
      showToast(`Superposición actualizada (${cc.processedCanvas.width}×${cc.processedCanvas.height}, ${uniqueColors} colores).`);
      closeCCModal();
    });

    renderPaletteGrid();

    cc.freeToggle.addEventListener('click', async () => {
      const allActive = isAllFreeActive();
      setAllActive('free', !allActive);
      config.ccFreeKeys = Array.from(cc.selectedFree);
      await saveConfig(['ccFreeKeys']);
      if (cc.realtime) recalcNow(); else markStale();
      applyPreview(); updateMeta(); updateMasterButtons();
    });
    cc.paidToggle.addEventListener('click', async () => {
      const allActive = isAllPaidActive();
      setAllActive('paid', !allActive);
      config.ccPaidKeys = Array.from(cc.selectedPaid);
      await saveConfig(['ccPaidKeys']);
      if (cc.realtime) recalcNow(); else markStale();
      applyPreview(); updateMeta(); updateMasterButtons();
    });

    function markStale() {
      cc.isStale = true;
      cc.meta.textContent = cc.meta.textContent.replace(/ \| Estado: .+$/, '') + ' | Estado: pendiente de recálculo';
    }
    function recalcNow() {
      processImage();
      cc.isStale = false;
      applyPreview();
      updateMeta();
    }
  }

  function openCCModal(overlay) {
    if (!cc) return;
    cc.overlay = overlay;
    document.body.classList.add('op-scroll-lock');
    cc.zoom = Number(config.ccZoom) || 1.0;
    cc.realtime = !!config.ccRealtime;
    cc.realtimeBtn.textContent = `En vivo: ${cc.realtime ? 'ON' : 'OFF'}`;
    cc.realtimeBtn.classList.toggle('op-danger', cc.realtime);
    const img = new Image();
    img.onload = () => {
      if (!cc.sourceCanvas) { cc.sourceCanvas = document.createElement('canvas'); cc.sourceCtx = cc.sourceCanvas.getContext('2d', { willReadFrequently: true }); }
      cc.sourceCanvas.width = img.width; cc.sourceCanvas.height = img.height;
      cc.sourceCtx.clearRect(0,0,img.width,img.height);
      cc.sourceCtx.drawImage(img, 0, 0);
      cc.sourceImageData = cc.sourceCtx.getImageData(0,0,img.width,img.height);
      if (!cc.processedCanvas) { cc.processedCanvas = document.createElement('canvas'); cc.processedCtx = cc.processedCanvas.getContext('2d'); }
      processImage();
      cc.isStale = false;
      applyPreview();
      updateMeta();
      cc.backdrop.classList.add('show');
      cc.modal.classList.add('show');
    };
    img.src = overlay.imageBase64;
  }

  function closeCCModal() {
    if (!cc) return;
    cc.backdrop.classList.remove('show');
    cc.modal.classList.remove('show');
    cc.overlay = null;
    document.body.classList.remove('op-scroll-lock');
  }

  function weightedNearest(r, g, b, palette) {
    let best = null, bestDist = Infinity;
    for (let i = 0; i < palette.length; i++) {
      const [pr, pg, pb] = palette[i];
      const rmean = (pr + r) / 2;
      const rdiff = pr - r;
      const gdiff = pg - g;
      const bdiff = pb - b;
      const x = (512 + rmean) * rdiff * rdiff >> 8;
      const y = 4 * gdiff * gdiff;
      const z = (767 - rmean) * bdiff * bdiff >> 8;
      const dist = Math.sqrt(x + y + z);
      if (dist < bestDist) { bestDist = dist; best = [pr, pg, pb]; }
    }
    return best || [0,0,0];
  }

  function getActivePalette() {
    const arr = [];
    cc.selectedFree.forEach(k => { const [r,g,b] = k.split(',').map(n => parseInt(n,10)); if (Number.isFinite(r)) arr.push([r,g,b]); });
    cc.selectedPaid.forEach(k => { const [r,g,b] = k.split(',').map(n => parseInt(n,10)); if (Number.isFinite(r)) arr.push([r,g,b]); });
    return arr;
  }

  function processImage() {
    if (!cc.sourceImageData) return;
    const w = cc.sourceImageData.width, h = cc.sourceImageData.height;
    const src = cc.sourceImageData.data;
    const out = new Uint8ClampedArray(src.length);
    const palette = getActivePalette();
    const counts = {};
    for (let i = 0; i < src.length; i += 4) {
      const r = src[i], g = src[i+1], b = src[i+2], a = src[i+3];
      if (a === 0) { out[i]=0; out[i+1]=0; out[i+2]=0; out[i+3]=0; continue; }
      const [nr, ng, nb] = palette.length ? weightedNearest(r,g,b,palette) : [r,g,b];
      out[i]=nr; out[i+1]=ng; out[i+2]=nb; out[i+3]=255;
      const key = `${nr},${ng},${nb}`;
      counts[key] = (counts[key] || 0) + 1;
    }
    if (!cc.processedCanvas) { cc.processedCanvas = document.createElement('canvas'); cc.processedCtx = cc.processedCanvas.getContext('2d'); }
    cc.processedCanvas.width = w; cc.processedCanvas.height = h;
    const outImg = new ImageData(out, w, h);
    cc.processedCtx.putImageData(outImg, 0, 0);
    cc.lastColorCounts = counts;
  }

  function applyPreview() {
    const zoom = Number(cc.zoom) || 1.0;
    const srcCanvas = cc.processedCanvas;
    if (!srcCanvas) return;
    const pw = Math.max(1, Math.round(srcCanvas.width * zoom));
    const ph = Math.max(1, Math.round(srcCanvas.height * zoom));
    cc.previewCanvas.width = pw;
    cc.previewCanvas.height = ph;
    const ctx = cc.previewCtx;
    ctx.clearRect(0,0,pw,ph);
    ctx.imageSmoothingEnabled = false;
    ctx.drawImage(srcCanvas, 0,0, srcCanvas.width, srcCanvas.height, 0,0, pw, ph);
    ctx.imageSmoothingEnabled = true;
  }

  function updateMeta() {
    if (!cc.sourceImageData) { cc.meta.textContent = ''; return; }
    const w = cc.sourceImageData.width, h = cc.sourceImageData.height;
    const colorsUsed = Object.keys(cc.lastColorCounts||{}).length;
    const status = cc.isStale ? 'pendiente de recálculo' : 'actualizado';
    cc.meta.textContent = `Tamaño: ${w}×${h} | Zoom: ${cc.zoom.toFixed(2)}× | Colores: ${colorsUsed} | Estado: ${status}`;
  }

  function renderPaletteGrid() {
    cc.freeGrid.innerHTML = '';
    cc.paidGrid.innerHTML = '';
    for (const [r,g,b] of WPLACE_FREE) {
      const key = `${r},${g},${b}`;
      const cell = document.createElement('div');
      cell.className = 'op-cc-cell';
      cell.style.background = `rgb(${r},${g},${b})`;
      cell.title = WPLACE_NAMES[key] || key;
      cell.dataset.key = key;
      cell.dataset.type = 'free';
      if (cc.selectedFree.has(key)) cell.classList.add('active');
      cell.addEventListener('click', async () => {
        if (cc.selectedFree.has(key)) cc.selectedFree.delete(key); else cc.selectedFree.add(key);
        cell.classList.toggle('active', cc.selectedFree.has(key));
        config.ccFreeKeys = Array.from(cc.selectedFree); await saveConfig(['ccFreeKeys']);
        if (cc.realtime) processImage(); else { cc.isStale = true; }
        applyPreview(); updateMeta(); updateMasterButtons();
      });
      cc.freeGrid.appendChild(cell);
    }
    for (const [r,g,b] of WPLACE_PAID) {
      const key = `${r},${g},${b}`;
      const cell = document.createElement('div');
      cell.className = 'op-cc-cell';
      cell.style.background = `rgb(${r},${g},${b})`;
      cell.title = WPLACE_NAMES[key] || key;
      cell.dataset.key = key;
      cell.dataset.type = 'paid';
      if (cc.selectedPaid.has(key)) cell.classList.add('active');
      cell.addEventListener('click', async () => {
        if (cc.selectedPaid.has(key)) cc.selectedPaid.delete(key); else cc.selectedPaid.add(key);
        cell.classList.toggle('active', cc.selectedPaid.has(key));
        config.ccPaidKeys = Array.from(cc.selectedPaid); await saveConfig(['ccPaidKeys']);
        if (cc.realtime) processImage(); else { cc.isStale = true; }
        applyPreview(); updateMeta(); updateMasterButtons();
      });
      cc.paidGrid.appendChild(cell);
    }
    updateMasterButtons();
  }

  function updateMasterButtons() {
    cc.freeToggle.textContent = isAllFreeActive() ? 'Desmarcar todo' : 'Marcar todo';
    cc.paidToggle.textContent = isAllPaidActive() ? 'Desmarcar todo' : 'Marcar todo';
  }
  function isAllFreeActive() { return DEFAULT_FREE_KEYS.every(k => cc.selectedFree.has(k)); }
  function isAllPaidActive() {
    const allPaidKeys = WPLACE_PAID.map(([r,g,b]) => `${r},${g},${b}`);
    return allPaidKeys.every(k => cc.selectedPaid.has(k)) && allPaidKeys.length > 0;
  }
  function setAllActive(type, active) {
    if (type === 'free') {
      const keys = DEFAULT_FREE_KEYS;
      if (active) keys.forEach(k => cc.selectedFree.add(k)); else cc.selectedFree.clear();
      cc.freeGrid.querySelectorAll('.op-cc-cell').forEach(cell => cell.classList.toggle('active', active));
    } else {
      const keys = WPLACE_PAID.map(([r,g,b]) => `${r},${g},${b}`);
      if (active) keys.forEach(k => cc.selectedPaid.add(k)); else cc.selectedPaid.clear();
      cc.paidGrid.querySelectorAll('.op-cc-cell').forEach(cell => cell.classList.toggle('active', active));
    }
  }

  let rs = null;

  function buildRSModal() {
    const backdrop = document.createElement('div');
    backdrop.className = 'op-rs-backdrop';
    backdrop.id = 'op-rs-backdrop';
    document.body.appendChild(backdrop);

    const modal = document.createElement('div');
    modal.className = 'op-rs-modal op-modal';
    modal.id = 'op-rs-modal';

    modal.innerHTML = `
      <div class="op-rs-header" id="op-rs-header">
        <div class="op-rs-title">Redimensionar Superposición</div>
        <button class="op-rs-close" id="op-rs-close" title="Cerrar">✕</button>
      </div>

      <div class="op-rs-tabs">
        <button class="op-rs-tab-btn active" id="op-rs-tab-simple">Simple</button>
        <button class="op-rs-tab-btn" id="op-rs-tab-advanced">Avanzado (cuadrícula)</button>
      </div>

      <div class="op-rs-body">
        <div class="op-rs-pane show" id="op-rs-pane-simple">
          <div class="op-rs-row">
            <label style="width:110px;">Original</label>
            <input type="text" class="op-input" id="op-rs-orig" disabled>
          </div>
          <div class="op-rs-row">
            <label style="width:110px;">Ancho</label>
            <input type="number" min="1" step="1" class="op-input" id="op-rs-w">
          </div>
          <div class="op-rs-row">
            <label style="width:110px;">Alto</label>
            <input type="number" min="1" step="1" class="op-input" id="op-rs-h">
          </div>
          <div class="op-rs-row">
            <input type="checkbox" id="op-rs-lock" checked>
            <label for="op-rs-lock">Bloquear relación de aspecto</label>
          </div>
          <div class="op-rs-row" style="gap:6px; flex-wrap:wrap;">
            <label style="width:110px;">Rápido</label>
            <button class="op-button" id="op-rs-double">2x</button>
            <button class="op-button" id="op-rs-onex">1x</button>
            <button class="op-button" id="op-rs-half">0.5x</button>
            <button class="op-button" id="op-rs-third">0.33x</button>
            <button class="op-button" id="op-rs-quarter">0.25x</button>
          </div>
          <div class="op-rs-row">
            <label style="width:110px;">Factor de escala</label>
            <input type="number" step="0.01" min="0.01" class="op-input" id="op-rs-scale" placeholder="ej. 0.5">
            <button class="op-button" id="op-rs-apply-scale">Aplicar</button>
          </div>

          <div class="op-rs-preview-wrap" id="op-rs-sim-wrap">
            <div class="op-rs-dual">
              <div class="op-rs-col" id="op-rs-col-left">
                <div class="label">Original</div>
                <div class="pad-top"></div>
                <canvas id="op-rs-sim-orig" class="op-rs-canvas op-rs-thumb"></canvas>
              </div>
              <div class="op-rs-col" id="op-rs-col-right">
                <div class="label">Resultado</div>
                <div class="pad-top"></div>
                <canvas id="op-rs-sim-new" class="op-rs-canvas op-rs-thumb"></canvas>
              </div>
            </div>
          </div>
        </div>

        <div class="op-rs-pane" id="op-rs-pane-advanced">
          <div class="op-rs-preview-wrap op-pan-grab" id="op-rs-adv-wrap">
            <canvas id="op-rs-preview" class="op-rs-canvas"></canvas>
            <div class="op-rs-zoom">
              <button class="op-icon-btn" id="op-rs-zoom-out" title="Alejar">−</button>
              <button class="op-icon-btn" id="op-rs-zoom-in" title="Acercar">+</button>
            </div>
          </div>

          <div class="op-rs-row" style="margin-top:8px;">
            <label style="width:160px;">Multiplicador</label>
            <input type="range" id="op-rs-mult-range" min="1" max="64" step="0.1" style="flex:1;">
            <input type="number" id="op-rs-mult-input" class="op-input op-rs-mini" min="1" step="0.05">
          </div>

          <div class="op-rs-row">
            <input type="checkbox" id="op-rs-bind" checked>
            <label for="op-rs-bind">Vincular tamaños de bloque X/Y</label>
          </div>

          <div class="op-rs-row">
            <label style="width:160px;">Ancho / Alto de Bloque</label>
            <input type="number" id="op-rs-blockw" class="op-input op-rs-mini" min="1" step="0.1">
            <input type="number" id="op-rs-blockh" class="op-input op-rs-mini" min="1" step="0.1">
          </div>

          <div class="op-rs-row">
            <label style="width:160px;">Offset X / Y</label>
            <input type="number" id="op-rs-offx" class="op-input op-rs-mini" min="0" step="0.1">
            <input type="number" id="op-rs-offy" class="op-input op-rs-mini" min="0" step="0.1">
          </div>

          <div class="op-rs-row">
            <label style="width:160px;">Radio del punto</label>
            <input type="range" id="op-rs-dotr" min="1" max="8" step="1" style="flex:1;">
            <span id="op-rs-dotr-val" class="op-muted" style="width:36px; text-align:right;"></span>
          </div>

          <div class="op-rs-row">
            <input type="checkbox" id="op-rs-grid" checked>
            <label for="op-rs-grid">Mostrar cuadrícula</label>
          </div>

          <div class="op-rs-grid-note" id="op-rs-adv-note">Alinea los puntos rojos con el centro de los bloques. Arrastra para mover; usa los botones o Ctrl+rueda para hacer zoom.</div>

          <div class="op-rs-row" style="margin-top:8px;">
            <label style="width:160px;">Previsualización</label>
            <span class="op-muted" id="op-rs-adv-resmeta"></span>
          </div>
          <div class="op-rs-preview-wrap" id="op-rs-adv-result-wrap" style="height: clamp(200px, 26vh, 420px);">
            <canvas id="op-rs-adv-result" class="op-rs-canvas"></canvas>
          </div>
        </div>
      </div>

      <div class="op-rs-footer">
        <div class="op-cc-ghost" id="op-rs-meta">Muestreo por vecino más cercano O centro de la cuadrícula.</div>
        <div class="op-cc-actions">
          <button class="op-button" id="op-rs-calc" title="Calcula la previsualización del resultado con los parámetros avanzados.">Calcular</button>
          <button class="op-button" id="op-rs-apply" title="Aplica los cambios de tamaño a la imagen de la superposición.">Aplicar</button>
          <button class="op-button" id="op-rs-cancel" title="Cierra la ventana sin aplicar los cambios de tamaño.">Cancelar</button>
        </div>
      </div>
    `;
    document.body.appendChild(modal);

    const els = {
      backdrop, modal,
      tabSimple: modal.querySelector('#op-rs-tab-simple'), tabAdvanced: modal.querySelector('#op-rs-tab-advanced'),
      paneSimple: modal.querySelector('#op-rs-pane-simple'), paneAdvanced: modal.querySelector('#op-rs-pane-advanced'),
      orig: modal.querySelector('#op-rs-orig'), w: modal.querySelector('#op-rs-w'), h: modal.querySelector('#op-rs-h'),
      lock: modal.querySelector('#op-rs-lock'), note: modal.querySelector('#op-rs-note'),
      onex: modal.querySelector('#op-rs-onex'), half: modal.querySelector('#op-rs-half'), third: modal.querySelector('#op-rs-third'),
      quarter: modal.querySelector('#op-rs-quarter'), double: modal.querySelector('#op-rs-double'),
      scale: modal.querySelector('#op-rs-scale'), applyScale: modal.querySelector('#op-rs-apply-scale'),
      simWrap: modal.querySelector('#op-rs-sim-wrap'), simOrig: modal.querySelector('#op-rs-sim-orig'), simNew: modal.querySelector('#op-rs-sim-new'),
      colLeft: modal.querySelector('#op-rs-col-left'), colRight: modal.querySelector('#op-rs-col-right'),
      advWrap: modal.querySelector('#op-rs-adv-wrap'), preview: modal.querySelector('#op-rs-preview'),
      meta: modal.querySelector('#op-rs-meta'), zoomIn: modal.querySelector('#op-rs-zoom-in'), zoomOut: modal.querySelector('#op-rs-zoom-out'),
      multRange: modal.querySelector('#op-rs-mult-range'), multInput: modal.querySelector('#op-rs-mult-input'),
      bind: modal.querySelector('#op-rs-bind'), blockW: modal.querySelector('#op-rs-blockw'), blockH: modal.querySelector('#op-rs-blockh'),
      offX: modal.querySelector('#op-rs-offx'), offY: modal.querySelector('#op-rs-offy'),
      dotR: modal.querySelector('#op-rs-dotr'), dotRVal: modal.querySelector('#op-rs-dotr-val'), gridToggle: modal.querySelector('#op-rs-grid'),
      advNote: modal.querySelector('#op-rs-adv-note'), resWrap: modal.querySelector('#op-rs-adv-result-wrap'),
      resCanvas: modal.querySelector('#op-rs-adv-result'), resMeta: modal.querySelector('#op-rs-adv-resmeta'),
      calcBtn: modal.querySelector('#op-rs-calc'), applyBtn: modal.querySelector('#op-rs-apply'),
      cancelBtn: modal.querySelector('#op-rs-cancel'), closeBtn: modal.querySelector('#op-rs-close'),
    };

    const ctxPrev = els.preview.getContext('2d', { willReadFrequently: true });
    const ctxSimOrig = els.simOrig.getContext('2d', { willReadFrequently: true });
    const ctxSimNew = els.simNew.getContext('2d', { willReadFrequently: true });
    const ctxRes = els.resCanvas.getContext('2d', { willReadFrequently: true });

    rs = {
      ...els, ov: null, img: null, origW: 0, origH: 0, mode: 'simple', zoom: 1.0, updating: false,
      mult: 4, gapX: 4, gapY: 4, offx: 0, offy: 0, dotr: 1, viewX: 0, viewY: 0,
      panning: false, panStart: null, calcCanvas: null, calcCols: 0, calcRows: 0, calcReady: false,
    };

    const computeSimpleFooterText = () => {
      const W = parseInt(rs.w.value||'0',10), H = parseInt(rs.h.value||'0',10);
      const ok = Number.isFinite(W) && Number.isFinite(H) && W>0 && H>0;
      const limit = (W >= MAX_OVERLAY_DIM || H >= MAX_OVERLAY_DIM);
      return ok ? (limit ? `Objetivo: ${W}×${H} (excede el límite: < ${MAX_OVERLAY_DIM}×${MAX_OVERLAY_DIM})` : `Objetivo: ${W}×${H} (OK)`) : 'Ingresa un ancho y alto positivos.';
    };
    const sampleDims = () => {
      const cols = Math.floor((rs.origW - rs.offx) / rs.gapX), rows = Math.floor((rs.origH - rs.offy) / rs.gapY);
      return { cols: Math.max(0, cols), rows: Math.max(0, rows) };
    };
    const computeAdvancedFooterText = () => {
      const { cols, rows } = sampleDims();
      const limit = (cols >= MAX_OVERLAY_DIM || rows >= MAX_OVERLAY_DIM);
      return (cols>0 && rows>0) ? `Muestras: ${cols} × ${rows} | Salida: ${cols}×${rows}${limit ? ` (excede el límite: < ${MAX_OVERLAY_DIM}×${MAX_OVERLAY_DIM})` : ''}` : 'Ajusta el multiplicador/offset hasta que los puntos se centren.';
    };
    const updateFooterMeta = () => { rs.meta.textContent = (rs.mode === 'advanced') ? computeAdvancedFooterText() : computeSimpleFooterText(); };
    const syncSimpleNote = () => {
      const W = parseInt(rs.w.value||'0',10), H = parseInt(rs.h.value||'0',10);
      const ok = Number.isFinite(W) && Number.isFinite(H) && W>0 && H>0;
      const limit = (W >= MAX_OVERLAY_DIM || H >= MAX_OVERLAY_DIM);
      const simpleText = ok ? (limit ? `Objetivo: ${W}×${H} (excede el límite: < ${MAX_OVERLAY_DIM}×${MAX_OVERLAY_DIM})` : `Objetivo: ${W}×${H} (OK)`) : 'Ingresa un ancho y alto positivos.';
      if (rs.note) rs.note.textContent = simpleText;
      if (rs.mode === 'simple') rs.applyBtn.disabled = (!ok || limit);
      if (rs.mode === 'simple') rs.meta.textContent = simpleText;
    };
    function applyScaleToFields(scale) {
      const W = Math.max(1, Math.round(rs.origW * scale)), H = Math.max(1, Math.round(rs.origH * scale));
      rs.updating = true;
      rs.w.value = W;
      rs.h.value = rs.lock.checked ? Math.max(1, Math.round(W * rs.origH / rs.origW)) : H;
      rs.updating = false;
      syncSimpleNote();
    }
    function drawSimplePreview() {
      if (!rs.img) return;
      const leftLabelH = rs.colLeft.querySelector('.pad-top').offsetHeight, rightLabelH = rs.colRight.querySelector('.pad-top').offsetHeight;
      const leftW = rs.colLeft.clientWidth, rightW = rs.colRight.clientWidth;
      const leftH = rs.colLeft.clientHeight - leftLabelH, rightH = rs.colRight.clientHeight - rightLabelH;
      rs.simOrig.width = leftW; rs.simOrig.height = leftH;
      rs.simNew.width  = rightW; rs.simNew.height = rightH;
      ctxSimOrig.save();
      ctxSimOrig.imageSmoothingEnabled = false;
      ctxSimOrig.clearRect(0,0,leftW,leftH);
      const sFit = Math.min(leftW / rs.origW, leftH / rs.origH);
      const dW = Math.max(1, Math.floor(rs.origW * sFit)), dH = Math.max(1, Math.floor(rs.origH * sFit));
      const dx0 = Math.floor((leftW - dW) / 2), dy0 = Math.floor((leftH - dH) / 2);
      ctxSimOrig.drawImage(rs.img, 0,0, rs.origW,rs.origH, dx0,dy0, dW,dH);
      ctxSimOrig.restore();
      const W = parseInt(rs.w.value||'0',10), H = parseInt(rs.h.value||'0',10);
      ctxSimNew.save();
      ctxSimNew.imageSmoothingEnabled = false;
      ctxSimNew.clearRect(0,0,rightW,rightH);
      if (Number.isFinite(W) && Number.isFinite(H) && W>0 && H>0) {
        const tiny = createCanvas(W, H), tctx = tiny.getContext('2d', { willReadFrequently: true });
        tctx.imageSmoothingEnabled = false;
        tctx.clearRect(0,0,W,H);
        tctx.drawImage(rs.img, 0,0, rs.origW,rs.origH, 0,0, W,H);
        const id = tctx.getImageData(0,0,W,H), data = id.data;
        for (let i=0;i<data.length;i+=4) { if (data[i+3] !== 0) data[i+3]=255; }
        tctx.putImageData(id, 0, 0);
        const s2 = Math.min(rightW / W, rightH / H);
        const dW2 = Math.max(1, Math.floor(W * s2)), dH2 = Math.max(1, Math.floor(H * s2));
        const dx2 = Math.floor((rightW - dW2)/2), dy2 = Math.floor((rightH - dH2)/2);
        ctxSimNew.drawImage(tiny, 0,0, W,H, dx2,dy2, dW2,dH2);
      } else {
        ctxSimNew.drawImage(rs.img, 0,0, rs.origW,rs.origH, dx0,dy0, dW,dH);
      }
      ctxSimNew.restore();
    }
    const syncAdvFieldsToState = () => {
      rs.updating = true;
      rs.multRange.value = String(rs.mult); rs.multInput.value = String(rs.mult);
      rs.blockW.value = String(rs.gapX); rs.blockH.value = String(rs.gapY);
      rs.offX.value = String(rs.offx); rs.offY.value = String(rs.offy);
      rs.dotR.value = String(rs.dotr); rs.dotRVal.textContent = String(rs.dotr);
      rs.updating = false;
    };
    function syncAdvancedMeta() {
      const { cols, rows } = sampleDims(), limit = (cols >= MAX_OVERLAY_DIM || rows >= MAX_OVERLAY_DIM);
      if (rs.mode === 'advanced') {
        rs.applyBtn.disabled = !rs.calcReady;
      } else {
        const W = parseInt(rs.w.value||'0',10), H = parseInt(rs.h.value||'0',10);
        const ok = Number.isFinite(W)&&Number.isFinite(H)&&W>0&&H>0&&W<MAX_OVERLAY_DIM&&H<MAX_OVERLAY_DIM;
        rs.applyBtn.disabled = !ok;
      }
      updateFooterMeta();
    }
    function drawAdvancedPreview() {
      if (rs.mode !== 'advanced' || !rs.img) return;
      const w = rs.origW, h = rs.origH;
      const destW = Math.max(50, Math.floor(rs.advWrap.clientWidth)), destH = Math.max(50, Math.floor(rs.advWrap.clientHeight));
      rs.preview.width = destW; rs.preview.height = destH;
      const sw = Math.max(1, Math.floor(destW / rs.zoom)), sh = Math.max(1, Math.floor(destH / rs.zoom));
      const maxX = Math.max(0, w - sw), maxY = Math.max(0, h - sh);
      rs.viewX = Math.min(Math.max(0, rs.viewX), maxX);
      rs.viewY = Math.min(Math.max(0, rs.viewY), maxY);
      ctxPrev.save();
      ctxPrev.imageSmoothingEnabled = false;
      ctxPrev.clearRect(0,0,destW,destH);
      ctxPrev.drawImage(rs.img, rs.viewX, rs.viewY, sw, sh, 0, 0, destW, destH);
      if (rs.gridToggle.checked && rs.gapX >= 1 && rs.gapY >= 1) {
        ctxPrev.strokeStyle = 'rgba(255,59,48,0.45)';
        ctxPrev.lineWidth = 1;
        const startGX = Math.ceil((rs.viewX - rs.offx) / rs.gapX), endGX   = Math.floor((rs.viewX + sw - rs.offx) / rs.gapX);
        const startGY = Math.ceil((rs.viewY - rs.offy) / rs.gapY), endGY   = Math.floor((rs.viewY + sh - rs.offy) / rs.gapY);
        const linesX = Math.max(0, endGX - startGX + 1), linesY = Math.max(0, endGY - startGY + 1);
        if (linesX <= 4000 && linesY <= 4000) {
          ctxPrev.beginPath();
          for (let gx = startGX; gx <= endGX; gx++) {
            const x = rs.offx + gx * rs.gapX, px = Math.round((x - rs.viewX) * rs.zoom);
            ctxPrev.moveTo(px + 0.5, 0);
            ctxPrev.lineTo(px + 0.5, destH);
          }
          for (let gy = startGY; gy <= endGY; gy++) {
            const y = rs.offy + gy * rs.gapY, py = Math.round((y - rs.viewY) * rs.zoom);
            ctxPrev.moveTo(0, py + 0.5);
            ctxPrev.lineTo(destW, py + 0.5);
          }
          ctxPrev.stroke();
        }
      }
      if (rs.gapX >= 1 && rs.gapY >= 1) {
        ctxPrev.fillStyle = '#ff3b30';
        const cx0 = rs.offx + Math.floor(rs.gapX/2), cy0 = rs.offy + Math.floor(rs.gapY/2);
        if (cx0 >= 0 && cy0 >= 0) {
          const startX = Math.ceil((rs.viewX - cx0) / rs.gapX), startY = Math.ceil((rs.viewY - cy0) / rs.gapY);
          const endY = Math.floor((rs.viewY + sh - 1 - cy0) / rs.gapY), endX2 = Math.floor((rs.viewX + sw - 1 - cx0) / rs.gapX);
          const r = rs.dotr, dotsX = Math.max(0, endX2 - startX + 1), dotsY = Math.max(0, endY - startY + 1);
          if (dotsX * dotsY <= 300000) {
            for (let gy = startY; gy <= endY; gy++) {
              const y = cy0 + gy * rs.gapY;
              for (let gx = startX; gx <= endX2; gx++) {
                const x = cx0 + gx * rs.gapX, px = Math.round((x - rs.viewX) * rs.zoom), py = Math.round((y - rs.viewY) * rs.zoom);
                ctxPrev.beginPath();
                ctxPrev.arc(px, py, r, 0, Math.PI*2);
                ctxPrev.fill();
              }
            }
          }
        }
      }
      ctxPrev.restore();
    }
    function drawAdvancedResultPreview() {
      const canvas = rs.calcCanvas, wrap = rs.resWrap;
      if (!wrap || !canvas) {
        ctxRes.clearRect(0,0, rs.resCanvas.width, rs.resCanvas.height);
        rs.resMeta.textContent = 'Sin resultado. Haz clic en Calcular.';
        return;
      }
      const W = canvas.width, H = canvas.height;
      const availW = Math.max(50, Math.floor(wrap.clientWidth - 16)), availH = Math.max(50, Math.floor(wrap.clientHeight - 16));
      const s = Math.min(availW / W, availH / H);
      const dW = Math.max(1, Math.floor(W * s)), dH = Math.max(1, Math.floor(H * s));
      rs.resCanvas.width = dW; rs.resCanvas.height = dH;
      ctxRes.save();
      ctxRes.imageSmoothingEnabled = false;
      ctxRes.clearRect(0,0,dW,dH);
      ctxRes.drawImage(canvas, 0,0, W,H, 0,0, dW,dH);
      ctxRes.restore();
      rs.resMeta.textContent = `Salida: ${W}×${H}${(W>=MAX_OVERLAY_DIM||H>=MAX_OVERLAY_DIM) ? ` (excede el límite: < ${MAX_OVERLAY_DIM}×${MAX_OVERLAY_DIM})` : ''}`;
    }
    rs._drawSimplePreview = drawSimplePreview; rs._drawAdvancedPreview = drawAdvancedPreview; rs._drawAdvancedResultPreview = drawAdvancedResultPreview;
    const setMode = (m) => {
      rs.mode = m;
      rs.tabSimple.classList.toggle('active', m === 'simple'); rs.tabAdvanced.classList.toggle('active', m === 'advanced');
      rs.paneSimple.classList.toggle('show', m === 'simple'); rs.paneAdvanced.classList.toggle('show', m === 'advanced');
      updateFooterMeta();
      rs.calcBtn.style.display = (m === 'advanced') ? 'inline-block' : 'none';
      if (m === 'advanced') { rs.applyBtn.disabled = !rs.calcReady; } else { syncSimpleNote(); }
      syncAdvancedMeta();
      if (m === 'advanced') { drawAdvancedPreview(); drawAdvancedResultPreview(); } else { drawSimplePreview(); }
    };
    rs.tabSimple.addEventListener('click', () => setMode('simple'));
    rs.tabAdvanced.addEventListener('click', () => setMode('advanced'));
    const onWidthInput = () => {
      if (rs.updating) return; rs.updating = true;
      const W = parseInt(rs.w.value||'0',10);
      if (rs.lock.checked && rs.origW>0 && rs.origH>0 && W>0) { rs.h.value = Math.max(1, Math.round(W * rs.origH / rs.origW)); }
      rs.updating = false; syncSimpleNote(); if (rs.mode === 'simple') drawSimplePreview();
    };
    const onHeightInput = () => {
      if (rs.updating) return; rs.updating = true;
      const H = parseInt(rs.h.value||'0',10);
      if (rs.lock.checked && rs.origW>0 && rs.origH>0 && H>0) { rs.w.value = Math.max(1, Math.round(H * rs.origW / rs.origH)); }
      rs.updating = false; syncSimpleNote(); if (rs.mode === 'simple') drawSimplePreview();
    };
    rs.w.addEventListener('input', onWidthInput); rs.h.addEventListener('input', onHeightInput);
    rs.onex.addEventListener('click', () => { applyScaleToFields(1); drawSimplePreview(); });
    rs.half.addEventListener('click', () => { applyScaleToFields(0.5); drawSimplePreview(); });
    rs.third.addEventListener('click', () => { applyScaleToFields(1/3); drawSimplePreview(); });
    rs.quarter.addEventListener('click', () => { applyScaleToFields(1/4); drawSimplePreview(); });
    rs.double.addEventListener('click', () => { applyScaleToFields(2); drawSimplePreview(); });
    rs.applyScale.addEventListener('click', () => {
      const s = parseFloat(rs.scale.value||'');
      if (!Number.isFinite(s) || s<=0) { showToast('Ingresa un factor de escala válido > 0'); return; }
      applyScaleToFields(s); drawSimplePreview();
    });
    const markCalcStale = () => {
      if (rs.mode === 'advanced') { rs.calcReady = false; rs.applyBtn.disabled = true; drawAdvancedResultPreview(); updateFooterMeta(); }
    };
    const onMultChange = (v) => {
      if (rs.updating) return;
      const parsed = parseFloat(v); if (!Number.isFinite(parsed)) return;
      const clamped = Math.min(Math.max(parsed, 1), 128);
      rs.mult = clamped;
      if (rs.bind.checked) { rs.gapX = clamped; rs.gapY = clamped; }
      syncAdvFieldsToState(); syncAdvancedMeta(); drawAdvancedPreview(); markCalcStale();
    };
    rs.multRange.addEventListener('input', (e) => { if (rs.updating) return; onMultChange(e.target.value); });
    rs.multInput.addEventListener('input', (e) => {
      if (rs.updating) return;
      const v = e.target.value; if (!Number.isFinite(parseFloat(v))) return;
      onMultChange(v);
    });
    rs.bind.addEventListener('change', () => {
      if (rs.bind.checked) { rs.gapX = rs.mult; rs.gapY = rs.mult; syncAdvFieldsToState(); }
      syncAdvancedMeta(); drawAdvancedPreview(); markCalcStale();
    });
    rs.blockW.addEventListener('input', (e) => {
      if (rs.updating) return;
      const raw = e.target.value, val = parseFloat(raw); if (!Number.isFinite(val)) return;
      rs.gapX = Math.min(Math.max(val, 1), 4096);
      if (rs.bind.checked) { rs.mult = rs.gapX; rs.gapY = rs.gapX; }
      syncAdvFieldsToState(); syncAdvancedMeta(); drawAdvancedPreview(); markCalcStale();
    });
    rs.blockH.addEventListener('input', (e) => {
      if (rs.updating) return;
      const raw = e.target.value, val = parseFloat(raw); if (!Number.isFinite(val)) return;
      rs.gapY = Math.min(Math.max(val, 1), 4096);
      if (rs.bind.checked) { rs.mult = rs.gapY; rs.gapX = rs.gapY; }
      syncAdvFieldsToState(); syncAdvancedMeta(); drawAdvancedPreview(); markCalcStale();
    });
    rs.offX.addEventListener('input', (e) => {
      const raw = e.target.value, val = parseFloat(raw); if (!Number.isFinite(val)) return;
      rs.offx = Math.min(Math.max(val, 0), Math.max(0, rs.origH-0.0001));
      rs.viewX = Math.min(rs.viewX, Math.max(0, rs.origW - 1));
      syncAdvancedMeta(); drawAdvancedPreview(); markCalcStale();
    });
    rs.offY.addEventListener('input', (e) => {
      const raw = e.target.value, val = parseFloat(raw); if (!Number.isFinite(val)) return;
      rs.offy = Math.min(Math.max(val, 0), Math.max(0, rs.origH-0.0001));
      rs.viewY = Math.min(rs.viewY, Math.max(0, rs.origH - 1));
      syncAdvancedMeta(); drawAdvancedPreview(); markCalcStale();
    });
    rs.dotR.addEventListener('input', (e) => {
      rs.dotr = Math.max(1, Math.round(Number(e.target.value)||1));
      rs.dotRVal.textContent = String(rs.dotr);
      drawAdvancedPreview();
    });
    rs.gridToggle.addEventListener('change', drawAdvancedPreview);
    const applyZoom = (factor) => {
      const destW = Math.max(50, Math.floor(rs.advWrap.clientWidth)), destH = Math.max(50, Math.floor(rs.advWrap.clientHeight));
      const sw = Math.max(1, Math.floor(destW / rs.zoom)), sh = Math.max(1, Math.floor(destH / rs.zoom));
      const cx = rs.viewX + sw / 2, cy = rs.viewY + sh / 2;
      rs.zoom = Math.min(32, Math.max(0.1, rs.zoom * factor));
      const sw2 = Math.max(1, Math.floor(destW / rs.zoom)), sh2 = Math.max(1, Math.floor(destH / rs.zoom));
      rs.viewX = Math.min(Math.max(0, Math.round(cx - sw2 / 2)), Math.max(0, rs.origW - sw2));
      rs.viewY = Math.min(Math.max(0, Math.round(cy - sh2 / 2)), Math.max(0, rs.origH - sh2));
      drawAdvancedPreview();
    };
    rs.zoomIn.addEventListener('click', () => applyZoom(1.25));
    rs.zoomOut.addEventListener('click', () => applyZoom(1/1.25));
    rs.advWrap.addEventListener('wheel', (e) => { if (!e.ctrlKey) return; e.preventDefault(); const delta = e.deltaY || 0; applyZoom(delta > 0 ? 1/1.15 : 1.15); }, { passive: false });
    const onPanDown = (e) => {
      if (e.target.closest('.op-rs-zoom')) return;
      rs.panning = true; rs.panStart = { x: e.clientX, y: e.clientY, viewX: rs.viewX, viewY: rs.viewY };
      rs.advWrap.classList.remove('op-pan-grab'); rs.advWrap.classList.add('op-pan-grabbing');
      rs.advWrap.setPointerCapture?.(e.pointerId);
    };
    const onPanMove = (e) => {
      if (!rs.panning) return;
      const dx = e.clientX - rs.panStart.x, dy = e.clientY - rs.panStart.y;
      const wrapW = rs.advWrap.clientWidth, wrapH = rs.advWrap.clientHeight;
      const sw = Math.max(1, Math.floor(wrapW / rs.zoom)), sh = Math.max(1, Math.floor(wrapH / rs.zoom));
      let nx = rs.panStart.viewX - Math.round(dx / rs.zoom), ny = rs.panStart.viewY - Math.round(dy / rs.zoom);
      nx = Math.min(Math.max(0, nx), Math.max(0, rs.origW - sw));
      ny = Math.min(Math.max(0, ny), Math.max(0, rs.origH - sh));
      rs.viewX = nx; rs.viewY = ny;
      drawAdvancedPreview();
    };
    const onPanUp = (e) => {
      if (!rs.panning) return;
      rs.panning = false; rs.panStart = null;
      rs.advWrap.classList.remove('op-pan-grabbing'); rs.advWrap.classList.add('op-pan-grab');
      rs.advWrap.releasePointerCapture?.(e.pointerId);
    };
    rs.advWrap.addEventListener('pointerdown', onPanDown); rs.advWrap.addEventListener('pointermove', onPanMove);
    rs.advWrap.addEventListener('pointerup', onPanUp); rs.advWrap.addEventListener('pointercancel', onPanUp); rs.advWrap.addEventListener('pointerleave', onPanUp);
    const close = () => closeRSModal();
    rs.cancelBtn.addEventListener('click', close); rs.closeBtn.addEventListener('click', close); backdrop.addEventListener('click', close);
    rs.calcBtn.addEventListener('click', async () => {
      if (rs.mode !== 'advanced') return;
      try {
        const { cols, rows } = sampleDims();
        if (cols<=0 || rows<=0) { showToast('No hay muestras. Ajusta el multiplicador/offset.'); return; }
        if (cols >= MAX_OVERLAY_DIM || rows >= MAX_OVERLAY_DIM) { showToast(`Salida demasiado grande. Debe ser < ${MAX_OVERLAY_DIM}×${MAX_OVERLAY_DIM}.`); return; }
        const canvas = await reconstructViaGrid(rs.img, rs.origW, rs.origH, rs.offx, rs.offy, rs.gapX, rs.gapY);
        rs.calcCanvas = canvas; rs.calcCols = cols; rs.calcRows = rows; rs.calcReady = true; rs.applyBtn.disabled = false;
        drawAdvancedResultPreview(); updateFooterMeta();
        showToast(`Calculado ${cols}×${rows}. Revisa la previsualización y luego aplica.`);
      } catch (e) { console.error(e); showToast('El cálculo falló.'); }
    });
    rs.applyBtn.addEventListener('click', async () => {
      if (!rs.ov) return;
      try {
        if (rs.mode === 'simple') {
          const W = parseInt(rs.w.value||'0',10), H = parseInt(rs.h.value||'0',10);
          if (!Number.isFinite(W) || !Number.isFinite(H) || W<=0 || H<=0) { showToast('Dimensiones inválidas'); return; }
          if (W >= MAX_OVERLAY_DIM || H >= MAX_OVERLAY_DIM) { showToast(`Demasiado grande. Debe ser < ${MAX_OVERLAY_DIM}×${MAX_OVERLAY_DIM}.`); return; }
          await resizeOverlayImage(rs.ov, W, H);
          closeRSModal(); showToast(`Redimensionado a ${W}×${H}.`);
        } else {
          if (!rs.calcReady || !rs.calcCanvas) { showToast('Calcula primero.'); return; }
          const dataUrl = await canvasToDataURLSafe(rs.calcCanvas);
          rs.ov.imageBase64 = dataUrl; rs.ov.imageUrl = null; rs.ov.isLocal = true;
          await saveConfig(['overlays']);
          clearOverlayCache(); ensureHook(); updateUI();
          closeRSModal(); showToast(`Aplicado ${rs.calcCols}×${rs.calcRows}.`);
        }
      } catch (e) { console.error(e); showToast('La aplicación falló.'); }
    });
    rs._syncAdvancedMeta = syncAdvancedMeta; rs._syncSimpleNote = syncSimpleNote;
    rs._setMode = (m) => { const evt = new Event('click'); (m === 'simple' ? rs.tabSimple : rs.tabAdvanced).dispatchEvent(evt); };
  }

function openRSModal(overlay) {
    if (!rs) return;
    rs.ov = overlay;
    const img = new Image();
    img.onload = () => {
      rs.img = img; rs.origW = img.width; rs.origH = img.height;
      rs.orig.value = `${rs.origW}×${rs.origH}`; rs.w.value = String(rs.origW); rs.h.value = String(rs.origH); rs.lock.checked = true;
      rs.zoom = 1.0; rs.mult = 4; rs.gapX = 4; rs.gapY = 4; rs.offx = 0; rs.offy = 0; rs.dotr = 1; rs.viewX = 0; rs.viewY = 0;
      rs.bind.checked = true; rs.multRange.value = '4'; rs.multInput.value = '4'; rs.blockW.value = '4'; rs.blockH.value = '4';
      rs.offX.value = '0'; rs.offY.value = '0'; rs.dotR.value = '1'; rs.dotRVal.textContent = '1'; rs.gridToggle.checked = true;
      rs.calcCanvas = null; rs.calcCols = 0; rs.calcRows = 0; rs.calcReady = false; rs.applyBtn.disabled = (rs.mode === 'advanced');
      rs._setMode('simple');
      document.body.classList.add('op-scroll-lock'); rs.backdrop.classList.add('show'); rs.modal.classList.add('show');
      rs._drawSimplePreview?.(); rs._drawAdvancedPreview?.(); rs._drawAdvancedResultPreview?.(); rs._syncAdvancedMeta?.(); rs._syncSimpleNote?.();
      const setFooterNow = () => {
        if (rs.mode === 'advanced') {
          const { cols, rows } = (function(){ const x = Math.floor((rs.origW - rs.offx) / rs.gapX); const y = Math.floor((rs.origH - rs.offy) / rs.gapY); return { cols: Math.max(0,x), rows: Math.max(0,y) };})();
          rs.meta.textContent = (cols>0&&rows>0) ? `Muestras: ${cols} × ${rows} | Salida: ${cols}×${rows}${(cols>=MAX_OVERLAY_DIM||rows>=MAX_OVERLAY_DIM)?` (excede el límite: < ${MAX_OVERLAY_DIM}×${MAX_OVERLAY_DIM})`:''}` : 'Ajusta el multiplicador/offset hasta que los puntos se centren.';
        } else {
          const W = parseInt(rs.w.value||'0',10); const H = parseInt(rs.h.value||'0',10);
          const ok = Number.isFinite(W)&&Number.isFinite(H)&&W>0&&H>0;
          const limit = (W>=MAX_OVERLAY_DIM||H>=MAX_OVERLAY_DIM);
          rs.meta.textContent = ok ? (limit ? `Objetivo: ${W}×${H} (excede el límite: < ${MAX_OVERLAY_DIM}×${MAX_OVERLAY_DIM})` : `Objetivo: ${W}×${H} (OK)`) : 'Ingresa un ancho y alto positivos.';
        }
      };
      setFooterNow();
      const onResize = () => {
        if (rs.mode === 'simple') rs._drawSimplePreview?.();
        else { rs._drawAdvancedPreview?.(); rs._drawAdvancedResultPreview?.(); }
      };
      rs._resizeHandler = onResize;
      window.addEventListener('resize', onResize);
    };
    img.src = overlay.imageBase64;
  }

  function closeRSModal() {
    if (!rs) return;
    window.removeEventListener('resize', rs._resizeHandler || (()=>{}));
    rs.backdrop.classList.remove('show');
    rs.modal.classList.remove('show');
    rs.ov = null;
    rs.img = null;
    document.body.classList.remove('op-scroll-lock');
  }

  async function resizeOverlayImage(ov, targetW, targetH) {
    const img = await loadImage(ov.imageBase64);
    const canvas = createHTMLCanvas(targetW, targetH);
    const ctx = canvas.getContext('2d', { willReadFrequently: true });
    ctx.imageSmoothingEnabled = false;
    ctx.clearRect(0,0,targetW,targetH);
    ctx.drawImage(img, 0,0, img.width,img.height, 0,0, targetW,targetH);
    const id = ctx.getImageData(0,0,targetW,targetH);
    const data = id.data;
    for (let i=0;i<data.length;i+=4) {
      if (data[i+3] === 0) { data[i]=0; data[i+1]=0; data[i+2]=0; data[i+3]=0; }
      else { data[i+3] = 255; }
    }
    ctx.putImageData(id, 0, 0);
    const dataUrl = canvas.toDataURL('image/png');
    ov.imageBase64 = dataUrl;
    ov.imageUrl = null;
    ov.isLocal = true;
    await saveConfig(['overlays']);
    clearOverlayCache();
    ensureHook();
    updateUI();
  }

  async function reconstructViaGrid(img, origW, origH, offx, offy, gapX, gapY) {
    const srcCanvas = createCanvas(origW, origH);
    const sctx = srcCanvas.getContext('2d', { willReadFrequently: true });
    sctx.imageSmoothingEnabled = false;
    sctx.drawImage(img, 0, 0);
    const srcData = sctx.getImageData(0,0,origW,origH).data;
    const cols = Math.floor((origW - offx) / gapX);
    const rows = Math.floor((origH - offy) / gapY);
    if (cols <= 0 || rows <= 0) throw new Error('No samples available with current offset/gap');
    const outCanvas = createHTMLCanvas(cols, rows);
    const octx = outCanvas.getContext('2d');
    const out = octx.createImageData(cols, rows);
    const odata = out.data;
    const cx0 = offx + gapX / 2;
    const cy0 = offy + gapY / 2;
    const clamp = (v, min, max) => Math.min(Math.max(v, min), max);
    for (let ry=0; ry<rows; ry++) {
      for (let rx=0; rx<cols; rx++) {
        const sx = Math.round(clamp(cx0 + rx*gapX, 0, origW-1));
        const sy = Math.round(clamp(cy0 + ry*gapY, 0, origH-1));
        const si = (sy*origW + sx) * 4;
        const r = srcData[si], g = srcData[si+1], b = srcData[si+2], a = srcData[si+3];
        const oi = (ry*cols + rx) * 4;
        if (a === 0) {
          odata[oi] = 0; odata[oi+1] = 0; odata[oi+2] = 0; odata[oi+3] = 0;
        } else {
          odata[oi] = r; odata[oi+1] = g; odata[oi+2] = b; odata[oi+3] = 255;
        }
      }
    }
    octx.putImageData(out, 0, 0);
    return outCanvas;
  }

function main() {
  loadConfig().then(() => {
    injectStyles();
    const onReady = () => {
        createUI();
        ensureHook();
        applyTheme();
        console.log("Overlay Pro: Script cargado.");
        if (config.isColorPanelVisible) {
            setTimeout(() => {
                updateOverlayProgress();
            }, 1500);
        }
    };
    if (document.readyState === 'loading') {
        window.addEventListener('DOMContentLoaded', onReady);
    } else {
        onReady();
    }
  });
}
main();
})();