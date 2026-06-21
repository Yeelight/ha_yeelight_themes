#!/usr/bin/env node

import { copyFile, mkdir, writeFile } from "node:fs/promises";
import { dirname, join, resolve } from "node:path";
import { fileURLToPath } from "node:url";
import { chromium } from "playwright";

const ROOT = resolve(dirname(fileURLToPath(import.meta.url)), "..");
const OUTPUT_DIR = join(ROOT, "assets/screenshots");
const REPORT_FILE = join(OUTPUT_DIR, "ha-native-controls.json");
const THEME_FILE = join(ROOT, "themes/yeelight.yaml");
const HA_URL = (process.env.HA_URL || "http://localhost:18124").replace(/\/$/, "");
const HA_USERNAME = process.env.HA_USERNAME;
const HA_PASSWORD = process.env.HA_PASSWORD;
const DEFAULT_HA_CONFIG_DIR = HA_URL.includes(":18124")
  ? resolve(ROOT, "../../../../config/homeassistant-verify")
  : resolve(ROOT, "../../../../config/homeassistant");
const HA_CONFIG_DIR = process.env.HA_CONFIG_DIR || DEFAULT_HA_CONFIG_DIR;
const HA_RUNTIME_THEME_FILE = process.env.HA_RUNTIME_THEME_FILE || join(HA_CONFIG_DIR, "themes/yeelight.yaml");
const HEADLESS = process.env.HEADLESS !== "0";
const WAIT_TIMEOUT = Number(process.env.HA_CONTROL_TIMEOUT || 60_000);
const PROFILE_PATH = process.env.HA_PROFILE_PATH || "/profile/general";
const THEME_CASES = [
  { name: "Yeelight Dark" },
  { name: "Yeelight Panel" },
  { name: "Yeelight Classic Dark" },
  { name: "Yeelight Minimal", dark: true },
];

function fail(message) {
  throw new Error(message);
}

function parseRgb(value) {
  let match = value.match(/^#([0-9a-f]{3}|[0-9a-f]{6}|[0-9a-f]{8})$/i);
  if (match) {
    let hex = match[1];
    if (hex.length === 3) {
      hex = hex
        .split("")
        .map((part) => `${part}${part}`)
        .join("");
    }
    return {
      r: parseInt(hex.slice(0, 2), 16),
      g: parseInt(hex.slice(2, 4), 16),
      b: parseInt(hex.slice(4, 6), 16),
      a: 1,
    };
  }

  match = value.match(/^rgba?\(\s*([0-9.]+)\s*,\s*([0-9.]+)\s*,\s*([0-9.]+)(?:\s*,\s*([0-9.]+))?\s*\)$/i);
  if (!match) return null;
  return {
    r: Number(match[1]),
    g: Number(match[2]),
    b: Number(match[3]),
    a: match[4] === undefined ? 1 : Number(match[4]),
  };
}

function luminance({ r, g, b }) {
  const normalize = (channel) => {
    const value = channel / 255;
    return value <= 0.03928 ? value / 12.92 : ((value + 0.055) / 1.055) ** 2.4;
  };
  return 0.2126 * normalize(r) + 0.7152 * normalize(g) + 0.0722 * normalize(b);
}

function contrast(background, foreground) {
  const bg = parseRgb(background);
  const fg = parseRgb(foreground);
  if (!bg || !fg || bg.a === 0 || fg.a === 0) return null;
  const bgLum = luminance(bg);
  const fgLum = luminance(fg);
  return (Math.max(bgLum, fgLum) + 0.05) / (Math.min(bgLum, fgLum) + 0.05);
}

async function syncThemeFile() {
  await mkdir(dirname(HA_RUNTIME_THEME_FILE), { recursive: true });
  await copyFile(THEME_FILE, HA_RUNTIME_THEME_FILE);
}

async function waitForHomeAssistant(page) {
  await page.waitForFunction(() => Boolean(document.querySelector("home-assistant")?.hass), null, { timeout: WAIT_TIMEOUT });
}

async function fillShadowInput(page, name, value) {
  await page.evaluate(
    ({ name: inputName, value: inputValue }) => {
      function findInput(root) {
        const input = root.querySelector?.(`input[name="${inputName}"]`);
        if (input) return input;
        for (const element of root.querySelectorAll?.("*") || []) {
          if (element.shadowRoot) {
            const found = findInput(element.shadowRoot);
            if (found) return found;
          }
        }
        return null;
      }

      const input = findInput(document);
      if (!input) throw new Error(`Unable to find ${inputName} input.`);
      input.value = inputValue;
      input.dispatchEvent(new Event("input", { bubbles: true, composed: true }));
      input.dispatchEvent(new Event("change", { bubbles: true, composed: true }));
    },
    { name, value }
  );
}

async function clickLoginButton(page) {
  const clicked = await page.evaluate(() => {
    function findLoginButton(root) {
      for (const element of root.querySelectorAll?.("button, ha-button, mwc-button") || []) {
        const label = (element.textContent || element.getAttribute("aria-label") || "").trim().toLowerCase();
        if (label.includes("log in") || label.includes("login") || label.includes("登录") || label.includes("登入")) {
          return element.shadowRoot?.querySelector("button") || element;
        }
      }
      for (const element of root.querySelectorAll?.("*") || []) {
        if (element.shadowRoot) {
          const found = findLoginButton(element.shadowRoot);
          if (found) return found;
        }
      }
      return null;
    }

    const button = findLoginButton(document);
    if (!button) return false;
    button.click();
    return true;
  });
  if (!clicked) fail("Unable to find the Home Assistant login button.");
}

async function loginIfNeeded(page) {
  await page.goto(`${HA_URL}${PROFILE_PATH}`, { waitUntil: "domcontentloaded", timeout: WAIT_TIMEOUT });
  const hasHass = await page
    .waitForFunction(() => Boolean(document.querySelector("home-assistant")?.hass), null, { timeout: 8_000 })
    .then(() => true)
    .catch(() => false);
  if (hasHass) return;

  if (!HA_USERNAME || !HA_PASSWORD) {
    fail("HA_USERNAME and HA_PASSWORD are required when the Home Assistant session is not already authenticated.");
  }
  await fillShadowInput(page, "username", HA_USERNAME);
  await fillShadowInput(page, "password", HA_PASSWORD);
  await clickLoginButton(page);
  await waitForHomeAssistant(page);
}

async function setTheme(page, themeCase) {
  await page.evaluate(async ({ name, dark }) => {
    const hass = document.querySelector("home-assistant")?.hass;
    if (!hass) throw new Error("Home Assistant frontend object is not available.");
    await hass.callService("frontend", "reload_themes");
    const value = dark === undefined ? { theme: name } : { theme: name, dark };
    await hass.connection.sendMessagePromise({
      type: "frontend/set_user_data",
      key: "theme",
      value,
    });
  }, themeCase);

  await page.reload({ waitUntil: "domcontentloaded", timeout: WAIT_TIMEOUT });
  await waitForHomeAssistant(page);
  await page.goto(`${HA_URL}${PROFILE_PATH}`, { waitUntil: "domcontentloaded", timeout: WAIT_TIMEOUT });
  await waitForHomeAssistant(page);
  await page.waitForTimeout(1_500);
}

async function sampleControls(page, themeCase) {
  const sample = await page.evaluate(async ({ name, dark }) => {
    function collect(root, selector, out = []) {
      for (const element of root.querySelectorAll?.(selector) || []) out.push(element);
      for (const element of root.querySelectorAll?.("*") || []) {
        if (element.shadowRoot) collect(element.shadowRoot, selector, out);
      }
      return out;
    }

    function readStyle(element) {
      const style = getComputedStyle(element);
      const vars = [
        "--ha-color-form-background",
        "--ha-color-form-background-disabled",
        "--ha-color-on-neutral-normal",
        "--ha-color-border-neutral-loud",
        "--wa-color-surface-raised",
        "--wa-color-surface-border",
        "--wa-color-text-normal",
        "--wa-color-text-quiet",
        "--mdc-select-fill-color",
        "--mdc-select-ink-color",
        "--md-filled-select-text-field-container-color",
        "--md-filled-select-text-field-input-text-color",
      ];
      return {
        tag: element.localName,
        text: (element.innerText || element.textContent || element.getAttribute("label") || element.getAttribute("value") || "").trim().slice(0, 120),
        color: style.color,
        backgroundColor: style.backgroundColor,
        borderColor: style.borderColor,
        vars: Object.fromEntries(vars.map((token) => [token, style.getPropertyValue(token).trim()])),
      };
    }

    const fields = collect(document, "ha-picker-field");
    const dropdowns = collect(document, "ha-dropdown");
    const items = collect(document, "ha-dropdown-item");
    const selects = collect(document, "ha-select");
    const firstSelect = selects[0];
    firstSelect?.click();
    await new Promise((resolve) => setTimeout(resolve, 500));

    return {
      theme: name,
      dark,
      url: location.href,
      activeTheme: document.querySelector("home-assistant")?.hass?.themes?.theme,
      selectedTheme: document.querySelector("home-assistant")?.hass?.selectedTheme,
      counts: {
        select: selects.length,
        pickerField: fields.length,
        dropdown: dropdowns.length,
        dropdownItem: items.length,
      },
      document: readStyle(document.documentElement),
      select: firstSelect ? readStyle(firstSelect) : null,
      pickerField: fields[0] ? readStyle(fields[0]) : null,
      dropdown: dropdowns[0] ? readStyle(dropdowns[0]) : null,
      dropdownItem: items[0] ? readStyle(items[0]) : null,
    };
  }, themeCase);

  if (sample.activeTheme !== themeCase.name || sample.selectedTheme?.theme !== themeCase.name) {
    fail(`Home Assistant did not apply ${themeCase.name}. active=${sample.activeTheme || "none"}`);
  }
  if (themeCase.dark !== undefined && sample.selectedTheme?.dark !== themeCase.dark) {
    fail(`Home Assistant did not apply ${themeCase.name} dark=${themeCase.dark}. selected=${JSON.stringify(sample.selectedTheme)}`);
  }
  if (sample.counts.select < 1 || sample.counts.pickerField < 1 || sample.counts.dropdownItem < 1) {
    fail(`${themeCase.name} did not expose profile select/dropdown controls.`);
  }

  const checks = [
    ["document", "--ha-color-form-background", "--ha-color-on-neutral-normal", 4.5],
    ["document", "--wa-color-surface-raised", "--wa-color-text-normal", 4.5],
    ["document", "--wa-color-surface-raised", "--wa-color-text-quiet", 3],
    ["select", "--mdc-select-fill-color", "--mdc-select-ink-color", 4.5],
    ["select", "--md-filled-select-text-field-container-color", "--md-filled-select-text-field-input-text-color", 4.5],
  ];

  sample.contrast = {};
  for (const [section, backgroundToken, foregroundToken, minimum] of checks) {
    const block = sample[section];
    const background = block?.vars?.[backgroundToken];
    const foreground = block?.vars?.[foregroundToken];
    const ratio = contrast(background, foreground);
    const key = `${section}:${backgroundToken}/${foregroundToken}`;
    sample.contrast[key] = ratio;
    if (ratio === null || ratio < minimum) {
      fail(`${themeCase.name} low control contrast for ${key}: ${ratio?.toFixed(2) || "n/a"} (${background} / ${foreground})`);
    }
  }

  return sample;
}

async function main() {
  await mkdir(OUTPUT_DIR, { recursive: true });
  await syncThemeFile();

  const browser = await chromium.launch({ headless: HEADLESS });
  const page = await browser.newPage({ viewport: { width: 1253, height: 691 }, deviceScaleFactor: 1 });
  const report = [];

  try {
    await loginIfNeeded(page);
    for (const themeCase of THEME_CASES) {
      await setTheme(page, themeCase);
      const sample = await sampleControls(page, themeCase);
      const fileName = `native-controls-${themeCase.name.toLowerCase().replaceAll(" ", "-")}.png`;
      await page.screenshot({ path: join(OUTPUT_DIR, fileName), fullPage: false });
      report.push({ ...sample, screenshot: `assets/screenshots/${fileName}` });
    }
  } finally {
    await browser.close();
  }

  await writeFile(
    REPORT_FILE,
    `${JSON.stringify({ capturedAt: new Date().toISOString(), haUrl: HA_URL, profilePath: PROFILE_PATH, themes: report }, null, 2)}\n`
  );
  console.log(`Validated native HA controls for ${report.length} Yeelight dark theme cases.`);
}

main().catch((error) => {
  console.error(error);
  process.exit(1);
});
