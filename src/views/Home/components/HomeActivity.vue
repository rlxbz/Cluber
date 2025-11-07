<!-- src/views/Home/components/HomeActivity.vue -->
<template>
  <div class="home-activity">
    <div class="section-title">
      <h2>热门活动</h2>
      <el-button type="text" @click="$router.push('/activities')">查看全部</el-button>
    </div>

    <el-skeleton
      :loading="activityStore.isLoading"
      row-count="3"
      :columns="1"
      :animated="true"
    >
      <div
        v-if="activityStore.hotActivities.length === 0 && !activityStore.isLoading"
        class="no-data"
      >
        暂无热门活动
      </div>
      <div class="activity-list" v-else>
        <el-card
          v-for="activity in activityStore.hotActivities"
          :key="activity.id"
          class="activity-item"
          @click="$router.push(`/activity/${activity.id}`)"
        >
          <div class="activity-header">
            <img
              :src="activity.coverImage"
              :alt="activity.title"
              class="activity-img"
              @error="handleImgError($event)"
            />
            <div class="activity-info">
              <h3 class="activity-title">{{ activity.title }}</h3>
              <p class="activity-organization">
                <span>主办方：{{ activity.organizer }}</span>
              </p>
              <p class="activity-date">
                <el-icon><Calendar /></el-icon>
                <span>{{ formatDate(activity.time) }}</span>
              </p>
            </div>
          </div>
          <div class="activity-content">
            <p>{{ activity.brief }}</p>
          </div>
          <div class="activity-footer">
            <span class="activity-location">
              <el-icon><Location /></el-icon>
              {{ activity.location }}
            </span>
            <span class="activity-participants">
              <el-icon><User /></el-icon>
              已有{{ activity.signUpCount }}人报名
            </span>
          </div>
        </el-card>
      </div>
    </el-skeleton>
  </div>
</template>

<script setup lang="ts">
import { onMounted } from "vue";
import { useActivityStore } from "@/stores/activityStore";
import { Calendar, Location, User } from "@element-plus/icons-vue";
import dayjs from "dayjs";
import { ElMessage } from "element-plus";

const activityStore = useActivityStore();

// 活动数据类型定义
interface Activity {
  id: number;
  title: string;
  coverImage: string;
  organizer: string;
  startTime: string;
  brief: string;
  location: string;
  participantCount: number;
}

// 处理图片加载失败
const handleImgError = (e: Event) => {
  const img = e.target as HTMLImageElement;
  img.src = "/images/default-activity.png"; // 使用项目默认图片
};

// 格式化日期
const formatDate = (date: string) => {
  return dayjs(date).format("YYYY-MM-DD HH:mm");
};

// 组件挂载时获取热门活动
onMounted(async () => {
  try {
    await activityStore.getHotActivity();
  } catch (error) {
    // 使用函数式调用显示错误信息
    ElMessage.error(error instanceof Error ? error.message : "获取活动失败");
  }
});
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

.activity-list {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(300px, 1fr));
  gap: 20px;
}

.activity-item {
  cursor: pointer;
  transition: transform 0.3s, box-shadow 0.3s;
}

.activity-item:hover {
  transform: translateY(-5px);
  box-shadow: 0 10px 20px rgba(0, 0, 0, 0.1);
}

.activity-header {
  display: flex;
  margin-bottom: 10px;
}

.activity-img {
  width: 100px;
  height: 100px;
  object-fit: cover;
  border-radius: 4px;
  margin-right: 10px;
}

.activity-info {
  flex: 1;
}

.activity-title {
  font-size: 16px;
  margin-bottom: 5px;
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
}

.activity-organization {
  font-size: 12px;
  color: var(--el-text-color-secondary);
  margin-bottom: 5px;
}

.activity-date {
  font-size: 12px;
  color: var(--el-text-color-secondary);
  display: flex;
  align-items: center;
}

.activity-date .el-icon {
  margin-right: 5px;
  font-size: 14px;
}

.activity-content {
  margin-bottom: 10px;
}

.activity-content p {
  display: -webkit-box;
  -webkit-box-orient: vertical;
  overflow: hidden;
  font-size: 13px;
  color: var(--el-text-color-secondary);
}

.activity-footer {
  display: flex;
  justify-content: space-between;
  font-size: 12px;
  color: var(--el-text-color-secondary);
  padding-top: 10px;
  border-top: 1px dashed var(--el-border-color);
}

.activity-location,
.activity-participants {
  display: flex;
  align-items: center;
}

.activity-footer .el-icon {
  margin-right: 3px;
  font-size: 14px;
}

.no-data {
  text-align: center;
  padding: 50px 0;
  color: var(--el-text-color-secondary);
}
</style>
