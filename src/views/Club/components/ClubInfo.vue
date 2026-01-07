<template>
  <div class="club-info">
    <!-- 社团头部信息 -->
    <div class="club-header">
      <el-image :src="clubInfo.logo || defaultLogo" class="club-logo" fit="cover" lazy />
      <div class="club-base-info">
        <div class="club-name-rank">
          <h2 class="club-name">{{ clubInfo.name || "未知社团" }}</h2>
          <el-tag v-if="clubInfo.level" :type="getLevelType">{{ clubInfo.level }}</el-tag>
        </div>
        <div class="club-meta">
          <span class="meta-item">
            <el-icon size="16"><UserFilled /></el-icon>
            {{ clubInfo.memberCount || 0 }}名成员
          </span>
          <span class="meta-item">
            <el-icon size="16"><Calendar /></el-icon>
            成立于{{ clubInfo.createTime || "未知时间" }}
          </span>
          <span class="meta-item">
            <el-icon size="16"><LocationFilled /></el-icon>
            {{ clubInfo.category || "未知类别" }}
          </span>
        </div>
        <div class="club-actions">
          <el-button v-if="!isJoined" type="primary" @click="handleJoin">
            申请加入
          </el-button>
          <el-button v-else type="success" disabled> 已加入 </el-button>
        </div>
      </div>
    </div>

    <!-- 社团简介 -->
    <div class="club-description mt-20">
      <h3 class="section-title">社团简介</h3>
      <div class="description-content">
        {{ clubInfo.description || "该社团暂未填写简介" }}
      </div>
    </div>

    <!-- 社团负责人 -->
    <div class="club-manager mt-20">
      <h3 class="section-title">社团负责人</h3>
      <div class="manager-info">
        <el-avatar :src="clubInfo.managerAvatar" class="manager-avatar" />
        <div class="manager-details">
          <p class="manager-name">{{ clubInfo.managerName || "未知" }}</p>
          <p class="manager-contact">{{ clubInfo.managerContact || "未公开联系方式" }}</p>
        </div>
      </div>
    </div>

    <HomeDashboard />
  </div>
</template>

<script setup>
import { ref, computed } from "vue";
import { useClubStore } from "@/stores/clubStore";
import { useApplyStore } from "@/stores/applyStore";
import { ElMessage } from "element-plus";
import { UserFilled, Calendar, LocationFilled } from "@element-plus/icons-vue";

import HomeDashboard from "./ClubDashboard.vue";
// 接收父组件传入的社团信息
const props = defineProps({
  clubInfo: {
    type: Object,
    default: () => ({}),
  },
});

// 状态管理
const clubStore = useClubStore();
const applyStore = useApplyStore();
const defaultLogo = "https://cube.elemecdn.com/3/7c/3ea6beec64348aa67243e5c931.jpeg";

// 计算属性：判断是否已加入社团
const isJoined = computed(() => {
  return clubStore.myClubs.some((club) => club.id === props.clubInfo.id);
});

// 计算属性：根据社团等级返回标签类型
const getLevelType = computed(() => {
  const levelMap = {
    校级: "primary",
    院级: "success",
    系级: "info",
  };
  return levelMap[props.clubInfo.level] || "default";
});

// 申请加入社团
const handleJoin = async () => {
  try {
    await applyStore.applyJoinClub({ clubId: props.clubInfo.id });
    ElMessage.success("申请已提交，请等待审核");
  } catch (err) {
    ElMessage.error(err.message || "申请失败，请重试");
  }
};
</script>

<style scoped>
.club-header {
  display: flex;
  padding-bottom: 20px;
  border-bottom: 1px solid var(--border-color);
}

.club-logo {
  width: 160px;
  height: 160px;
  border-radius: 8px;
  margin-right: 20px;
}

.club-base-info {
  flex: 1;
}

.club-name-rank {
  display: flex;
  align-items: center;
  margin-bottom: 15px;
}

.club-name {
  margin: 0;
  font-size: 24px;
  font-weight: 600;
  color: var(--text-color);
}

.el-tag {
  margin-left: 15px;
}

.club-meta {
  margin-bottom: 20px;
}

.meta-item {
  display: inline-flex;
  align-items: center;
  margin-right: 25px;
  color: var(--text-light-color);
}

.meta-item .el-icon {
  margin-right: 5px;
}

.section-title {
  font-size: 16px;
  font-weight: 600;
  color: var(--text-color);
  padding-bottom: 10px;
  border-bottom: 1px solid var(--border-color);
  margin-bottom: 15px;
}

.description-content {
  line-height: 1.8;
  color: var(--text-color);
  text-indent: 2em;
}

.manager-info {
  display: flex;
  align-items: center;
}

.manager-avatar {
  width: 60px;
  height: 60px;
  margin-right: 15px;
}

.manager-name {
  font-weight: 500;
  margin-bottom: 5px;
}

.manager-contact {
  color: var(--text-light-color);
  font-size: 13px;
}
</style>
