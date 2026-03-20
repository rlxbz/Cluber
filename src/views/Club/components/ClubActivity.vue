<template>
  <div class="club-activity-container">
    <FrontLoadingState
      v-if="loading"
      compact
      title="活动加载中"
      description="正在查看这个社团最近的活动安排。"
    />

    <FrontErrorState
      v-else-if="error"
      compact
      :description="error"
      @retry="getClubActivities"
    />

    <FrontEmptyState
      v-else-if="activityList.length === 0"
      compact
      title="这个社团暂时还没有活动"
      description="之后再来看看，也许很快就会有新的活动发布。"
    />

    <ActivityList v-else :activities="activityList" layout="list" @item-click="handleActivityClick" />

    <el-pagination
      v-if="total > 0"
      class="activity-pagination"
      :current-page="currentPage"
      :page-size="pageSize"
      :total="total"
      :pager-count="5"
      layout="prev, pager, next"
      @current-change="handlePageChange"
    />
  </div>
</template>

<script setup>
import { ref, onMounted, watch } from "vue";
import { useRouter } from "vue-router";
import { useActivityStore } from "@/stores/activityStore";
import ActivityList from "@/views/Activity/components/ActivityList.vue";
import FrontLoadingState from "@/components/business/FrontLoadingState.vue";
import FrontEmptyState from "@/components/business/FrontEmptyState.vue";
import FrontErrorState from "@/components/business/FrontErrorState.vue";
import { getErrorMessage } from "@/utils/frontBusiness";

// 接收父组件传入的社团ID
const props = defineProps({
  clubId: {
    type: Number,
    required: true,
    validator: (value) => !isNaN(value), // 确保是有效数字
  },
});

// 状态管理
const activityStore = useActivityStore();

// 分页参数
const currentPage = ref(1);
const pageSize = ref(5);
const total = ref(0);
const activityList = ref([]);
const loading = ref(false);
const error = ref("");

// 路由实例
const router = useRouter();

// 获取社团活动列表
const getClubActivities = async () => {
  loading.value = true;
  error.value = "";
  try {
    const params = {
      clubId: props.clubId,
      page: currentPage.value,
      size: pageSize.value,
    };
    const res = await activityStore.getClubActivityList(params);
    activityList.value = res.list || [];
    total.value = res.total || 0;
  } catch (err) {
    console.error("获取社团活动失败:", err);
    error.value = getErrorMessage(err, "加载活动列表失败，请重试");
    activityList.value = [];
    total.value = 0;
  } finally {
    loading.value = false;
  }
};

// 监听页面变化
const handlePageChange = (page) => {
  currentPage.value = page;
};

// 活动项点击事件
const handleActivityClick = (id) => {
  router.push(`/activity/${id}`);
};

// 初始化
onMounted(() => {
  getClubActivities();
});
// 监听社团ID变化，重新加载数据
watch(
  () => props.clubId,
  () => {
    currentPage.value = 1; // 确保切换社团时重置为第1页
    pageSize.value = 5;
    getClubActivities();
  }
);

// 监听页码变化，重新加载数据
watch(() => currentPage.value, getClubActivities);
</script>

<style scoped>
.club-activity-container {
  background-color: #fff;
  border-radius: 4px;
  padding: 20px;
  margin-top: 20px;
}

.activity-pagination {
  margin-top: 20px;
  text-align: right;
}
</style>
