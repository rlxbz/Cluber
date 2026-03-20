<template>
  <div class="activity-page">
    <div class="page-header">
      <div>
        <h1>活动列表</h1>
        <p class="page-desc">看看近期社团活动，按兴趣筛选后再决定报名。</p>
      </div>

      <el-button
        v-if="canManageClubActivities"
        type="primary"
        @click="handleApplyActivity"
        class="apply-button"
      >
        发布本社团活动
      </el-button>
    </div>

    <el-card class="activity-list-card">
      <template #header>
        <div class="header-actions">
          <span>共 {{ total }} 个活动</span>

          <ListFilterBar
            v-model:keyword="searchKey"
            v-model:filters="filters"
            :filter-items="activityFilterItems"
            placeholder="搜索活动名称或主办方"
            action-text="查找活动"
            @search="handleSearch"
          />
        </div>
      </template>

      <FrontLoadingState
        v-if="isLoading"
        title="活动加载中"
        description="正在为你整理近期可以参加的活动。"
      />

      <FrontErrorState
        v-else-if="error"
        :description="error"
        @retry="fetchActivityList"
      />

      <FrontEmptyState
        v-else-if="activityList.length === 0"
        title="还没有找到活动"
        description="换个关键词或筛选条件试试，也可以稍后再来看看。"
        action-text="重新加载"
        @action="fetchActivityList"
      />

      <ActivityList v-else :activities="activityList" @item-click="handleActivityClick" />

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
import { computed, ref, onMounted } from "vue";
import { useRouter } from "vue-router";
import { getActivityListAPI } from "@/apis/activity";
import { useUserStore } from "@/stores/userStore";
import ListFilterBar from "@/components/business/ListFilterBar.vue";
import FrontLoadingState from "@/components/business/FrontLoadingState.vue";
import FrontEmptyState from "@/components/business/FrontEmptyState.vue";
import FrontErrorState from "@/components/business/FrontErrorState.vue";
import ActivityList from "./components/ActivityList.vue";
import { getErrorMessage } from "@/utils/frontBusiness";

const router = useRouter();
const userStore = useUserStore();

const activityList = ref([]);
const total = ref(0);
const isLoading = ref(false);
const error = ref(null);

const searchKey = ref("");
const filters = ref({
  status: "",
});
const currentPage = ref(1);
const pageSize = ref(10);
const canManageClubActivities = computed(() =>
  userStore.frontPermissions.canPublishClubActivity
);
const activityFilterItems = [
  {
    key: "status",
    placeholder: "活动状态",
    options: [
      { label: "全部活动", value: "" },
      { label: "未开始", value: "upcoming" },
      { label: "进行中", value: "ongoing" },
      { label: "已结束", value: "ended" },
    ],
  },
];

const handleApplyActivity = () => {
  router.push("/apply?tab=activity");
};

const fetchActivityList = async () => {
  isLoading.value = true;
  error.value = null;
  try {
    const params = {
      page: currentPage.value,
      size: pageSize.value,
      keyword: searchKey.value,
      status: filters.value.status,
    };

    const response = await getActivityListAPI(params);
    activityList.value = response.data?.list || [];
    total.value = response.data?.total || 0;
  } catch (err) {
    error.value = getErrorMessage(err, "获取活动列表失败，请重试");
    console.error("活动列表加载错误:", err);
  } finally {
    isLoading.value = false;
  }
};

const handleSearch = () => {
  currentPage.value = 1;
  fetchActivityList();
};

const handlePageSizeChange = (size) => {
  pageSize.value = size;
  currentPage.value = 1;
  fetchActivityList();
};

const handlePageChange = (page) => {
  currentPage.value = page;
  fetchActivityList();
};

const handleActivityClick = (id) => {
  router.push(`/activity/${id}`);
};

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
  align-items: flex-start;
  margin-bottom: 20px;
  gap: 16px;
}

.page-header h1 {
  margin: 0 0 6px;
}

.page-desc {
  margin: 0;
  color: var(--text-light-color);
}

.header-actions {
  display: flex;
  justify-content: space-between;
  align-items: flex-start;
  width: 100%;
  gap: 16px;
  flex-wrap: wrap;
}

.error-message {
  margin: 20px 0;
}

.pagination-container {
  margin-top: 20px;
  text-align: right;
}

/* 响应式适配 */
@media (max-width: 768px) {
  .page-header {
    flex-direction: column;
  }

  .header-actions {
    flex-direction: column;
    align-items: stretch;
  }
}
</style>
