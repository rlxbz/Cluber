<template>
  <div class="home-notice">
    <div class="notice-title">最新公告</div>
    <el-card class="notice-list">
      <template #default>
        <FrontLoadingState
          v-if="noticeStore.noticeLoading"
          compact
          title="公告加载中"
          description="正在整理最新公告。"
        />
        <FrontErrorState
          v-else-if="noticeStore.error"
          compact
          :description="noticeStore.error"
          @retry="loadNoticeList"
        />
        <div v-else-if="noticeStore.noticeList.length > 0">
          <div
            class="notice-item"
            v-for="notice in noticeStore.noticeList"
            :key="notice.id"
            @click="handleNoticeClick(notice.id)"
          >
            <div class="notice-title">{{ notice.title }}</div>
            <div class="notice-time">{{ formatTime(notice.createTime) }}</div>
            <div class="notice-content">{{ notice.content }}</div>
          </div>
        </div>
        <FrontEmptyState
          v-else
          compact
          title="暂时还没有公告"
          description="当前没有新的公告通知。"
        />
      </template>
    </el-card>
    <el-pagination
      v-if="noticeStore.total > 5"
      :current-page="page"
      :page-size="5"
      :total="noticeStore.total"
      layout="prev, pager, next"
      @current-change="handlePageChange"
    />
  </div>
</template>

<script setup>
import { onMounted, ref } from "vue";
import { useNoticeStore } from "@/stores/noticeStore";
import { useRouter } from "vue-router";
import FrontLoadingState from "@/components/business/FrontLoadingState.vue";
import FrontEmptyState from "@/components/business/FrontEmptyState.vue";
import FrontErrorState from "@/components/business/FrontErrorState.vue";

const noticeStore = useNoticeStore();
const router = useRouter();
const page = ref(1);

const loadNoticeList = () => {
  noticeStore.getNoticeList({ page: page.value, size: 5 });
};

// 分页切换
const handlePageChange = (val) => {
  page.value = val;
  loadNoticeList();
};

// 点击公告跳转详情页
const handleNoticeClick = (id) => {
  router.push(`/notice/${id}`);
};

// 时间格式化工具函数
const formatTime = (time) => {
  if (!time) return "";
  const date = new Date(time);
  return `${date.getFullYear()}-${(date.getMonth() + 1)
    .toString()
    .padStart(2, "0")}-${date.getDate().toString().padStart(2, "0")}`;
};

onMounted(loadNoticeList);
</script>

<style scoped>
.home-notice {
  margin-bottom: 20px;
}

.notice-title {
  font-size: 18px;
  font-weight: bold;
  margin-bottom: 10px;
  color: #333;
}

.notice-list {
  min-height: 300px;
}

.notice-item {
  padding: 15px 0;
  border-bottom: 1px dashed #eee;
  cursor: pointer;
  transition: background-color 0.2s;
}

.notice-item:hover {
  background-color: #f5f7fa;
}

.notice-item .notice-title {
  font-size: 16px;
  margin-bottom: 5px;
  color: #1890ff;
}

.notice-item .notice-time {
  font-size: 12px;
  color: #999;
  margin-bottom: 5px;
}

.notice-item .notice-content {
  font-size: 14px;
  color: #666;
  display: -webkit-box;
  -webkit-box-orient: vertical;
  overflow: hidden;
}

.empty-notice {
  text-align: center;
  padding: 50px 0;
  color: #999;
}
</style>
