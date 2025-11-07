<template>
  <div class="join-club-container">
    <CommonButton
      v-if="!hasApplied && !isMember"
      type="primary"
      :loading="applyLoading"
      @click="handleJoinClub"
    >
      申请加入社团
    </CommonButton>

    <CommonButton v-if="hasApplied && !isMember" type="info" disabled>
      已申请，等待审核
    </CommonButton>

    <CommonButton v-if="isMember" type="success" disabled> 已加入社团 </CommonButton>
  </div>
</template>

<script setup>
import { ref, watch, onMounted } from "vue";
import { useRoute } from "vue-router";
import { useApplyStore } from "@/stores/applyStore";
import { useClubStore } from "@/stores/clubStore";
import { ElMessage } from "element-plus";
import CommonButton from "@/components/common/Button/index.vue";

// 路由参数
const route = useRoute();
const clubId = route.params.id;

// 状态管理
const applyStore = useApplyStore();
const clubStore = useClubStore();

// 状态变量
const applyLoading = ref(false);
const hasApplied = ref(false);
const isMember = ref(false);

// 检查是否已申请或已是成员
const checkApplyStatus = async () => {
  try {
    // 获取用户申请列表
    await applyStore.getUserApplyList();
    // 检查是否有该社团的申请
    hasApplied.value = applyStore.applyList.some(
      (item) =>
        item.clubId === clubId &&
        item.type === "join" &&
        ["pending", "reviewing"].includes(item.status)
    );

    // 检查是否已是社团成员
    if (clubStore.currentClub) {
      isMember.value = clubStore.currentClub.members.some(
        (member) => member.id === clubStore.currentUser.id
      );
    }
  } catch (err) {
    console.error("检查申请状态失败:", err);
  }
};

// 申请加入社团
const handleJoinClub = async () => {
  applyLoading.value = true;
  try {
    await applyStore.applyJoinClub({
      clubId,
      applyReason: "我希望加入这个社团，参与社团活动", // 可以改为从输入框获取
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
    // 如果社团信息未加载，则先加载
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
