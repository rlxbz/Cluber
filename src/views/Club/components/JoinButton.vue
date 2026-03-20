<template>
  <div class="join-club-container">
    <CommonButton
      v-if="canShowJoinAction"
      type="primary"
      :loading="applyLoading"
      @click="handleJoinClub"
    >
      申请加入社团
    </CommonButton>

    <CommonButton v-if="canShowAppliedState" type="info" disabled>
      已申请，等待审核
    </CommonButton>

    <CommonButton v-if="isMember" type="success" disabled> 已加入社团 </CommonButton>
  </div>
</template>

<script setup>
import { computed, ref, watch, onMounted } from "vue";
import { useRoute } from "vue-router";
import { useApplyStore } from "@/stores/applyStore";
import { useClubStore } from "@/stores/clubStore";
import { useUserStore } from "@/stores/userStore";
import { ElMessage } from "element-plus";
import CommonButton from "@/components/common/Button/index.vue";
import { getMemberUserId } from "@/utils/member";

// 路由参数
const route = useRoute();
const clubId = route.params.id;

// 状态管理
const applyStore = useApplyStore();
const clubStore = useClubStore();
const userStore = useUserStore();

// 状态变量
const applyLoading = ref(false);
const hasApplied = ref(false);
const isMember = ref(false);
const normalizedClubId = computed(() => String(clubId));
const canSubmitJoinClubApply = computed(() => userStore.can("canSubmitJoinClubApply"));
const canShowJoinAction = computed(
  () => canSubmitJoinClubApply.value && !hasApplied.value && !isMember.value
);
const canShowAppliedState = computed(
  () => canSubmitJoinClubApply.value && hasApplied.value && !isMember.value
);

// 检查是否已申请或已是成员
const checkApplyStatus = async () => {
  try {
    await applyStore.getUserApplyList();
    hasApplied.value = applyStore.applyList.some(
      (item) =>
        (item.type === "join" || item.type === "join_club") &&
        String(item.clubId ?? item.targetId ?? "") === normalizedClubId.value &&
        item.status === "pending"
    );

    if (clubStore.currentClub) {
      isMember.value = (clubStore.currentClub.members || []).some(
        (member) => getMemberUserId(member) === String(userStore.userInfo?.id ?? "")
      );
    }
  } catch (err) {
    console.error("检查申请状态失败:", err);
  }
};

// 申请加入社团
const handleJoinClub = async () => {
  if (!canSubmitJoinClubApply.value) {
    return;
  }

  applyLoading.value = true;
  try {
    await applyStore.applyJoinClub({
      clubId,
      applyReason: "我希望加入这个社团，参与社团活动",
    });

    ElMessage.success("申请已提交，请等待社团管理员审核");
    hasApplied.value = true;
  } catch (err) {
    ElMessage.error(err.message || "申请提交失败，请稍后重试");
  } finally {
    applyLoading.value = false;
  }
};

// 监听数据变化
watch(() => clubStore.currentClub, checkApplyStatus);

// 初始化检查
onMounted(() => {
  if (clubStore.currentClub) {
    checkApplyStatus();
  } else {
    clubStore.getClubDetail(clubId).then(checkApplyStatus);
  }
});
</script>

<style scoped>
.join-club-container {
  margin-top: 20px;
  text-align: right;
}
</style>
