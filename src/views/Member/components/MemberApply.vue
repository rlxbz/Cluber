<template>
  <div class="member-apply">
    <el-card shadow="hover" class="page-card">
      <template #header>
        <div class="card-header">
          <span class="header-title">我的申请记录</span>
        </div>
      </template>

      <FrontLoadingState
        v-if="loading"
        compact
        title="申请记录加载中"
        description="正在整理你提交过的申请。"
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
        title="还没有申请记录"
        description="你提交过的入社或活动申请会展示在这里。"
      />

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
import ApplyStatusTag from "@/components/business/ApplyStatusTag.vue";
import FrontLoadingState from "@/components/business/FrontLoadingState.vue";
import FrontEmptyState from "@/components/business/FrontEmptyState.vue";
import FrontErrorState from "@/components/business/FrontErrorState.vue";
import { getErrorMessage, formatApplyType, getApplyTypeTagType } from "@/utils/frontBusiness";

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
    error.value = getErrorMessage(err, "获取申请列表失败，请稍后重试");
  } finally {
    loading.value = false;
  }
};

onMounted(() => {
  loadApplyList();
});
</script>

<style scoped>
</style>
