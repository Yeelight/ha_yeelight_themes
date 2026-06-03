# Yeelight Themes

[English](README.md) | [中文](README_zh.md)

Yeelight-branded theme pack for Home Assistant.

## Features

- ✅ Dark theme (Yeelight Dark)
- ✅ Light theme (Yeelight Light)
- ✅ Control Panel theme (Yeelight Panel)
- ✅ Yeelight brand visual style
- ✅ No integration dependencies

## Installation

### HACS Installation (Recommended)

1. Open HACS
2. Search for "Yeelight Themes"
3. Click Install
4. Restart Home Assistant

### Manual Installation

1. Download the latest release
2. Copy theme files to `config/themes/`
3. Restart Home Assistant

## Usage

1. Go to Settings → Appearance
2. Select theme:
   - **Yeelight Dark**: Dark theme, suitable for nighttime
   - **Yeelight Light**: Light theme, suitable for daytime
   - **Yeelight Panel**: Control panel theme, suitable for wall-mounted displays

## Theme Variables

### Yeelight Dark

| Variable | Value | Description |
| --- | --- | --- |
| `primary-color` | `#FFC56D` | Primary color (warm gold) |
| `accent-color` | `#FF9F43` | Accent color |
| `card-background-color` | `#1A1B1E` | Card background |
| `primary-background-color` | `#101114` | Main background |
| `primary-text-color` | `#E8E8E8` | Primary text color |
| `yl-hero-glow-color` | `rgba(255,197,109,0.15)` | Hero glow effect |

### Yeelight Light

| Variable | Value | Description |
| --- | --- | --- |
| `primary-color` | `#FFB84D` | Primary color (warm orange) |
| `accent-color` | `#FF9F43` | Accent color |
| `card-background-color` | `#FFFFFF` | Card background |
| `primary-background-color` | `#FFF8EF` | Main background |
| `primary-text-color` | `#333333` | Primary text color |
| `yl-hero-glow-color` | `rgba(255,184,77,0.1)` | Hero glow effect |

### Yeelight Panel

| Variable | Value | Description |
| --- | --- | --- |
| `primary-color` | `#FFC56D` | Primary color |
| `accent-color` | `#FF9F43` | Accent color |
| `card-background-color` | `#1A1B1E` | Card background |
| `primary-background-color` | `#101114` | Main background |
| `primary-text-color` | `#E8E8E8` | Primary text color |
| `body-font-size` | `16px` | Body font size |
| `headline-font-size` | `24px` | Headline font size |

## Customization

You can customize themes by overriding CSS variables:

```yaml
# In configuration.yaml
frontend:
  themes:
    yeelight_dark:
      primary-color: "#FF0000"  # Custom primary color
```

## License

MIT License
