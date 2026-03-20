<template>
  <div class="member-club">
    <el-card shadow="hover" class="page-card">
      <template #header>
        <div class="card-header">
          <span class="header-title">{{ pageTitle }}</span>
          <span v-if="clubList.length" class="header-subtitle">
            共 {{ clubList.length }} 个社团
          </span>
        </div>
      </template>

      <div v-if="loading" class="loading-container">
        <el-loading-spinner />
      </div>

      <div v-else-if="error" class="error-message">
        <el-alert title="加载失败" :description="error" type="error" show-icon />
      </div>

      <div v-else-if="clubList.length === 0" class="no-data">
        <el-empty :description="emptyDescription" />
      </div>

      <div v-else-if="isClubAdminView" class="club-grid manage-grid">
        <div v-for="club in clubList" :key="club.id" class="manage-card">
          <div class="manage-card__header">
            <h3 class="manage-card__title">{{ club.name || "未命名社团" }}</h3>
            <span class="manage-card__tag">管理中</span>
          </div>

          <div class="manage-card__meta">
            {{ club.category || club.type || "社团管理员" }}
          </div>

          <div class="manage-card__desc">
            <p>{{ club.description || "进入社团详情后可继续处理成员管理与入社申请事务。" }}</p>
          </div>

          <div class="manage-card__footer">
            <div class="manage-card__stats">
              <span>成员: {{ club.memberCount || 0 }}</span>
              <span>活动: {{ club.activityCount || 0 }}</span>
            </div>

            <div class="manage-card__actions">
              <el-button size="small" @click="handleViewDetail(club.id)">
                查看详情
              </el-button>
              <el-button size="small" type="primary" @click="handleManageMembers(club.id)">
                管理成员
              </el-button>
              <el-button
                size="small"
                type="warning"
                plain
                @click="handleReviewApplications(club.id)"
              >
                处理申请
              </el-button>
            </div>
          </div>
        </div>
      </div>

      <div v-else class="club-grid">
        <ClubCard
          v-for="club in clubList"
          :key="club.id"
          :club="club"
          @click="handleViewDetail(club.id)"
        />
      </div>
    </el-card>
  </div>
</template>

<script setup>
import { computed, onMounted, ref } from "vue";
import { useRouter } from "vue-router";
import ClubCard from "@/views/Club/components/ClubCard.vue";
import { useClubStore } from "@/stores/clubStore";
import { useUserStore } from "@/stores/userStore";

const clubStore = useClubStore();
const userStore = useUserStore();
const router = useRouter();

const loading = ref(true);
const error = ref("");
const clubList = ref([]);

const isClubAdminView = computed(() => userStore.frontPermissions.canManageOwnClub);
const pageTitle = computed(() => (isClubAdminView.value ? "我管理的社团" : "我的社团"));
const emptyDescription = computed(() =>
  isClubAdminView.value ? "当前暂无可管理的社团" : "暂无加入的社团"
);

const fetchMyClubs = async () => {
  try {
    loading.value = true;
    const clubs = clubStore.myClubs.length ? clubStore.myClubs : await clubStore.getMyClubList();
    clubList.value = clubs || [];
    error.value = "";
  } catch (err) {
    error.value = err.message || "获取社团列表失败，请重试";
    clubList.value = [];
  } finally {
    loading.value = false;
  }
};

const handleViewDetail = (clubId) => {
  router.push(`/club/${clubId}`);
};

const handleManageMembers = (clubId) => {
  router.push({
    path: `/club/${clubId}`,
    query: { tab: "members" },
    hash: "#members",
  });
};

const handleReviewApplications = (clubId) => {
  router.push({
    path: `/club/${clubId}`,
    query: { tab: "applications", action: "review" },
    hash: "#members",
  });
};

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
  gap: 12px;
}

.header-title {
  font-size: 16px;
  font-weight: 500;
}

.header-subtitle {
  font-size: 13px;
  color: var(--text-light-color);
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

.manage-card {
  border: 1px solid var(--border-color);
  border-radius: 4px;
  padding: 15px;
  transition: all 0.3s;
  background-color: #fff;
}

.manage-card:hover {
  box-shadow: 0 2px 12px rgba(0, 0, 0, 0.08);
}

.manage-card__title {
  margin: 0;
  font-size: 16px;
  font-weight: 500;
}

.manage-card__header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  gap: 10px;
  margin-bottom: 10px;
}

.manage-card__tag {
  font-size: 12px;
  padding: 2px 8px;
  background-color: #ecfdf3;
  color: #15803d;
  border-radius: 12px;
  white-space: nowrap;
}

.manage-card__meta {
  font-size: 12px;
  padding: 2px 8px;
  background-color: #f0f2f5;
  border-radius: 12px;
  display: inline-flex;
  margin-bottom: 12px;
}

.manage-card__desc {
  margin-bottom: 15px;
  height: 60px;
  overflow: hidden;
}

.manage-card__desc p {
  margin: 0;
  font-size: 13px;
  color: var(--text-light-color);
  display: -webkit-box;
  -webkit-box-orient: vertical;
  -webkit-line-clamp: 3;
}

.manage-card__footer {
  display: flex;
  justify-content: space-between;
  align-items: flex-end;
  padding-top: 10px;
  border-top: 1px dashed var(--border-color);
  gap: 12px;
}

.manage-card__stats {
  font-size: 12px;
  color: var(--text-light-color);
}

.manage-card__stats span {
  margin-right: 10px;
}

.manage-card__actions {
  display: flex;
  flex-wrap: wrap;
  justify-content: flex-end;
  gap: 6px;
}

@media (max-width: 768px) {
  .member-club {
    padding: 0 10px;
  }

  .club-grid {
    grid-template-columns: 1fr;
  }

  .manage-card__footer {
    flex-direction: column;
    align-items: flex-start;
  }

  .manage-card__actions {
    justify-content: flex-start;
  }
}
</style>
