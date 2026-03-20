<template>
  <div class="club-list-page">
    <div class="page-header">
      <div>
        <h1>社团广场</h1>
        <p class="page-desc">按名称或类别筛选，快速找到你想加入的社团。</p>
      </div>

      <ListFilterBar
        v-model:keyword="searchKey"
        v-model:filters="filters"
        :filter-items="filterItems"
        placeholder="搜索社团名称或关键词"
        action-text="查找社团"
        @search="handleSearch"
      />
    </div>

    <FrontLoadingState
      v-if="loading"
      title="社团加载中"
      description="正在整理社团广场内容，请稍等一下。"
    />

    <FrontErrorState
      v-else-if="error"
      :description="error"
      @retry="loadClubList"
    />

    <FrontEmptyState
      v-else-if="clubList.length === 0"
      title="还没有找到社团"
      description="换个关键词或类别试试，也可以稍后再来看看。"
      action-text="重新加载"
      @action="loadClubList"
    />

    <ClubList v-else :clubs="clubList" @item-click="goToDetail" />

    <div v-if="clubStore.total > 0" class="pagination-container mt-20">
      <el-pagination
        v-model:current-page="clubStore.currentPage"
        v-model:page-size="clubStore.pageSize"
        :total="clubStore.total"
        :page-sizes="[5, 10, 20]"
        layout="total, sizes, prev, pager, next, jumper"
        @size-change="handleSizeChange"
        @current-change="handlePageChange"
      />
    </div>
  </div>
</template>

<script setup>
import { computed, ref, watch, onMounted } from "vue";
import { useRouter } from "vue-router";
import { useClubStore } from "@/stores/clubStore";
import ListFilterBar from "@/components/business/ListFilterBar.vue";
import FrontLoadingState from "@/components/business/FrontLoadingState.vue";
import FrontEmptyState from "@/components/business/FrontEmptyState.vue";
import FrontErrorState from "@/components/business/FrontErrorState.vue";
import ClubList from "./components/ClubList.vue";
import { getErrorMessage } from "@/utils/frontBusiness";

const router = useRouter();
const clubStore = useClubStore();
const searchKey = ref(clubStore.searchKey);
const filters = ref({
  category: clubStore.category,
});
const clubList = ref([]);
const loading = ref(false);
const error = ref("");
const filterItems = computed(() => {
  const categories = [...new Set(clubList.value.map((club) => club.category).filter(Boolean))];

  if (!categories.length) {
    return [];
  }

  return [
    {
      key: "category",
      placeholder: "社团类别",
      options: [{ label: "全部类别", value: "" }, ...categories.map((item) => ({
        label: item,
        value: item,
      }))],
    },
  ];
});

watch(searchKey, (newVal) => {
  clubStore.setSearchKey(newVal);
});

watch(
  () => filters.value.category,
  (newVal) => {
    clubStore.setCategory(newVal);
  }
);

const loadClubList = async () => {
  loading.value = true;
  error.value = "";
  try {
    const result = await clubStore.getClubList({
      page: clubStore.currentPage,
      size: clubStore.pageSize,
      searchKey: searchKey.value,
      category: filters.value.category,
    });
    clubList.value = result.list || [];
  } catch (err) {
    console.error("获取社团列表失败:", err);
    error.value = getErrorMessage(err, "加载社团列表失败，请重试");
    clubList.value = [];
  } finally {
    loading.value = false;
  }
};

const handleSearch = async () => {
  clubStore.currentPage = 1;
  await loadClubList();
};

onMounted(() => {
  searchKey.value = clubStore.searchKey;
  loadClubList();
});

const handleSizeChange = async (size) => {
  clubStore.pageSize = size;
  clubStore.currentPage = 1;
  await loadClubList();
};

const handlePageChange = async (page) => {
  clubStore.currentPage = page;
  await loadClubList();
};

const goToDetail = (id) => {
  router.push(`/club/${id}`);
};
</script>

<style scoped>
.club-list-page {
  padding: 20px;
}

.page-header {
  display: flex;
  justify-content: space-between;
  align-items: flex-start;
  gap: 16px;
  margin-bottom: 20px;
}

.page-header h1 {
  margin: 0 0 6px;
}

.page-desc {
  margin: 0;
  color: var(--text-light-color);
}

.pagination-container {
  text-align: right;
}

@media (max-width: 768px) {
  .page-header {
    flex-direction: column;
  }
}
</style>
