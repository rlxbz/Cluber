<!-- src/views/Member/components/MemberClub.vue -->
<template>
  <div class="member-club">
    <el-card shadow="hover" class="page-card">
      <div slot="header" class="card-header">
        <span class="header-title">我的社团</span>
      </div>

      <div v-if="loading" class="loading-container">
        <el-loading-spinner />
      </div>

      <div v-else-if="error" class="error-message">
        <el-alert title="加载失败" :description="error" type="error" show-icon />
      </div>

      <div v-else-if="clubList.length === 0" class="no-data">
        <el-empty description="暂无加入的社团" />
      </div>

      <div v-else class="club-grid">
        <ClubCard
          v-for="club in clubList"
          :key="club.id"
          :club="club"
          @click="handleClubClick(club.id)"
        />
      </div>
    </el-card>
  </div>
</template>

<script setup>
import { onMounted, ref } from "vue";
import { useRouter } from "vue-router";
import ClubCard from "@/views/Club/components/ClubCard.vue";
import { getMyClubListAPI } from "@/apis/club";

// 状态管理
const loading = ref(true);
const error = ref("");
const clubList = ref([]);
const router = useRouter();

// 获取我的社团列表
const fetchMyClubs = async () => {
  try {
    loading.value = true;
    const res = await getMyClubListAPI();
    clubList.value = res.data || [];
    error.value = "";
  } catch (err) {
    error.value = err.message || "获取社团列表失败，请重试";
    clubList.value = [];
  } finally {
    loading.value = false;
  }
};

// 跳转社团详情页
const handleClubClick = (clubId) => {
  router.push(`/club/${clubId}`);
};

// 页面挂载时加载数据
onMounted(() => {
  fetchMyClubs();
});
</script>

<style scoped>
.member-club {
  padding: 0 20px;
}

.page-card {
  margin-top: 20px;
}

.card-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
}

.header-title {
  font-size: 16px;
  font-weight: 500;
}

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

.club-grid {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(280px, 1fr));
  gap: 20px;
  margin-top: 20px;
}

/* 响应式适配 */
@media (max-width: 768px) {
  .club-grid {
    grid-template-columns: 1fr;
  }

  .member-club {
    padding: 0 10px;
  }
}
</style>
