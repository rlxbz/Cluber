<template>
  <el-card class="activity-item" :class="`activity-item--${variant}`" @click="handleClick">
    <div class="activity-main">
      <div v-if="activity.coverImage" class="activity-cover">
        <img :src="activity.coverImage" :alt="activity.title" class="activity-img" />
      </div>

      <div class="activity-content">
        <div class="activity-top">
          <div class="activity-main-info">
            <h3 class="activity-title">{{ activity.title }}</h3>
            <p class="activity-club">
              <el-icon><School /></el-icon>
              {{ hostName }}
            </p>
          </div>

          <ActivitySignUpStatus v-if="showSignUpStatus" :activity="activity" />
        </div>

        <p class="activity-date">
          <el-icon><Clock /></el-icon>
          {{ timeText }}
        </p>

        <div class="activity-intro">
          {{ summaryText }}
        </div>

        <div class="activity-footer">
          <div class="activity-location">
            <el-icon><Location /></el-icon>
            {{ activity.location || "地点待更新" }}
          </div>
          <div class="activity-participants">
            <el-icon><User /></el-icon>
            {{ participantText }}
          </div>
        </div>
      </div>
    </div>
  </el-card>
</template>

<script setup>
import { computed } from "vue";
import { Location, User, School, Clock } from "@element-plus/icons-vue";
import ActivitySignUpStatus from "@/components/business/ActivitySignUpStatus.vue";
import {
  formatActivityTime,
  getActivityHostName,
  getActivityParticipantInfo,
  getActivitySummaryText,
} from "@/utils/frontBusiness";

// 接收活动数据
const props = defineProps({
  activity: {
    type: Object,
    required: true,
      default: () => ({}),
  },
  variant: {
    type: String,
    default: "default",
  },
  showSignUpStatus: {
    type: Boolean,
    default: true,
  },
});

const emits = defineEmits(["click"]);
const summaryText = computed(() => getActivitySummaryText(props.activity));
const hostName = computed(() => getActivityHostName(props.activity));
const participantText = computed(() => getActivityParticipantInfo(props.activity).text);
const timeText = computed(() => formatActivityTime(props.activity.time || props.activity.startTime));

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

.activity-main {
  display: flex;
  gap: 14px;
}

.activity-cover {
  flex-shrink: 0;
}

.activity-img {
  width: 108px;
  height: 108px;
  object-fit: cover;
  border-radius: 8px;
}

.activity-content {
  flex: 1;
  min-width: 0;
}

.activity-top {
  display: flex;
  justify-content: space-between;
  align-items: flex-start;
  gap: 12px;
  margin-bottom: 6px;
}

.activity-main-info {
  min-width: 0;
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
  margin-bottom: 12px;
  display: -webkit-box;
  -webkit-line-clamp: 2;
  -webkit-box-orient: vertical;
  overflow: hidden;
  line-height: 1.7;
}

.activity-footer {
  display: flex;
  justify-content: space-between;
  gap: 12px;
  font-size: 12px;
  color: #666;
  padding-top: 10px;
  border-top: 1px dashed #eee;
  flex-wrap: wrap;
}

.activity-club,
.activity-location,
.activity-participants,
.activity-date {
  display: flex;
  align-items: center;
  font-size: 12px;
  color: #666;
  margin-bottom: 3px;
  gap: 4px;
}

.activity-item--compact .activity-img {
  width: 96px;
  height: 96px;
}

.activity-item--compact .activity-intro {
  -webkit-line-clamp: 3;
}

@media (max-width: 768px) {
  .activity-main,
  .activity-top {
    flex-direction: column;
  }

  .activity-img {
    width: 100%;
    height: 180px;
  }
}
</style>
