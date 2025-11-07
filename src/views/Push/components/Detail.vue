<template>
  <div class="notice-detail">
    <el-page-header
      @back="handleBack"
      :content="`公告详情-${noticeStore.currentNotice?.id}`"
    ></el-page-header>

    <el-card v-loading="noticeStore.noticeLoading" class="detail-card">
      <div v-if="noticeStore.currentNotice" class="detail-content">
        <h1 class="title">{{ noticeStore.currentNotice.title }}</h1>
        <div class="time">{{ formatTime(noticeStore.currentNotice.createTime) }}</div>
        <div class="content">{{ noticeStore.currentNotice.content }}</div>
      </div>

      <el-empty v-else description="暂无公告详情"></el-empty>
    </el-card>
  </div>
</template>

<script setup>
import { useNoticeStore } from "@/stores/noticeStore";
import { onMounted } from "vue";
import dayjs from "dayjs";
import { useRoute, useRouter } from "vue-router";

const noticeStore = useNoticeStore();
const route = useRoute();
const router = useRouter();

// 格式化时间
const formatTime = (time) => {
  return dayjs(time).format("YYYY-MM-DD HH:mm:ss");
};

// 返回上一页
const handleBack = () => {
  router.back();
};

// 页面挂载时加载详情
onMounted(() => {
  const { id } = route.params; // 从路由参数中获取公告ID
  if (id) {
    noticeStore.getNoticeDetail(id);
  }
});
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
