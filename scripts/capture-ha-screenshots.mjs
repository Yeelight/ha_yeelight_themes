#!/usr/bin/env node

import { mkdir, writeFile } from "node:fs/promises";
import { dirname, join, resolve } from "node:path";
import { fileURLToPath } from "node:url";
import { chromium } from "playwright";

const ROOT = resolve(dirname(fileURLToPath(import.meta.url)), "..");
const OUTPUT_DIR = join(ROOT, "assets/screenshots");
const REPORT_FILE = join(OUTPUT_DIR, "ha-theme-screenshots.json");
const HA_URL = (process.env.HA_URL || "http://localhost:18124").replace(/\/$/, "");
const HA_USERNAME = process.env.HA_USERNAME;
const HA_PASSWORD = process.env.HA_PASSWORD;
const HEADLESS = process.env.HEADLESS !== "0";
const DASHBOARD_PATH = process.env.HA_DASHBOARD_PATH || "/home/overview";
const WAIT_TIMEOUT = Number(process.env.HA_SCREENSHOT_TIMEOUT || 60_000);
const REQUIRED_THEMES = [
  { name: "Yeelight Light", file: "yeelight-light.png" },
  { name: "Yeelight Dark", file: "yeelight-dark.png" },
  { name: "Yeelight Panel", file: "yeelight-panel.png" },
  { name: "Yeelight Classic Light", file: "yeelight-classic-light.png" },
  { name: "Yeelight Classic Dark", file: "yeelight-classic-dark.png" },
  { name: "Yeelight Minimal", file: "yeelight-minimal.png" },
];

function fail(message) {
  throw new Error(message);
}

async function waitForHomeAssistant(page) {
  await page.waitForFunction(
    () => Boolean(document.querySelector("home-assistant")?.hass),
    null,
    { timeout: WAIT_TIMEOUT }
  );
}

async function gotoDashboard(page) {
  await page.goto(`${HA_URL}${DASHBOARD_PATH}`, { waitUntil: "domcontentloaded", timeout: WAIT_TIMEOUT });
  if (page.url().includes("/auth/authorize")) {
    await page.waitForURL((url) => !url.pathname.startsWith("/auth/"), { timeout: WAIT_TIMEOUT }).catch(() => undefined);
  }
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
      if (!input) {
        throw new Error(`Unable to find ${inputName} input.`);
      }
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
  if (!clicked) {
    fail("Unable to find the Home Assistant login button.");
  }
}

async function loginIfNeeded(page) {
  await gotoDashboard(page);
  const hasHass = await page
    .waitForFunction(() => Boolean(document.querySelector("home-assistant")?.hass), null, { timeout: 8_000 })
    .then(() => true)
    .catch(() => false);
  if (hasHass) {
    await waitForHomeAssistant(page);
    return;
  }

  if (!HA_USERNAME || !HA_PASSWORD) {
    fail("HA_USERNAME and HA_PASSWORD are required when the Home Assistant session is not already authenticated.");
  }

  await fillShadowInput(page, "username", HA_USERNAME);
  await fillShadowInput(page, "password", HA_PASSWORD);
  await clickLoginButton(page);
  await waitForHomeAssistant(page);
}

async function ensureAuthenticated(page) {
  const hasHass = await page
    .waitForFunction(() => Boolean(document.querySelector("home-assistant")?.hass), null, { timeout: 5_000 })
    .then(() => true)
    .catch(() => false);
  if (hasHass) return;

  const body = await page.locator("body").evaluate((element) => element.innerText).catch(() => "");
  if (page.url().includes("/auth/") || body.includes("Welcome home") || body.includes("Log in")) {
    if (!HA_USERNAME || !HA_PASSWORD) {
      fail("Home Assistant asked for authentication, but HA_USERNAME and HA_PASSWORD are not set.");
    }
    await fillShadowInput(page, "username", HA_USERNAME);
    await fillShadowInput(page, "password", HA_PASSWORD);
    await clickLoginButton(page);
  }
  await waitForHomeAssistant(page);
}

async function setTheme(page, themeName) {
  await page.evaluate(async (name) => {
    const hass = document.querySelector("home-assistant")?.hass;
    if (!hass) {
      throw new Error("Home Assistant frontend object is not available.");
    }
    await hass.connection.sendMessagePromise({
      type: "frontend/set_user_data",
      key: "theme",
      value: { theme: name },
    });
  }, themeName);

  console.log(`Applying ${themeName}...`);
  await page.reload({ waitUntil: "domcontentloaded", timeout: WAIT_TIMEOUT });
  try {
    await ensureAuthenticated(page);
  } catch (error) {
    await page.screenshot({ path: join(OUTPUT_DIR, `debug-${themeName.toLowerCase().replaceAll(" ", "-")}.png`), fullPage: false }).catch(() => undefined);
    const body = await page.locator("body").evaluate((element) => element.innerText).catch(() => "");
    fail(`Home Assistant did not finish loading after applying ${themeName}. url=${page.url()} body=${body.slice(0, 400)} error=${error.message}`);
  }
  await page.waitForTimeout(2_000);
}

async function sampleTheme(page, themeName) {
  return page.evaluate((name) => {
    const rootStyle = getComputedStyle(document.documentElement);
    const card = document.querySelector("ha-card");
    const cardStyle = card ? getComputedStyle(card) : null;
    const themeNames = Object.keys(document.querySelector("home-assistant")?.hass?.themes?.themes || {});
    return {
      theme: name,
      activeTheme: document.querySelector("home-assistant")?.hass?.themes?.theme,
      selectedTheme: document.querySelector("home-assistant")?.hass?.selectedTheme,
      hasTheme: themeNames.includes(name),
      variables: {
        primaryColor: rootStyle.getPropertyValue("--primary-color").trim(),
        primaryBackgroundColor: rootStyle.getPropertyValue("--primary-background-color").trim(),
        cardBackgroundColor: rootStyle.getPropertyValue("--ha-card-background").trim(),
        haCardBorderRadius: rootStyle.getPropertyValue("--ha-card-border-radius").trim(),
        ylPrimary: rootStyle.getPropertyValue("--yl-primary").trim(),
      },
      card: cardStyle
        ? {
            backgroundColor: cardStyle.backgroundColor,
            borderRadius: cardStyle.borderRadius,
            color: cardStyle.color,
          }
        : null,
    };
  }, themeName);
}

async function main() {
  await mkdir(OUTPUT_DIR, { recursive: true });
  const browser = await chromium.launch({ headless: HEADLESS });
  const page = await browser.newPage({ viewport: { width: 1440, height: 960 }, deviceScaleFactor: 1 });
  const report = [];

  try {
    await loginIfNeeded(page);
    await page.evaluate(async () => {
      const hass = document.querySelector("home-assistant")?.hass;
      await hass?.callService?.("frontend", "reload_themes");
    });

    for (const theme of REQUIRED_THEMES) {
      await setTheme(page, theme.name);
      const sample = await sampleTheme(page, theme.name);
      if (!sample.hasTheme) {
        fail(`Home Assistant did not load ${theme.name}.`);
      }
      if (sample.activeTheme !== theme.name || sample.selectedTheme?.theme !== theme.name) {
        fail(
          `Home Assistant did not apply ${theme.name}. ` +
            `active=${sample.activeTheme || "none"} selected=${sample.selectedTheme?.theme || "none"} url=${page.url()}`
        );
      }
      if (!sample.variables.primaryColor || !sample.variables.primaryBackgroundColor || !sample.variables.ylPrimary) {
        fail(`${theme.name} did not expose expected CSS variables.`);
      }
      await page.screenshot({ path: join(OUTPUT_DIR, theme.file), fullPage: false });
      report.push({ ...sample, screenshot: `assets/screenshots/${theme.file}` });
    }
  } finally {
    await browser.close();
  }

  await writeFile(REPORT_FILE, `${JSON.stringify({ capturedAt: new Date().toISOString(), haUrl: HA_URL, themes: report }, null, 2)}\n`);
  console.log(`Captured ${report.length} Home Assistant theme screenshots.`);
}

main().catch((error) => {
  console.error(error);
  process.exit(1);
});
