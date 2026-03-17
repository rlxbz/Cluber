import router from "./index";
import { useUserStore } from "@/stores/userStore";
import { ElMessage } from "element-plus";

router.beforeEach(async (to, from, next) => {
  const userStore = useUserStore();
  const token = userStore.token;
  const requiresAuth = to.meta.requiresAuth ?? to.meta.requireAuth ?? false;

  if ((to.path === "/login" || to.path === "/register") && token) {
    next(userStore.defaultFrontRoute);
    return;
  }

  if (requiresAuth === false) {
    next();
    return;
  }

  if (!token) {
    ElMessage.warning("请先登录以使用完整功能");
    next("/home");
    return;
  }

  if (!userStore.userInfo) {
    try {
      await userStore.getUserInfo();
    } catch (error) {
      userStore.logout();
      next("/home");
      return;
    }
  }

  if (to.meta.roles?.length && !userStore.hasRouteAccess(to.meta.roles)) {
    ElMessage.error("当前账号暂无该页面访问权限");
    next(userStore.defaultFrontRoute);
    return;
  }

  next();
});

router.afterEach((to) => {
  if (to.meta.title) {
    document.title = `Cluber - ${to.meta.title}`;
  }
});

export default router;
