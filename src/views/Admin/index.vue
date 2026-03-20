<template>
  <div class="preferences-page">
    <el-page-header @back="handleBack" content="界面偏好" />
    <PreferenceSettingsPanel class="setting-content" />
  </div>
</template>

<script setup>
import { useRouter } from "vue-router";
import PreferenceSettingsPanel from "./components/SystemSetting.vue";

const router = useRouter();

// 返回上一页
const handleBack = () => {
  router.back();
};
</script>

<style scoped>
.preferences-page {
  padding: 20px;
}

.setting-content {
  margin-top: 20px;
}
</style>
