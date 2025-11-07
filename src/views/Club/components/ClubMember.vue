<template>
  <div class="club-member-container">
    <el-card>
      <div slot="header" class="member-header">
        <span>社团成员管理</span>
      </div>

      <!-- 成员列表 -->
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
        <el-table-column label="操作" width="180" v-if="isAdmin">
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

      <!-- 申请列表 -->
      <div class="application-list mt-20" v-if="isAdmin">
        <h3>待处理加入申请</h3>
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
import { ref, onMounted } from "vue";
import { useRoute } from "vue-router";
import { useApplyStore } from "@/stores/applyStore";
import { useClubStore } from "@/stores/clubStore";
import { useUserStore } from "@/stores/userStore";
import { ElMessage } from "element-plus";

// 获取路由参数
const route = useRoute();
const clubId = route.params.id;

// 状态管理
const memberList = ref([]);
const applicationList = ref([]);
const isLoading = ref(false);
const applyStore = useApplyStore();
const clubStore = useClubStore();
const userStore = useUserStore();

// 权限控制
const isAdmin = ref(false);

// 初始化
onMounted(async () => {
  // 检查当前用户是否为管理员
  await checkAdminPermission();
  // 获取成员列表
  await getMemberList();
  // 管理员获取申请列表
  if (isAdmin.value) {
    await getApplicationList();
  }
});

// 检查管理员权限
const checkAdminPermission = async () => {
  if (!userStore.userInfo) {
    ElMessage.warning("用户信息未加载，请刷新页面重试");
    isAdmin.value = false;
    return;
  }
  isAdmin.value =
    userStore.userInfo.role === "club_admin" ||
    userStore.userInfo.role === "system_admin";
};

// 获取成员列表
const getMemberList = async () => {
  isLoading.value = true;
  try {
    const data = await clubStore.getClubMembers(clubId);
    memberList.value = data;
  } catch (error) {
    ElMessage.error("获取成员列表失败：" + error.message);
  } finally {
    isLoading.value = false;
  }
};

// 获取申请列表
const getApplicationList = async () => {
  try {
    const data = await applyStore.getClubJoinApply(clubId);
    applicationList.value = data;
  } catch (error) {
    ElMessage.error("获取申请列表失败：" + error.message);
  }
};

// 批准申请
const handleApprove = async (applyId) => {
  try {
    await applyStore.handleClubJoinApply(applyId, "approved");
    ElMessage.success("已批准申请");
    // 重新获取申请列表和成员列表
    await getApplicationList();
    await getMemberList();
  } catch (error) {
    ElMessage.error("操作失败：" + error.message);
  }
};

// 拒绝申请
const handleReject = async (applyId) => {
  try {
    await applyStore.handleClubJoinApply(applyId, "rejected");
    ElMessage.success("已拒绝申请");
    // 重新获取申请列表
    await getApplicationList();
  } catch (error) {
    ElMessage.error("操作失败：" + error.message);
  }
};

// 移除成员
const handleRemoveMember = async (userId) => {
  try {
    await clubStore.removeMember({ clubId, userId });
    ElMessage.success("已移除成员");
    // 重新获取成员列表
    await getMemberList();
  } catch (error) {
    ElMessage.error("操作失败：" + error.message);
  }
};
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
