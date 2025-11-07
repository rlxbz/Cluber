<template>
  <!-- 保持原有UI不变 -->
  <el-card class="system-setting-card">
    <div slot="header">
      <h2 class="setting-title">个性化设置</h2>
    </div>

    <div class="setting-section">
      <h3 class="section-title">颜色主题</h3>
      <div class="theme-colors">
        <div
          v-for="(theme, index) in themeList"
          :key="index"
          class="color-option"
          :style="{ backgroundColor: theme.color }"
          @click="handleThemeChange(theme.value)"
          :class="{ active: settingStore.settings.theme === theme.value }"
        ></div>
      </div>
    </div>

    <div class="setting-section">
      <h3 class="section-title">字体大小</h3>
      <el-slider
        v-model="settingStore.settings.fontSize"
        :min="12"
        :max="18"
        :step="1"
        @change="handleFontSizeChange"
      >
        <template #tooltip="scope"> {{ scope.value }}px </template>
      </el-slider>
      <p class="setting-desc">当前大小: {{ settingStore.settings.fontSize }}px</p>
    </div>

    <div class="setting-section">
      <h3 class="section-title">字体类型</h3>
      <el-select
        v-model="settingStore.settings.fontFamily"
        placeholder="选择字体"
        @change="handleFontFamilyChange"
      >
        <el-option
          v-for="(font, index) in fontList"
          :key="index"
          :label="font.label"
          :value="font.value"
        ></el-option>
      </el-select>
    </div>

    <div class="setting-actions">
      <el-button type="primary" @click="settingStore.saveSettings"> 保存设置 </el-button>
      <el-button
        type="default"
        @click="settingStore.resetToDefault"
        style="margin-left: 10px"
      >
        恢复默认
      </el-button>
    </div>
  </el-card>
</template>

<script setup>
import { onMounted } from "vue";
import { useSettingStore } from "@/stores/settingStore";
import { ElMessage } from "element-plus";

// 主题配置
const themeList = [
  { value: "default", label: "默认主题", color: "#409eff" },
  { value: "dark", label: "深色主题", color: "#242424" },
  { value: "green", label: "绿色主题", color: "#67c23a" },
  { value: "red", label: "红色主题", color: "#f56c6c" },
];

// 字体配置
const fontList = [
  { label: "系统默认", value: "system-ui, Avenir, Helvetica, Arial, sans-serif" },
  { label: "微软雅黑", value: '"Microsoft YaHei", sans-serif' },
  { label: "宋体", value: '"SimSun", serif' },
  { label: "黑体", value: '"SimHei", sans-serif' },
];

const settingStore = useSettingStore();

// 初始化设置
onMounted(() => {
  settingStore.initSettings();
});

// 主题切换
const handleThemeChange = (theme) => {
  settingStore.updateSetting("theme", theme);
  ElMessage.success("主题已更新");
};

// 字体大小修改
const handleFontSizeChange = (size) => {
  settingStore.updateSetting("fontSize", size);
  ElMessage.success("字体大小已更新");
};

// 字体类型修改
const handleFontFamilyChange = (family) => {
  settingStore.updateSetting("fontFamily", family);
  ElMessage.success("字体类型已更新");
};
</script>

<style scoped>
.system-setting-card {
  max-width: 800px;
  margin: 20px auto;
  padding: 20px;
}

.setting-title {
  margin: 0;
  font-size: 18px;
  font-weight: 500;
}

.setting-section {
  margin-bottom: 30px;
  padding-bottom: 20px;
  border-bottom: 1px solid var(--border-color);
}

.setting-section:last-child {
  border-bottom: none;
}

.section-title {
  margin-bottom: 15px;
  font-size: 16px;
  color: var(--text-color);
}

.theme-colors {
  display: flex;
  gap: 15px;
  margin-bottom: 10px;
}

.color-option {
  width: 30px;
  height: 30px;
  border-radius: 50%;
  cursor: pointer;
  transition: transform 0.2s;
  border: 2px solid transparent;
}

.color-option.active {
  transform: scale(1.2);
  border-color: #646cff;
}

.setting-desc {
  margin-top: 10px;
  color: var(--text-light-color);
  font-size: 14px;
}

.setting-actions {
  display: flex;
  justify-content: flex-end;
  margin-top: 20px;
}
</style>
