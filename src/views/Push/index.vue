<template>
  <div class="push-page">
    <div class="page-header">
      <h2>社团推送</h2>
    </div>

    <el-input
      v-model="searchKey"
      placeholder="搜索推送内容..."
      class="search-input"
      clearable
      @clear="handleSearch"
      @keyup.enter="handleSearch"
    >
      <template #append>
        <el-button type="primary" @click="handleSearch">搜索</el-button>
      </template>
    </el-input>

    <div v-if="loading" class="loading-container">
      <el-loading-spinner />
    </div>

    <!-- <div v-if="error" class="error-message">
      <el-alert
        title="加载失败"
        description="获取推送列表时发生错误，请稍后重试"
        type="error"
        show-icon
      />
    </div> -->

    <div v-if="!loading && !error && pushList.length === 0" class="no-data">
      <el-empty description="暂无推送数据" />
    </div>

    <div v-else class="push-list">
      <PushItem v-for="push in pushList" :key="push.id" :push="push" />
    </div>

    <div class="pagination-container" v-if="total > 0">
      <el-pagination
        v-model:current-page="page"
        v-model:page-size="size"
        :total="total"
        :page-sizes="[10, 20, 30]"
        layout="total, sizes, prev, pager, next, jumper"
        @size-change="handleSizeChange"
        @current-change="handlePageChange"
      />
    </div>
  </div>
</template>

<script setup>
import { ref, onMounted } from "vue";
import { usePushStore } from "@/stores/pushStore";
import PushItem from "./components/PushItem.vue";
import { getPushListAPI } from "@/apis/push";

// 状态管理
const pushStore = usePushStore();
const loading = ref(false);
const error = ref(false);
const pushList = ref([]);
const total = ref(0);

// 分页参数
const page = ref(1);
const size = ref(10);
const searchKey = ref("");

// 获取推送列表
const fetchPushList = async () => {
  loading.value = true;
  error.value = false;
  try {
    const params = {
      page: page.value,
      size: size.value,
      searchKey: searchKey.value,
    };
    const res = await getPushListAPI(params);
    pushList.value = res.data.list;
    total.value = res.data.total;
    // 同步到store
    pushStore.setPushList(res.data.list);
  } catch (err) {
    console.error("获取推送列表失败:", err);
    error.value = true;
  } finally {
    loading.value = false;
  }
};

// 搜索处理
const handleSearch = () => {
  page.value = 1;
  fetchPushList();
};

// 分页处理
const handleSizeChange = (newSize) => {
  size.value = newSize;
  page.value = 1;
  fetchPushList();
};

const handlePageChange = (newPage) => {
  page.value = newPage;
  fetchPushList();
};

// 初始化加载
onMounted(() => {
  fetchPushList();
});
</script>

<style scoped>
.push-page {
  padding: 20px;
}

.page-header {
  margin-bottom: 20px;
  border-bottom: 1px solid var(--border-color);
  padding-bottom: 10px;
}

.search-input {
  width: 400px;
  margin-bottom: 20px;
}

.loading-container {
  min-height: 300px;
  display: flex;
  align-items: center;
  justify-content: center;
}

.push-list {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(300px, 1fr));
  gap: 20px;
}

.pagination-container {
  margin-top: 20px;
  text-align: right;
}

.no-data {
  padding: 50px 0;
}

@media (max-width: 768px) {
  .search-input {
    width: 100%;
  }

  .push-list {
    grid-template-columns: 1fr;
  }
}
</style>
