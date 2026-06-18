# Yeelight Themes

[English](README.md) | [中文](README_zh.md)

Yeelight 品牌的 Home Assistant 主题包。它是 Yeelight 卡片和中枢面板的可选配套主题，用来让 HA 原生界面、按钮、选择框、卡片和 Yeelight 卡片包保持一致的视觉风格。

主题只影响视觉，不提供灯光交互模型、服务调用、自动化或后端集成。

## 功能特性

- Yeelight Light、Yeelight Dark、Yeelight Panel、Yeelight Classic Light、Yeelight Classic Dark、Yeelight Minimal 六套主题
- 覆盖 HA 原生卡片、弹窗、按钮、选择框、输入框、开关、滑块和侧边栏变量
- 覆盖灯、开关、风扇、窗帘、媒体播放器、门锁、警戒、更新等常见状态色
- 提供 `yl-*` 变量给 Yeelight 卡片包复用
- 不依赖自定义集成或 JavaScript 运行时

## 安装

### HACS 安装

1. 打开 HACS。
2. 将本仓库作为 **Theme** 类型的自定义仓库添加，或在进入 HACS 主题目录后直接安装。
3. 安装 **Yeelight Themes**。
4. 调用 Home Assistant 服务 `frontend.reload_themes`，或重启 Home Assistant。

### 手动安装

1. 将 `themes/yeelight.yaml` 复制到 `config/themes/yeelight.yaml`。
2. 确认 Home Assistant 已启用主题目录：

```yaml
frontend:
  themes: !include_dir_merge_named themes
```

3. 调用 `frontend.reload_themes`，或重启 Home Assistant。

## 使用

1. 进入 设置 → 外观。
2. 选择主题：
   - **Yeelight Light**：适合日常看板的暖色浅色界面。
   - **Yeelight Dark**：适合夜间和壁挂屏的深色界面。
   - **Yeelight Panel**：从旧 Yeelight 中控屏主题整理而来的高对比深色主题。
   - **Yeelight Classic Light**：从旧 Lucore 浅色主题整理而来的蓝色浅色主题，并补齐 HA 原生控件变量。
   - **Yeelight Classic Dark**：从旧 Lucore 深色主题整理而来的蓝色深色主题，并补齐 HA 原生控件变量。
   - **Yeelight Minimal**：更克制的主题，支持 HA 的 light/dark mode。

## 主题变量

每套主题都会先定义标准 HA 变量，再定义 Yeelight 专用变量：

| 分组 | 示例 |
| --- | --- |
| 核心色 | `primary-color`、`accent-color`、`dark-primary-color`、`light-primary-color` |
| 界面表面 | `primary-background-color`、`secondary-background-color`、`card-background-color`、`ha-card-background` |
| 原生控件 | `mdc-theme-primary`、`input-fill-color`、`switch-checked-color`、`slider-color`、`paper-item-icon-color` |
| 实体状态 | `state-light-active-color`、`state-switch-active-color`、`state-lock-locked-color`、`state-alarm_control_panel-armed_away-color` |
| 反馈色 | `success-color`、`warning-color`、`error-color`、`info-color` |
| Yeelight 卡片 | `yl-accent`、`yl-surface`、`yl-text`、`yl-muted`、`yl-radius-card`、`yl-card-shadow`、`yl-hero-glow-color` |

## 自定义

你可以复制主题到自己的 YAML 文件，再覆盖需要调整的变量：

```yaml
frontend:
  themes:
    My Yeelight Light:
      primary-color: "#FFB84D"
      accent-color: "#2B8CFF"
```

调整 Yeelight 卡片时，优先覆盖 `yl-*` 变量；调整 HA 原生组件时，优先覆盖 `primary-color`、`ha-card-background`、`divider-color`、`state-*-color` 等标准变量。

## 许可证

MIT License
