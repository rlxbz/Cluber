<template>
  <div class="member-container">
    <!-- 顶部导航菜单 -->
    <div class="member-nav">
      <el-menu
        default-active="info"
        class="member-menu"
        mode="horizontal"
        @select="handleMenuSelect"
      >
        <el-menu-item index="info">
          <el-icon><User /></el-icon>
          <span>个人信息</span>
        </el-menu-item>
        <el-menu-item index="club">
          <el-icon><Collection /></el-icon>
          <span>我的社团</span>
        </el-menu-item>
        <el-menu-item index="apply">
          <el-icon><Ticket /></el-icon>
          <span>我的申请</span>
        </el-menu-item>
      </el-menu>
    </div>

    <!-- 内容区域 -->
    <div class="member-content">
      <router-view />
    </div>
  </div>
</template>

<script setup>
import { useRouter } from "vue-router";
import { User, Collection, Ticket } from "@element-plus/icons-vue";

const router = useRouter();

// 处理菜单选择
const handleMenuSelect = (index) => {
  router.push(`/member/${index}`);
};
</script>

<style scoped>
.member-container {
  min-height: 500px;
  display: flex;
  flex-direction: column;
}

/* 顶部导航样式 */
.member-nav {
  border-bottom: 1px solid var(--border-color);
}

.member-menu {
  border-bottom: none;
}

/* 内容区域样式 */
.member-content {
  flex: 1;
  padding: 20px;
  margin-top: 15px;
}

/* 响应式调整 */
@media (max-width: 768px) {
  .member-menu {
    width: 100%;
    overflow-x: auto;
    white-space: nowrap;
  }

  .member-content {
    padding: 15px;
  }
}
</style>
