<template>
  <div class="apply-container">
    <el-page-header @back="handleBack" content="申请服务" />

    <el-tabs v-model="activeTab" class="mt-20">
      <el-tab-pane
        v-for="tab in visibleTabs"
        :key="tab.name"
        :label="tab.label"
        :name="tab.name"
      />
    </el-tabs>

    <div class="tab-content mt-20">
      <ApplyActivity v-if="activeTab === 'activity'" />
      <ApplyJoin v-else-if="activeTab === 'join'" />
      <MemberApply v-else />
    </div>
  </div>
</template>

<script setup>
import { computed, ref, watch } from "vue";
import { useRoute, useRouter } from "vue-router";
import { useUserStore } from "@/stores/userStore";
import ApplyActivity from "./components/ApplyActivity.vue";
import ApplyJoin from "./components/ApplyJoin.vue";
import MemberApply from "@/views/Member/components/MemberApply.vue";
import { ElPageHeader, ElTabs, ElTabPane } from "element-plus";

const route = useRoute();
const router = useRouter();
const userStore = useUserStore();
const activeTab = ref("records");

const visibleTabs = computed(() => {
  const tabs = [{ name: "records", label: "我的申请记录" }];

  if (userStore.isClubAdmin) {
    tabs.unshift(
      { name: "activity", label: "本社团活动发布" },
      { name: "join", label: "本社团申请处理" }
    );
  }

  return tabs;
});

const syncActiveTab = () => {
  const tabNames = visibleTabs.value.map((tab) => tab.name);
  const preferredTab = route.query.tab;
  activeTab.value =
    typeof preferredTab === "string" && tabNames.includes(preferredTab)
      ? preferredTab
      : visibleTabs.value[0]?.name || "records";
};

watch([visibleTabs, () => route.query.tab], syncActiveTab, { immediate: true });

watch(activeTab, (tab) => {
  if (route.query.tab === tab) {
    return;
  }

  router.replace({
    path: "/apply",
    query: tab === "records" ? {} : { tab },
  });
});

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
</style>
