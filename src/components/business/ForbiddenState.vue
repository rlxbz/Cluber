<template>
  <div class="forbidden-page">
    <div class="forbidden-card">
      <p class="forbidden-code">403</p>
      <h1 class="forbidden-title">{{ title }}</h1>
      <p class="forbidden-description">{{ description }}</p>
      <div class="forbidden-actions">
        <el-button type="primary" @click="$emit('go-home')">{{ homeText }}</el-button>
        <el-button @click="$emit('go-back')">{{ backText }}</el-button>
      </div>
    </div>
  </div>
</template>

<script setup>
defineProps({
  title: {
    type: String,
    default: "这个页面暂时不对当前账号开放",
  },
  description: {
    type: String,
    default: "你可以先返回首页，或者回到刚才的页面继续浏览其他内容。",
  },
  homeText: {
    type: String,
    default: "返回首页",
  },
  backText: {
    type: String,
    default: "返回上一页",
  },
});

defineEmits(["go-home", "go-back"]);
</script>

<style scoped>
.forbidden-page {
  min-height: calc(100vh - 120px);
  display: flex;
  align-items: center;
  justify-content: center;
  padding: 32px 20px;
  background:
    radial-gradient(circle at top left, rgba(64, 158, 255, 0.14), transparent 32%),
    linear-gradient(180deg, #f7fbff 0%, #fffaf5 100%);
}

.forbidden-card {
  width: min(560px, 100%);
  padding: 40px 32px;
  border-radius: 20px;
  background: rgba(255, 255, 255, 0.92);
  box-shadow: 0 18px 48px rgba(31, 41, 55, 0.08);
  text-align: center;
}

.forbidden-code {
  margin: 0 0 10px;
  font-size: 52px;
  font-weight: 700;
  letter-spacing: 4px;
  color: var(--el-color-primary);
}

.forbidden-title {
  margin: 0 0 12px;
  font-size: 28px;
  color: var(--text-color);
}

.forbidden-description {
  margin: 0 auto;
  max-width: 420px;
  line-height: 1.8;
  color: var(--text-light-color);
}

.forbidden-actions {
  display: flex;
  justify-content: center;
  gap: 12px;
  margin-top: 24px;
  flex-wrap: wrap;
}
</style>
