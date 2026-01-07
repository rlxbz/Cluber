<template>
  <div class="activity-page">
    <div class="page-header">
      <h1>活动列表</h1>
      <el-button type="primary" @click="handleApplyActivity" class="apply-button">
        申请举办活动
      </el-button>
      <el-input
        v-model="searchKey"
        placeholder="搜索活动名称"
        prefix-icon="Search"
        class="search-input"
        @keyup.enter="handleSearch"
      />
    </div>

    <el-card class="activity-list-card">
      <template #header>
        <div class="header-actions">
          <span>共 {{ total }} 个活动</span>
          <el-select
            v-model="filterStatus"
            placeholder="状态筛选"
            size="small"
            @change="handleFilterChange"
            class="filterStatus"
          >
            <el-option label="全部活动" value="" />
            <el-option label="未开始" value="upcoming" />
            <el-option label="进行中" value="ongoing" />
            <el-option label="已结束" value="ended" />
          </el-select>
        </div>
      </template>

      <!-- 加载状态 -->
      <div v-if="isLoading" class="loading-container">
        <el-loading :visible="true" text="加载活动列表中..." />
      </div>

      <!-- 错误状态 -->
      <div v-else-if="error" class="error-message">
        <el-alert title="加载失败" :description="error" type="error" show-icon />
      </div>

      <!-- 空状态 -->
      <div v-else-if="activityList.length === 0" class="no-data">
        <el-empty description="暂无活动数据" />
      </div>

      <!-- 活动列表 -->
      <div v-else class="activity-list">
        <ActivityItem
          v-for="activity in activityList"
          :key="activity.id"
          :activity="activity"
          @click="handleActivityClick(activity.id)"
        />
      </div>

      <!-- 分页 -->
      <div v-if="total > 0" class="pagination-container">
        <el-pagination
          :current-page="currentPage"
          :page-size="pageSize"
          :total="total"
          :page-sizes="[10, 20, 30]"
          layout="total, sizes, prev, pager, next, jumper"
          @size-change="handlePageSizeChange"
          @current-change="handlePageChange"
        />
      </div>
    </el-card>
  </div>
</template>

<script setup>
import { ref, onMounted } from "vue";
import { useRouter } from "vue-router";
import ActivityItem from "./components/ActivityItem.vue";
import { getActivityListAPI } from "@/apis/activity";
import { ElLoading } from "element-plus";

// 路由实例
const router = useRouter();

// 页面状态
const activityList = ref([]);
const total = ref(0);
const isLoading = ref(false);
const error = ref(null);

// 筛选条件
const searchKey = ref("");
const filterStatus = ref("");
const currentPage = ref(1);
const pageSize = ref(10);

/**
 * 跳转到活动申请页
 */
const handleApplyActivity = () => {
  router.push("/apply?tab=activity");
};

/**
 * 获取活动列表数据
 */
const fetchActivityList = async () => {
  isLoading.value = true;
  error.value = null;
  try {
    const params = {
      page: currentPage.value,
      size: pageSize.value,
      keyword: searchKey.value,
      status: filterStatus.value,
    };

    const response = await getActivityListAPI(params);
    activityList.value = response.data?.list || [];
    total.value = response.data?.total || 0;
  } catch (err) {
    error.value = err.message || "获取活动列表失败，请重试";
    console.error("活动列表加载错误:", err);
  } finally {
    isLoading.value = false;
  }
};

/**
 * 搜索处理
 */
const handleSearch = () => {
  currentPage.value = 1;
  fetchActivityList();
};

/**
 * 筛选条件变化处理
 */
const handleFilterChange = () => {
  currentPage.value = 1;
  fetchActivityList();
};

/**
 * 分页大小变化处理
 */
const handlePageSizeChange = (size) => {
  pageSize.value = size;
  currentPage.value = 1;
  fetchActivityList();
};

/**
 * 页码变化处理
 */
const handlePageChange = (page) => {
  currentPage.value = page;
  fetchActivityList();
};

/**
 * 活动项点击跳转详情
 */
const handleActivityClick = (id) => {
  router.push(`/activity/${id}`);
};

// 页面加载时初始化数据
onMounted(() => {
  fetchActivityList();
});
</script>

<style scoped>
.activity-page {
  padding: 20px;
}

.page-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 20px;
}

.search-input {
  width: 300px;
}

.filterStatus {
  width: 200px;
  float: right;
}
.header-actions {
  display: flex;
  justify-content: space-between;
  align-items: center;
  width: 100%;
}

.loading-container {
  min-height: 300px;
  display: flex;
  align-items: center;
  justify-content: center;
}

.error-message {
  margin: 20px 0;
}

.no-data {
  padding: 50px 0;
  text-align: center;
}

.activity-list {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(300px, 1fr));
  gap: 20px;
  margin-top: 10px;
}

.pagination-container {
  margin-top: 20px;
  text-align: right;
}

/* 响应式适配 */
@media (max-width: 768px) {
  .page-header {
    flex-direction: column;
    align-items: flex-start;
    gap: 10px;
  }

  .search-input {
    width: 100%;
  }

  .activity-list {
    grid-template-columns: 1fr;
  }
}
</style>
