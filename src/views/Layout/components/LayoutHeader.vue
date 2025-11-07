<template>
  <header class="app-header">
    <div class="header-container container">
      <div class="logo">Cluber</div>

      <!-- 已登录状态显示用户信息 -->
      <div class="user-info" v-if="token">
        <el-dropdown>
          <span class="user-name">{{ userInfo?.name || "用户" }}</span>
          <template #dropdown>
            <el-dropdown-menu>
              <el-dropdown-item @click="handleLogout">退出登录</el-dropdown-item>
            </el-dropdown-menu>
          </template>
        </el-dropdown>
      </div>

      <!-- 未登录状态显示登录按钮 -->
      <div v-else>
        <CommonButton type="primary" @click="toLogin" class="login-btn">
          去登录
        </CommonButton>
      </div>
    </div>
  </header>
</template>

<script setup>
import { useUserStore } from "@/stores/userStore";
import { useRouter } from "vue-router";
import { ElDropdown, ElDropdownMenu, ElDropdownItem, ElMessage } from "element-plus";
import CommonButton from "@/components/common/Button/index.vue";
import { ref } from "vue";

const router = useRouter();
const userStore = useUserStore();
// 直接通过token判断登录状态
const token = ref(localStorage.getItem("token"));
const userInfo = userStore.userInfo;

const toLogin = () => {
  router.push("/login");
};

const handleLogout = () => {
  userStore.logout();
  localStorage.removeItem("token");
  token.value = null; // 刷新状态
  ElMessage.success("已退出登录");
  router.push("/login");
};
</script>

<style scoped>
.app-header {
  height: 60px;
  background-color: #fff;
  border-bottom: 1px solid var(--border-color);
  position: relative;
  z-index: 100;
}

.header-container {
  display: flex;
  justify-content: space-between;
  align-items: center;
  height: 100%;
}

.logo {
  font-size: 20px;
  font-weight: bold;
  color: var(--primary-color);
}

/* 移动端适配 */
@media (max-width: 767px) {
  .logo {
    margin-left: 50px; /* 给移动端菜单按钮留出空间 */
  }

  .user-name {
    font-size: 14px;
    padding: 3px 8px;
  }

  .login-btn {
    padding: 4px 12px;
    font-size: 14px;
  }
}
</style>
