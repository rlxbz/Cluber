<template>
  <el-card>
    <template #header>
      <span>本社团入社申请处理</span>
    </template>

    <div class="filter-bar mb-10">
      <el-select
        v-model="filterStatus"
        placeholder="请选择状态"
        clearable
        @change="handleFilterChange"
        style="width: 180px"
      >
        <el-option label="待处理" value="pending" />
        <el-option label="已通过" value="approved" />
        <el-option label="已拒绝" value="rejected" />
      </el-select>

      <el-button type="primary" icon="Refresh" @click="refreshList">刷新</el-button>
    </div>

    <el-table
      :data="applyList"
      border
      style="width: 100%"
      v-loading="isLoading"
      table-layout="auto"
    >
      <el-table-column prop="id" label="申请ID" min-width="80" />

      <el-table-column label="申请人" min-width="140">
        <template #default="scope">
          <div class="applicant-info">
            <el-avatar :size="30" :src="scope.row.userAvatar || defaultAvatar" />
            <span class="applicant-name">{{ scope.row.username }}</span>
          </div>
        </template>
      </el-table-column>

      <el-table-column prop="clubName" label="社团名称" min-width="160" />
      <el-table-column prop="applyTime" label="申请时间" min-width="170" />

      <el-table-column label="状态" min-width="110">
        <template #default="scope">
          <el-tag
            :type="
              scope.row.status === 'pending'
                ? 'warning'
                : scope.row.status === 'approved'
                ? 'success'
                : 'danger'
            "
          >
            {{
              scope.row.status === "pending"
                ? "待处理"
                : scope.row.status === "approved"
                ? "已通过"
                : "已拒绝"
            }}
          </el-tag>
        </template>
      </el-table-column>

      <el-table-column label="操作" min-width="180" v-if="showHandleBtn">
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

    <div class="pagination mt-10">
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

const applyStore = useApplyStore();
const clubStore = useClubStore();
const userStore = useUserStore();

const filterStatus = ref("");
const page = ref(1);
const pageSize = ref(10);
const total = ref(0);
const isLoading = ref(false);
const applyList = ref([]);
const defaultAvatar = ref(defaultAvatarImage);
const managedClubId = ref(null);

const showHandleBtn = computed(() => userStore.isClubAdmin);

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
  if (!userStore.isClubAdmin) {
    applyList.value = [];
    total.value = 0;
    return;
  }

  try {
    isLoading.value = true;

    const clubId = await ensureManagedClubId();
    if (!clubId) {
      applyList.value = [];
      total.value = 0;
      ElMessage.warning("当前暂无可处理的本社团申请");
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
    ElMessage.error("获取本社团申请失败：" + error.message);
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
  try {
    await applyStore.handleClubJoinApplication(id, "approved");
    ElMessage.success("已通过该申请");
    loadApplyList();
  } catch (error) {
    ElMessage.error("操作失败：" + error.message);
  }
};

const handleReject = async (id) => {
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
