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

      <FrontLoadingState
        v-if="loading"
        compact
        title="社团服务加载中"
        description="正在整理与你有关的社团信息。"
      />

      <FrontErrorState
        v-else-if="error"
        compact
        :description="error"
        @retry="fetchMyClubs"
      />

      <FrontEmptyState
        v-else-if="clubList.length === 0"
        compact
        :title="isClubAdminView ? '还没有可服务的社团' : '还没有加入社团'"
        :description="emptyDescription"
      />

      <div v-else-if="isClubAdminView" class="club-grid service-grid">
        <div v-for="club in clubList" :key="club.id" class="manage-card">
          <div class="manage-card__header">
            <h3 class="manage-card__title">{{ club.name || "未命名社团" }}</h3>
            <span class="manage-card__tag">社团服务</span>
          </div>

          <div class="manage-card__meta">
            {{ club.category || club.type || "社团信息待补充" }}
          </div>

          <div class="manage-card__desc">
            <p>{{ club.description || "进入社团主页后可以继续查看成员名单、近期活动和申请处理情况。" }}</p>
          </div>

          <div class="manage-card__footer">
            <div class="manage-card__stats">
              <span>成员: {{ club.memberCount || 0 }}</span>
              <span>活动: {{ club.activityCount || 0 }}</span>
            </div>

            <div class="manage-card__actions">
              <el-button size="small" @click="handleViewDetail(club.id)">
                查看社团主页
              </el-button>
              <el-button size="small" type="primary" @click="handleManageMembers(club.id)">
                查看成员服务
              </el-button>
              <el-button
                size="small"
                type="warning"
                plain
                @click="handleReviewApplications(club.id)"
              >
                回复入社申请
              </el-button>
            </div>
          </div>
        </div>
      </div>

      <ClubList v-else :clubs="clubList" @item-click="handleViewDetail" />
    </el-card>
  </div>
</template>

<script setup>
import { computed, onMounted, ref } from "vue";
import { useRouter } from "vue-router";
import ClubList from "@/views/Club/components/ClubList.vue";
import { useClubStore } from "@/stores/clubStore";
import { useUserStore } from "@/stores/userStore";
import FrontLoadingState from "@/components/business/FrontLoadingState.vue";
import FrontEmptyState from "@/components/business/FrontEmptyState.vue";
import FrontErrorState from "@/components/business/FrontErrorState.vue";
import { getErrorMessage } from "@/utils/frontBusiness";

const clubStore = useClubStore();
const userStore = useUserStore();
const router = useRouter();

const loading = ref(true);
const error = ref("");
const clubList = ref([]);

const isClubAdminView = computed(() => userStore.frontPermissions.canManageOwnClub);
const pageTitle = computed(() => (isClubAdminView.value ? "我的社团服务" : "我的社团"));
const emptyDescription = computed(() =>
  isClubAdminView.value
    ? "当前还没有你需要处理服务事项的社团。"
    : "加入社团后，这里会展示你参与的社团和相关入口。"
);

const fetchMyClubs = async () => {
  try {
    loading.value = true;
    const clubs = clubStore.myClubs.length ? clubStore.myClubs : await clubStore.getMyClubList();
    clubList.value = clubs || [];
    error.value = "";
  } catch (err) {
    error.value = getErrorMessage(err, "获取社团列表失败，请重试");
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

.manage-card {
  border: 1px solid var(--border-color);
  border-radius: 4px;
  padding: 15px;
  transition: all 0.3s;
  background-color: #fff;
}

.service-grid {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(280px, 1fr));
  gap: 20px;
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
  background-color: #eef6ff;
  color: #2563eb;
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

  .manage-card__footer {
    flex-direction: column;
    align-items: flex-start;
  }

  .manage-card__actions {
    justify-content: flex-start;
  }
}
</style>
