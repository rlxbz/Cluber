<template>
  <el-card class="apply-join-card">
    <template #header>
      <div class="card-header">
        <div>
          <h3 class="card-title">本社团申请处理</h3>
          <p class="card-desc">查看近期想加入社团的同学，并及时给出回复。</p>
        </div>
      </div>
    </template>

    <div class="filter-bar mb-10">
      <el-select
        v-model="filterStatus"
        placeholder="筛选申请状态"
        clearable
        @change="handleFilterChange"
        style="width: 180px"
      >
        <el-option label="审核中" value="pending" />
        <el-option label="已通过" value="approved" />
        <el-option label="已拒绝" value="rejected" />
      </el-select>

      <el-button type="primary" icon="Refresh" @click="refreshList">刷新列表</el-button>
    </div>

    <FrontLoadingState
      v-if="isLoading"
      compact
      title="申请列表加载中"
      description="正在整理与你社团相关的入社申请。"
    />

    <FrontErrorState
      v-else-if="error"
      compact
      :description="error"
      @retry="loadApplyList"
    />

    <FrontEmptyState
      v-else-if="applyList.length === 0"
      compact
      title="暂时没有待处理申请"
      :description="emptyText"
      action-text="重新加载"
      @action="loadApplyList"
    />

    <el-table v-else :data="applyList" stripe style="width: 100%" table-layout="auto">
      <el-table-column label="申请人" min-width="140">
        <template #default="scope">
          <div class="applicant-info">
            <el-avatar :size="30" :src="scope.row.userAvatar || defaultAvatar" />
            <span class="applicant-name">{{ scope.row.username }}</span>
          </div>
        </template>
      </el-table-column>

      <el-table-column prop="clubName" label="申请社团" min-width="160" />
      <el-table-column prop="applyTime" label="提交时间" min-width="170" />

      <el-table-column label="状态" min-width="110">
        <template #default="scope">
          <ApplyStatusTag :status="scope.row.status" />
        </template>
      </el-table-column>

      <el-table-column label="处理" min-width="180" v-if="showHandleBtn">
        <template #default="scope">
          <el-button
            size="small"
            type="success"
            @click="handleApprove(scope.row.id)"
            v-if="scope.row.status === 'pending'"
          >
            通过
          </el-button>
          <el-button
            size="small"
            type="danger"
            @click="handleReject(scope.row.id)"
            v-if="scope.row.status === 'pending'"
            class="ml-2"
          >
            拒绝
          </el-button>
        </template>
      </el-table-column>
    </el-table>

    <div v-if="total > 0" class="pagination mt-10">
      <el-pagination
        v-model:current-page="page"
        v-model:page-size="pageSize"
        :total="total"
        @current-change="handlePageChange"
        layout="prev, pager, next, total"
      />
    </div>
  </el-card>
</template>

<script setup>
import { computed, ref, onMounted } from "vue";
import { ElMessage } from "element-plus";
import { useApplyStore } from "@/stores/applyStore";
import { useClubStore } from "@/stores/clubStore";
import { useUserStore } from "@/stores/userStore";
import defaultAvatarImage from "@/assets/images/default-avatar.png";
import ApplyStatusTag from "@/components/business/ApplyStatusTag.vue";
import FrontLoadingState from "@/components/business/FrontLoadingState.vue";
import FrontEmptyState from "@/components/business/FrontEmptyState.vue";
import FrontErrorState from "@/components/business/FrontErrorState.vue";
import { getErrorMessage } from "@/utils/frontBusiness";

const applyStore = useApplyStore();
const clubStore = useClubStore();
const userStore = useUserStore();

const filterStatus = ref("");
const page = ref(1);
const pageSize = ref(10);
const total = ref(0);
const isLoading = ref(false);
const applyList = ref([]);
const error = ref("");
const defaultAvatar = ref(defaultAvatarImage);
const managedClubId = ref(null);

const showHandleBtn = computed(() =>
  userStore.frontPermissions.canReviewClubJoinApplications
);
const emptyText = computed(() =>
  managedClubId.value ? "目前还没有新的入社申请。" : "你当前还没有可处理申请的社团。"
);

const ensureManagedClubId = async () => {
  if (managedClubId.value) {
    return managedClubId.value;
  }

  const myClubs = clubStore.myClubs.length
    ? clubStore.myClubs
    : await clubStore.getMyClubList();
  managedClubId.value = myClubs[0]?.id || null;
  return managedClubId.value;
};

const loadApplyList = async () => {
  if (!userStore.can("canReviewClubJoinApplications")) {
    applyList.value = [];
    total.value = 0;
    error.value = "";
    return;
  }

  try {
    isLoading.value = true;
    error.value = "";

    const clubId = await ensureManagedClubId();
    if (!clubId) {
      applyList.value = [];
      total.value = 0;
      return;
    }

    const res = await applyStore.getClubJoinApplications(clubId, {
      page: page.value,
      size: pageSize.value,
      status: filterStatus.value || undefined,
    });

    applyList.value = res.list || [];
    total.value = res.total || 0;
  } catch (error) {
    applyList.value = [];
    total.value = 0;
    error.value = getErrorMessage(error, "获取本社团申请失败，请稍后重试");
  } finally {
    isLoading.value = false;
  }
};

const handleFilterChange = () => {
  page.value = 1;
  loadApplyList();
};

const handlePageChange = (value) => {
  page.value = value;
  loadApplyList();
};

const refreshList = () => {
  loadApplyList();
};

const handleApprove = async (id) => {
  if (!userStore.can("canReviewClubJoinApplications")) {
    return;
  }

  try {
    await applyStore.handleClubJoinApplication(id, "approved");
    ElMessage.success("已通过该申请");
    loadApplyList();
  } catch (error) {
    ElMessage.error("操作失败：" + error.message);
  }
};

const handleReject = async (id) => {
  if (!userStore.can("canReviewClubJoinApplications")) {
    return;
  }

  try {
    await applyStore.handleClubJoinApplication(id, "rejected");
    ElMessage.success("已拒绝该申请");
    loadApplyList();
  } catch (error) {
    ElMessage.error("操作失败：" + error.message);
  }
};

onMounted(() => {
  loadApplyList();
});
</script>

<style scoped>
.apply-join-card {
  border-radius: 12px;
}

.card-header {
  display: flex;
  justify-content: space-between;
  align-items: flex-start;
  gap: 12px;
}

.card-title {
  margin: 0 0 6px;
  font-size: 18px;
}

.card-desc {
  margin: 0;
  color: var(--text-light-color);
  font-size: 13px;
  line-height: 1.6;
}

.filter-bar {
  display: flex;
  justify-content: space-between;
  align-items: center;
  flex-wrap: wrap;
  gap: 10px;
}

.applicant-info {
  display: flex;
  align-items: center;
  gap: 8px;
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
}

.applicant-name {
  font-size: 14px;
  max-width: 80px;
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
}

.pagination {
  text-align: right;
}

::v-deep(.el-table__body-wrapper) {
  overflow-x: auto;
}

::v-deep(.el-button.ml-2) {
  margin-left: 8px !important;
}
</style>
