<template>
  <div class="login-required" :class="{ 'login-required--compact': compact }">
    <el-icon class="login-required__icon"><Lock /></el-icon>
    <div class="login-required__content">
      <h3 class="login-required__title">{{ title }}</h3>
      <p class="login-required__description">{{ description }}</p>
    </div>
    <el-button type="primary" @click="goToLogin">{{ buttonText }}</el-button>
  </div>
</template>

<script setup>
import { computed } from "vue";
import { useRoute, useRouter } from "vue-router";
import { Lock } from "@element-plus/icons-vue";

const props = defineProps({
  title: {
    type: String,
    default: "你还未登录",
  },
  description: {
    type: String,
    default: "登录后即可继续报名或提交申请。",
  },
  buttonText: {
    type: String,
    default: "去登录",
  },
  redirect: {
    type: String,
    default: "",
  },
  compact: {
    type: Boolean,
    default: false,
  },
});

const route = useRoute();
const router = useRouter();

const redirectTarget = computed(() => props.redirect || route.fullPath || "/home");

const goToLogin = () => {
  router.push({
    path: "/login",
    query: {
      redirect: redirectTarget.value,
    },
  });
};
</script>

<style scoped>
.login-required {
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 16px;
  padding: 18px 20px;
  border-radius: 12px;
  background: linear-gradient(90deg, rgba(64, 158, 255, 0.1) 0%, rgba(103, 194, 58, 0.08) 100%);
  border: 1px solid rgba(64, 158, 255, 0.16);
}

.login-required--compact {
  padding: 14px 16px;
}

.login-required__icon {
  flex-shrink: 0;
  font-size: 28px;
  color: var(--el-color-primary);
}

.login-required__content {
  flex: 1;
  min-width: 0;
}

.login-required__title {
  margin: 0 0 4px;
  font-size: 16px;
  color: var(--text-color);
}

.login-required__description {
  margin: 0;
  color: var(--text-light-color);
  line-height: 1.6;
}

@media (max-width: 768px) {
  .login-required {
    flex-direction: column;
    align-items: flex-start;
  }
}
</style>
