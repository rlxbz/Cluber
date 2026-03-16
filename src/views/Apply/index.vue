<template>
  <div class="apply-container">
    <!-- 页头与返回按钮 -->
    <el-page-header @back="handleBack" content="申请中心" />

    <!-- 选项卡切换不同申请类型 -->
    <el-tabs v-model="activeTab" class="mt-20">
      <el-tab-pane
        v-for="tab in visibleTabs"
        :key="tab.name"
        :label="tab.label"
        :name="tab.name"
      />
    </el-tabs>

    <!-- 选项卡内容区域 -->
    <div class="tab-content mt-20">
      <ApplyCreate v-if="activeTab === 'create'" />
      <ApplyActivity v-else-if="activeTab === 'activity'" />
    </div>
  </div>
</template>

<script setup>
import { computed, ref, watch } from "vue";
import { useRoute, useRouter } from "vue-router";
import { useUserStore } from "@/stores/userStore";
// 导入子组件
import ApplyCreate from "./components/ApplyCreate.vue";
import ApplyActivity from "./components/ApplyActivity.vue";
import { ElPageHeader, ElTabs, ElTabPane } from "element-plus";

const route = useRoute();
const activeTab = ref("create");
const router = useRouter();
const userStore = useUserStore();

const visibleTabs = computed(() => {
  if (userStore.role === "club_admin") {
    return [{ name: "activity", label: "活动申请" }];
  }

  return [{ name: "create", label: "创建社团申请" }];
});

const syncActiveTab = () => {
  const tabNames = visibleTabs.value.map((tab) => tab.name);
  const preferredTab = route.query.tab;
  activeTab.value =
    typeof preferredTab === "string" && tabNames.includes(preferredTab)
      ? preferredTab
      : visibleTabs.value[0]?.name || "create";
};

watch([visibleTabs, () => route.query.tab], syncActiveTab, { immediate: true });

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
