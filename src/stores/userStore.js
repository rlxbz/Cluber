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

export const ROLE_STUDENT = "student";
export const ROLE_CLUB_ADMIN = "club_admin";
export const ROLE_SYS_ADMIN = "sys_admin";
export const FRONT_ROLE_LIST = [ROLE_STUDENT, ROLE_CLUB_ADMIN, ROLE_SYS_ADMIN];
export const FRONT_CORE_ROLE_LIST = [ROLE_STUDENT, ROLE_CLUB_ADMIN];
export const CLUB_ADMIN_ROLE_LIST = [ROLE_CLUB_ADMIN];
export const GUEST_FRONT_ROLE_LIST = ["guest", ...FRONT_ROLE_LIST];

const DEFAULT_FRONT_ROUTE = "/home";
const AUTH_PAGE_LIST = ["/login", "/register"];

const DEFAULT_USER_INFO = Object.freeze({
  id: null,
  username: "",
  name: "",
  avatar: "",
  email: "",
  role: "",
  phone: "",
  introduction: "",
});

const DEFAULT_FRONT_ROUTE_MAP = {
  [ROLE_STUDENT]: DEFAULT_FRONT_ROUTE,
  [ROLE_CLUB_ADMIN]: "/apply?tab=activity",
  [ROLE_SYS_ADMIN]: "/preferences",
};

const FRONT_ROLE_META = {
  [ROLE_STUDENT]: {
    key: ROLE_STUDENT,
    label: "学生",
    homeRoute: DEFAULT_FRONT_ROUTE,
    description: "前台标准用户，使用社团浏览、活动参与和个人申请能力。",
    isCoreFrontRole: true,
    hasWeakEntryOnly: false,
  },
  [ROLE_CLUB_ADMIN]: {
    key: ROLE_CLUB_ADMIN,
    label: "社团管理员",
    homeRoute: "/apply?tab=activity",
    description: "保留学生前台能力，并可处理本社团轻业务。",
    isCoreFrontRole: true,
    hasWeakEntryOnly: false,
  },
  [ROLE_SYS_ADMIN]: {
    key: ROLE_SYS_ADMIN,
    label: "体验账号",
    homeRoute: "/preferences",
    description: "仅保留界面体验与调试用的轻入口。",
    isCoreFrontRole: false,
    hasWeakEntryOnly: true,
  },
};

const FRONT_MENU_CATALOG = {
  "/home": { key: "/home", path: "/home", label: "首页", icon: "home" },
  "/club": {
    key: "/club",
    path: "/club",
    label: "社团",
    icon: "club",
    permission: "canBrowseClub",
  },
  "/activity": {
    key: "/activity",
    path: "/activity",
    label: "活动",
    icon: "activity",
    permission: "canBrowseActivity",
  },
  "/apply": {
    key: "/apply",
    path: "/apply",
    label: "申请",
    icon: "apply",
    permission: "canViewMyApplications",
  },
  "/member/club": {
    key: "/member/club",
    path: "/member/club",
    label: "我的社团",
    icon: "clubService",
    permission: "canManageOwnClub",
  },
  "/apply?tab=join": {
    key: "/apply?tab=join",
    path: "/apply?tab=join",
    label: "入社申请回复",
    icon: "clubApply",
    permission: "canReviewClubJoinApplications",
  },
  "/notice": {
    key: "/notice",
    path: "/notice",
    label: "公告",
    icon: "notice",
    permission: "canVisitFront",
  },
  "/member/info": {
    key: "/member/info",
    path: "/member/info",
    label: "我的",
    icon: "profile",
    permission: "canEditProfile",
  },
};

const FRONT_MENU_KEYS_BY_ROLE = {
  guest: ["/home"],
  [ROLE_STUDENT]: ["/home", "/club", "/activity", "/apply", "/notice", "/member/info"],
  [ROLE_CLUB_ADMIN]: [
    "/home",
    "/club",
    "/activity",
    "/apply",
    "/member/club",
    "/apply?tab=join",
    "/notice",
    "/member/info",
  ],
  [ROLE_SYS_ADMIN]: ["/home"],
};

const normalizeRole = (role) => {
  const roleValue = String(role || "")
    .trim()
    .toLowerCase();

  if (roleValue === "system_admin") {
    return ROLE_SYS_ADMIN;
  }

  return roleValue;
};

export const normalizeUserInfo = (rawInfo = {}, fallbackRole = "") => {
  const source = rawInfo && typeof rawInfo === "object" ? rawInfo : {};
  const normalizedRole = normalizeRole(source.role || fallbackRole);

  return {
    ...DEFAULT_USER_INFO,
    ...source,
    id: source.id ?? source.userId ?? DEFAULT_USER_INFO.id,
    username: source.username ?? source.userName ?? DEFAULT_USER_INFO.username,
    name:
      source.name ??
      source.nickname ??
      source.realName ??
      source.username ??
      DEFAULT_USER_INFO.name,
    avatar: source.avatar ?? source.avatarUrl ?? DEFAULT_USER_INFO.avatar,
    email: source.email ?? DEFAULT_USER_INFO.email,
    role: normalizedRole,
    phone: source.phone ?? DEFAULT_USER_INFO.phone,
    introduction: source.introduction ?? DEFAULT_USER_INFO.introduction,
  };
};

const hasMeaningfulUserInfo = (info = {}) =>
  Boolean(info?.id || info?.username || info?.name || info?.email);

const normalizeSessionPayload = (payload = {}) => {
  const token = typeof payload.token === "string" ? payload.token : "";
  const normalizedRole = normalizeRole(payload.userInfo?.role || payload.role);
  const userInfo = normalizeUserInfo(payload.userInfo, normalizedRole);

  return {
    token,
    role: normalizedRole || userInfo.role,
    userInfo,
  };
};

const getDefaultRouteByRole = (role) =>
  DEFAULT_FRONT_ROUTE_MAP[normalizeRole(role)] || DEFAULT_FRONT_ROUTE;

const getRoleMeta = (role) =>
  FRONT_ROLE_META[normalizeRole(role)] || {
    key: normalizeRole(role) || "",
    label: "游客",
    homeRoute: DEFAULT_FRONT_ROUTE,
    description: "未登录用户，仅保留首页访问。",
    isCoreFrontRole: false,
    hasWeakEntryOnly: true,
  };

const createFrontPermissions = ({ isLogin, role }) => {
  const normalizedRole = normalizeRole(role);
  const canVisitFront = isLogin && FRONT_ROLE_LIST.includes(normalizedRole);
  const canUseCoreFront = FRONT_CORE_ROLE_LIST.includes(normalizedRole);
  const canManageOwnClub = normalizedRole === ROLE_CLUB_ADMIN;

  return {
    canVisitFront,
    canBrowseClub: canUseCoreFront,
    canBrowseActivity: canUseCoreFront,
    canSubmitJoinClubApply: canUseCoreFront,
    canViewMyApplications: canUseCoreFront,
    canEditProfile: canUseCoreFront,
    canViewOwnClub: canUseCoreFront,
    canManageOwnClub,
    canPublishClubActivity: canManageOwnClub,
    canReviewClubJoinApplications: canManageOwnClub,
    canVisitPreferencePage: canVisitFront,
    canUseHiddenDebugEntry: normalizedRole === ROLE_SYS_ADMIN,
  };
};

const createFrontMenus = ({ isLogin, role, permissions }) => {
  const menuKeys = FRONT_MENU_KEYS_BY_ROLE[isLogin ? normalizeRole(role) : "guest"] || ["/home"];

  return menuKeys
    .map((key) => FRONT_MENU_CATALOG[key])
    .filter(Boolean)
    .filter((item) => !item.permission || permissions[item.permission]);
};

const mockUsers = [
  {
    username: "student",
    password: "123456",
    role: ROLE_STUDENT,
    userInfo: normalizeUserInfo({
      id: 1,
      username: "student",
      name: "学生用户",
      role: ROLE_STUDENT,
    }),
  },
  {
    username: "clubadmin",
    password: "123456",
    role: ROLE_CLUB_ADMIN,
    userInfo: normalizeUserInfo({
      id: 2,
      username: "clubadmin",
      name: "社团管理员",
      role: ROLE_CLUB_ADMIN,
    }),
  },
  {
    username: "sysadmin",
    password: "123456",
    role: ROLE_SYS_ADMIN,
    userInfo: normalizeUserInfo({
      id: 3,
      username: "sysadmin",
      name: "体验账号",
      role: ROLE_SYS_ADMIN,
    }),
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

const parseSessionInput = (tokenOrPayload, userInfo, role) => {
  if (tokenOrPayload && typeof tokenOrPayload === "object" && !Array.isArray(tokenOrPayload)) {
    return tokenOrPayload;
  }

  return {
    token: tokenOrPayload,
    userInfo,
    role,
  };
};

const getInitialSessionState = () =>
  normalizeSessionPayload({
    token: tokenStorage.get("token") || "",
    userInfo: userInfoStorage.get("userInfo"),
    role: roleStorage.get("role") || "",
  });

export const useUserStore = defineStore("user", {
  state: () => {
    const initialSession = getInitialSessionState();

    return {
      token: initialSession.token,
      userInfo: initialSession.userInfo,
      role: initialSession.role,
    };
  },
  getters: {
    isLogin: (state) => !!state.token,
    userProfile: (state) => state.userInfo,
    normalizedRole: (state) => normalizeRole(state.role || state.userInfo?.role),
    hasUserProfile: (state) => hasMeaningfulUserInfo(state.userInfo),
    isStudent() {
      return this.normalizedRole === ROLE_STUDENT;
    },
    isClubAdmin() {
      return this.normalizedRole === ROLE_CLUB_ADMIN;
    },
    isSysAdmin() {
      return this.normalizedRole === ROLE_SYS_ADMIN;
    },
    currentRoleInfo() {
      return getRoleMeta(this.normalizedRole);
    },
    roleProfile() {
      return this.currentRoleInfo;
    },
    frontPermissions() {
      return createFrontPermissions({
        isLogin: this.isLogin,
        role: this.normalizedRole,
      });
    },
    frontVisibleMenus() {
      return createFrontMenus({
        isLogin: this.isLogin,
        role: this.normalizedRole,
        permissions: this.frontPermissions,
      });
    },
    defaultFrontRoute() {
      return getDefaultRouteByRole(this.normalizedRole);
    },
  },
  actions: {
    setUserState(sessionPayload = {}) {
      const normalizedSession = normalizeSessionPayload(sessionPayload);

      this.token = normalizedSession.token;
      this.userInfo = normalizedSession.userInfo;
      this.role = normalizedSession.role;

      return normalizedSession;
    },

    clearSession() {
      this.setUserState({
        token: "",
        userInfo: DEFAULT_USER_INFO,
        role: "",
      });

      tokenStorage.remove("token");
      userInfoStorage.remove("userInfo");
      roleStorage.remove("role");
    },

    persistSession(tokenOrPayload, userInfo, role) {
      const normalizedSession = this.setUserState(
        parseSessionInput(tokenOrPayload, userInfo, role)
      );

      tokenStorage.set("token", normalizedSession.token);
      userInfoStorage.set("userInfo", normalizedSession.userInfo);
      roleStorage.set("role", normalizedSession.role);

      return normalizedSession;
    },

    can(permissionKey) {
      return Boolean(this.frontPermissions[permissionKey]);
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
        this.persistSession({
          token: `mock_token_${mockUser.role}`,
          userInfo: mockUser.userInfo,
          role: mockUser.role,
        });
        ElMessage.success("登录成功（本地模拟）");
        return true;
      }

      try {
        const res = await loginAPI(userData);
        const token = res?.data?.token || res?.token;

        if (!token) {
          throw new Error("登录返回缺少 token");
        }

        this.persistSession({ token, role: this.role, userInfo: this.userInfo });
        await this.getUserInfo({ force: true });
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
        userInfo: normalizeUserInfo({
          id: Date.now(),
          username: userData.username,
          name: userData.username,
          role: ROLE_STUDENT,
          avatar: "",
          email: userData.email || "",
        }),
      });

      ElMessage.success("注册成功，请登录");
      return true;
    },

    async restoreSession() {
      const storedSession = {
        token: tokenStorage.get("token") || this.token,
        userInfo: userInfoStorage.get("userInfo"),
        role: roleStorage.get("role") || this.role,
      };

      if (!storedSession.token) {
        this.clearSession();
        return false;
      }

      this.persistSession(storedSession);

      if (!this.hasUserProfile || !this.normalizedRole) {
        try {
          await this.getUserInfo({ force: true, fallbackRole: storedSession.role });
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

    async getUserInfo(options = {}) {
      const { force = false, fallbackRole = this.role } = options;

      if (!this.token) {
        return this.userInfo;
      }

      if (!force && this.hasUserProfile && this.normalizedRole) {
        return this.persistSession({
          token: this.token,
          userInfo: this.userInfo,
          role: this.role,
        }).userInfo;
      }

      const mockUser = getMockUserByToken(this.token);
      if (mockUser) {
        return this.persistSession({
          token: this.token,
          userInfo: mockUser.userInfo,
          role: mockUser.role,
        }).userInfo;
      }

      try {
        const res = await getUserInfoAPI();
        const info = res?.data || res || {};

        return this.persistSession({
          token: this.token,
          userInfo: info,
          role: info.role || fallbackRole || this.role,
        }).userInfo;
      } catch (error) {
        ElMessage.error("获取用户信息失败");
        this.clearSession();
        throw error;
      }
    },

    async updateUserInfo(info) {
      const nextUserInfo = normalizeUserInfo(
        {
          ...this.userInfo,
          ...info,
        },
        this.normalizedRole
      );

      try {
        if (!this.token || this.token.startsWith("mock_token_")) {
          this.persistSession({
            token: this.token,
            userInfo: nextUserInfo,
            role: this.normalizedRole,
          });
          return true;
        }

        const res = await updateUserInfoAPI(info);
        const updateSucceeded =
          res !== null &&
          res !== undefined &&
          res !== false &&
          res?.code !== 500 &&
          res?.success !== false;

        if (!updateSucceeded) {
          return false;
        }

        this.persistSession({
          token: this.token,
          userInfo: nextUserInfo,
          role: this.normalizedRole,
        });
        return true;
      } catch (error) {
        console.error("更新用户信息失败", error);
        throw error;
      }
    },
  },
});
