<template>
  <div class="member-apply">
    <el-card shadow="hover" class="page-card">
      <template #header>
        <div class="card-header">
        <span class="header-title">我的申请记录</span>
        </div>
      </template>

      <div v-if="loading" class="loading-container">
        <el-loading-spinner />
      </div>

      <div v-else-if="error" class="error-message">
        <el-alert title="加载失败" :description="error" type="error" show-icon />
      </div>

      <div v-else-if="applyList.length === 0" class="no-data">
        <el-empty description="暂无申请记录" />
      </div>

      <el-table v-else :data="applyList" stripe>
        <el-table-column prop="title" label="申请内容" min-width="220">
          <template #default="scope">
            {{ scope.row.title || scope.row.clubName || scope.row.activityTitle || "申请记录" }}
          </template>
        </el-table-column>
        <el-table-column prop="type" label="申请类型" width="120">
          <template #default="scope">
            <el-tag :type="getApplyTypeTagType(scope.row.type)" effect="plain" round>
              {{ formatApplyType(scope.row.type) }}
            </el-tag>
          </template>
        </el-table-column>
        <el-table-column label="提交时间" width="180">
          <template #default="scope">
            {{ scope.row.createTime || scope.row.applyTime || "时间待更新" }}
          </template>
        </el-table-column>
        <el-table-column prop="status" label="状态" width="120">
          <template #default="scope">
            <ApplyStatusTag :status="scope.row.status" />
          </template>
        </el-table-column>
      </el-table>
    </el-card>
  </div>
</template>

<script setup>
import { ref, onMounted } from "vue";
import { useApplyStore } from "@/stores/applyStore";
import { ElMessage } from "element-plus";
import ApplyStatusTag from "@/components/business/ApplyStatusTag.vue";
import { formatApplyType, getApplyTypeTagType } from "@/utils/frontBusiness";

const applyStore = useApplyStore();

const applyList = ref([]);
const loading = ref(false);
const error = ref("");

const loadApplyList = async () => {
  loading.value = true;
  try {
    const res = await applyStore.ensureUserApplyList();
    applyList.value = res.list || [];
    error.value = "";
  } catch (err) {
    error.value = err.message || "获取申请列表失败";
    ElMessage.error(error.value);
  } finally {
    loading.value = false;
  }
};

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
