<template>
  <el-card class="activity-item" @click="handleClick">
    <div class="activity-header">
      <img
        v-if="activity.coverImage"
        :src="activity.coverImage"
        alt="活动封面"
        class="activity-img"
      />
      <div class="activity-info">
        <h3 class="activity-title">{{ activity.title }}</h3>
        <p class="activity-club">
          <el-icon><School /></el-icon>
          {{ activity.clubName }}
        </p>
        <p class="activity-date">
          <el-icon><Clock /></el-icon>
          {{ activity.time }}
        </p>
      </div>
    </div>

    <div class="activity-intro">
      {{ activity.intro }}
    </div>

    <div class="activity-footer">
      <div class="activity-location">
        <el-icon><Location /></el-icon>
        {{ activity.location }}
      </div>
      <div class="activity-participants">
        <el-icon><User /></el-icon>
        {{ activity.currentParticipants }}/{{ activity.maxParticipants }}
      </div>
    </div>
  </el-card>
</template>

<script setup>
import { Location, User } from "@element-plus/icons-vue";
import { School, Clock } from "@element-plus/icons-vue";

// 接收活动数据
const props = defineProps({
  activity: {
    type: Object,
    required: true,
    default: () => ({}),
  },
});

// 正确定义事件发射，不需要单独声明 emit 变量
const emits = defineEmits(["click"]);

// 点击事件 - 直接使用 emits 而不是 emit
const handleClick = () => {
  emits("click", props.activity.id);
};
</script>

<style scoped>
.activity-item {
  transition: all 0.3s;
  cursor: pointer;
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
  margin: 0 0 5px 0;
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
}

.activity-intro {
  font-size: 14px;
  color: #666;
  margin-bottom: 10px;
  display: -webkit-box;
  -webkit-line-clamp: 2;
  -webkit-box-orient: vertical;
  overflow: hidden;
}

.activity-footer {
  display: flex;
  justify-content: space-between;
  font-size: 12px;
  color: #666;
  padding-top: 10px;
  border-top: 1px dashed #eee;
}

.activity-club,
.activity-location,
.activity-participants,
.activity-date {
  display: flex;
  align-items: center;
  white-space: nowrap;
  font-size: 12px;
  color: #666;
  margin-bottom: 3px;
}

.activity-footer .el-icon {
  margin-right: 3px;
  font-size: 14px;
}
</style>
