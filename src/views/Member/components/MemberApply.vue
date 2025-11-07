<template>
  <div class="member-apply">
    <el-card shadow="hover" class="page-card">
      <div slot="header" class="card-header">
        <span class="header-title">我的申请记录</span>
      </div>

      <div v-if="loading" class="loading-container">
        <el-loading-spinner />
      </div>

      <div v-else-if="error" class="error-message">
        <el-alert title="加载失败" :description="error" type="error" show-icon />
      </div>

      <div v-else-if="applyList.length === 0" class="no-data">
        <el-empty description="暂无申请记录" />
      </div>

      <el-table v-else :data="applyList" border>
        <el-table-column prop="id" label="申请ID" width="100" />
        <el-table-column prop="title" label="申请标题" />
        <el-table-column prop="type" label="申请类型" width="120">
          <template #default="scope">
            <el-tag :type="scope.row.type === 'join' ? 'info' : 'primary'">
              {{ scope.row.type === "join" ? "加入社团" : "创建社团" }}
            </el-tag>
          </template>
        </el-table-column>
        <el-table-column prop="createTime" label="申请时间" width="160" />
        <el-table-column prop="status" label="状态" width="120">
          <template #default="scope">
            <el-tag :type="getStatusTagType(scope.row.status)">
              {{ formatStatus(scope.row.status) }}
            </el-tag>
          </template>
        </el-table-column>
      </el-table>
    </el-card>
  </div>
</template>

<script setup>
import { ref, onMounted } from "vue";
import { useApplyStore } from "@/stores/applyStore";
import { ElMessage, ElTag, ElEmpty, ElAlert, ElLoading } from "element-plus";
import dayjs from "dayjs";

// 初始化 store
const applyStore = useApplyStore();

// 状态管理
const applyList = ref([]);
const loading = ref(false);
const error = ref("");

// 格式化状态文本
const formatStatus = (status) => {
  const statusMap = {
    pending: "待审核",
    approved: "已通过",
    rejected: "已拒绝",
  };
  return statusMap[status] || status;
};

// 获取状态标签类型
const getStatusTagType = (status) => {
  const typeMap = {
    pending: "warning",
    approved: "success",
    rejected: "danger",
  };
  return typeMap[status] || "info";
};

// 加载申请列表
const loadApplyList = async () => {
  loading.value = true;
  try {
    const res = await applyStore.getUserApplyList();
    applyList.value = res.list || [];
    error.value = "";
  } catch (err) {
    error.value = err.message || "获取申请列表失败";
    ElMessage.error(error.value);
  } finally {
    loading.value = false;
  }
};

// 页面挂载时加载数据
onMounted(() => {
  loadApplyList();
});
</script>

<style scoped>
/* 补充样式 */
.loading-container {
  min-height: 300px;
  display: flex;
  align-items: center;
  justify-content: center;
}

.error-message {
  margin: 20px 0;
}

.no-data {
  padding: 50px 0;
  text-align: center;
}
</style>
