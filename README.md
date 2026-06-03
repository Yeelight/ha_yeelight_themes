# Yeelight Themes

Yeelight 品牌的 Home Assistant 主题包。

## 功能特性

- ✅ 暗色主题（Yeelight Dark）
- ✅ 亮色主题（Yeelight Light）
- ✅ 中控屏主题（Yeelight Panel）
- ✅ Yeelight 品牌视觉风格
- ✅ 不依赖任何集成

## 安装

### HACS 安装（推荐）

1. 打开 HACS
2. 搜索 "Yeelight Themes"
3. 点击安装
4. 重启 Home Assistant

### 手动安装

1. 下载最新版本
2. 将主题文件复制到 `config/themes/`
3. 重启 Home Assistant

## 使用

1. 进入 设置 → 外观
2. 选择主题：
   - **Yeelight Dark**：暗色主题，适合夜间使用
   - **Yeelight Light**：亮色主题，适合日间使用
   - **Yeelight Panel**：中控屏主题，适合 wall-mounted 显示器

## 主题变量

### Yeelight Dark

| 变量 | 值 | 描述 |
|------|-----|------|
| `primary-color` | `#FFC56D` | 主色调（暖金色） |
| `accent-color` | `#FF9F43` | 强调色 |
| `card-background-color` | `#1A1B1E` | 卡片背景 |
| `primary-background-color` | `#101114` | 主背景 |
| `primary-text-color` | `#E8E8E8` | 主文本颜色 |
| `yl-hero-glow-color` | `rgba(255,197,109,0.15)` | Hero 发光效果 |

### Yeelight Light

| 变量 | 值 | 描述 |
|------|-----|------|
| `primary-color` | `#FFB84D` | 主色调（暖橙色） |
| `accent-color` | `#FF9F43` | 强调色 |
| `card-background-color` | `#FFFFFF` | 卡片背景 |
| `primary-background-color` | `#FFF8EF` | 主背景 |
| `primary-text-color` | `#333333` | 主文本颜色 |
| `yl-hero-glow-color` | `rgba(255,184,77,0.1)` | Hero 发光效果 |

### Yeelight Panel

| 变量 | 值 | 描述 |
|------|-----|------|
| `primary-color` | `#FFC56D` | 主色调 |
| `accent-color` | `#FF9F43` | 强调色 |
| `card-background-color` | `#1A1B1E` | 卡片背景 |
| `primary-background-color` | `#101114` | 主背景 |
| `primary-text-color` | `#E8E8E8` | 主文本颜色 |
| `body-font-size` | `16px` | 正文字体大小 |
| `headline-font-size` | `24px` | 标题字体大小 |

## 自定义

你可以通过覆盖 CSS 变量来自定义主题：

```yaml
# 在 configuration.yaml 中
frontend:
  themes:
    yeelight_dark:
      primary-color: "#FF0000"  # 自定义主色调
```

## 许可证

MIT License
