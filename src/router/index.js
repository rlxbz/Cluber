import { createRouter, createWebHistory } from "vue-router";
import Layout from "@/views/Layout/index.vue";
import Login from "@/views/Login/index.vue";
import Register from "@/views/Register/index.vue";
import Home from "@/views/Home/index.vue";
import Club from "@/views/Club/index.vue";
import Notice from "@/views/Notice/index.vue";
import Push from "@/views/Push/index.vue";
import Apply from "@/views/Apply/index.vue";

const GUEST_FRONT_ROLES = ["guest", "student", "club_admin", "sys_admin"];
const FRONT_ROLES = ["student", "club_admin", "sys_admin"];
const CLUB_SERVICE_ROLES = ["club_admin"];

const createRouteMeta = ({
  title,
  roles = FRONT_ROLES,
  hidden = false,
  requiresAuth = true,
  menuKey = "",
  activeMenu = "",
}) => ({
  title,
  roles,
  hidden,
  requiresAuth,
  menuKey,
  activeMenu: activeMenu || menuKey,
});

const router = createRouter({
  history: createWebHistory(import.meta.env.BASE_URL),
  routes: [
    {
      path: "/",
      component: Layout,
      meta: { requiresAuth: false, hidden: true },
      children: [
        {
          path: "",
          redirect: "/home",
          meta: { requiresAuth: false, hidden: true },
        },
        {
          path: "home",
          name: "front-home",
          component: Home,
          meta: createRouteMeta({
            title: "首页",
            roles: GUEST_FRONT_ROLES,
            requiresAuth: false,
            menuKey: "/home",
          }),
        },
        {
          path: "club",
          name: "club-square",
          component: Club,
          meta: createRouteMeta({
            title: "社团",
            menuKey: "/club",
          }),
        },
        {
          path: "club/:id",
          name: "club-detail",
          component: () => import("@/views/Club/components/Detail.vue"),
          meta: createRouteMeta({
            title: "社团详情",
            hidden: true,
            activeMenu: "/club",
          }),
        },
        {
          path: "activity",
          name: "activity-square",
          component: () => import("@/views/Activity/index.vue"),
          meta: createRouteMeta({
            title: "活动",
            menuKey: "/activity",
          }),
        },
        {
          path: "activity/:id",
          name: "activity-detail",
          component: () => import("@/views/Activity/components/Detail.vue"),
          meta: createRouteMeta({
            title: "活动详情",
            hidden: true,
            activeMenu: "/activity",
          }),
        },
        {
          path: "apply",
          name: "application-service",
          component: Apply,
          meta: createRouteMeta({
            title: "申请服务",
            menuKey: "/apply",
          }),
        },
        {
          path: "notice",
          name: "notice-list",
          component: Notice,
          meta: createRouteMeta({
            title: "公告",
            menuKey: "/notice",
          }),
        },
        {
          path: "notice/:id",
          name: "notice-detail",
          component: () => import("@/views/Notice/components/Detail.vue"),
          meta: createRouteMeta({
            title: "公告详情",
            hidden: true,
            activeMenu: "/notice",
          }),
        },
        {
          path: "notice-detail",
          name: "legacy-notice-detail",
          component: () => import("@/views/Notice/components/Detail.vue"),
          meta: createRouteMeta({
            title: "公告详情",
            hidden: true,
            activeMenu: "/notice",
          }),
        },
        {
          path: "push",
          name: "club-feed",
          component: Push,
          meta: createRouteMeta({
            title: "社团动态",
            hidden: true,
            menuKey: "/push",
          }),
        },
        {
          path: "push/:id",
          name: "club-feed-detail",
          component: () => import("@/views/Push/components/Detail.vue"),
          meta: createRouteMeta({
            title: "社团动态详情",
            hidden: true,
            activeMenu: "/push",
          }),
        },
        {
          path: "member",
          name: "member-center",
          component: () => import("@/views/Member/index.vue"),
          redirect: "/member/info",
          meta: createRouteMeta({
            title: "个人中心",
            menuKey: "/member/info",
          }),
          children: [
            {
              path: "info",
              name: "member-profile",
              component: () => import("@/views/Member/components/MemberInfo.vue"),
              meta: createRouteMeta({
                title: "个人资料",
                hidden: true,
                activeMenu: "/member/info",
              }),
            },
            {
              path: "club",
              name: "member-clubs",
              component: () => import("@/views/Member/components/MemberClub.vue"),
              meta: createRouteMeta({
                title: "我的社团",
                hidden: true,
                activeMenu: "/member/info",
              }),
            },
            {
              path: "apply",
              name: "member-applications",
              component: () => import("@/views/Member/components/MemberApply.vue"),
              meta: createRouteMeta({
                title: "我的申请",
                hidden: true,
                activeMenu: "/member/info",
              }),
            },
          ],
        },
      ],
    },
    {
      path: "/register",
      name: "register",
      component: Register,
      meta: { requiresAuth: false, hidden: true, title: "注册" },
    },
    {
      path: "/login",
      name: "login",
      component: Login,
      meta: { requiresAuth: false, hidden: true, title: "登录" },
    },
    {
      path: "/preferences",
      alias: "/setting",
      name: "front-preferences",
      component: () => import("@/views/Admin/index.vue"),
      meta: createRouteMeta({
        title: "页面偏好",
        roles: FRONT_ROLES,
        hidden: true,
        requiresAuth: true,
        menuKey: "/preferences",
      }),
    },
    {
      path: "/club-service",
      redirect: "/member/club",
      meta: createRouteMeta({
        title: "我的社团",
        roles: CLUB_SERVICE_ROLES,
        hidden: true,
        requiresAuth: true,
        menuKey: "/member/club",
      }),
    },
  ],
});

export default router;
