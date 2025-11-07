<template>
  <div class="club-detail">
    <!-- 社团基本信息 -->
    <ClubInfo :club="club" />

    <!-- 操作按钮区 -->
    <div class="club-actions mt-20">
      <CommonButton
        v-if="isMember && isManager"
        type="success"
        @click="handleManageMembers"
      >
        管理成员
      </CommonButton>
      <el-button v-if="hasApplied" disabled type="info"> 已申请，等待审核 </el-button>
    </div>

    <ClubMember
      v-if="isManager && club?.id"
      :club-id="club.id"
      @member-updated="fetchClubDetail"
    />
    <ClubActivity v-if="club?.id" :club-id="Number(club.id)" />
  </div>
</template>

<script setup>
import { ref, onMounted, computed } from "vue";
import { useRoute } from "vue-router";
import { useClubStore } from "@/stores/clubStore";
import { useApplyStore } from "@/stores/applyStore";
import { useUserStore } from "@/stores/userStore";
import ClubInfo from "./ClubInfo.vue";
import ClubMember from "./ClubMember.vue";
import ClubActivity from "./ClubActivity.vue";
import CommonButton from "@/components/common/Button/index.vue";
import { ElMessage } from "element-plus";

const route = useRoute();
const clubStore = useClubStore();
const applyStore = useApplyStore();
const userStore = useUserStore();

const clubId = route.params.id;
const club = ref({});

// 获取社团详情
const fetchClubDetail = async () => {
  console.log("clubId:", clubId); // 检查ID是否正确
  club.value = await clubStore.getClubDetail(clubId);
  console.log("club数据:", club.value); // 检查数据是否完整
};

const isMember = computed(
  () =>
    club.value?.members?.some((member) => member.id === userStore.userInfo?.id) ?? false
);

const isManager = computed(
  () => club.value?.managerId === userStore.userInfo?.id ?? false
);

// 检查当前用户是否已申请加入
const hasApplied = computed(() => {
  if (!applyStore.userApplies || !clubId) return false;
  return applyStore.userApplies.some(
    (apply) =>
      apply.type === "join_club" &&
      apply.targetId === clubId &&
      apply.status === "pending"
  );
});

// 管理成员
const handleManageMembers = () => {
  // 滚动到成员列表
  document.querySelector(".club-member-section")?.scrollIntoView({ behavior: "smooth" });
};

onMounted(async () => {
  await fetchClubDetail();
  // 获取用户申请列表，用于判断是否已申请
  if (userStore.isLogin) {
    await applyStore.getUserApplyList();
  }
});
</script>

<style scoped>
.club-detail {
  padding: 20px;
  background-color: #fff;
  border-radius: 4px;
  box-shadow: 0 2px 12px 0 rgba(0, 0, 0, 0.05);
}

.club-actions {
  margin: 20px 0;
  display: flex;
  gap: 10px;
}
</style>
