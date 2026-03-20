<template>
  <div class="notice-detail">
    <el-page-header
      @back="handleBack"
      :content="`动态详情-${pushStore.currentPush?.id || '未知'}`"
    ></el-page-header>

    <el-card class="detail-card">
      <FrontLoadingState
        v-if="pushStore.loading"
        compact
        title="动态详情加载中"
        description="正在整理这条社团动态。"
      />

      <FrontErrorState
        v-else-if="detailError"
        compact
        :description="detailError"
        @retry="loadPushDetail"
      />

      <div v-else-if="pushStore.currentPush" class="detail-content">
        <h1 class="title">{{ pushStore.currentPush.title }}</h1>
        <div class="time">{{ formatTime(pushStore.currentPush.createTime) }}</div>
        <div class="content">{{ pushStore.currentPush.content }}</div>
      </div>

      <FrontEmptyState
        v-else
        compact
        title="这条动态暂时无法查看"
        description="动态可能已下线，或者链接已经失效。"
        action-text="返回动态列表"
        @action="router.push('/push')"
      />
    </el-card>
  </div>
</template>

<script setup>
import { usePushStore } from "@/stores/pushStore";
import { computed, watch } from "vue";
import dayjs from "dayjs";
import { useRoute, useRouter } from "vue-router";
import { ElMessage } from "element-plus";
import FrontLoadingState from "@/components/business/FrontLoadingState.vue";
import FrontEmptyState from "@/components/business/FrontEmptyState.vue";
import FrontErrorState from "@/components/business/FrontErrorState.vue";

const pushStore = usePushStore();
const route = useRoute();
const router = useRouter();
const detailError = computed(() => pushStore.error || "");

// 格式化时间
const formatTime = (time) => {
  return dayjs(time).format("YYYY-MM-DD HH:mm:ss");
};

// 返回上一页
const handleBack = () => {
  router.back();
};

const loadPushDetail = () => {
  const { id } = route.params;
  if (!id || isNaN(Number(id))) {
    pushStore.currentPush = null;
    pushStore.error = "动态编号无效，请返回动态列表重新选择。";
    ElMessage.warning("动态编号无效");
    return;
  }
  pushStore.error = "";
  pushStore.getPushDetail(id);
};

watch(() => route.params.id, loadPushDetail, { immediate: true });
</script>

<style scoped>
.notice-detail {
  padding: 20px;
}

.detail-card {
  margin: 20px 0;
  padding: 30px;
}

.title {
  font-size: 20px;
  text-align: center;
  margin-bottom: 20px;
  color: var(--text-color); /* 替换#333 */
}

.time {
  text-align: center;
  color: var(--text-light-color); /* 替换#666 */
  margin-bottom: 30px;
  font-size: 14px;
}

.content {
  line-height: 1.8;
  color: var(--text-light-color); /* 替换#666 */
  white-space: pre-wrap; /* 保留换行和空格 */
}
</style>
