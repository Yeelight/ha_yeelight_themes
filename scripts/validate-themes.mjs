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
const HACS_PR_BODY_FILE = join(ROOT, "docs/hacs-default-pr-body.md");
const HACS_SUBMISSION_DOC_FILE = join(ROOT, "docs/hacs-default-submission.md");
const DOCKERFILE = join(WORKSPACE_ROOT, "Dockerfile");
const CONFIGURATION_FILE = join(WORKSPACE_ROOT, "config/configuration.yaml");
const ENTRYPOINT_FILE = join(WORKSPACE_ROOT, "scripts/docker-entrypoint.sh");
const RUN_SH_FILE = join(WORKSPACE_ROOT, "run.sh");
const THEME_MIGRATION_FILE = join(WORKSPACE_ROOT, "config/www/yeelight/theme-migration.js");
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

function fail(message) {
  throw new Error(message);
}

function readText(file) {
  if (!existsSync(file)) {
    fail(`Missing file: ${file}`);
  }
  return readFileSync(file, "utf8");
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
        modes: new Map(),
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

    const modeKey = rawLine.match(/^      ([A-Za-z0-9_-]+):/);
    if (currentMode && modeKey) {
      currentTheme.modes.get(currentMode).add(modeKey[1]);
      continue;
    }

    const key = rawLine.match(/^  ([A-Za-z0-9_-]+):/);
    if (key && key[1] !== "modes") {
      currentTheme.keys.add(key[1]);
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
            return { label: `${name} ${mode}`, tokens: new Set([...theme.keys, ...modeTokens]) };
          })
        : [{ label: name, tokens: theme.keys }];

    if (name === "Yeelight Minimal" && theme.modes.get("dark").size < 20) {
      fail("Yeelight Minimal modes.dark must override the light baseline with a real dark palette.");
    }

    for (const { label, tokens } of tokenSets) {
      const missing = REQUIRED_TOKENS.filter((token) => !tokens.has(token));
      if (missing.length > 0) {
        fail(`${label} is missing required tokens: ${missing.join(", ")}`);
      }
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

function assertHacsSubmissionDocs() {
  const body = readText(HACS_PR_BODY_FILE);
  const docs = readText(HACS_SUBMISSION_DOC_FILE);

  if (body.includes("\\n")) {
    fail("HACS PR body template contains literal escaped newline text.");
  }
  if (!body.includes("## Checklist") || !body.includes("## Links")) {
    fail("HACS PR body template must keep the upstream Checklist and Links sections.");
  }
  if (!body.includes("hacs.xyz/docs/publish/action") || !body.includes("actions/runs/27744600672") || !body.includes("releases/tag/v1.0.1")) {
    fail("HACS PR body template must include validation action and release links.");
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
  if (!configuration.includes("/local/yeelight/theme-migration.js")) {
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
assertHacsSubmissionDocs();

if (canValidateWorkspaceIntegration()) {
  assertDistributionIntegration();
  assertRuntimePackagesUseThemeNames();
  assertLegacyThemeSourceRemoved();
}

console.log("Yeelight themes validation passed.");
