<template>
  <div class="club-detail">
    <!-- 社团基本信息 -->
    <ClubInfo :club-info="club" />

    <!-- 操作按钮区 -->
    <div class="club-actions mt-20">
      <CommonButton v-if="canManageThisClub" type="success" @click="handleManageMembers">
        管理成员
      </CommonButton>
      <el-button v-if="hasApplied" disabled type="info"> 已申请，等待审核 </el-button>
    </div>

    <ClubMember
      id="members"
      class="club-member-section"
      v-if="showClubManagementSection && club?.id"
      :club-id="club.id"
      :can-manage-club="canManageThisClub"
      :can-review-applications="canReviewThisClubApplications"
      @member-updated="fetchClubDetail"
    />
    <ClubActivity v-if="club?.id" :club-id="Number(club.id)" />
  </div>
</template>

<script setup>
import { ref, onMounted, computed, nextTick, watch } from "vue";
import { useRoute } from "vue-router";
import { useClubStore } from "@/stores/clubStore";
import { useApplyStore } from "@/stores/applyStore";
import { useUserStore } from "@/stores/userStore";
import ClubInfo from "./ClubInfo.vue";
import ClubMember from "./ClubMember.vue";
import ClubActivity from "./ClubActivity.vue";
import CommonButton from "@/components/common/Button/index.vue";
import { getMemberUserId, hasManagerMemberRole, normalizeEntityId } from "@/utils/member";

const route = useRoute();
const clubStore = useClubStore();
const applyStore = useApplyStore();
const userStore = useUserStore();

const clubId = route.params.id;
const club = ref({});

// 获取社团详情
const fetchClubDetail = async () => {
  club.value = await clubStore.getClubDetail(clubId);
};

const fetchManagedClubs = async () => {
  if (!userStore.frontPermissions.canManageOwnClub || clubStore.myClubs.length) {
    return;
  }

  try {
    await clubStore.getMyClubList();
  } catch (error) {
    console.error("获取我的社团列表失败:", error);
  }
};

const belongsToManagedClub = computed(() => {
  const currentClubId = normalizeEntityId(club.value?.id || clubId);
  if (!currentClubId) {
    return false;
  }

  return clubStore.myClubs.some((item) => normalizeEntityId(item.id) === currentClubId);
});

const isCurrentClubManager = computed(() => {
  const currentUserId = normalizeEntityId(userStore.userInfo?.id);
  if (!currentUserId) {
    return false;
  }

  const managerMatched = normalizeEntityId(club.value?.managerId) === currentUserId;
  const adminMemberMatched =
    club.value?.members?.some(
      (member) => getMemberUserId(member) === currentUserId && hasManagerMemberRole(member)
    ) ?? false;

  return managerMatched || adminMemberMatched || belongsToManagedClub.value;
});

const canManageThisClub = computed(
  () => userStore.frontPermissions.canManageOwnClub && isCurrentClubManager.value
);

const canReviewThisClubApplications = computed(
  () =>
    userStore.frontPermissions.canReviewClubJoinApplications &&
    isCurrentClubManager.value
);
const showClubManagementSection = computed(
  () => canManageThisClub.value || canReviewThisClubApplications.value
);

// 检查当前用户是否已申请加入
const hasApplied = computed(() => {
  if (!applyStore.applyList || !clubId) return false;
  return applyStore.applyList.some(
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

const scrollToClubManagement = async () => {
  const shouldFocusManagement =
    route.hash === "#members" ||
    route.hash === "#club-member-section" ||
    route.query.tab === "members" ||
    route.query.tab === "applications" ||
    route.query.action === "review";

  if (!shouldFocusManagement || !showClubManagementSection.value) {
    return;
  }

  await nextTick();
  document.querySelector("#members, .club-member-section")?.scrollIntoView({ behavior: "smooth" });
};

onMounted(async () => {
  await fetchClubDetail();
  await fetchManagedClubs();
  // 获取用户申请列表，用于判断是否已申请
  if (userStore.isLogin) {
    await applyStore.getUserApplyList();
  }
  await scrollToClubManagement();
});

watch(
  [() => route.query.tab, () => route.query.action, () => route.hash, showClubManagementSection],
  async () => {
    await scrollToClubManagement();
  }
);
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
