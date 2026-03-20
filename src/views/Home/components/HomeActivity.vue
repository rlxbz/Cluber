<!-- src/views/Home/components/HomeActivity.vue -->
<template>
  <div class="home-activity">
    <div class="section-title">
      <h2>热门活动</h2>
      <el-button type="text" @click="$router.push('/activity')">查看全部</el-button>
    </div>

    <FrontLoadingState
      v-if="activityStore.isLoading"
      compact
      title="热门活动加载中"
      description="正在挑选近期值得关注的活动。"
    />

    <FrontErrorState
      v-else-if="activityError"
      compact
      :description="activityError"
      @retry="loadHotActivities"
    />

    <FrontEmptyState
      v-else-if="activityStore.hotActivities.length === 0"
      compact
      title="暂时还没有热门活动"
      description="你可以先去活动页看看有没有新内容。"
      action-text="查看活动广场"
      @action="router.push('/activity')"
    />

    <ActivityList
      v-else
      :activities="activityStore.hotActivities"
      variant="compact"
      :show-sign-up-status="false"
      @item-click="handleActivityClick"
    />
  </div>
</template>

<script setup lang="ts">
import { onMounted, ref } from "vue";
import { useActivityStore } from "@/stores/activityStore";
import { useRouter } from "vue-router";
import ActivityList from "@/views/Activity/components/ActivityList.vue";
import FrontLoadingState from "@/components/business/FrontLoadingState.vue";
import FrontEmptyState from "@/components/business/FrontEmptyState.vue";
import FrontErrorState from "@/components/business/FrontErrorState.vue";
import { getErrorMessage } from "@/utils/frontBusiness";

const activityStore = useActivityStore();
const router = useRouter();
const activityError = ref("");

const handleActivityClick = (activityId: number | string) => {
  router.push(`/activity/${activityId}`);
};

const loadHotActivities = async () => {
  try {
    activityError.value = "";
    await activityStore.getHotActivity();
  } catch (error) {
    activityError.value = getErrorMessage(error, "获取热门活动失败");
  }
};

onMounted(loadHotActivities);
</script>

<style scoped>
.home-activity {
  margin-top: 20px;
  padding: 15px;
  background-color: #fff;
  border-radius: 4px;
}

.section-title {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 15px;
  padding-bottom: 10px;
  border-bottom: 1px solid var(--el-border-color);
}

.section-title h2 {
  font-size: 18px;
  color: var(--el-text-color-primary);
  margin: 0;
}

.no-data {
  text-align: center;
  padding: 50px 0;
  color: var(--el-text-color-secondary);
}
</style>
