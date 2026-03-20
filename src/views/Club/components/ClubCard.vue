<template>
  <div class="club-card">
    <div class="club-header">
      <h3 class="club-name">{{ club.name }}</h3>
      <span class="club-type">{{ club.category || club.type || "社团" }}</span>
    </div>

    <div class="club-desc">
      <p>{{ club.description }}</p>
    </div>

    <div class="club-footer">
      <div class="club-stats">
        <span>成员: {{ club.memberCount || 0 }}</span>
        <span>活动: {{ club.activityCount || 0 }}</span>
      </div>

      <div class="club-actions">
        <CommonButton size="small" @click="handleViewDetail"> 查看详情 </CommonButton>

        <CommonButton
          v-if="canShowJoinAction"
          size="small"
          type="primary"
          @click="handleJoinApply"
          :loading="applyStore.loading"
        >
          {{ joinActionText }}
        </CommonButton>

        <ApplyStatusTag v-if="canShowAppliedState" status="pending" />
        <el-tag v-if="isMember" type="success" effect="plain" round> 已加入 </el-tag>
      </div>
    </div>
  </div>
</template>

<script setup>
import { computed, onMounted } from "vue";
import { useRoute, useRouter } from "vue-router";
import { useApplyStore } from "@/stores/applyStore";
import { useUserStore } from "@/stores/userStore";
import CommonButton from "@/components/common/Button/index.vue";
import ApplyStatusTag from "@/components/business/ApplyStatusTag.vue";
import { ElMessage, ElMessageBox } from "element-plus";
import { getMemberUserId } from "@/utils/member";

const props = defineProps({
  club: {
    type: Object,
    required: true,
  },
});

const emit = defineEmits(["click"]);
const applyStore = useApplyStore();
const userStore = useUserStore();
const route = useRoute();
const router = useRouter();
const canSubmitJoinClubApply = computed(() => userStore.can("canSubmitJoinClubApply"));

const isMember = computed(() => {
  if (props.club.isMember === true || props.club.joined === true) {
    return true;
  }

  if (!userStore.userInfo || !props.club.members) return false;
  return props.club.members.some(
    (member) => getMemberUserId(member) === String(userStore.userInfo.id ?? "")
  );
});

const hasApplied = computed(() => applyStore.hasPendingClubJoinApply(props.club.id));

const canShowJoinAction = computed(
  () => !isMember.value && !hasApplied.value && (!userStore.isLogin || canSubmitJoinClubApply.value)
);
const canShowAppliedState = computed(
  () => canSubmitJoinClubApply.value && hasApplied.value && !isMember.value
);
const joinActionText = computed(() => (userStore.isLogin ? "申请加入" : "登录后申请"));

const handleViewDetail = () => {
  emit("click", props.club.id);
};

const handleJoinApply = async () => {
  if (!userStore.isLogin) {
    try {
      await ElMessageBox.confirm(
        "你还未登录，登录后可继续提交入社申请。",
        "登录后继续",
        {
          confirmButtonText: "去登录",
          cancelButtonText: "先看看",
          type: "info",
        }
      );
      router.push({
        path: "/login",
        query: {
          redirect: route.fullPath,
        },
      });
    } catch (error) {
      // 用户取消时不再追加提示，避免打断浏览。
    }
    return;
  }

  if (!canSubmitJoinClubApply.value) {
    ElMessage.warning("当前账号暂时无法提交入社申请");
    return;
  }

  try {
    await applyStore.applyJoinClub({ clubId: props.club.id });
    ElMessage.success("申请已提交，请等待社团管理员审核");
  } catch (err) {
    ElMessage.error(applyStore.error || "申请失败，请稍后重试");
  }
};

onMounted(() => {
  if (userStore.isLogin && canSubmitJoinClubApply.value) {
    applyStore.ensureUserApplyList().catch(() => {});
  }
});
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
  align-items: center;
  flex-wrap: wrap;
  gap: 1px;
}
</style>
