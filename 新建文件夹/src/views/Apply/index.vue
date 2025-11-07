<template>
  <div class="apply-container">
    <!-- 页头与返回按钮 -->
    <el-page-header @back="handleBack" content="申请管理" />

    <!-- 选项卡切换不同申请类型 -->
    <el-tabs v-model="activeTab" class="mt-20">
      <el-tab-pane label="创建社团申请" name="create" />
      <el-tab-pane label="加入社团申请" name="join" />
      <el-tab-pane label="活动举办申请" name="activity" />
    </el-tabs>

    <!-- 选项卡内容区域 -->
    <div class="tab-content mt-20">
      <ApplyCreate v-if="activeTab === 'create'" />
      <ApplyJoin v-else-if="activeTab === 'join'" />
      <ApplyActivity v-else-if="activeTab === 'activity'" />
    </div>
  </div>
</template>

<script setup>
import { ref } from "vue";
import { useRouter } from "vue-router";
// 导入子组件
import ApplyCreate from "./components/ApplyCreate.vue";
import ApplyJoin from "./components/ApplyJoin.vue";
import ApplyActivity from "./components/ApplyActivity.vue";
import { ElPageHeader, ElTabs, ElTabPane } from "element-plus";

// 激活的选项卡（默认显示创建社团申请）
const activeTab = ref("create");
const router = useRouter();

/**
 * 返回上一页
 */
const handleBack = () => {
  router.back();
};
</script>

<style scoped>
.apply-container {
  padding: 20px;
}

.tab-content {
  background-color: #fff;
  padding: 20px;
  border-radius: 4px;
  min-height: 400px;
}

.empty-text {
  text-align: center;
  padding: 50px 0;
  color: var(--el-text-color-secondary);
}
</style>
