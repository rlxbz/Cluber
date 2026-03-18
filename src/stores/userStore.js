import { defineStore } from "pinia";
import {
  loginAPI,
  registerAPI,
  getUserInfoAPI,
  updateUserInfoAPI,
} from "@/apis/user";
import { ElMessage } from "element-plus";
import { Storage, StorageConfig } from "@/utils/storage";

const tokenStorage = Storage[StorageConfig.user.token];
const userInfoStorage = Storage[StorageConfig.user.userInfo];
const roleStorage = Storage[StorageConfig.user.role];

const ROLE_STUDENT = "student";
const ROLE_CLUB_ADMIN = "club_admin";
const ROLE_SYS_ADMIN = "sys_admin";
const FRONT_ROLE_LIST = [ROLE_STUDENT, ROLE_CLUB_ADMIN, ROLE_SYS_ADMIN];
const DEFAULT_FRONT_ROUTE = "/home";
const AUTH_PAGE_LIST = ["/login", "/register"];

const normalizeRole = (role) => {
  if (role === "system_admin") {
    return ROLE_SYS_ADMIN;
  }

  return role || "";
};

const DEFAULT_FRONT_ROUTE_MAP = {
  [ROLE_STUDENT]: DEFAULT_FRONT_ROUTE,
  [ROLE_CLUB_ADMIN]: "/apply?tab=activity",
  [ROLE_SYS_ADMIN]: "/preferences",
};

const getDefaultRouteByRole = (role) =>
  DEFAULT_FRONT_ROUTE_MAP[normalizeRole(role)] || DEFAULT_FRONT_ROUTE;

const mockUsers = [
  {
    username: "student",
    password: "123456",
    role: ROLE_STUDENT,
    userInfo: { id: 1, username: "student", name: "学生用户", role: ROLE_STUDENT, avatar: "" },
  },
  {
    username: "clubadmin",
    password: "123456",
    role: ROLE_CLUB_ADMIN,
    userInfo: {
      id: 2,
      username: "clubadmin",
      name: "社团管理员",
      role: ROLE_CLUB_ADMIN,
      avatar: "",
    },
  },
  {
    username: "sysadmin",
    password: "123456",
    role: ROLE_SYS_ADMIN,
    userInfo: {
      id: 3,
      username: "sysadmin",
      name: "系统测试账号",
      role: ROLE_SYS_ADMIN,
      avatar: "",
    },
  },
];

const getMockUserByRole = (role) =>
  mockUsers.find((user) => user.role === normalizeRole(role));

const getMockUserByToken = (token) => {
  if (!token || !token.startsWith("mock_token_")) {
    return null;
  }

  const role = normalizeRole(token.replace("mock_token_", ""));
  return getMockUserByRole(role);
};

const createFrontMenus = ({ isLoggedIn, isClubAdmin }) => {
  if (!isLoggedIn) {
    return [{ key: "/home", path: "/home", label: "首页", icon: "home" }];
  }

  const baseMenus = [
    { key: "/home", path: "/home", label: "首页", icon: "home" },
    { key: "/club", path: "/club", label: "社团", icon: "club" },
    { key: "/activity", path: "/activity", label: "活动", icon: "activity" },
    { key: "/apply", path: "/apply", label: "申请", icon: "apply" },
    { key: "/notice", path: "/notice", label: "公告", icon: "notice" },
    { key: "/member/info", path: "/member/info", label: "我的", icon: "profile" },
  ];

  if (!isClubAdmin) {
    return baseMenus;
  }

  return [
    ...baseMenus.slice(0, 4),
    { key: "/member/club", path: "/member/club", label: "我的社团", icon: "clubService" },
    { key: "/apply?tab=join", path: "/apply?tab=join", label: "社团申请处理", icon: "clubApply" },
    ...baseMenus.slice(4),
  ];
};

export const useUserStore = defineStore("user", {
  state: () => ({
    token: tokenStorage.get("token") || "",
    userInfo: userInfoStorage.get("userInfo") || null,
    role: normalizeRole(roleStorage.get("role") || ""),
  }),
  getters: {
    isLogin: (state) => !!state.token,
    normalizedRole: (state) => normalizeRole(state.role || state.userInfo?.role),
    isStudent() {
      return this.normalizedRole === ROLE_STUDENT;
    },
    isClubAdmin() {
      return this.normalizedRole === ROLE_CLUB_ADMIN;
    },
    isSysAdmin() {
      return this.normalizedRole === ROLE_SYS_ADMIN;
    },
    frontPermissions() {
      return {
        canVisitFront: FRONT_ROLE_LIST.includes(this.normalizedRole),
        canManageOwnClub: this.isClubAdmin,
        canUseHiddenDebugEntry: this.isSysAdmin,
      };
    },
    frontVisibleMenus() {
      return createFrontMenus({
        isLoggedIn: this.isLogin,
        isClubAdmin: this.isClubAdmin,
      });
    },
    defaultFrontRoute() {
      return getDefaultRouteByRole(this.normalizedRole);
    },
  },
  actions: {
    clearSession() {
      this.token = "";
      this.userInfo = null;
      this.role = "";

      tokenStorage.remove("token");
      userInfoStorage.remove("userInfo");
      roleStorage.remove("role");
    },

    persistSession(token, userInfo, role) {
      const normalizedRole = normalizeRole(role);

      this.token = token;
      this.userInfo = userInfo ? { ...userInfo, role: normalizedRole } : null;
      this.role = normalizedRole;

      tokenStorage.set("token", this.token);
      userInfoStorage.set("userInfo", this.userInfo);
      roleStorage.set("role", this.role);
    },

    getDefaultRouteByRole(role = this.normalizedRole) {
      return getDefaultRouteByRole(role);
    },

    resolveLoginTarget(redirect, allowRedirect = true) {
      const fallbackRoute = this.getDefaultRouteByRole(this.normalizedRole);

      if (!allowRedirect || typeof redirect !== "string" || !redirect.startsWith("/")) {
        return fallbackRoute;
      }

      if (AUTH_PAGE_LIST.some((path) => redirect.startsWith(path))) {
        return fallbackRoute;
      }

      return redirect;
    },

    hasRouteAccess(roles = []) {
      if (!roles.length) {
        return true;
      }

      return roles.includes(this.normalizedRole);
    },

    async login(userData) {
      const mockUser = mockUsers.find(
        (user) => user.username === userData.username && user.password === userData.password
      );

      if (mockUser) {
        this.persistSession(
          `mock_token_${mockUser.role}`,
          mockUser.userInfo,
          mockUser.role
        );
        ElMessage.success("登录成功（本地模拟）");
        return true;
      }

      try {
        const res = await loginAPI(userData);
        const token = res?.data?.token || res?.token;

        if (!token) {
          throw new Error("登录返回缺少 token");
        }

        tokenStorage.set("token", token);
        this.token = token;
        await this.getUserInfo();
        ElMessage.success("登录成功");
        return true;
      } catch (error) {
        ElMessage.error("用户名或密码错误");
        return false;
      }
    },

    async register(userData) {
      const duplicatedUser = mockUsers.some((user) => user.username === userData.username);

      if (duplicatedUser) {
        ElMessage.error("用户名已存在");
        return false;
      }

      try {
        const res = await registerAPI(userData);
        if (res?.success === false) {
          throw new Error("注册失败");
        }
      } catch (error) {
        // 保留本地模拟注册，避免演示流程被后端缺失阻塞。
      }

      mockUsers.push({
        username: userData.username,
        password: userData.password,
        role: ROLE_STUDENT,
        userInfo: {
          id: Date.now(),
          username: userData.username,
          name: userData.username,
          role: ROLE_STUDENT,
          avatar: "",
          email: userData.email || "",
        },
      });

      ElMessage.success("注册成功，请登录");
      return true;
    },

    async restoreSession() {
      const token = tokenStorage.get("token") || this.token;

      if (!token) {
        this.clearSession();
        return false;
      }

      const storedUserInfo = userInfoStorage.get("userInfo");
      const storedRole = normalizeRole(roleStorage.get("role") || storedUserInfo?.role || this.role);

      this.token = token;
      this.role = storedRole;
      this.userInfo = storedUserInfo
        ? { ...storedUserInfo, role: normalizeRole(storedUserInfo.role || storedRole) }
        : null;

      if (this.userInfo) {
        this.role = normalizeRole(this.userInfo.role || this.role);
        userInfoStorage.set("userInfo", this.userInfo);
      }

      if (this.role) {
        roleStorage.set("role", this.role);
      }

      if (!this.userInfo || !this.role) {
        try {
          await this.getUserInfo();
        } catch (error) {
          this.clearSession();
          return false;
        }
      }

      return true;
    },

    logout() {
      this.clearSession();
    },

    async getUserInfo() {
      if (this.userInfo && (this.userInfo.role || this.role)) {
        const normalizedRole = normalizeRole(this.userInfo.role || this.role);
        this.userInfo = { ...this.userInfo, role: normalizedRole };
        this.role = normalizedRole;
        userInfoStorage.set("userInfo", this.userInfo);
        roleStorage.set("role", this.role);
        return this.userInfo;
      }

      const mockUser = getMockUserByToken(this.token);
      if (mockUser) {
        this.persistSession(this.token, mockUser.userInfo, mockUser.role);
        return this.userInfo;
      }

      try {
        const res = await getUserInfoAPI();
        const info = res?.data || res || {};
        const normalizedRole = normalizeRole(info.role || this.role);

        this.userInfo = { ...info, role: normalizedRole };
        this.role = normalizedRole;
        userInfoStorage.set("userInfo", this.userInfo);
        roleStorage.set("role", this.role);
        return this.userInfo;
      } catch (error) {
        ElMessage.error("获取用户信息失败");
        this.clearSession();
        throw error;
      }
    },

    async updateUserInfo(info) {
      try {
        if (!this.token || this.token.startsWith("mock_token_")) {
          this.userInfo = { ...this.userInfo, ...info, role: this.normalizedRole };
          userInfoStorage.set("userInfo", this.userInfo);
          return true;
        }

        const res = await updateUserInfoAPI(info);
        const updateSucceeded =
          res !== null &&
          res !== undefined &&
          res !== false &&
          res?.code !== 500 &&
          res?.success !== false;

        if (updateSucceeded) {
          this.userInfo = { ...this.userInfo, ...info, role: this.normalizedRole };
          userInfoStorage.set("userInfo", this.userInfo);
          return true;
        }

        return false;
      } catch (error) {
        console.error("更新用户信息失败", error);
        throw error;
      }
    },
  },
});
