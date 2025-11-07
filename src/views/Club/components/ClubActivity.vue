<template>
  <div class="club-activity-container">
    <div class="activity-list">
      <activity-item
        v-for="activity in activityList"
        :key="activity.id"
        :activity="activity"
        @click="handleActivityClick(activity.id)"
      />
    </div>

    <div v-if="activityList.length === 0" class="no-activity">
      <el-empty description="该社团暂无活动" />
    </div>

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
import { useRoute } from "vue-router";
import { useActivityStore } from "@/stores/activityStore";
import ActivityItem from "@/views/Activity/components/ActivityItem.vue";
import { ElMessage } from "element-plus";

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

// 路由实例
const route = useRoute();

// 获取社团活动列表
const getClubActivities = async () => {
  try {
    const params = {
      clubId: props.clubId,
      page: currentPage.value,
      size: pageSize.value,
    };
    const res = await activityStore.getClubActivityList(params);
    activityList.value = res.list;
    total.value = res.total;
  } catch (error) {
    console.error("获取社团活动失败:", error);
    ElMessage.error("加载活动列表失败，请重试");
  }
};

// 监听页面变化
const handlePageChange = (page) => {
  currentPage.value = page;
};

// 活动项点击事件
const handleActivityClick = (id) => {
  route.push(`/activity/${id}`);
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

.activity-list {
  display: flex;
  flex-direction: column;
  gap: 15px;
}

.no-activity {
  padding: 40px 0;
  text-align: center;
}

.activity-pagination {
  margin-top: 20px;
  text-align: right;
}
</style>
