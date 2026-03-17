<template>
  <div class="club-member-container">
    <el-card>
      <template #header>
        <div class="member-header">
          <span>本社团成员</span>
        </div>
      </template>

      <el-table :data="memberList" border style="width: 100%" v-loading="isLoading">
        <el-table-column prop="userId" label="用户ID" width="100" />
        <el-table-column prop="username" label="用户名" width="120" />
        <el-table-column prop="role" label="角色" width="100">
          <template #default="scope">
            <el-tag :type="scope.row.role === 'admin' ? 'primary' : 'success'">
              {{ scope.row.role === "admin" ? "管理员" : "成员" }}
            </el-tag>
          </template>
        </el-table-column>
        <el-table-column prop="joinTime" label="加入时间" width="160" />
        <el-table-column label="操作" width="180" v-if="isClubAdmin">
          <template #default="scope">
            <el-button
              size="small"
              type="danger"
              @click="handleRemoveMember(scope.row.userId)"
              v-if="scope.row.role !== 'admin'"
            >
              移除成员
            </el-button>
          </template>
        </el-table-column>
      </el-table>

      <div class="application-list mt-20" v-if="isClubAdmin">
        <h3>待处理入社申请</h3>
        <el-table :data="applicationList" border style="width: 100%; margin-top: 10px">
          <el-table-column prop="userId" label="用户ID" width="100" />
          <el-table-column prop="username" label="用户名" width="120" />
          <el-table-column prop="applyTime" label="申请时间" width="160" />
          <el-table-column label="操作" width="200">
            <template #default="scope">
              <el-button size="small" type="success" @click="handleApprove(scope.row.id)">
                通过
              </el-button>
              <el-button
                size="small"
                type="danger"
                @click="handleReject(scope.row.id)"
                style="margin-left: 5px"
              >
                拒绝
              </el-button>
            </template>
          </el-table-column>
        </el-table>
      </div>
    </el-card>
  </div>
</template>

<script setup>
import { computed, ref, onMounted } from "vue";
import { useRoute } from "vue-router";
import { useApplyStore } from "@/stores/applyStore";
import { useClubStore } from "@/stores/clubStore";
import { useUserStore } from "@/stores/userStore";
import { ElMessage } from "element-plus";

const props = defineProps({
  clubId: {
    type: [String, Number],
    default: "",
  },
});

const route = useRoute();
const applyStore = useApplyStore();
const clubStore = useClubStore();
const userStore = useUserStore();

const currentClubId = computed(() => props.clubId || route.params.id);
const memberList = ref([]);
const applicationList = ref([]);
const isLoading = ref(false);
const isClubAdmin = computed(() => userStore.isClubAdmin);

const getMemberList = async () => {
  isLoading.value = true;
  try {
    const data = await clubStore.getClubMembers(currentClubId.value);
    memberList.value = data || [];
  } catch (error) {
    ElMessage.error("获取成员列表失败：" + error.message);
  } finally {
    isLoading.value = false;
  }
};

const getApplicationList = async () => {
  if (!isClubAdmin.value) {
    applicationList.value = [];
    return;
  }

  try {
    const data = await applyStore.getClubJoinApplications(currentClubId.value);
    applicationList.value = data.list || [];
  } catch (error) {
    ElMessage.error("获取本社团申请失败：" + error.message);
  }
};

const handleApprove = async (applyId) => {
  try {
    await applyStore.handleClubJoinApplication(applyId, "approved");
    ElMessage.success("已通过申请");
    await getApplicationList();
    await getMemberList();
  } catch (error) {
    ElMessage.error("操作失败：" + error.message);
  }
};

const handleReject = async (applyId) => {
  try {
    await applyStore.handleClubJoinApplication(applyId, "rejected");
    ElMessage.success("已拒绝申请");
    await getApplicationList();
  } catch (error) {
    ElMessage.error("操作失败：" + error.message);
  }
};

const handleRemoveMember = async (userId) => {
  try {
    await clubStore.removeMember({ clubId: currentClubId.value, userId });
    ElMessage.success("已移除成员");
    await getMemberList();
  } catch (error) {
    ElMessage.error("操作失败：" + error.message);
  }
};

onMounted(async () => {
  await getMemberList();
  await getApplicationList();
});
</script>

<style scoped>
.member-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
}

.application-list {
  margin-top: 20px;
}
</style>
