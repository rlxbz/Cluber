<template>
  <div class="notice-page">
    <div class="page-header">
      <h2>公告管理</h2>
    </div>

    <el-card class="page-content">
      <!-- 搜索区域 -->
      <div class="search-bar mb-20">
        <el-input
          v-model="searchKey"
          placeholder="请输入公告标题搜索"
          class="search-input"
          @keyup.enter="handleSearch"
        >
          <template #append>
            <el-button type="primary" @click="handleSearch">搜索</el-button>
          </template>
        </el-input>
      </div>

      <!-- 加载状态 -->
      <div v-if="noticeStore.noticeLoading" class="loading-container">
        <el-loading-spinner />
      </div>

      <!-- 错误提示 -->
      <div v-else-if="errorMessage" class="error-message">
        <el-alert title="加载失败" :description="errorMessage" type="error" show-icon />
      </div>

      <!-- 空状态 -->
      <div v-else-if="noticeStore.noticeList.length === 0" class="no-data">
        <el-empty description="暂无公告数据" />
      </div>

      <!-- 公告列表 -->
      <div v-else class="notice-list">
        <NoticeItem
          v-for="notice in noticeStore.noticeList"
          :key="notice.id"
          :notice="notice"
          @click="goToDetail(notice.id)"
        />
      </div>

      <!-- 分页控件 -->
      <div v-if="noticeStore.total > 0" class="pagination-container">
        <el-pagination
          :current-page="page"
          :page-size="size"
          :total="noticeStore.total"
          :page-sizes="[10, 20, 30]"
          layout="total, sizes, prev, pager, next, jumper"
          @size-change="handleSizeChange"
          @current-change="handlePageChange"
        />
      </div>
    </el-card>
  </div>
</template>

<script setup>
import { ref, onMounted } from "vue";
import { useNoticeStore } from "@/stores/noticeStore";
import NoticeItem from "./components/NoticeItem.vue";
import { useRouter } from "vue-router";

// 状态管理
const noticeStore = useNoticeStore();
const router = useRouter();
const errorMessage = ref("");

// 分页参数
const page = ref(1);
const size = ref(10);
const searchKey = ref("");

/**
 * 加载公告列表数据
 */
const loadNoticeList = async () => {
  try {
    const params = {
      page: page.value,
      size: size.value,
      keyword: searchKey.value,
    };
    await noticeStore.getNoticeList(params);
  } catch (err) {
    errorMessage.value = "获取公告列表失败，请重试";
    console.error("公告列表加载失败:", err);
  }
};

/**
 * 搜索处理
 */
const handleSearch = () => {
  page.value = 1; // 重置页码
  loadNoticeList();
};

/**
 * 分页大小变更
 * @param {number} newSize - 新的每页条数
 */
const handleSizeChange = (newSize) => {
  size.value = newSize;
  page.value = 1;
  loadNoticeList();
};

/**
 * 页码变更
 * @param {number} newPage - 新页码
 */
const handlePageChange = (newPage) => {
  page.value = newPage;
  loadNoticeList();
};

/**
 * 跳转至公告详情页
 * @param {number} id - 公告ID
 */
const goToDetail = (id) => {
  router.push(`/notice/${id}`);
};

// 页面初始化加载
onMounted(loadNoticeList);
</script>

<style scoped>
.notice-page {
  padding: 20px;
}
.page-header {
  margin-bottom: 20px;
}
.search-bar {
  display: flex;
  gap: 10px;
}
.search-input {
  width: 300px;
}
.loading-container {
  text-align: center;
  padding: 50px 0;
}
.error-message {
  margin: 20px 0;
}
.no-data {
  padding: 50px 0;
  text-align: center;
}
.notice-list {
  margin: 10px 0;
}
.pagination-container {
  margin-top: 20px;
  text-align: right;
}
</style>
