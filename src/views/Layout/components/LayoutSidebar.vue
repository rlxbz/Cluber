<template>
  <aside class="app-sidebar" :class="{ mobile: isMobile }">
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
      <el-menu-item
        v-for="item in menuList"
        :key="item.key"
        :index="item.key"
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
  Collection as CollectionIcon,
  Tickets as TicketsIcon,
  Close,
} from "@element-plus/icons-vue";

const isMobile = inject("isMobile", ref(false));
const showMobileMenu = inject("showMobileMenu", ref(false));
const toggleMobileMenu = inject("toggleMobileMenu", () => {});

const userStore = useUserStore();
const route = useRoute();
const router = useRouter();

const iconMap = {
  home: HomeIcon,
  club: SchoolIcon,
  activity: CalendarIcon,
  apply: FileTextIcon,
  notice: BellIcon,
  profile: UserIcon,
  clubService: CollectionIcon,
  clubApply: TicketsIcon,
};

const menuList = computed(() =>
  userStore.frontVisibleMenus.map((item) => ({
    ...item,
    iconComponent: iconMap[item.icon] || FileTextIcon,
  }))
);

const activeMenu = computed(() => {
  if (route.path.startsWith("/member")) {
    return route.path === "/member/club" && userStore.isClubAdmin
      ? "/member/club"
      : "/member/info";
  }

  if (route.path === "/apply") {
    if (route.query.tab === "join") {
      return "/apply?tab=join";
    }

    if (route.query.tab === "activity") {
      return "/apply";
    }
  }

  return route.meta.activeMenu || route.meta.menuKey || route.path;
});

const handleClose = () => {
  toggleMobileMenu();
};

const handleMenuSelect = (key) => {
  const selectedMenu = menuList.value.find((item) => item.key === key);
  if (!selectedMenu) {
    return;
  }

  router.push(selectedMenu.path);

  if (isMobile.value) {
    toggleMobileMenu();
  }
};
</script>

<style scoped>
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
