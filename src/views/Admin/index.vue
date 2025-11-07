<template>
  <div class="system-setting-page">
    <el-page-header @back="handleBack" content="系统设置" />
    <SystemSettingComponent class="setting-content" />
  </div>
</template>

<script setup>
import { useRouter } from "vue-router";
import SystemSettingComponent from "./components/SystemSetting.vue";

const router = useRouter();

// 返回上一页
const handleBack = () => {
  router.back();
};
</script>

<style scoped>
.system-setting-page {
  padding: 20px;
}

.setting-content {
  margin-top: 20px;
}
</style>
