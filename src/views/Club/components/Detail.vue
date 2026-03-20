<template>
  <div class="club-detail">
    <FrontLoadingState
      v-if="loading"
      title="社团详情加载中"
      description="正在整理这个社团的最新介绍和活动。"
    />

    <FrontErrorState
      v-else-if="error"
      :description="error"
      @retry="fetchClubDetail"
    />

    <FrontEmptyState
      v-else-if="!club?.id"
      title="没有找到这个社团"
      description="社团可能已下线或链接有误，你可以返回社团广场继续浏览。"
      action-text="返回社团广场"
      @action="router.push('/club')"
    />

    <template v-else>
      <ClubInfo :club-info="club" />

      <div class="club-actions mt-20">
        <CommonButton v-if="canManageThisClub" type="success" @click="handleManageMembers">
          管理成员
        </CommonButton>
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
    </template>
  </div>
</template>

<script setup>
import { ref, computed, nextTick, watch } from "vue";
import { useRoute, useRouter } from "vue-router";
import { useClubStore } from "@/stores/clubStore";
import { useUserStore } from "@/stores/userStore";
import ClubInfo from "./ClubInfo.vue";
import ClubMember from "./ClubMember.vue";
import ClubActivity from "./ClubActivity.vue";
import CommonButton from "@/components/common/Button/index.vue";
import FrontLoadingState from "@/components/business/FrontLoadingState.vue";
import FrontEmptyState from "@/components/business/FrontEmptyState.vue";
import FrontErrorState from "@/components/business/FrontErrorState.vue";
import { getErrorMessage } from "@/utils/frontBusiness";
import { getMemberUserId, hasManagerMemberRole, normalizeEntityId } from "@/utils/member";

const route = useRoute();
const router = useRouter();
const clubStore = useClubStore();
const userStore = useUserStore();

const clubId = computed(() => route.params.id);
const club = ref({});
const loading = ref(true);
const error = ref("");

// 获取社团详情
const fetchClubDetail = async () => {
  const currentClubId = clubId.value;

  if (!currentClubId || Number.isNaN(Number(currentClubId))) {
    club.value = {};
    error.value = "社团编号无效，请返回社团广场重新选择。";
    loading.value = false;
    return;
  }

  loading.value = true;
  error.value = "";

  try {
    club.value = (await clubStore.getClubDetail(currentClubId)) || {};
  } catch (err) {
    club.value = {};
    error.value = getErrorMessage(err, "获取社团详情失败，请稍后重试");
  } finally {
    loading.value = false;
  }
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
  const currentClubId = normalizeEntityId(club.value?.id || clubId.value);
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

watch(clubId, async () => {
  await fetchClubDetail();
  await fetchManagedClubs();
  await scrollToClubManagement();
}, { immediate: true });

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
