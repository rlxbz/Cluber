<template>
  <div class="notice-detail">
    <el-page-header
      @back="handleBack"
      :content="`公告详情-${noticeStore.currentNotice?.id || '未知'}`"
    ></el-page-header>

    <el-card class="detail-card">
      <FrontLoadingState
        v-if="noticeStore.noticeLoading"
        compact
        title="公告详情加载中"
        description="正在整理这条公告内容。"
      />

      <FrontErrorState
        v-else-if="detailError"
        compact
        :description="detailError"
        @retry="loadNoticeDetail"
      />

      <div v-else-if="noticeStore.currentNotice" class="detail-content">
        <h1 class="title">{{ noticeStore.currentNotice.title }}</h1>
        <div class="time">{{ formatTime(noticeStore.currentNotice.createTime) }}</div>
        <div class="content">{{ noticeStore.currentNotice.content }}</div>
      </div>

      <FrontEmptyState
        v-else
        compact
        title="这条公告暂时无法查看"
        description="公告可能已被撤下，或者链接已经失效。"
        action-text="返回公告列表"
        @action="router.push('/notice')"
      />
    </el-card>
  </div>
</template>

<script setup>
import { useNoticeStore } from "@/stores/noticeStore";
import { computed, watch } from "vue";
import dayjs from "dayjs";
import { useRoute, useRouter } from "vue-router";
import { ElMessage } from "element-plus";
import FrontLoadingState from "@/components/business/FrontLoadingState.vue";
import FrontEmptyState from "@/components/business/FrontEmptyState.vue";
import FrontErrorState from "@/components/business/FrontErrorState.vue";

const noticeStore = useNoticeStore();
const route = useRoute();
const router = useRouter();
const detailError = computed(() => noticeStore.error || "");

// 格式化时间
const formatTime = (time) => {
  return dayjs(time).format("YYYY-MM-DD HH:mm:ss");
};

// 返回上一页
const handleBack = () => {
  router.back();
};

const loadNoticeDetail = () => {
  const { id } = route.params; // 从路由参数中获取公告ID
  if (!id || isNaN(Number(id))) {
    noticeStore.clearCurrentNotice();
    noticeStore.error = "公告编号无效，请返回公告列表重新选择。";
    ElMessage.warning("公告编号无效");
    return;
  }
  noticeStore.error = "";
  noticeStore.getNoticeDetail(id);
};

watch(() => route.params.id, loadNoticeDetail, { immediate: true });
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
  color: #333;
}

.time {
  text-align: center;
  color: #999;
  margin-bottom: 30px;
  font-size: 14px;
}

.content {
  line-height: 1.8;
  color: #666;
  white-space: pre-wrap; /* 保留换行和空格 */
}
</style>
