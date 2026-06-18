# Changelog

All notable changes to this project will be documented in this file.

The format is based on [Keep a Changelog](https://keepachangelog.com/en/1.0.0/),
and this project adheres to [Semantic Versioning](https://semver.org/spec/v2.0.0.html).

## [1.0.1] - 2026-06-18

### Added
- Real Home Assistant screenshots for all six Yeelight themes.
- Repeatable Playwright screenshot capture script for local HA validation.
- HACS default-store submission notes and a PR body template that must be used with `--body-file`.

### Changed
- README files now show real Home Assistant screenshots before the SVG overview.
- Release validation now checks screenshot evidence and HACS PR body newline hygiene.

## [1.0.0] - 2026-06-18

### Added
- Installable `themes/yeelight.yaml` package with Yeelight Light, Yeelight Dark, and Yeelight Minimal.
- Home Assistant native component variables for cards, controls, sidebar, dialogs, and state colors.
- Yeelight `yl-*` companion variables for card packages.
- Local release validation script for HACS metadata, theme shape, and token coverage.
- Yeelight Panel, Yeelight Classic Light, and Yeelight Classic Dark migrated from existing `config/themes` styles with improved native HA control compatibility.
- GitHub Actions validation for HACS theme publication.
- README preview image for HACS default-store review.

### Changed
- Align HACS metadata with a theme repository layout instead of an integration zip release.
- Remove region limits so the theme package is globally installable.
