# Cluber项目设计

## 项目整体架构

```
项目根目录
├── src/
│   ├── views/               # 页面级组件（路由对应组件）
│   ├── components/          # 通用组件（全局复用）
│   │   ├── common/          # 基础通用组件（按钮、输入框等）
│   │   ├── layout/          # 布局相关组件
│   │   └── business/        # 业务通用组件（社团卡片、活动列表项等）
│   ├── apis/                # 接口请求函数（按模块划分）
│   ├── stores/              # Pinia状态管理（用户、社团、活动等状态）
│   ├── router/              # 路由配置（含路由守卫）
│   ├── utils/               # 工具函数（请求封装、权限判断等）
│   ├── assets/              # 静态资源（图片、样式、图标等）
│   ├── App.vue              # 根组件（路由出口）
│   └── main.js              # 入口文件（初始化Vue、路由、Pinia等）
```

页面组件关系

```
App.vue
└── RouterView（一级路由出口）
    ├── Login/index.vue              # 登录页（/login）
    ├── Register/index.vue           # 注册页（/register）
    └── Layout/index.vue             # 主布局页（/ 及子路由）
        ├── LayoutSidebar.vue        # 侧边导航栏（区分用户/管理员权限）
        ├── LayoutHeader.vue         # 顶部头部（含用户信息、退出登录）
        ├── LayoutFooter.vue         # 页脚（版权、联系方式等）
        └── RouterView（二级路由出口）
            ├── Home/index.vue       # 首页（/）
            │   ├── HomeNotice.vue   # 首页系统公告组件
            │   ├── HomePush.vue     # 首页社团推送组件
            │   └── HomeActivity.vue # 首页热门活动组件
            ├── Club/index.vue       # 社团列表页（/club）
            │   └── ClubCard.vue     # 社团卡片组件
            ├── Club/Detail.vue      # 社团详情页（/club/:id）
            │   ├── ClubInfo.vue     # 社团基本信息组件
            │   ├── ClubMember.vue   # 社团成员管理组件
            │   └── ClubActivity.vue # 社团活动列表组件
            ├── Activity/index.vue   # 活动列表页（/activity）
            │   └── ActivityItem.vue # 活动列表项组件
            ├── Activity/Detail.vue  # 活动详情页（/activity/:id）
            ├── Apply/index.vue      # 申请管理页（/apply）
            │   ├── ApplyCreate.vue  # 社团创建申请组件
            │   ├── ApplyJoin.vue    # 社团加入申请组件
            │   └── ApplyActivity.vue # 活动举办申请组件
            ├── Notice/index.vue     # 公告管理页（/notice）
            │   └── NoticeItem.vue   # 公告列表项组件
            ├── Push/index.vue       # 推送管理页（/push）
            │   └── PushItem.vue     # 推送列表项组件
            └── Member/index.vue     # 个人中心（/member）
                ├── MemberInfo.vue   # 个人信息组件
                ├── MemberClub.vue   # 我的社团组件
                └── MemberApply.vue  # 我的申请组件
```

## 核心功能模块逻辑关系

### 1. **首页与信息展示**

- **触发点**：用户登录后进入首页（`Home/index.vue`），自动加载系统公告、社团推送及热门活动。
- 数据流向：
  - `Home/index.vue` 挂载时，分别调用 `noticeStore.getNoticeList()`（来自 `apis/notice.js` 的 `getNoticeListAPI`）、`pushStore.getPushList()`（来自 `apis/push.js` 的 `getPushListAPI`）、`activityStore.getHotActivity()`（来自 `apis/activity.js` 的 `getHotActivityAPI`）。
  - 公告数据存储在 `noticeStore`、推送数据存储在 `pushStore`、活动数据存储在 `activityStore`，供首页子组件渲染。
  - 用户点击公告 / 推送 / 活动项，跳转至对应详情页（`Notice/Detail.vue`/`Push/Detail.vue`/`Activity/Detail.vue`）。

### 2. **社团管理与成员操作**

- **触发点**：用户在社团列表页（`Club/index.vue`）点击 “申请加入”，或社团管理员在社团详情页（`Club/Detail.vue`）处理成员申请 / 开除成员。
- 数据流向：
  - `Club/index.vue` 挂载时调用 `clubStore.getClubList()`（来自 `apis/club.js` 的 `getClubListAPI`）获取社团列表，渲染 `ClubCard.vue`。
  - 普通用户点击 “申请加入”，调用 `applyStore.applyJoinClub()`（来自 `apis/apply.js` 的 `applyJoinClubAPI`）提交申请，申请数据存储在 `applyStore`。
  - 社团管理员进入 `Club/Detail.vue`，调用 `applyStore.getClubJoinApply()` 获取本社团加入申请，处理申请后调用 `applyStore.handleApply()` 更新申请状态，同时更新 `clubStore` 中的成员列表。

### 3. **活动管理与申请**

- **触发点**：社团管理员在活动管理页（`Activity/index.vue`）点击 “申请举办活动”，或普通成员查看活动详情并报名。
- 数据流向：
  - 社团管理员点击 “申请举办活动”，跳转至 `Apply/ApplyActivity.vue`，填写表单后调用 `applyStore.applyActivity()`（来自 `apis/apply.js` 的 `applyActivityAPI`）提交申请。
  - 系统管理员在 `Apply/index.vue` 查看活动申请，调用 `applyStore.handleActivityApply()` 审批，审批通过后 `activityStore` 自动新增活动数据。
  - 普通成员在 `Activity/Detail.vue` 点击 “报名”，调用 `activityStore.signUpActivity()` 更新活动报名人数。

### 4. **登录与权限控制**

- **触发点**：用户在登录页（`Login/index.vue`）提交账号密码，或注册页（`Register/index.vue`）完成注册。
- 数据流向：
  - 登录时，`Login/index.vue` 调用 `userStore.login()`（来自 `apis/user.js` 的 `loginAPI`），验证成功后获取 token 并存储在 `userStore`，同时调用 `userStore.getUserInfo()` 获取用户信息及权限。
  - 注册时，`Register/index.vue` 调用 `userStore.register()`（来自 `apis/user.js` 的 `registerAPI`），注册成功后自动跳转至登录页。
  - 路由守卫通过 `userStore` 中的权限信息，控制侧边栏（`LayoutSidebar.vue`）显示的菜单（如普通用户隐藏 “公告管理”，管理员显示所有菜单）。

## 组件架构关系

```
根组件 (App.vue)
  ├── 路由出口 (RouterView)
  │   ├── 登录页 (Login/index.vue)
  │   ├── 注册页 (Register/index.vue)
  │   └── 主布局页 (Layout/index.vue)
  │       ├── 侧边导航栏 (LayoutSidebar.vue)
  │       ├── 顶部头部 (LayoutHeader.vue)
  │       │   └── 用户信息组件 (UserInfoDropdown.vue)
  │       ├── 二级路由出口 (RouterView)
  │       │   ├── 首页 (Home/index.vue)
  │       │   │   ├── 系统公告组件 (HomeNotice.vue)
  │       │   │   ├── 社团推送组件 (HomePush.vue)
  │       │   │   └── 热门活动组件 (HomeActivity.vue)
  │       │   ├── 社团列表页 (Club/index.vue)
  │       │   │   └── 社团卡片组件 (ClubCard.vue)
  │       │   ├── 社团详情页 (Club/Detail.vue)
  │       │   │   ├── 社团信息组件 (ClubInfo.vue)
  │       │   │   ├── 成员管理组件 (ClubMember.vue)
  │       │   │   └── 社团活动组件 (ClubActivity.vue)
  │       │   ├── 活动列表页 (Activity/index.vue)
  │       │   │   └── 活动列表项组件 (ActivityItem.vue)
  │       │   ├── 活动详情页 (Activity/Detail.vue)
  │       │   ├── 申请管理页 (Apply/index.vue)
  │       │   │   ├── 社团创建申请组件 (ApplyCreate.vue)
  │       │   │   ├── 社团加入申请组件 (ApplyJoin.vue)
  │       │   │   └── 活动举办申请组件 (ApplyActivity.vue)
  │       │   ├── 公告管理页 (Notice/index.vue)
  │       │   │   └── 公告列表项组件 (NoticeItem.vue)
  │       │   ├── 推送管理页 (Push/index.vue)
  │       │   │   └── 推送列表项组件 (PushItem.vue)
  │       │   └── 个人中心 (Member/index.vue)
  │       │       ├── 个人信息组件 (MemberInfo.vue)
  │       │       ├── 我的社团组件 (MemberClub.vue)
  │       │       └── 我的申请组件 (MemberApply.vue)
  │       └── 页脚 (LayoutFooter.vue)
```

## 核心组件关系

### 1. **布局组件 (Layout)**

- **核心作用**：作为全局布局容器，统一管理侧边导航、顶部头部、页脚等公共组件，根据用户权限动态渲染菜单。
- 组件构成：
  - `LayoutSidebar.vue`：侧边导航栏，依赖 `userStore` 中的 `role` 字段（学生 / 社团管理员 / 系统管理员）显示不同菜单，如系统管理员显示 “公告管理”“社团审核”，普通学生隐藏。
  - `LayoutHeader.vue`：顶部头部，包含系统名称、用户信息下拉框（`UserInfoDropdown.vue`），点击下拉框可进入个人中心或退出登录（调用 `userStore.logout()`）。
  - 二级路由出口：承载各业务页面组件，确保布局统一性。

### 2. **社团相关组件**

- `Club/index.vue`（社团列表页）：
- 依赖 `clubStore` 获取社团列表，通过 `v-for` 循环渲染 `ClubCard.vue`。
  - 支持社团搜索功能，通过 `clubStore.setSearchKey()` 过滤社团列表。

- `Club/Detail.vue`（社团详情页）：
- 通过路由参数 `route.params.id` 获取社团 ID，调用 `clubStore.getClubDetail()` 获取社团详情。
  - 社团管理员可看到 “成员管理”“活动管理” 入口，普通成员仅查看信息，权限控制依赖 `userStore` 与 `clubStore` 中的成员角色。

### 3. **申请相关组件**

- `Apply/index.vue`（申请管理页）：

  - 按申请类型拆分三个子组件（`ApplyCreate.vue`/`ApplyJoin.vue`/`ApplyActivity.vue`），通过选项卡切换。
- 系统管理员查看所有申请，调用 `applyStore.getAdminApplyList()`；普通用户查看个人申请，调用 `applyStore.getUserApplyList()`。
  
- **申请提交逻辑**：各申请子组件通过表单验证后，调用对应接口提交申请，成功后更新 `applyStore` 中的申请列表，同时给出提示。

### 4. **个人中心组件 (Member)**

- 采用嵌套路由结构，`Member/index.vue` 作为父容器，包含侧边导航（切换 “个人信息”“我的社团”“我的申请”）。
- **`MemberInfo.vue`**：调用 `userStore.getUserInfo()` 获取个人信息，支持编辑功能（调用 `userStore.updateUserInfo()`）。
- **`MemberClub.vue`**：调用 `clubStore.getMyClubList()` 获取用户加入的社团，渲染社团卡片，点击可进入社团详情页。
- **`MemberApply.vue`**：调用 `applyStore.getUserApplyList()` 获取用户提交的申请，展示申请状态（待审核 / 已通过 / 已拒绝）。

## 全局组件与状态管理

### 1. **全局注册组件**

- 基础通用组件：
  - `CommonButton.vue`：统一按钮样式，支持不同类型（primary/secondary/danger）和尺寸。
  - `CommonInput.vue`：封装输入框，支持表单验证、 placeholder 自定义。
  - `CommonDialog.vue`：通用弹窗组件，用于确认操作（如删除申请、开除成员）。
- 业务通用组件：
  - `ClubCard.vue`：社团卡片，展示社团名称、类型、简介，复用在社团列表页、个人中心 “我的社团”。
  - `NoticeItem.vue`/`PushItem.vue`/`ActivityItem.vue`：分别封装公告、推送、活动的列表项，统一样式和交互。

### 2. **状态管理（Pinia）**

| Store 名称      | 核心功能                         | 关键状态字段                                                | 核心方法                                                     |
| --------------- | -------------------------------- | ----------------------------------------------------------- | ------------------------------------------------------------ |
| `userStore`     | 管理用户登录状态、个人信息、权限 | `token`（登录令牌）、`userInfo`（用户信息）、`role`（角色） | `login()`（登录）、`logout()`（登出）、`updateUserInfo()`（更新信息） |
| `clubStore`     | 管理社团列表、社团详情、成员信息 | `clubList`（社团列表）、`currentClub`（当前查看的社团）     | `getClubList()`（获取社团列表）、`getClubDetail()`（获取详情）、`getMyClubList()`（获取我的社团） |
| `activityStore` | 管理活动列表、活动详情、报名状态 | `activityList`（活动列表）、`hotActivity`（热门活动）       | `getHotActivity()`（获取热门活动）、`signUpActivity()`（活动报名） |
| `applyStore`    | 管理申请列表、申请状态、申请操作 | `applyList`（申请列表）、`currentApply`（当前查看的申请）   | `applyJoinClub()`（申请加入社团）、`handleApply()`（处理申请）、`getUserApplyList()`（获取个人申请） |
| `noticeStore`   | 管理系统公告列表、公告详情       | `noticeList`（公告列表）、`currentNotice`（当前查看的公告） | `getNoticeList()`（获取公告列表）、`getNoticeDetail()`（获取详情） |
| `pushStore`     | 管理社团推送列表、推送详情       | `pushList`（推送列表）、`currentPush`（当前查看的推送）     | `getPushList()`（获取推送列表）、`getPushDetail()`（获取详情） |

## 路由与页面映射

|    路由路径     |       对应组件        |     父组件容器     |        权限控制         |
| :-------------: | :-------------------: | :----------------: | :---------------------: |
|       `/`       |   `Home/index.vue`    | `Layout/index.vue` |       已登录用户        |
|    `/login`     |   `Login/index.vue`   |     根路由出口     |       未登录用户        |
|   `/register`   | `Register/index.vue`  |     根路由出口     |       未登录用户        |
|     `/club`     |   `Club/index.vue`    | `Layout/index.vue` |       已登录用户        |
|   `/club/:id`   |   `Club/Detail.vue`   | `Layout/index.vue` |       已登录用户        |
|   `/activity`   | `Activity/index.vue`  | `Layout/index.vue` |       已登录用户        |
| `/activity/:id` | `Activity/Detail.vue` | `Layout/index.vue` |       已登录用户        |
|    `/apply`     |   `Apply/index.vue`   | `Layout/index.vue` |       已登录用户        |
|    `/notice`    |  `Notice/index.vue`   | `Layout/index.vue` |       系统管理员        |
|     `/push`     |   `Push/index.vue`    | `Layout/index.vue` | 社团管理员 / 系统管理员 |
|    `/member`    |   `MemberInfo.vue`    | `Member/index.vue` |       已登录用户        |
| `/member/club`  |   `MemberClub.vue`    | `Member/index.vue` |       已登录用户        |
| `/member/apply` |   `MemberApply.vue`   | `Member/index.vue` |       已登录用户        |