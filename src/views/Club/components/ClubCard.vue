<template>
  <div class="club-card">
    <div class="club-header">
      <h3 class="club-name">{{ club.name }}</h3>
      <span class="club-type">{{ club.type }}</span>
    </div>

    <div class="club-desc">
      <p>{{ club.description }}</p>
    </div>

    <div class="club-footer">
      <div class="club-stats">
        <span>成员: {{ club.memberCount }}</span>
        <span>活动: {{ club.activityCount }}</span>
      </div>

      <div class="club-actions">
        <CommonButton size="small" @click="handleViewDetail"> 详情 </CommonButton>

        <CommonButton
          v-if="!isMember && !hasApplied"
          size="small"
          type="primary"
          @click="handleJoinApply"
          :loading="applyStore.loading"
        >
          申请加入
        </CommonButton>

        <el-button v-if="hasApplied" size="small" type="info" disabled>
          已申请
        </el-button>
      </div>
    </div>
  </div>
</template>

<script setup>
import { computed } from "vue";
import { useRouter } from "vue-router";
import { useApplyStore } from "@/stores/applyStore";
import { useUserStore } from "@/stores/userStore";
import CommonButton from "@/components/common/Button/index.vue";
import { ElMessage } from "element-plus";

const props = defineProps({
  club: {
    type: Object,
    required: true,
  },
});

const router = useRouter();
const applyStore = useApplyStore();
const userStore = useUserStore();

// 检查当前用户是否为社团成员
const isMember = computed(() => {
  if (!userStore.userInfo || !props.club.members) return false;
  return props.club.members.some((member) => member.id === userStore.userInfo.id);
});

// 检查当前用户是否已申请加入
const hasApplied = computed(() => {
  if (!applyStore.userApplies || !props.club.id) return false;
  return applyStore.userApplies.some(
    (apply) =>
      apply.type === "join_club" &&
      apply.targetId === props.club.id &&
      apply.status === "pending"
  );
});

// 查看社团详情
const handleViewDetail = () => {
  router.push(`/club/${props.club.id}`);
};

// 申请加入社团
const handleJoinApply = async () => {
  if (!userStore.isLogin) {
    ElMessage.warning("请先登录");
    router.push("/login");
    return;
  }

  try {
    await applyStore.applyJoinClub({ clubId: props.club.id });
    ElMessage.success("申请已提交，请等待社团管理员审核");
  } catch (err) {
    ElMessage.error(applyStore.error || "申请失败，请稍后重试");
  }
};
</script>

<style scoped>
.club-card {
  border: 1px solid var(--border-color);
  border-radius: 4px;
  padding: 15px;
  transition: all 0.3s;
}

.club-card:hover {
  box-shadow: 0 2px 12px rgba(0, 0, 0, 0.08);
}

.club-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 10px;
}

.club-name {
  font-size: 16px;
  font-weight: 500;
  margin: 0;
}

.club-type {
  font-size: 12px;
  padding: 2px 8px;
  background-color: #f0f2f5;
  border-radius: 12px;
}

.club-desc {
  margin-bottom: 15px;
  height: 60px;
  overflow: hidden;
}

.club-desc p {
  margin: 0;
  font-size: 13px;
  color: var(--text-light-color);
  display: -webkit-box;
  -webkit-box-orient: vertical;
  -webkit-line-clamp: 3;
}

.club-footer {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding-top: 10px;
  border-top: 1px dashed var(--border-color);
}

.club-stats {
  font-size: 12px;
  color: var(--text-light-color);
}

.club-stats span {
  margin-right: 10px;
}

.club-actions {
  display: flex;
  gap: 5px;
}
</style>
