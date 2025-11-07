<template>
  <aside class="app-sidebar" :class="{ mobile: isMobile }">
    <!-- 移动端关闭按钮 -->
    <div class="mobile-close" @click="handleClose" v-if="isMobile">
      <el-icon :size="20"><Close /></el-icon>
    </div>

    <el-menu
      :default-active="activeMenu"
      class="sidebar-menu"
      mode="vertical"
      @select="handleMenuSelect"
      :collapse="isMobile && !showMobileMenu"
    >
      <!-- 菜单内容保持不变 -->
      <el-menu-item
        v-for="item in menuList"
        :key="item.path"
        :index="item.path"
        :route="item.path"
      >
        <component :is="item.iconComponent" class="el-icon" />
        <span>{{ item.label }}</span>
      </el-menu-item>
    </el-menu>
  </aside>
</template>

<script setup>
import { computed, ref, inject } from "vue";
import { useRoute, useRouter } from "vue-router";
import { useUserStore } from "@/stores/userStore";
import {
  House as HomeIcon,
  School as SchoolIcon,
  Calendar as CalendarIcon,
  Document as FileTextIcon,
  Bell as BellIcon,
  User as UserIcon,
  Setting as SettingIcon,
  Close,
} from "@element-plus/icons-vue";

// 接收来自父组件的响应式状态
const isMobile = inject("isMobile", ref(false));
const showMobileMenu = inject("showMobileMenu", ref(false));
const toggleMobileMenu = inject("toggleMobileMenu", () => {});

const handleClose = () => {
  toggleMobileMenu();
};

// 原有逻辑保持不变
const userStore = useUserStore();
const route = useRoute();
const router = useRouter();

const menuList = computed(() => {
  const token = localStorage.getItem("token");
  if (!token) {
    return [{ path: "/home", label: "首页", iconComponent: HomeIcon }];
  }

  const baseMenu = [
    { path: "/home", label: "首页", iconComponent: HomeIcon },
    { path: "/club", label: "社团列表", iconComponent: SchoolIcon },
    { path: "/activity", label: "活动中心", iconComponent: CalendarIcon },
    { path: "/notice", label: "公告通知", iconComponent: BellIcon },
    { path: "/member/info", label: "个人中心", iconComponent: UserIcon },
    { path: "/setting", label: "系统设置", iconComponent: SettingIcon },
  ];

  if (userStore.role === "system_admin") {
    return [
      ...baseMenu,
      { path: "/apply", label: "申请管理", iconComponent: FileTextIcon },
    ];
  }
  if (userStore.role === "club_admin") {
    return [
      ...baseMenu,
      { path: "/apply", label: "申请管理", iconComponent: FileTextIcon },
    ];
  }
  return baseMenu;
});

const activeMenu = computed(() => {
  return route.path;
});

const handleMenuSelect = (index) => {
  router.push(index);
  // 移动端选中后关闭菜单
  if (isMobile.value) {
    toggleMobileMenu();
  }
};
</script>

<style scoped>
/* 原有样式保持不变 */
.app-sidebar {
  width: 220px;
  background-color: #fff;
  border-right: 1px solid var(--border-color);
  min-height: calc(100vh - 120px);
}

.sidebar-menu {
  border-right: none;
  height: 100%;
  padding-top: 20px;
}

.el-menu-item {
  height: 50px;
  line-height: 50px;
  font-size: 14px;
}

.el-icon {
  margin-right: 10px;
}

/* 移动端样式 */
.mobile {
  width: 260px;
  min-height: calc(100vh - 60px);
}

.mobile-close {
  padding: 15px 20px;
  text-align: right;
  cursor: pointer;
}
</style>
