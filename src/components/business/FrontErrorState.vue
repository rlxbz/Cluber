<template>
  <div class="front-state" :class="{ 'front-state--compact': compact }">
    <el-icon class="front-state__icon"><WarningFilled /></el-icon>
    <h3 class="front-state__title">{{ title }}</h3>
    <p class="front-state__description">{{ description }}</p>
    <el-button v-if="showRetry" type="primary" @click="$emit('retry')">
      {{ retryText }}
    </el-button>
  </div>
</template>

<script setup>
import { WarningFilled } from "@element-plus/icons-vue";

defineProps({
  title: {
    type: String,
    default: "加载出了点问题",
  },
  description: {
    type: String,
    default: "当前内容没能顺利加载，你可以稍后再试一次。",
  },
  retryText: {
    type: String,
    default: "重新加载",
  },
  showRetry: {
    type: Boolean,
    default: true,
  },
  compact: {
    type: Boolean,
    default: false,
  },
});

defineEmits(["retry"]);
</script>

<style scoped>
.front-state {
  padding: 32px 24px;
  border: 1px solid rgba(245, 108, 108, 0.18);
  border-radius: 12px;
  background: #fff7f7;
  text-align: center;
}

.front-state--compact {
  padding: 20px 16px;
}

.front-state__icon {
  font-size: 30px;
  color: var(--el-color-danger);
  margin-bottom: 12px;
}

.front-state__title {
  margin: 0 0 8px;
  font-size: 18px;
  color: var(--text-color);
}

.front-state__description {
  max-width: 520px;
  margin: 0 auto 16px;
  color: var(--text-light-color);
  line-height: 1.7;
}
</style>
