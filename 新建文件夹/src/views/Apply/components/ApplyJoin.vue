<template>
  <el-card>
    <div slot="header">
      <span>加入社团申请管理</span>
    </div>

    <!-- 筛选区域 -->
    <div class="filter-bar mb-10">
      <el-select
        v-model="filterStatus"
        placeholder="请选择状态"
        clearable
        @change="handleFilterChange"
        style="width: 180px"
      >
        <el-option label="待审核" value="pending" />
        <el-option label="已通过" value="approved" />
        <el-option label="已拒绝" value="rejected" />
      </el-select>

      <el-button type="primary" icon="Refresh" @click="refreshList"> 刷新 </el-button>
    </div>

    <!-- 申请列表：开启自适应列宽，移除不必要的固定width -->
    <el-table
      :data="applyList"
      border
      style="width: 100%"
      v-loading="isLoading"
      :fit="true"
      :table-layout="tableLayout"
    >
      <!-- 申请ID：最小宽度+自适应 -->
      <el-table-column prop="id" label="申请ID" min-width="80" />

      <!-- 申请人：最小宽度+内容自适应 -->
      <el-table-column label="申请人" min-width="140">
        <template #default="scope">
          <div class="applicant-info">
            <el-avatar :size="30" :src="scope.row.userAvatar || defaultAvatar" />
            <span class="applicant-name">{{ scope.row.username }}</span>
          </div>
        </template>
      </el-table-column>

      <!-- 社团名称：最小宽度+自适应（内容长时会自动扩展） -->
      <el-table-column prop="clubName" label="社团名称" min-width="160" />

      <!-- 申请时间：固定最小宽度（格式固定，无需扩展） -->
      <el-table-column prop="applyTime" label="申请时间" min-width="170" />

      <!-- 状态：固定最小宽度（内容固定） -->
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
                ? "待审核"
                : scope.row.status === "approved"
                ? "已通过"
                : "已拒绝"
            }}
          </el-tag>
        </template>
      </el-table-column>

      <!-- 操作：固定最小宽度（按钮数量固定） -->
      <el-table-column label="操作" min-width="180" v-if="showHandleBtn">
        <template #default="scope">
          <el-button
            size="small"
            type="success"
            @click="handleApprove(scope.row.id)"
            v-if="scope.row.status === 'pending'"
          >
            批准
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

    <!-- 分页 -->
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
import { ref, onMounted, watch } from "vue";
import { ElMessage } from "element-plus";
import { useApplyStore } from "@/stores/applyStore";
import { useUserStore } from "@/stores/userStore";
// 引入默认头像（避免无头像时布局错乱）
import AdefaultAvatar from "@/assets/images/default-avatar.png";

// 状态管理
const applyStore = useApplyStore();
const userStore = useUserStore();

// 筛选与分页参数
const filterStatus = ref("");
const page = ref(1);
const pageSize = ref(10);
const total = ref(0);
const isLoading = ref(false);
const applyList = ref([]);
const defaultAvatar = ref(AdefaultAvatar); // 默认头像

// 是否显示操作按钮（管理员可见）
const showHandleBtn = ref(userStore.role === "admin" || userStore.role === "clubAdmin");

// 表格布局：自适应模式（关键）
// fixed：固定布局（性能好，需手动设宽）；auto：自适应布局（内容决定宽度，适配性好）
const tableLayout = ref("auto");

// 加载申请列表
const loadApplyList = async () => {
  try {
    isLoading.value = true;
    // 根据用户角色获取不同列表
    const params = {
      page: page.value,
      size: pageSize.value,
      status: filterStatus.value || undefined,
    };

    const res =
      userStore.role === "admin"
        ? await applyStore.getAdminApplyList({ ...params, type: "join" })
        : await applyStore.getClubJoinApply(params);

    applyList.value = res.list;
    total.value = res.total;
  } catch (error) {
    ElMessage.error("获取申请列表失败：" + error.message);
  } finally {
    isLoading.value = false;
  }
};

// 筛选条件变化时重新加载列表
const handleFilterChange = () => {
  page.value = 1;
  loadApplyList();
};

// 分页变化时重新加载列表
const handlePageChange = (val) => {
  page.value = val;
  loadApplyList();
};

// 刷新列表
const refreshList = () => {
  loadApplyList();
};

// 批准申请
const handleApprove = async (id) => {
  try {
    await applyStore.handleApply(id, { status: "approved", type: "clubJoin" });
    ElMessage.success("已批准申请");
    loadApplyList(); // 刷新列表
  } catch (error) {
    ElMessage.error("操作失败：" + error.message);
  }
};

// 拒绝申请
const handleReject = async (id) => {
  try {
    await applyStore.handleApply(id, { status: "rejected", type: "clubJoin" });
    ElMessage.success("已拒绝申请");
    loadApplyList(); // 刷新列表
  } catch (error) {
    ElMessage.error("操作失败：" + error.message);
  }
};

// 页面加载时初始化列表
onMounted(() => {
  loadApplyList();
});

// 监听窗口大小变化，重新渲染表格（可选，增强适配性）
watch(
  () => window.innerWidth,
  () => {
    if (applyList.value.length > 0) {
      // 延迟执行，避免频繁触发
      setTimeout(() => {
        const table = document.querySelector(".el-table__body-wrapper");
        if (table) table.scrollLeft = 0; // 重置滚动条
      }, 100);
    }
  },
  { immediate: false, deep: false }
);
</script>

<style scoped>
.filter-bar {
  display: flex;
  justify-content: space-between;
  align-items: center;
  flex-wrap: wrap; /* 筛选栏自适应，避免窗口变窄时溢出 */
  gap: 10px;
}

.applicant-info {
  display: flex;
  align-items: center;
  gap: 8px;
  white-space: nowrap; /* 申请人名称不换行 */
  overflow: hidden; /* 超出部分隐藏（配合min-width避免布局错乱） */
  text-overflow: ellipsis; /* 超出部分显示省略号 */
}

.applicant-name {
  font-size: 14px;
  max-width: 80px; /* 名称最大宽度，避免过长导致列宽异常 */
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
}

.pagination {
  text-align: right;
}

/* 适配小屏幕：表格横向滚动时不挤压容器 */
::v-deep(.el-table__body-wrapper) {
  overflow-x: auto;
}

/* 按钮间距优化（避免小屏幕时按钮重叠） */
::v-deep(.el-button.ml-2) {
  margin-left: 8px !important;
}
</style>
