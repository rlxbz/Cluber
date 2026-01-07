# Cluber 社团管理系统

基于 Vue 3 + Element Plus 的现代化社团管理系统，提供社团管理、活动组织、成员互动等功能。

## 项目介绍

Cluber 社团管理系统是一款面向校园社团的全功能管理平台，旨在简化社团日常运营、活动组织和成员管理流程。系统采用前后端分离架构，前端基于 Vue 3 + Vite 构建，结合 Element Plus 组件库提供优雅的用户界面和流畅的交互体验。

## 技术栈

- **前端框架**：Vue 3 (使用 `<script setup>` SFCs)
- **构建工具**：Vite
- **状态管理**：Pinia
- **UI 组件库**：Element Plus
- **路由管理**：Vue Router
- **HTTP 客户端**：Axios
- **图标库**：@element-plus/icons-vue
- **日期处理**：date-fns

## 功能特点

1. **用户认证**：支持用户注册、登录及权限管理
2. **社团管理**：社团创建、信息维护、成员管理
3. **活动管理**：活动申请、审批、报名及状态跟踪
4. **公告系统**：发布社团公告及系统通知
5. **申请处理**：社团加入申请、活动举办申请的审核流程
6. **个性化设置**：支持主题切换、字体大小调整等界面定制

## 项目结构

```plaintext
src/
├── apis/           # API请求函数
├── assets/         # 静态资源
├── components/     # 通用组件
├── router/         # 路由配置
├── stores/         # Pinia状态管理
├── styles/         # 样式文件
├── utils/          # 工具函数
├── views/          # 页面组件
├── App.vue         # 根组件
└── main.js         # 入口文件
```

## API 文档

系统后端 API 遵循 OpenAPI 3.0 规范，详细接口定义请参考 [openapi.json](https://www.doubao.com/chat/openapi.json)。主要接口包括：

- 用户认证（登录、注册、信息获取）
- 社团管理（列表、详情、创建、编辑）
- 活动管理（列表、详情、申请、报名）
- 公告管理（列表、详情、发布）
- 申请处理（加入社团、创建社团、举办活动的申请及审核）

## 个性化设置

系统支持通过设置面板自定义界面展示效果：

- 主题切换（通过 `data-theme` 属性实现）
- 字体大小调整
- 字体类型选择

设置功能通过 Pinia 的 `settingStore` 实现，相关逻辑见 [settingStore.js](https://www.doubao.com/chat/src/stores/settingStore.js)。

## 扩展与定制

1. **添加新页面**：在 `views` 目录下创建组件，在 `router/index.js` 中配置路由
2. **新增 API**：在 `apis` 目录下创建对应模块的请求函数
3. **自定义组件**：在 `components` 目录下创建组件并全局注册（参考 main.js 中的全局组件注册）
4. **样式定制**：通过修改 `styles/element/index.scss` 和 `styles/var.scss` 覆盖 Element Plus 样式变量