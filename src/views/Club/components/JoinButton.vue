<template>
  <div class="join-club-container">
    <LoginRequiredState
      v-if="!userStore.isLogin"
      compact
      :redirect="route.fullPath"
      description="登录后可继续申请加入这个社团。"
    />

    <CommonButton
      v-else-if="canShowJoinAction"
      type="primary"
      :loading="applyLoading"
      @click="handleJoinClub"
    >
      申请加入社团
    </CommonButton>

    <ApplyStatusTag v-if="canShowAppliedState" status="pending" />

    <el-tag v-if="isMember" type="success" effect="plain" round> 已加入社团 </el-tag>
  </div>
</template>

<script setup>
import { computed, ref, watch } from "vue";
import { useRoute } from "vue-router";
import { useApplyStore } from "@/stores/applyStore";
import { useClubStore } from "@/stores/clubStore";
import { useUserStore } from "@/stores/userStore";
import { ElMessage } from "element-plus";
import CommonButton from "@/components/common/Button/index.vue";
import ApplyStatusTag from "@/components/business/ApplyStatusTag.vue";
import LoginRequiredState from "@/components/business/LoginRequiredState.vue";
import { getMemberUserId } from "@/utils/member";

// 路由参数
const route = useRoute();
const clubId = computed(() => route.params.id);

// 状态管理
const applyStore = useApplyStore();
const clubStore = useClubStore();
const userStore = useUserStore();

// 状态变量
const applyLoading = ref(false);
const isMember = ref(false);
const checkVersion = ref(0);
const normalizedClubId = computed(() => String(clubId.value ?? ""));
const canSubmitJoinClubApply = computed(() => userStore.can("canSubmitJoinClubApply"));
const hasApplied = computed(() => applyStore.hasPendingClubJoinApply(normalizedClubId.value));
const canShowJoinAction = computed(
  () => canSubmitJoinClubApply.value && !hasApplied.value && !isMember.value
);
const canShowAppliedState = computed(
  () => canSubmitJoinClubApply.value && hasApplied.value && !isMember.value
);

const resetJoinState = () => {
  isMember.value = false;
};

// 检查是否已申请或已是成员
const checkApplyStatus = async (targetClubId = clubId.value) => {
  const currentCheckVersion = ++checkVersion.value;
  const normalizedTargetClubId = String(targetClubId ?? "");

  resetJoinState();

  if (!normalizedTargetClubId || Number.isNaN(Number(normalizedTargetClubId))) {
    return;
  }

  try {
    await applyStore.ensureUserApplyList();

    if (
      currentCheckVersion !== checkVersion.value ||
      normalizedTargetClubId !== String(clubId.value ?? "")
    ) {
      return;
    }

    const currentClub = clubStore.currentClub;
    const currentClubId = String(currentClub?.id ?? "");

    if (
      currentCheckVersion !== checkVersion.value ||
      normalizedTargetClubId !== String(clubId.value ?? "") ||
      currentClubId !== normalizedTargetClubId
    ) {
      return;
    }

    isMember.value = (currentClub?.members || []).some(
      (member) => getMemberUserId(member) === String(userStore.userInfo?.id ?? "")
    );
  } catch (err) {
    resetJoinState();
    console.error("检查申请状态失败:", err);
  }
};

// 申请加入社团
const handleJoinClub = async () => {
  if (!canSubmitJoinClubApply.value) {
    ElMessage.warning(
      userStore.isLogin
        ? "当前账号暂不支持申请加入社团"
        : "你还未登录，登录后可继续提交入社申请"
    );
    return;
  }

  applyLoading.value = true;
  try {
    await applyStore.applyJoinClub({
      clubId: clubId.value,
      applyReason: "我希望加入这个社团，参与社团活动",
    });

    ElMessage.success("申请已提交，请等待社团管理员审核");
  } catch (err) {
    ElMessage.error(err.message || "申请提交失败，请稍后重试");
  } finally {
    applyLoading.value = false;
  }
};

watch(
  clubId,
  (nextClubId) => {
    resetJoinState();

    if (!nextClubId || Number.isNaN(Number(nextClubId))) {
      return;
    }

    checkApplyStatus(nextClubId);
  },
  { immediate: true }
);

watch(
  () => clubStore.currentClub,
  () => {
    checkApplyStatus(clubId.value);
  }
);
</script>

<style scoped>
.join-club-container {
  margin-top: 20px;
  text-align: right;
}
</style>
