import { createRouter, createWebHistory } from "vue-router";
import Layout from "@/views/Layout/index.vue";
import Login from "@/views/Login/index.vue";
import Register from "@/views/Register/index.vue";
import Home from "@/views/Home/index.vue";
import Club from "@/views/Club/index.vue";
import Notice from "@/views/Notice/index.vue";
import NoticeDetail from "@/views/Notice/components/Detail.vue";
import Push from "@/views/Push/index.vue";
import PushDetail from "@/views/Push/components/Detail.vue";
import Apply from "@/views/Apply/index.vue";

// 公共元信息配置
const guestMeta = {
  requiresAuth: false,
  roles: ["guest", "student", "club_admin", "system_admin"],
};
const authMeta = { requiresAuth: true };

const router = createRouter({
  history: createWebHistory(import.meta.env.BASE_URL),
  routes: [
    {
      path: "/",
      component: Layout,
      meta: { requiresAuth: false },
      children: [
        {
          path: "",
          component: Home,
          meta: {
            ...guestMeta,
            title: "首页",
          },
        },
        {
          path: "home",
          component: Home,
          meta: { ...guestMeta, title: "首页" },
        },
        {
          path: "club",
          component: Club,
          meta: { ...authMeta, title: "社团列表" },
        },
        {
          // 添加社团详情页路由
          path: "club/:id",
          component: () => import("@/views/Club/components/Detail.vue"), // 懒加载组件
          meta: { ...authMeta, title: "社团详情" },
        },
        {
          path: "notice",
          component: Notice,
          meta: { ...authMeta, title: "公告" },
        },
        {
          path: "/notice/:id",
          name: "NoticeDetail",
          component: () => import("@/views/Notice/components/Detail.vue"),
          meta: {
            title: "公告详情",
            requireAuth: true,
          },
        },
        {
          path: "noticeDetail",
          component: NoticeDetail,
          meta: { ...authMeta, title: "公告详情" },
        },
        {
          path: "/push",
          component: Push,
          meta: { ...authMeta, title: "推送" },
        },
        {
          path: "/push/:id",
          component: PushDetail,
          meta: { ...authMeta, title: "推送详情" },
        },
        {
          path: "activity",
          component: () => import("@/views/Activity/index.vue"),
          meta: { ...authMeta, title: "活动列表" },
        },
        {
          path: "activity/:id",
          component: () => import("@/views/Activity/components/Detail.vue"),
          meta: { ...authMeta, title: "活动详情" },
        },
        {
          path: "member",
          component: () => import("@/views/Member/index.vue"),
          meta: { ...authMeta, title: "个人中心" },
          children: [
            {
              path: "info",
              component: () =>
                import("@/views/Member/components/MemberInfo.vue"),
              meta: { ...authMeta, title: "个人信息" },
            },
            {
              path: "club",
              component: () =>
                import("@/views/Member/components/MemberClub.vue"),
              meta: { ...authMeta, title: "我的社团" },
            },
            {
              path: "apply",
              component: () =>
                import("@/views/Member/components/MemberApply.vue"),
              meta: { ...authMeta, title: "我的申请" },
            },
          ],
        },
        {
          path: "/apply",
          name: "Apply",
          component: Apply,
          meta: {
            requiresAuth: true, // 需要登录
          },
        },
      ],
    },
    {
      path: "/register",
      name: "register",
      component: Register,
      meta: { requiresAuth: false },
    },
    {
      path: "/login",
      name: "Login",
      component: Login,
      meta: { requiresAuth: false },
      // beforeEnter 已由 guard.js 统一处理，这里移除避免重复检查
    },
    {
      path: "/setting", // 路径改为根目录下，方便所有用户访问
      name: "personalSetting",
      component: () => import("@/views/Admin/index.vue"),
      meta: {
        title: "个性化设置",
        requiresAuth: false, // 允许未登录用户也能访问（使用默认设置）
      },
    },
  ],
});

export default router;
