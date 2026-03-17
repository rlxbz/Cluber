import { defineStore } from "pinia";
import {
  loginAPI,
  registerAPI,
  getUserInfoAPI,
  updateUserInfoAPI,
} from "@/apis/user";
import { ElMessage } from "element-plus";
import { Storage, StorageConfig } from "@/utils/storage";

const userStorage = Storage[StorageConfig.user.token];

const ROLE_STUDENT = "student";
const ROLE_CLUB_ADMIN = "club_admin";
const ROLE_SYS_ADMIN = "sys_admin";
const FRONT_ROLE_LIST = [ROLE_STUDENT, ROLE_CLUB_ADMIN, ROLE_SYS_ADMIN];

const normalizeRole = (role) => {
  if (role === "system_admin") {
    return ROLE_SYS_ADMIN;
  }

  return role || "";
};

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
    token: userStorage.get("token") || "",
    userInfo: userStorage.get("userInfo") || null,
    role: normalizeRole(userStorage.get("role") || ""),
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
    defaultFrontRoute: () => "/home",
  },
  actions: {
    persistSession(token, userInfo, role) {
      const normalizedRole = normalizeRole(role);

      this.token = token;
      this.userInfo = userInfo ? { ...userInfo, role: normalizedRole } : null;
      this.role = normalizedRole;

      userStorage.set("token", this.token);
      userStorage.set("userInfo", this.userInfo);
      userStorage.set("role", this.role);
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

        userStorage.set("token", token);
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

    logout() {
      this.token = "";
      this.userInfo = null;
      this.role = "";

      userStorage.remove("token");
      userStorage.remove("userInfo");
      userStorage.remove("role");
    },

    async getUserInfo() {
      if (this.userInfo) {
        const normalizedRole = normalizeRole(this.userInfo.role || this.role);
        this.userInfo = { ...this.userInfo, role: normalizedRole };
        this.role = normalizedRole;
        userStorage.set("userInfo", this.userInfo);
        userStorage.set("role", this.role);
        return this.userInfo;
      }

      try {
        const res = await getUserInfoAPI();
        const info = res?.data || res || {};
        const normalizedRole = normalizeRole(info.role || this.role);

        this.userInfo = { ...info, role: normalizedRole };
        this.role = normalizedRole;
        userStorage.set("userInfo", this.userInfo);
        userStorage.set("role", this.role);
        return this.userInfo;
      } catch (error) {
        ElMessage.error("获取用户信息失败");
        this.logout();
        throw error;
      }
    },

    async updateUserInfo(info) {
      try {
        if (!this.token || this.token.startsWith("mock_token_")) {
          this.userInfo = { ...this.userInfo, ...info, role: this.normalizedRole };
          userStorage.set("userInfo", this.userInfo);
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
          userStorage.set("userInfo", this.userInfo);
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
