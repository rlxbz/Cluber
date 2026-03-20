<template>
  <div class="front-state" :class="{ 'front-state--compact': compact }">
    <el-icon class="front-state__icon front-state__icon--loading"><Loading /></el-icon>
    <h3 class="front-state__title">{{ title }}</h3>
    <p class="front-state__description">{{ description }}</p>
    <el-skeleton animated :rows="compact ? 2 : 3" class="front-state__skeleton" />
  </div>
</template>

<script setup>
import { Loading } from "@element-plus/icons-vue";

defineProps({
  title: {
    type: String,
    default: "正在加载",
  },
  description: {
    type: String,
    default: "内容正在准备中，请稍等一下。",
  },
  compact: {
    type: Boolean,
    default: false,
  },
});
</script>

<style scoped>
.front-state {
  padding: 32px 24px;
  border: 1px dashed var(--border-color);
  border-radius: 12px;
  background: linear-gradient(180deg, #ffffff 0%, #f8fbff 100%);
  text-align: center;
}

.front-state--compact {
  padding: 20px 16px;
}

.front-state__icon {
  font-size: 28px;
  color: var(--el-color-primary);
  margin-bottom: 12px;
}

.front-state__icon--loading {
  animation: loading-spin 1s linear infinite;
}

.front-state__title {
  margin: 0 0 8px;
  font-size: 18px;
  color: var(--text-color);
}

.front-state__description {
  margin: 0;
  color: var(--text-light-color);
  line-height: 1.7;
}

.front-state__skeleton {
  max-width: 420px;
  margin: 18px auto 0;
  text-align: left;
}

@keyframes loading-spin {
  from {
    transform: rotate(0deg);
  }

  to {
    transform: rotate(360deg);
  }
}
</style>
