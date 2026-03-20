<template>
  <div class="front-state" :class="{ 'front-state--compact': compact }">
    <el-icon class="front-state__icon"><Box /></el-icon>
    <h3 class="front-state__title">{{ title }}</h3>
    <p class="front-state__description">{{ description }}</p>
    <el-button v-if="actionText" type="primary" plain @click="$emit('action')">
      {{ actionText }}
    </el-button>
  </div>
</template>

<script setup>
import { Box } from "@element-plus/icons-vue";

defineProps({
  title: {
    type: String,
    default: "暂时还没有内容",
  },
  description: {
    type: String,
    default: "你可以稍后再来看看，或者换个筛选条件试试。",
  },
  actionText: {
    type: String,
    default: "",
  },
  compact: {
    type: Boolean,
    default: false,
  },
});

defineEmits(["action"]);
</script>

<style scoped>
.front-state {
  padding: 32px 24px;
  border: 1px dashed var(--border-color);
  border-radius: 12px;
  background: #fff;
  text-align: center;
}

.front-state--compact {
  padding: 20px 16px;
}

.front-state__icon {
  font-size: 30px;
  color: var(--el-color-info);
  margin-bottom: 12px;
}

.front-state__title {
  margin: 0 0 8px;
  font-size: 18px;
  color: var(--text-color);
}

.front-state__description {
  margin: 0 0 16px;
  color: var(--text-light-color);
  line-height: 1.7;
}
</style>
