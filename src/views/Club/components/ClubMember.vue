<template>
  <div class="club-member-container">
    <el-card class="member-service-card">
      <template #header>
        <div class="member-header">
          <div>
            <h3 class="member-title">社团成员服务</h3>
            <p class="member-desc">查看成员名单，并处理与你当前社团相关的加入申请。</p>
          </div>
        </div>
      </template>

      <section class="member-section">
        <div class="member-section__head">
          <h4>成员名单</h4>
          <p>先了解当前成员构成，再决定是否需要调整社团服务安排。</p>
        </div>

        <FrontLoadingState
          v-if="memberLoading"
          compact
          title="成员名单加载中"
          description="正在整理这支社团的成员信息。"
        />

        <FrontErrorState
          v-else-if="memberError"
          compact
          :description="memberError"
          @retry="handleRetryClubMember"
        />

        <FrontEmptyState
          v-else-if="memberList.length === 0"
          compact
          title="暂时还没有成员信息"
          description="当前没有可展示的成员名单。"
        />

        <el-table v-else :data="memberList" style="width: 100%">
          <el-table-column label="账号" width="100">
            <template #default="scope">
              {{ getMemberUserId(scope.row) || "-" }}
            </template>
          </el-table-column>
          <el-table-column prop="username" label="昵称" min-width="120" />
          <el-table-column prop="role" label="身份" width="100">
            <template #default="scope">
              <el-tag
                :type="scope.row.role === 'admin' ? 'primary' : 'success'"
                effect="plain"
                round
              >
                {{ scope.row.role === "admin" ? "负责人" : "成员" }}
              </el-tag>
            </template>
          </el-table-column>
          <el-table-column prop="joinTime" label="加入时间" min-width="160" />
          <el-table-column label="服务操作" width="140" v-if="canManageOwnClub">
            <template #default="scope">
              <el-button
                v-if="scope.row.role !== 'admin'"
                size="small"
                type="danger"
                plain
                @click="handleRemoveMember(getMemberUserId(scope.row))"
              >
                移出社团
              </el-button>
            </template>
          </el-table-column>
        </el-table>
      </section>

      <section class="application-list mt-20" v-if="canReviewClubJoinApplications">
        <div class="member-section__head">
          <h4>待回复的入社申请</h4>
          <p>只保留与你当前社团直接相关的申请，处理完成后会自动刷新。</p>
        </div>

        <FrontLoadingState
          v-if="applicationLoading"
          compact
          title="申请列表加载中"
          description="正在整理待回复的入社申请。"
        />

        <FrontErrorState
          v-else-if="applicationError"
          compact
          :description="applicationError"
          @retry="handleRetryClubMember"
        />

        <FrontEmptyState
          v-else-if="applicationList.length === 0"
          compact
          title="暂时没有待回复申请"
          description="最近还没有新的入社申请需要你处理。"
        />

        <el-table v-else :data="applicationList" style="width: 100%; margin-top: 10px">
          <el-table-column prop="userId" label="申请人账号" width="120" />
          <el-table-column prop="username" label="申请人" min-width="120" />
          <el-table-column prop="applyTime" label="申请时间" min-width="160" />
          <el-table-column label="回复操作" width="180">
            <template #default="scope">
              <el-button size="small" type="success" @click="handleApprove(scope.row.id)">
                同意
              </el-button>
              <el-button
                size="small"
                type="danger"
                plain
                @click="handleReject(scope.row.id)"
              >
                婉拒
              </el-button>
            </template>
          </el-table-column>
        </el-table>
      </section>
    </el-card>
  </div>
</template>

<script setup>
import { computed, ref, watch } from "vue";
import { useRoute } from "vue-router";
import { useApplyStore } from "@/stores/applyStore";
import { useClubStore } from "@/stores/clubStore";
import { useUserStore } from "@/stores/userStore";
import { ElMessage } from "element-plus";
import FrontLoadingState from "@/components/business/FrontLoadingState.vue";
import FrontEmptyState from "@/components/business/FrontEmptyState.vue";
import FrontErrorState from "@/components/business/FrontErrorState.vue";
import { getErrorMessage } from "@/utils/frontBusiness";
import { getMemberUserId } from "@/utils/member";

const emit = defineEmits(["member-updated"]);

const props = defineProps({
  clubId: {
    type: [String, Number],
    default: "",
  },
  canManageClub: {
    type: null,
    default: null,
  },
  canReviewApplications: {
    type: null,
    default: null,
  },
});

const route = useRoute();
const applyStore = useApplyStore();
const clubStore = useClubStore();
const userStore = useUserStore();

const currentClubId = computed(() => props.clubId || route.params.id);
const memberList = ref([]);
const applicationList = ref([]);
const memberLoading = ref(false);
const applicationLoading = ref(false);
const memberError = ref("");
const applicationError = ref("");
const loadVersion = ref(0);
const canManageOwnClub = computed(() =>
  typeof props.canManageClub === "boolean"
    ? props.canManageClub
    : userStore.frontPermissions.canManageOwnClub
);
const canReviewClubJoinApplications = computed(() =>
  typeof props.canReviewApplications === "boolean"
    ? props.canReviewApplications
    : userStore.frontPermissions.canReviewClubJoinApplications
);

const resetClubMemberState = () => {
  memberList.value = [];
  applicationList.value = [];
  memberError.value = "";
  applicationError.value = "";
  memberLoading.value = false;
  applicationLoading.value = false;
};

const getMemberList = async (
  targetClubId = currentClubId.value,
  version = loadVersion.value
) => {
  memberLoading.value = true;
  memberError.value = "";
  try {
    const data = await clubStore.getClubMembers(targetClubId);
    if (
      version !== loadVersion.value ||
      String(targetClubId ?? "") !== String(currentClubId.value ?? "")
    ) {
      return;
    }
    memberList.value = data || [];
  } catch (error) {
    if (
      version !== loadVersion.value ||
      String(targetClubId ?? "") !== String(currentClubId.value ?? "")
    ) {
      return;
    }
    memberList.value = [];
    memberError.value = getErrorMessage(error, "获取成员列表失败，请稍后重试");
  } finally {
    if (
      version === loadVersion.value &&
      String(targetClubId ?? "") === String(currentClubId.value ?? "")
    ) {
      memberLoading.value = false;
    }
  }
};

const getApplicationList = async (
  targetClubId = currentClubId.value,
  version = loadVersion.value
) => {
  if (!canReviewClubJoinApplications.value) {
    applicationList.value = [];
    applicationError.value = "";
    return;
  }

  try {
    applicationLoading.value = true;
    applicationError.value = "";
    const data = await applyStore.getClubJoinApplications(targetClubId);
    if (
      version !== loadVersion.value ||
      String(targetClubId ?? "") !== String(currentClubId.value ?? "")
    ) {
      return;
    }
    applicationList.value = data.list || [];
  } catch (error) {
    if (
      version !== loadVersion.value ||
      String(targetClubId ?? "") !== String(currentClubId.value ?? "")
    ) {
      return;
    }
    applicationList.value = [];
    applicationError.value = getErrorMessage(error, "获取入社申请失败，请稍后重试");
  } finally {
    if (
      version === loadVersion.value &&
      String(targetClubId ?? "") === String(currentClubId.value ?? "")
    ) {
      applicationLoading.value = false;
    }
  }
};

const loadClubMemberData = async (targetClubId = currentClubId.value) => {
  const normalizedTargetClubId = String(targetClubId ?? "");

  loadVersion.value += 1;
  const currentVersion = loadVersion.value;
  resetClubMemberState();

  if (!normalizedTargetClubId || Number.isNaN(Number(normalizedTargetClubId))) {
    memberError.value = "社团编号无效，暂时无法加载成员服务。";
    return;
  }

  await Promise.all([
    getMemberList(normalizedTargetClubId, currentVersion),
    getApplicationList(normalizedTargetClubId, currentVersion),
  ]);
};

const handleRetryClubMember = () => {
  loadClubMemberData(currentClubId.value);
};

const handleApprove = async (applyId) => {
  if (!canReviewClubJoinApplications.value) {
    return;
  }

  try {
    await applyStore.handleClubJoinApplication(applyId, "approved");
    ElMessage.success("已同意该申请");
    emit("member-updated");
    await getApplicationList();
    await getMemberList();
  } catch (error) {
    ElMessage.error("操作失败：" + getErrorMessage(error, "请稍后重试"));
  }
};

const handleReject = async (applyId) => {
  if (!canReviewClubJoinApplications.value) {
    return;
  }

  try {
    await applyStore.handleClubJoinApplication(applyId, "rejected");
    ElMessage.success("已婉拒该申请");
    emit("member-updated");
    await getApplicationList();
  } catch (error) {
    ElMessage.error("操作失败：" + getErrorMessage(error, "请稍后重试"));
  }
};

const handleRemoveMember = async (userId) => {
  if (!canManageOwnClub.value || !userId) {
    return;
  }

  try {
    await clubStore.removeMember({ clubId: currentClubId.value, userId });
    ElMessage.success("已将该成员移出社团");
    emit("member-updated");
    await getMemberList();
  } catch (error) {
    ElMessage.error("操作失败：" + getErrorMessage(error, "请稍后重试"));
  }
};

watch(
  currentClubId,
  (nextClubId) => {
    loadClubMemberData(nextClubId);
  },
  { immediate: true }
);
</script>

<style scoped>
.member-service-card {
  border-radius: 12px;
}

.member-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
}

.member-title {
  margin: 0 0 6px;
  font-size: 18px;
}

.member-desc {
  margin: 0;
  color: var(--text-light-color);
  line-height: 1.6;
  font-size: 13px;
}

.member-section__head {
  margin-bottom: 14px;
}

.member-section__head h4 {
  margin: 0 0 6px;
  font-size: 15px;
}

.member-section__head p {
  margin: 0;
  color: var(--text-light-color);
  font-size: 13px;
  line-height: 1.6;
}

.application-list {
  margin-top: 20px;
}
</style>
