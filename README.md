
<div align="center">

**[English](#english)** | **[中文](#中文)**

</div>

---

<a id="english"></a>

# InsightFlow - Enterprise Survey Platform

InsightFlow is a modern, feature-rich enterprise survey platform built with Svelte 5, TypeScript, and Tailwind CSS. It provides a complete solution for creating, distributing, and analyzing surveys with a beautiful, responsive user interface.

## ✨ Features

- 🎨 **Modern UI/UX** - Beautiful, responsive design with dark mode support
- 🦉 **Interactive Login** - Animated owl mascot that reacts to user input
- 📊 **Drag & Drop Editor** - Intuitive survey builder with real-time preview
- 🔄 **Cross-Tab Sync** - SharedWorker support for data synchronization across browser tabs
- 📱 **Responsive Design** - Works seamlessly on desktop and mobile devices
- 🔐 **Secure Authentication** - Local user authentication with session persistence
- 📈 **Analytics Dashboard** - Visual statistics and response analysis
- 💾 **Local Data Persistence** - All data stored locally using IndexedDB/localStorage
- 🌐 **Multi-language Support** - Internationalization ready
- 🎨 **Theme Customization** - Customizable primary colors and branding

## 🚀 Quick Start

### Prerequisites

- Node.js (v18 or higher)
- npm or yarn

### Installation

1. Clone the repository:
   ```bash
   git clone <repository-url>
   cd insightflow
   ```

2. Install dependencies:
   ```bash
   npm install
   ```

3. Set up environment variables:
   ```bash
   cp .env.example .env.local
   # Edit .env.local and add your GEMINI_API_KEY
   ```

4. Run the development server:
   ```bash
   npm run dev
   ```

5. Open your browser and navigate to `http://localhost:3000`

## 🛠️ Tech Stack

- **Framework**: Svelte 5 with Runes
- **Language**: TypeScript
- **Styling**: Tailwind CSS
- **Routing**: page.js
- **Storage**: localStorage + IndexedDB
- **Testing**: Vitest with coverage
- **Build Tool**: Vite

## 📁 Project Structure

```
insightflow/
├── src/
│   ├── components/        # Svelte components
│   │   ├── LoginView.svelte
│   │   ├── DashboardView.svelte
│   │   ├── EditorView.svelte
│   │   ├── AnalyticsView.svelte
│   │   ├── SurveyFillView.svelte
│   │   └── SettingsView.svelte
│   ├── types.ts          # TypeScript type definitions
│   ├── i18n.ts           # Internationalization
│   ├── router.ts         # Route configuration
│   └── App.svelte        # Main application component
├── public/               # Static assets
├── tests/                # Unit tests
└── package.json
```

## 🧪 Testing

Run the test suite:

```bash
# Run tests
npm run test

# Run tests with coverage
npm run test:coverage

# Run tests in UI mode
npm run test:ui
```

## 📦 Building for Production

```bash
npm run build
```

The built files will be in the `dist` directory.

## 🔧 Configuration

### Environment Variables

- `GEMINI_API_KEY` - Your Gemini API key for AI features

### Theme Customization

Access the settings page to customize:
- Primary color
- System name
- Language
- Dark mode preference

## 📝 License

[MIT](LICENSE)

---

<div align="center">

**[↑ Back to Top](#english)**

</div>

---

<a id="中文"></a>

# InsightFlow - 企业级问卷平台

InsightFlow 是一个基于 Svelte 5、TypeScript 和 Tailwind CSS 构建的现代化企业级问卷平台。它提供了完整的问卷创建、分发和分析解决方案，拥有美观、响应式的用户界面。

## ✨ 功能特性

- 🎨 **现代化 UI/UX** - 美观的响应式设计，支持暗黑模式
- 🦉 **交互式登录** - 猫头鹰吉祥物会根据用户输入做出反应
- 📊 **拖拽编辑器** - 直观的问卷构建器，支持实时预览
- 🔄 **跨标签页同步** - 使用 SharedWorker 实现浏览器标签页间的数据同步
- 📱 **响应式设计** - 在桌面和移动设备上都能完美运行
- 🔐 **安全认证** - 本地用户认证，支持会话持久化
- 📈 **分析仪表板** - 可视化统计和回复分析
- 💾 **本地数据持久化** - 所有数据使用 IndexedDB/localStorage 本地存储
- 🌐 **多语言支持** - 支持国际化
- 🎨 **主题定制** - 可自定义主题色和品牌

## 🚀 快速开始

### 环境要求

- Node.js (v18 或更高版本)
- npm 或 yarn

### 安装步骤

1. 克隆仓库：
   ```bash
   git clone <repository-url>
   cd insightflow
   ```

2. 安装依赖：
   ```bash
   npm install
   ```

3. 配置环境变量：
   ```bash
   cp .env.example .env.local
   # 编辑 .env.local 并添加你的 GEMINI_API_KEY
   ```

4. 运行开发服务器：
   ```bash
   npm run dev
   ```

5. 打开浏览器访问 `http://localhost:3000`

## 🛠️ 技术栈

- **框架**: Svelte 5 with Runes
- **语言**: TypeScript
- **样式**: Tailwind CSS
- **路由**: page.js
- **存储**: localStorage + IndexedDB
- **测试**: Vitest with coverage
- **构建工具**: Vite

## 📁 项目结构

```
insightflow/
├── src/
│   ├── components/        # Svelte 组件
│   │   ├── LoginView.svelte
│   │   ├── DashboardView.svelte
│   │   ├── EditorView.svelte
│   │   ├── AnalyticsView.svelte
│   │   ├── SurveyFillView.svelte
│   │   └── SettingsView.svelte
│   ├── types.ts          # TypeScript 类型定义
│   ├── i18n.ts           # 国际化
│   ├── router.ts         # 路由配置
│   └── App.svelte        # 主应用组件
├── public/               # 静态资源
├── tests/                # 单元测试
└── package.json
```

## 🧪 测试

运行测试套件：

```bash
# 运行测试
npm run test

# 运行测试并生成覆盖率报告
npm run test:coverage

# 在 UI 模式下运行测试
npm run test:ui
```

## 📦 生产构建

```bash
npm run build
```

构建后的文件将在 `dist` 目录中。

## 🔧 配置

### 环境变量

- `GEMINI_API_KEY` - 你的 Gemini API 密钥，用于 AI 功能

### 主题定制

访问设置页面可以自定义：
- 主题色
- 系统名称
- 语言
- 暗黑模式偏好

## 📝 许可证

[MIT](LICENSE)

---

<div align="center">

**[↑ 返回顶部](#中文)**

</div>
