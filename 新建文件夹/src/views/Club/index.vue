<template>
  <div class="club-list-page">
    <!-- 搜索区域 -->
    <div class="search-bar">
      <el-input
        v-model="searchKey"
        placeholder="搜索社团名称或关键词"
        clearable
        @clear="handleSearch"
        @keyup.enter="handleSearch"
      >
        <template #append>
          <el-button type="primary" @click="handleSearch">
            <el-icon>
              <Search />
            </el-icon>
            搜索
          </el-button>
        </template>
      </el-input>
    </div>

    <!-- 社团列表 -->
    <div class="club-grid" v-loading="loading">
      <ClubCard
        v-for="club in clubList"
        :key="club.id"
        :club="club"
        @click="goToDetail(club.id)"
      />
    </div>

    <!-- 无数据状态 -->
    <div v-if="clubList.length === 0 && !loading" class="no-data">
      <el-empty description="暂无社团数据" />
    </div>

    <!-- 分页组件 -->
    <div class="pagination-container mt-20">
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
import { ref, watch, onMounted } from "vue";
import { useRouter } from "vue-router";
import { useClubStore } from "@/stores/clubStore";
import ClubCard from "./components/ClubCard.vue";
import { ElMessage, ElEmpty } from "element-plus";
import { Search } from "@element-plus/icons-vue";

const router = useRouter();
const clubStore = useClubStore();
const searchKey = ref(clubStore.searchKey);
const category = ref(clubStore.category);
const clubList = ref([]);
const loading = ref(false);

// 监听搜索关键词变化
watch(searchKey, (newVal) => {
  clubStore.setSearchKey(newVal);
});

// 监听分类变化
watch(category, (newVal) => {
  clubStore.setCategory(newVal);
});

// 同时修正初始化加载逻辑
const loadClubList = async () => {
  const result = await clubStore.getClubList();
  clubList.value = result.list || [];
};

// 页面加载时获取列表
loadClubList();

// 搜索处理
const handleSearch = async () => {
  loading.value = true;
  try {
    const result = await clubStore.getClubList({
      searchKey: searchKey.value,
    });
    // 正确提取接口返回的 list 数组（而非整个 result 对象）
    clubList.value = result.list || [];
  } catch (error) {
    console.error("获取社团列表失败:", error);
    ElMessage.error("加载社团列表失败，请重试");
    clubList.value = [];
  } finally {
    loading.value = false;
  }
};

onMounted(() => {
  searchKey.value = clubStore.searchKey;
  loadClubList(); // 初始化时也需要正确加载
});

// 分页大小变化
const handleSizeChange = async (size) => {
  clubStore.pageSize = size;
  await loadClubList();
};

// 页码变化
const handlePageChange = async (page) => {
  clubStore.currentPage = page;
  await loadClubList();
};

// 跳转到详情页
const goToDetail = (id) => {
  router.push(`/club/${id}`);
};
</script>

<style scoped>
.club-list-page {
  padding: 20px;
}

.club-grid {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(280px, 1fr));
  gap: 20px;
  margin-top: 20px;
}

.pagination-container {
  text-align: right;
}

.no-data {
  padding: 50px 0;
  text-align: center;
}
</style>
