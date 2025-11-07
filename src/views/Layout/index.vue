<!-- src/views/Layout/index.vue -->
<template>
  <div class="layout-container">
    <!-- 头部导航 -->
    <LayoutHeader />

    <!-- 移动端导航开关 -->
    <div class="mobile-nav-toggle" @click="toggleMobileMenu" v-if="isMobile">
      <el-icon :size="24"><Menu /></el-icon>
    </div>

    <!-- 内容区容器 -->
    <div class="content-wrapper container">
      <div class="layout-content">
        <!-- 侧边栏 (桌面端常驻，移动端可折叠) -->
        <LayoutSidebar
          :class="{
            'mobile-sidebar': isMobile,
            'sidebar-hidden': isMobile && !showMobileMenu,
          }"
        />

        <!-- 主内容区 -->
        <main class="main-content">
          <RouterView />
        </main>
      </div>
    </div>

    <!-- 页脚 -->
    <LayoutFooter />
  </div>
</template>

<script setup>
import { ref, onMounted, onUnmounted, provide } from "vue";
import LayoutHeader from "./components/LayoutHeader.vue";
import LayoutSidebar from "./components/LayoutSidebar.vue";
import LayoutFooter from "./components/LayoutFooter.vue";
import { Menu } from "@element-plus/icons-vue";

// 响应式状态管理
const isMobile = ref(false);
const showMobileMenu = ref(false);

// 检测屏幕尺寸
const checkScreenSize = () => {
  isMobile.value = window.innerWidth < 768;
  // 移动端默认隐藏菜单
  if (isMobile.value) {
    showMobileMenu.value = false;
  } else {
    showMobileMenu.value = true;
  }
};

// 切换移动端菜单显示状态
const toggleMobileMenu = () => {
  showMobileMenu.value = !showMobileMenu.value;
};

// 监听窗口大小变化
onMounted(() => {
  checkScreenSize();
  window.addEventListener("resize", checkScreenSize);
});

onUnmounted(() => {
  window.removeEventListener("resize", checkScreenSize);
});

provide("isMobile", isMobile);
provide("showMobileMenu", showMobileMenu);
provide("toggleMobileMenu", toggleMobileMenu);
</script>

<style scoped>
/* 原有样式保持不变 */
.layout-container {
  min-height: 100vh;
  display: flex;
  flex-direction: column;
}

.content-wrapper {
  flex: 1;
  padding: 20px 0;
}

.layout-content {
  display: flex;
  height: 100%;
}

.main-content {
  flex: 1;
  background-color: var(--bg-color);
  border-radius: 4px;
}

/* 移动端导航开关样式 */
.mobile-nav-toggle {
  position: fixed;
  top: 15px;
  left: 15px;
  z-index: 1000;
  background: white;
  width: 40px;
  height: 40px;
  border-radius: 50%;
  display: flex;
  align-items: center;
  justify-content: center;
  box-shadow: 0 2px 10px rgba(0, 0, 0, 0.1);
}

/* 响应式样式 */
@media (max-width: 767px) {
  .layout-content {
    position: relative;
  }

  .mobile-sidebar {
    position: fixed;
    top: 60px; /* 头部高度 */
    left: 0;
    bottom: 0;
    z-index: 999;
    transition: transform 0.3s ease;
    box-shadow: 2px 0 10px rgba(0, 0, 0, 0.1);
  }

  .sidebar-hidden {
    transform: translateX(-100%);
  }

  .main-content {
    padding: 15px;
    width: 100%;
  }
}

@media (min-width: 768px) {
  :deep(.app-sidebar) {
    width: 220px;
    margin-right: 20px;
  }

  .mobile-nav-toggle {
    display: none;
  }
}
</style>
