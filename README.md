# Yeelight Themes

[English](README.md) | [中文](README_zh.md)

Yeelight-branded theme pack for Home Assistant. This repository is an optional companion for Yeelight cards and dashboards: it keeps the native Home Assistant UI, built-in controls, and Yeelight card package on the same visual system.

Themes affect visuals only. They do not add a lighting interaction model, service calls, automations, or a backend integration.

## Features

- Yeelight Light, Yeelight Dark, Yeelight Panel, Yeelight Classic Light, Yeelight Classic Dark, and Yeelight Minimal
- Native Home Assistant variables for cards, dialogs, buttons, selects, inputs, switches, sliders, and sidebar
- State colors for common HA domains including lights, switches, fans, covers, media players, locks, alarms, and updates
- `yl-*` companion tokens for Yeelight cards
- No integration or JavaScript dependency

## Installation

### HACS Installation

1. Open HACS.
2. Add this repository as a custom repository with category **Theme**, or install it from the HACS theme catalog when available.
3. Install **Yeelight Themes**.
4. Run the Home Assistant service `frontend.reload_themes`, or restart Home Assistant.

### Manual Installation

1. Copy `themes/yeelight.yaml` to `config/themes/yeelight.yaml`.
2. Make sure Home Assistant loads theme files:

```yaml
frontend:
  themes: !include_dir_merge_named themes
```

3. Run `frontend.reload_themes`, or restart Home Assistant.

## Usage

1. Go to Settings → Appearance.
2. Select theme:
   - **Yeelight Light**: warm daylight interface for regular dashboards.
   - **Yeelight Dark**: dark interface for night use and wall-mounted displays.
   - **Yeelight Panel**: high-contrast dark theme adapted from the older Yeelight wall-panel theme.
   - **Yeelight Classic Light**: blue light theme adapted from the older Lucore light theme with better native HA control coverage.
   - **Yeelight Classic Dark**: blue dark theme adapted from the older Lucore dark theme with better native HA control coverage.
   - **Yeelight Minimal**: lower-contrast theme with Home Assistant light/dark mode support.

## Theme Variables

Each theme defines standard HA variables before Yeelight-specific variables:

| Group | Examples |
| --- | --- |
| Core palette | `primary-color`, `accent-color`, `dark-primary-color`, `light-primary-color` |
| Surfaces | `primary-background-color`, `secondary-background-color`, `card-background-color`, `ha-card-background` |
| Native controls | `mdc-theme-primary`, `input-fill-color`, `switch-checked-color`, `slider-color`, `paper-item-icon-color` |
| Entity states | `state-light-active-color`, `state-switch-active-color`, `state-lock-locked-color`, `state-alarm_control_panel-armed_away-color` |
| Feedback | `success-color`, `warning-color`, `error-color`, `info-color` |
| Yeelight cards | `yl-accent`, `yl-surface`, `yl-text`, `yl-muted`, `yl-radius-card`, `yl-card-shadow`, `yl-hero-glow-color` |

## Customization

You can override any variable by copying the theme into your own YAML file and changing the values:

```yaml
frontend:
  themes:
    My Yeelight Light:
      primary-color: "#FFB84D"
      accent-color: "#2B8CFF"
```

For Yeelight cards, prefer overriding `yl-*` tokens first. For native Home Assistant controls, prefer standard HA variables such as `primary-color`, `ha-card-background`, `divider-color`, and `state-*-color`.

## License

MIT License
