# Changelog

All notable changes to this project will be documented in this file.

The format is based on [Keep a Changelog](https://keepachangelog.com/en/1.0.0/),
and this project adheres to [Semantic Versioning](https://semver.org/spec/v2.0.0.html).

## [Unreleased]

### Added
- Installable `themes/yeelight.yaml` package with Yeelight Light, Yeelight Dark, and Yeelight Minimal.
- Home Assistant native component variables for cards, controls, sidebar, dialogs, and state colors.
- Yeelight `yl-*` companion variables for card packages.
- Local release validation script for HACS metadata, theme shape, and token coverage.
- Yeelight Panel, Yeelight Classic Light, and Yeelight Classic Dark migrated from existing `config/themes` styles with improved native HA control compatibility.

### Changed
- Align HACS metadata with a theme repository layout instead of an integration zip release.

## [1.0.0] - 2026-06-03

### Added
- Initial release
- Three Yeelight-branded themes
- Complete CSS variable system
- Responsive design support
