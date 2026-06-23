#!/usr/bin/env node

import { existsSync, readdirSync, readFileSync, statSync } from "node:fs";
import { dirname, join, resolve } from "node:path";
import { fileURLToPath } from "node:url";

const ROOT = resolve(dirname(fileURLToPath(import.meta.url)), "..");
const WORKSPACE_ROOT = resolve(ROOT, "../..");
const THEMES_DIR = join(ROOT, "themes");
const THEME_FILE = join(THEMES_DIR, "yeelight.yaml");
const HACS_FILE = join(ROOT, "hacs.json");
const README_FILE = join(ROOT, "README.md");
const README_ZH_FILE = join(ROOT, "README_zh.md");
const SCREENSHOTS_DIR = join(ROOT, "assets/screenshots");
const SCREENSHOT_REPORT_FILE = join(SCREENSHOTS_DIR, "ha-theme-screenshots.json");
const NATIVE_CONTROL_REPORT_FILE = join(SCREENSHOTS_DIR, "ha-native-controls.json");
const HACS_PR_BODY_FILE = join(ROOT, "docs/hacs-default-pr-body.md");
const HACS_SUBMISSION_DOC_FILE = join(ROOT, "docs/hacs-default-submission.md");
const DOCKERFILE = join(WORKSPACE_ROOT, "Dockerfile");
const CONFIGURATION_FILE = join(WORKSPACE_ROOT, "config/configuration.yaml");
const ENTRYPOINT_FILE = join(WORKSPACE_ROOT, "scripts/docker-entrypoint.sh");
const RUN_SH_FILE = join(WORKSPACE_ROOT, "run.sh");
const THEME_MIGRATION_FILE = join(WORKSPACE_ROOT, "config/www/yeelight-theme-migration.js");
const CONFIG_THEMES_DIR = join(WORKSPACE_ROOT, "config/themes");
const YEELIGHT_UI_PACKAGE = join(WORKSPACE_ROOT, "config/packages/yeelight_ui.yaml");
const LUCORE_UI_PACKAGE = join(WORKSPACE_ROOT, "config/packages/lucore_ui.yaml");

const REQUIRED_THEMES = [
  "Yeelight Light",
  "Yeelight Dark",
  "Yeelight Panel",
  "Yeelight Classic Light",
  "Yeelight Classic Dark",
  "Yeelight Minimal",
];
const REQUIRED_SCREENSHOTS = [
  ["Yeelight Light", "assets/screenshots/yeelight-light.png"],
  ["Yeelight Dark", "assets/screenshots/yeelight-dark.png"],
  ["Yeelight Panel", "assets/screenshots/yeelight-panel.png"],
  ["Yeelight Classic Light", "assets/screenshots/yeelight-classic-light.png"],
  ["Yeelight Classic Dark", "assets/screenshots/yeelight-classic-dark.png"],
  ["Yeelight Minimal", "assets/screenshots/yeelight-minimal.png"],
];
const REQUIRED_NATIVE_CONTROL_SCREENSHOTS = [
  { theme: "Yeelight Dark", screenshot: "assets/screenshots/native-controls-yeelight-dark.png" },
  { theme: "Yeelight Panel", screenshot: "assets/screenshots/native-controls-yeelight-panel.png" },
  { theme: "Yeelight Classic Dark", screenshot: "assets/screenshots/native-controls-yeelight-classic-dark.png" },
  { theme: "Yeelight Minimal", screenshot: "assets/screenshots/native-controls-yeelight-minimal.png", dark: true },
];
const REQUIRED_TOKENS = [
  "primary-color",
  "accent-color",
  "dark-primary-color",
  "light-primary-color",
  "primary-background-color",
  "secondary-background-color",
  "card-background-color",
  "ha-card-background",
  "divider-color",
  "primary-text-color",
  "secondary-text-color",
  "disabled-text-color",
  "text-primary-color",
  "app-header-background-color",
  "app-header-text-color",
  "sidebar-background-color",
  "sidebar-icon-color",
  "sidebar-text-color",
  "sidebar-selected-background-color",
  "sidebar-selected-icon-color",
  "sidebar-selected-text-color",
  "mdc-theme-primary",
  "mdc-theme-secondary",
  "mdc-theme-surface",
  "mdc-theme-on-primary",
  "mdc-theme-on-surface",
  "md-sys-color-primary",
  "md-sys-color-on-primary",
  "md-sys-color-surface",
  "md-sys-color-surface-container",
  "md-sys-color-surface-container-highest",
  "md-sys-color-on-surface",
  "md-sys-color-on-surface-variant",
  "md-sys-color-outline",
  "ha-color-form-background",
  "ha-color-form-background-disabled",
  "ha-color-border-neutral-loud",
  "ha-color-on-neutral-normal",
  "ha-color-fill-primary-quiet-resting",
  "ha-color-fill-primary-quiet-hover",
  "ha-dialog-surface-background",
  "wa-color-surface-raised",
  "wa-color-surface-border",
  "wa-color-text-normal",
  "wa-color-text-quiet",
  "wa-color-neutral-fill-normal",
  "wa-color-neutral-on-quiet",
  "wa-color-danger-on-quiet",
  "wa-color-danger-fill-normal",
  "wa-color-danger-on-normal",
  "mdc-select-fill-color",
  "mdc-select-ink-color",
  "mdc-select-label-ink-color",
  "mdc-select-dropdown-icon-color",
  "mdc-select-idle-line-color",
  "mdc-select-hover-line-color",
  "mdc-text-field-fill-color",
  "mdc-text-field-ink-color",
  "mdc-text-field-label-ink-color",
  "mdc-text-field-disabled-fill-color",
  "md-filled-select-text-field-container-color",
  "md-filled-select-text-field-input-text-color",
  "md-filled-select-text-field-label-text-color",
  "md-filled-select-text-field-trailing-icon-color",
  "md-filled-text-field-container-color",
  "md-filled-text-field-input-text-color",
  "md-filled-text-field-label-text-color",
  "md-filled-text-field-trailing-icon-color",
  "ha-select-background",
  "ha-select-text-color",
  "ha-select-label-color",
  "ha-select-dropdown-icon-color",
  "ha-picker-field-background-color",
  "ha-picker-field-input-color",
  "ha-picker-field-label-color",
  "ha-picker-field-icon-color",
  "mdc-menu-surface-fill-color",
  "mdc-menu-item-ink-color",
  "mdc-list-item-primary-text-color",
  "mdc-list-item-secondary-text-color",
  "input-fill-color",
  "input-ink-color",
  "input-label-ink-color",
  "switch-checked-color",
  "switch-unchecked-color",
  "slider-color",
  "slider-secondary-color",
  "paper-input-container-color",
  "paper-input-container-focus-color",
  "paper-button-ink-color",
  "paper-item-icon-color",
  "paper-item-icon-active-color",
  "state-icon-color",
  "state-icon-active-color",
  "state-icon-unavailable-color",
  "state-light-active-color",
  "state-switch-active-color",
  "state-fan-active-color",
  "state-cover-active-color",
  "state-media_player-active-color",
  "state-binary_sensor-on-color",
  "state-lock-locked-color",
  "state-alarm_control_panel-armed_away-color",
  "success-color",
  "warning-color",
  "error-color",
  "info-color",
  "ha-card-border-radius",
  "ha-card-box-shadow",
  "yl-primary",
  "yl-accent",
  "yl-surface",
  "yl-surface-soft",
  "yl-text",
  "yl-muted",
  "yl-radius-card",
  "yl-card-shadow",
  "yl-room-image-tint",
  "yl-hero-glow-color",
  "yl-scene-warm-color",
];

const CONTROL_CONTRAST_CHECKS = [
  ["input-fill-color", "input-ink-color", 4.5],
  ["input-fill-color", "input-label-ink-color", 3],
  ["mdc-select-fill-color", "mdc-select-ink-color", 4.5],
  ["mdc-select-fill-color", "mdc-select-label-ink-color", 3],
  ["mdc-select-fill-color", "mdc-select-dropdown-icon-color", 3],
  ["mdc-text-field-fill-color", "mdc-text-field-ink-color", 4.5],
  ["mdc-text-field-fill-color", "mdc-text-field-label-ink-color", 3],
  ["md-filled-select-text-field-container-color", "md-filled-select-text-field-input-text-color", 4.5],
  ["md-filled-select-text-field-container-color", "md-filled-select-text-field-label-text-color", 3],
  ["md-filled-select-text-field-container-color", "md-filled-select-text-field-trailing-icon-color", 3],
  ["md-filled-text-field-container-color", "md-filled-text-field-input-text-color", 4.5],
  ["md-filled-text-field-container-color", "md-filled-text-field-label-text-color", 3],
  ["ha-color-form-background", "ha-color-on-neutral-normal", 4.5],
  ["ha-picker-field-background-color", "ha-picker-field-input-color", 4.5],
  ["ha-picker-field-background-color", "ha-picker-field-label-color", 3],
  ["ha-picker-field-background-color", "ha-picker-field-icon-color", 3],
  ["wa-color-surface-raised", "wa-color-text-normal", 4.5],
  ["wa-color-surface-raised", "wa-color-text-quiet", 3],
  ["mdc-menu-surface-fill-color", "mdc-menu-item-ink-color", 4.5],
  ["mdc-menu-surface-fill-color", "mdc-list-item-primary-text-color", 4.5],
  ["mdc-menu-surface-fill-color", "mdc-list-item-secondary-text-color", 3],
  ["md-sys-color-surface-container-highest", "md-sys-color-on-surface", 4.5],
  ["md-sys-color-surface-container-highest", "md-sys-color-on-surface-variant", 3],
  ["primary-color", "mdc-theme-on-primary", 4.5],
  ["md-sys-color-primary", "md-sys-color-on-primary", 4.5],
];

function fail(message) {
  throw new Error(message);
}

function readText(file) {
  if (!existsSync(file)) {
    fail(`Missing file: ${file}`);
  }
  return readFileSync(file, "utf8");
}

function parseYamlScalar(value) {
  const trimmed = value.trim();
  if (!trimmed) {
    return "";
  }
  const withoutComment = trimmed.replace(/\s+#.*$/, "");
  const doubleQuoted = withoutComment.match(/^"([^"]*)"\s*$/);
  if (doubleQuoted) {
    return doubleQuoted[1];
  }
  const singleQuoted = withoutComment.match(/^'([^']*)'\s*$/);
  if (singleQuoted) {
    return singleQuoted[1];
  }
  return withoutComment.trim();
}

function parseCssColor(value) {
  const color = parseYamlScalar(value || "");
  let match = color.match(/^#([0-9a-f]{3}|[0-9a-f]{6}|[0-9a-f]{8})$/i);
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
    };
  }

  match = color.match(/^rgba?\(\s*([0-9.]+)\s*,\s*([0-9.]+)\s*,\s*([0-9.]+)(?:\s*,\s*([0-9.]+))?\s*\)$/i);
  if (match) {
    return {
      r: Number(match[1]),
      g: Number(match[2]),
      b: Number(match[3]),
    };
  }

  return null;
}

function relativeLuminance({ r, g, b }) {
  const normalize = (channel) => {
    const value = channel / 255;
    return value <= 0.03928 ? value / 12.92 : ((value + 0.055) / 1.055) ** 2.4;
  };
  return 0.2126 * normalize(r) + 0.7152 * normalize(g) + 0.0722 * normalize(b);
}

function contrastRatio(background, foreground) {
  const bg = parseCssColor(background);
  const fg = parseCssColor(foreground);
  if (!bg || !fg) {
    return null;
  }
  const bgLum = relativeLuminance(bg);
  const fgLum = relativeLuminance(fg);
  return (Math.max(bgLum, fgLum) + 0.05) / (Math.min(bgLum, fgLum) + 0.05);
}

function parseThemeKeys(yaml) {
  const themes = new Map();
  const anchors = new Map();
  let currentTheme = null;
  let currentMode = null;

  for (const rawLine of yaml.split(/\r?\n/)) {
    if (!rawLine.trim() || rawLine.trimStart().startsWith("#")) {
      continue;
    }

    const top = rawLine.match(/^"([^"]+)":(?:\s*&([A-Za-z0-9_-]+))?\s*$/);
    if (top) {
      currentTheme = {
        keys: new Set(),
        values: new Map(),
        modes: new Map(),
        modeValues: new Map(),
        mergeAnchors: [],
        modeMergeAnchors: new Map(),
      };
      themes.set(top[1], currentTheme);
      if (top[2]) {
        anchors.set(top[2], currentTheme.keys);
      }
      currentMode = null;
      continue;
    }

    if (!currentTheme) {
      continue;
    }

    const mode = rawLine.match(/^    (light|dark):\s*$/);
    if (mode) {
      currentMode = mode[1];
      currentTheme.modes.set(currentMode, new Set());
      currentTheme.modeValues.set(currentMode, new Map());
      currentTheme.modeMergeAnchors.set(currentMode, []);
      continue;
    }

    const merge = rawLine.match(/^(?:  |      )<<:\s*\*([A-Za-z0-9_-]+)\s*$/);
    if (merge) {
      if (currentMode) {
        currentTheme.modeMergeAnchors.get(currentMode).push(merge[1]);
      } else {
        currentTheme.mergeAnchors.push(merge[1]);
      }
      continue;
    }

    const modeKey = rawLine.match(/^      ([A-Za-z0-9_-]+):\s*(.*)$/);
    if (currentMode && modeKey) {
      currentTheme.modes.get(currentMode).add(modeKey[1]);
      currentTheme.modeValues.get(currentMode).set(modeKey[1], parseYamlScalar(modeKey[2]));
      continue;
    }

    const key = rawLine.match(/^  ([A-Za-z0-9_-]+):\s*(.*)$/);
    if (key && key[1] !== "modes") {
      currentTheme.keys.add(key[1]);
      currentTheme.values.set(key[1], parseYamlScalar(key[2]));
    }
  }

  for (const theme of themes.values()) {
    for (const anchor of theme.mergeAnchors) {
      const source = anchors.get(anchor);
      if (!source) {
        fail(`Unknown YAML merge anchor: ${anchor}`);
      }
      for (const key of source) {
        theme.keys.add(key);
      }
    }

    for (const [mode, modeAnchors] of theme.modeMergeAnchors) {
      const modeTokens = theme.modes.get(mode);
      for (const anchor of modeAnchors) {
        const source = anchors.get(anchor);
        if (!source) {
          fail(`Unknown YAML merge anchor in mode ${mode}: ${anchor}`);
        }
        for (const key of source) {
          modeTokens.add(key);
        }
      }
    }
  }

  return themes;
}

function assertHacsMetadata() {
  const hacs = JSON.parse(readText(HACS_FILE));

  if (hacs.name !== "Yeelight Themes") {
    fail("hacs.json name must stay Yeelight Themes.");
  }
  if (hacs.filename !== "yeelight.yaml") {
    fail("hacs.json filename must point to yeelight.yaml.");
  }
  if (hacs.content_in_root !== false) {
    fail("hacs.json content_in_root must be false for themes/ layout.");
  }
  if ("zip_release" in hacs) {
    fail("hacs.json must not use zip_release for a theme repository.");
  }
}

function assertThemeFiles() {
  if (!existsSync(THEMES_DIR)) {
    fail("Missing themes directory.");
  }

  const yamlFiles = readdirSync(THEMES_DIR).filter((file) => /\.ya?ml$/i.test(file));
  if (yamlFiles.length !== 1 || yamlFiles[0] !== "yeelight.yaml") {
    fail(`Expected exactly themes/yeelight.yaml, found: ${yamlFiles.join(", ") || "none"}`);
  }
}

function assertNoYamlMergeKeys() {
  const yaml = readText(THEME_FILE);

  if (/^\s*<<:\s*/m.test(yaml)) {
    fail("themes/yeelight.yaml must not use YAML merge keys because Home Assistant reports duplicate-key warnings for merge overrides.");
  }
  if (/^\s*[^#\n]+:\s*&[A-Za-z0-9_-]+\s*$/m.test(yaml) || /^\s*[^#\n]+:\s*\*[A-Za-z0-9_-]+\s*$/m.test(yaml)) {
    fail("themes/yeelight.yaml must not use YAML anchors or aliases in release output.");
  }
}

function assertThemeTokens() {
  const themes = parseThemeKeys(readText(THEME_FILE));
  const names = [...themes.keys()];

  if (names.join("|") !== REQUIRED_THEMES.join("|")) {
    fail(`Unexpected theme order or names: ${names.join(", ")}`);
  }
  if (names.some((name) => !name.startsWith("Yeelight "))) {
    fail(`All exported theme names must start with Yeelight: ${names.join(", ")}`);
  }

  for (const name of REQUIRED_THEMES) {
    const theme = themes.get(name);
    if (!theme) {
      fail(`Missing theme: ${name}`);
    }

    const tokenSets =
      name === "Yeelight Minimal"
        ? ["light", "dark"].map((mode) => {
            const modeTokens = theme.modes.get(mode);
            if (!modeTokens) {
              fail("Yeelight Minimal must define both modes.light and modes.dark.");
            }
            return {
              label: `${name} ${mode}`,
              tokens: new Set([...theme.keys, ...modeTokens]),
              values: new Map([...theme.values, ...(theme.modeValues.get(mode) || new Map())]),
            };
          })
        : [{ label: name, tokens: theme.keys, values: theme.values }];

    if (name === "Yeelight Minimal" && theme.modes.get("dark").size < 20) {
      fail("Yeelight Minimal modes.dark must override the light baseline with a real dark palette.");
    }

    for (const { label, tokens, values } of tokenSets) {
      const missing = REQUIRED_TOKENS.filter((token) => !tokens.has(token));
      if (missing.length > 0) {
        fail(`${label} is missing required tokens: ${missing.join(", ")}`);
      }
      assertControlContrast(label, tokens, values);
    }
  }
}

function assertControlContrast(label, tokens, values) {
  for (const [backgroundToken, foregroundToken, minimum] of CONTROL_CONTRAST_CHECKS) {
    if (!tokens.has(backgroundToken) || !tokens.has(foregroundToken)) {
      fail(`${label} cannot check contrast because ${backgroundToken} or ${foregroundToken} is missing.`);
    }

    const background = values.get(backgroundToken);
    const foreground = values.get(foregroundToken);
    const ratio = contrastRatio(background, foreground);
    if (ratio === null) {
      fail(`${label} has non-static colors for ${backgroundToken}/${foregroundToken}: ${background} / ${foreground}`);
    }
    if (ratio < minimum) {
      fail(
        `${label} contrast ${backgroundToken} vs ${foregroundToken} is ${ratio.toFixed(2)}, ` +
          `expected at least ${minimum}. Values: ${background} / ${foreground}`
      );
    }
  }
}

function assertDocs() {
  const readme = readText(README_FILE);
  const readmeZh = readText(README_ZH_FILE);
  const combined = `${readme}\n${readmeZh}`;

  for (const theme of REQUIRED_THEMES) {
    if (!combined.includes(theme)) {
      fail(`README files must mention ${theme}.`);
    }
  }

  for (const phrase of ["optional companion", "visuals only", "frontend.reload_themes"]) {
    if (!readme.includes(phrase)) {
      fail(`README.md must mention "${phrase}".`);
    }
  }
  if (!/\!\[[^\]]+\]\(assets\/preview\.svg\)/.test(readme)) {
    fail("README.md must include the theme preview image for HACS review.");
  }
  if (!readme.includes("Real Home Assistant screenshots")) {
    fail("README.md must include real Home Assistant screenshots.");
  }

  for (const phrase of ["可选配套主题", "只影响视觉", "frontend.reload_themes"]) {
    if (!readmeZh.includes(phrase)) {
      fail(`README_zh.md must mention "${phrase}".`);
    }
  }
  if (!/\!\[[^\]]+\]\(assets\/preview\.svg\)/.test(readmeZh)) {
    fail("README_zh.md must include the theme preview image for HACS review.");
  }
  if (!readmeZh.includes("真实 Home Assistant 截图")) {
    fail("README_zh.md must include real Home Assistant screenshots.");
  }

  for (const [_theme, screenshot] of REQUIRED_SCREENSHOTS) {
    if (!readme.includes(screenshot) || !readmeZh.includes(screenshot)) {
      fail(`README files must reference ${screenshot}.`);
    }
  }
}

function assertScreenshotEvidence() {
  const report = JSON.parse(readText(SCREENSHOT_REPORT_FILE));
  const capturedThemes = new Map((report.themes || []).map((theme) => [theme.theme, theme]));

  for (const [theme, screenshot] of REQUIRED_SCREENSHOTS) {
    const file = join(ROOT, screenshot);
    if (!existsSync(file)) {
      fail(`Missing real Home Assistant screenshot for ${theme}: ${screenshot}`);
    }
    const size = statSync(file).size;
    if (size < 20_000) {
      fail(`Screenshot for ${theme} is unexpectedly small: ${screenshot}`);
    }

    const entry = capturedThemes.get(theme);
    if (!entry) {
      fail(`Screenshot report must include ${theme}.`);
    }
    if (entry.screenshot !== screenshot) {
      fail(`Screenshot report path mismatch for ${theme}: ${entry.screenshot}`);
    }
    if (entry.activeTheme !== theme || entry.selectedTheme?.theme !== theme) {
      fail(`Screenshot report must confirm ${theme} was the active HA theme.`);
    }
    for (const token of ["primaryColor", "primaryBackgroundColor", "cardBackgroundColor", "haCardBorderRadius", "ylPrimary"]) {
      if (!entry.variables?.[token]) {
        fail(`Screenshot report for ${theme} is missing CSS token sample: ${token}`);
      }
    }
  }
}

function assertNativeControlEvidence() {
  const report = JSON.parse(readText(NATIVE_CONTROL_REPORT_FILE));
  const capturedThemes = new Map((report.themes || []).map((theme) => [theme.theme, theme]));

  for (const { theme, screenshot, dark } of REQUIRED_NATIVE_CONTROL_SCREENSHOTS) {
    const file = join(ROOT, screenshot);
    if (!existsSync(file)) {
      fail(`Missing native HA control screenshot for ${theme}: ${screenshot}`);
    }
    const size = statSync(file).size;
    if (size < 20_000) {
      fail(`Native control screenshot for ${theme} is unexpectedly small: ${screenshot}`);
    }

    const entry = capturedThemes.get(theme);
    if (!entry) {
      fail(`Native control report must include ${theme}.`);
    }
    if (entry.screenshot !== screenshot) {
      fail(`Native control report path mismatch for ${theme}: ${entry.screenshot}`);
    }
    if (entry.activeTheme !== theme || entry.selectedTheme?.theme !== theme) {
      fail(`Native control report must confirm ${theme} was the active HA theme.`);
    }
    if (dark !== undefined && entry.selectedTheme?.dark !== dark) {
      fail(`Native control report must confirm ${theme} dark=${dark}.`);
    }
    if (entry.counts?.select < 1 || entry.counts?.pickerField < 1 || entry.counts?.dropdownItem < 1) {
      fail(`Native control report for ${theme} must include select, picker field, and dropdown item samples.`);
    }
    const contrastEntries = Object.entries(entry.contrast || {});
    if (contrastEntries.length < 5) {
      fail(`Native control report for ${theme} must include all native control contrast samples.`);
    }
    for (const [key, ratio] of contrastEntries) {
      if (typeof ratio !== "number" || ratio < 4.5) {
        fail(`Native control report for ${theme} has low contrast ${key}: ${ratio}`);
      }
    }
  }
}

function assertHacsSubmissionDocs() {
  const body = readText(HACS_PR_BODY_FILE);
  const docs = readText(HACS_SUBMISSION_DOC_FILE);

  if (body.includes("\\n")) {
    fail("HACS PR body template contains literal escaped newline text.");
  }
  if (!body.includes("## Checklist") || !body.includes("## Links")) {
    fail("HACS PR body template must keep the upstream Checklist and Links sections.");
  }
  if (!body.includes("hacs.xyz/docs/publish/action") || !body.includes("releases/tag/v1.0.2")) {
    fail("HACS PR body template must include validation action and release links.");
  }
  if (!/actions\/runs\/(\d+|TODO)>/.test(body)) {
    fail("HACS PR body template must include a successful HACS action run link or TODO while preparing the next release.");
  }
  if (!body.includes("- [ ] (For integrations only) I've added the [hassfest action]")) {
    fail("HACS PR body template must leave the integration-only hassfest checklist item unchecked for a theme repository.");
  }
  if (!body.includes("Link to successful hassfest action (if integration): <>")) {
    fail("HACS PR body template must leave the integration-only hassfest link empty for a theme repository.");
  }

  for (const phrase of ["New default repository", "--body-file", "theme", "hacs/default"]) {
    if (!docs.includes(phrase)) {
      fail(`HACS submission notes must mention "${phrase}".`);
    }
  }
}

function canValidateWorkspaceIntegration() {
  return [
    DOCKERFILE,
    CONFIGURATION_FILE,
    ENTRYPOINT_FILE,
    RUN_SH_FILE,
    THEME_MIGRATION_FILE,
    YEELIGHT_UI_PACKAGE,
    LUCORE_UI_PACKAGE,
  ].every((file) => existsSync(file));
}

function assertDistributionIntegration() {
  const dockerfile = readText(DOCKERFILE);
  const configuration = readText(CONFIGURATION_FILE);
  const entrypoint = readText(ENTRYPOINT_FILE);
  const runSh = readText(RUN_SH_FILE);
  const migration = readText(THEME_MIGRATION_FILE);

  if (!dockerfile.includes("extensions/ha_yeelight_themes/themes/yeelight.yaml")) {
    fail("Dockerfile must copy the Yeelight theme package YAML into the image.");
  }
  if (!dockerfile.includes("/opt/lucore-homeassistant/yeelight-themes/yeelight.yaml")) {
    fail("Dockerfile must place the theme package under /opt/lucore-homeassistant/yeelight-themes.");
  }
  if (!entrypoint.includes("sync_yeelight_theme_pack")) {
    fail("docker-entrypoint.sh must sync the Yeelight theme package.");
  }
  if (!entrypoint.includes("$TEMPLATE_ROOT/yeelight-themes/yeelight.yaml")) {
    fail("docker-entrypoint.sh must read the packaged Yeelight theme YAML.");
  }
  if (!entrypoint.includes("$CONFIG_DIR/themes/yeelight.yaml")) {
    fail("docker-entrypoint.sh must sync the package to /config/themes/yeelight.yaml.");
  }
  if (entrypoint.includes("$TEMPLATE_ROOT/config/themes")) {
    fail("docker-entrypoint.sh must not use config/themes as the Yeelight theme source.");
  }
  if (!runSh.includes("/opt/lucore-homeassistant/yeelight-themes:ro")) {
    fail("run.sh --dev-mount must mount the Yeelight theme package source.");
  }
  if (!configuration.includes("/local/yeelight-theme-migration.js")) {
    fail("configuration.yaml must load the Yeelight theme migration frontend module.");
  }
  for (const [legacyName, themeName] of Object.entries({
    yeelight_light: "Yeelight Light",
    yeelight_dark: "Yeelight Dark",
    yeelight_panel: "Yeelight Panel",
    lucore_light: "Yeelight Classic Light",
    lucore_dark: "Yeelight Classic Dark",
  })) {
    if (!migration.includes(legacyName) || !migration.includes(themeName)) {
      fail(`theme-migration.js must map ${legacyName} to ${themeName}.`);
    }
  }
}

function assertRuntimePackagesUseThemeNames() {
  const combinedPackages = `${readText(YEELIGHT_UI_PACKAGE)}\n${readText(LUCORE_UI_PACKAGE)}`;
  const legacyIds = [
    "lucore_light",
    "lucore_dark",
    "yeelight_light",
    "yeelight_dark",
    "yeelight_panel",
    "Lucore Light",
    "Lucore Dark",
  ];

  for (const legacyId of legacyIds) {
    if (combinedPackages.includes(legacyId)) {
      fail(`Runtime theme packages must not reference legacy theme id/name: ${legacyId}`);
    }
  }

  for (const theme of REQUIRED_THEMES) {
    if (!combinedPackages.includes(theme)) {
      fail(`Runtime theme packages must expose ${theme}.`);
    }
  }
}

function assertLegacyThemeSourceRemoved() {
  if (!existsSync(CONFIG_THEMES_DIR)) {
    return;
  }

  const yamlFiles = readdirSync(CONFIG_THEMES_DIR).filter((file) => /\.ya?ml$/i.test(file));
  if (yamlFiles.length > 0) {
    fail(`config/themes must not contain Yeelight-owned source YAML files: ${yamlFiles.join(", ")}`);
  }
}

// 该脚本验证 HACS 发布形态和主题 token 覆盖；完整 YAML 解析仍交给 Home Assistant check_config。
assertHacsMetadata();
assertThemeFiles();
assertNoYamlMergeKeys();
assertThemeTokens();
assertDocs();
assertScreenshotEvidence();
assertNativeControlEvidence();
assertHacsSubmissionDocs();

if (canValidateWorkspaceIntegration()) {
  assertDistributionIntegration();
  assertRuntimePackagesUseThemeNames();
  assertLegacyThemeSourceRemoved();
}

console.log("Yeelight themes validation passed.");
