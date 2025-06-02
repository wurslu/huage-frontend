# Notes Frontend

一个现代化的个人笔记管理系统前端，基于 React 18 + TypeScript + Vite 构建，提供丰富的笔记管理功能。

## ✨ 主要功能

### 📝 笔记管理

- **创建与编辑**：支持 Markdown 和 HTML 格式笔记
- **实时预览**：编辑器内置预览功能，支持语法高亮
- **分类管理**：树形分类结构，支持多级嵌套
- **标签系统**：彩色标签，灵活标记笔记
- **搜索功能**：全文搜索笔记标题和内容
- **批量操作**：支持批量删除、移动分类等操作

### 📎 附件管理

- **文件上传**：支持图片（JPG、PNG、GIF、WebP）和文档（PDF、Word、Excel）
- **存储管理**：实时显示存储空间使用情况，支持配额管理
- **附件预览**：图片在线预览，文档可下载查看
- **批量管理**：批量上传、删除附件

### 🔗 分享功能

- **公开分享**：生成分享链接，无需登录即可查看
- **密码保护**：可设置访问密码保护私密内容
- **过期控制**：支持设置分享链接过期时间
- **访问统计**：记录分享链接访问次数和浏览量

### 👤 用户系统

- **账户管理**：注册、登录、个人信息管理
- **权限控制**：基于 JWT 的身份认证
- **数据安全**：私人笔记仅本人可见
- **存储统计**：实时显示文件使用情况

### 🎨 界面设计

- **响应式设计**：适配桌面、平板、手机等多种设备
- **Material-UI**：现代化的 Material Design 风格界面
- **深色主题**：支持浅色/深色主题切换
- **流畅动画**：丰富的交互动画和过渡效果

## 🛠 技术栈

### 核心框架

- **React 18** - 现代化的用户界面库
- **TypeScript** - 类型安全的 JavaScript 超集
- **Vite** - 快速的构建工具和开发服务器

### 状态管理

- **Redux Toolkit** - 现代化的 Redux 状态管理
- **RTK Query** - 强大的数据获取和缓存解决方案

### UI 组件

- **Material-UI (MUI)** - React Material Design 组件库
- **Tailwind CSS** - 实用优先的 CSS 框架
- **Lucide React** - 精美的图标库

### 功能增强

- **React Router** - 客户端路由管理
- **React Markdown** - Markdown 渲染和预览
- **Rehype Highlight** - 代码语法高亮
- **React Hook Form** - 高性能表单处理

## 📁 项目结构

```
src/
├── components/          # 可复用组件
│   ├── layout/         # 布局组件（Header、Sidebar、Layout）
│   ├── ui/             # UI 基础组件（通知、对话框等）
│   ├── AttachmentManager.tsx    # 附件管理器
│   ├── NoteEditor.tsx           # 笔记编辑器
│   ├── NotesList.tsx            # 笔记列表
│   ├── ShareDialog.tsx          # 分享对话框
│   ├── CategoryDialog.tsx       # 分类管理对话框
│   └── TagDialog.tsx            # 标签管理对话框
├── pages/              # 页面组件
│   ├── auth/           # 认证页面（登录、注册）
│   ├── dashboard/      # 仪表板页面
│   └── notes/          # 笔记相关页面
├── store/              # Redux 状态管理
│   ├── api/            # API 接口定义
│   ├── slices/         # Redux 切片
│   └── store.ts        # Store 配置
├── hooks/              # 自定义 Hooks
├── theme/              # 主题配置
├── types/              # TypeScript 类型定义
└── utils/              # 工具函数
```

## 🚀 快速开始

### 环境要求

- Node.js 16+
- npm 或 yarn 包管理器

### 安装依赖

```bash
npm install
```

### 开发模式

```bash
npm run dev
```

访问 http://localhost:5173

### 构建生产版本

```bash
npm run build
```

### 预览生产版本

```bash
npm run preview
```

## ⚙️ 配置说明

### 环境变量

项目支持通过 Vite 的环境变量进行配置：

```bash
# API 基础地址（通过 Vite 代理配置）
VITE_API_BASE_URL=http://localhost:9191
```

### API 代理配置

开发环境下，API 请求通过 Vite 代理转发到后端服务：

```typescript
// vite.config.ts
export default defineConfig({
	server: {
		proxy: {
			"/api": {
				target: "http://localhost:9191",
				changeOrigin: true,
				secure: false,
			},
		},
	},
});
```

## 📋 功能详情

### 笔记编辑器

- **双栏布局**：左侧编辑，右侧预览和附件管理
- **Markdown 支持**：完整的 Markdown 语法支持
- **语法高亮**：代码块自动语法高亮
- **实时预览**：编辑内容实时预览效果
- **附件集成**：编辑器内直接管理附件

### 分享系统

- **灵活分享**：支持公开分享和密码保护
- **访问控制**：可设置分享链接过期时间
- **统计功能**：记录分享链接访问情况
- **响应式**：分享页面完全响应式设计

### 文件管理

- **多格式支持**：图片、PDF、Office 文档
- **存储监控**：实时显示存储空间使用情况
- **批量操作**：支持批量上传和管理
- **权限控制**：文件访问需要身份验证

## 🔧 开发工具

### 代码质量

- **ESLint** - 代码规范检查
- **TypeScript** - 静态类型检查
- **Prettier** - 代码格式化（可选配置）

### 构建优化

- **Vite** - 快速的开发服务器和构建工具
- **Tree Shaking** - 自动移除未使用的代码
- **代码分割** - 按需加载，优化性能

## 📱 浏览器支持

- Chrome 90+
- Firefox 88+
- Safari 14+
- Edge 90+

## 🤝 贡献指南

1. Fork 项目
2. 创建功能分支 (`git checkout -b feature/AmazingFeature`)
3. 提交更改 (`git commit -m 'Add some AmazingFeature'`)
4. 推送到分支 (`git push origin feature/AmazingFeature`)
5. 打开 Pull Request

## 📄 许可证

本项目采用 MIT 许可证 - 查看 [LICENSE](LICENSE) 文件了解详情。

## 🙏 致谢

- [React](https://reactjs.org/) - 用户界面库
- [Material-UI](https://mui.com/) - React 组件库
- [Vite](https://vitejs.dev/) - 构建工具
- [Redux Toolkit](https://redux-toolkit.js.org/) - 状态管理
- [React Markdown](https://github.com/remarkjs/react-markdown) - Markdown 渲染

---

**Notes Frontend** - 现代化的个人笔记管理系统，让记录想法变得更加简单高效。
