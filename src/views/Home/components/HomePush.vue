<template>
  <div class="home-push-container">
    <div class="push-title">
      <h3>社团推送</h3>
      <a href="/push" class="more-link">查看更多 →</a>
    </div>

    <div class="push-list">
      <FrontLoadingState
        v-if="pushStore.loading"
        compact
        title="动态加载中"
        description="正在整理最近的社团动态。"
      />

      <FrontErrorState
        v-else-if="pushStore.error"
        compact
        :description="pushStore.error"
        @retry="loadPushList"
      />

      <template v-else-if="pushList.length > 0">
        <div
          v-for="push in pushList"
          :key="push.id"
          class="push-item"
          @click="handlePushClick(push)"
        >
          <div class="push-content">
            <h4 class="push-title">{{ push.title }}</h4>
            <p class="push-desc">{{ push.content }}</p>
          </div>
          <div class="push-meta">
            <span class="source">{{ push.clubName }}</span>
            <span class="time">{{ formatTime(push.createTime) }}</span>
          </div>
        </div>
      </template>

      <FrontEmptyState
        v-else
        compact
        title="暂时还没有动态"
        description="等社团发布新动态后，这里会第一时间显示。"
      />
    </div>
  </div>
</template>

<script setup>
import { onMounted, ref } from "vue";
import { usePushStore } from "@/stores/pushStore";
import { useRouter } from "vue-router";
import dayjs from "dayjs";
import FrontLoadingState from "@/components/business/FrontLoadingState.vue";
import FrontEmptyState from "@/components/business/FrontEmptyState.vue";
import FrontErrorState from "@/components/business/FrontErrorState.vue";

// 初始化Store和路由
const pushStore = usePushStore();
const router = useRouter();
const pushList = ref([]);

// 格式化时间
const formatTime = (time) => {
  return dayjs(time).format("YYYY-MM-DD");
};

// 点击推送项跳转详情页
const handlePushClick = (push) => {
  router.push(`/push/${push.id}`);
};

const loadPushList = async () => {
  const result = await pushStore.getPushList({ limit: 5 });
  pushList.value = result.list || [];
};

onMounted(loadPushList);
</script>

<style scoped>
.home-push-container {
  margin: 20px 0;
  padding: 15px;
  color: var(--text-color); /* 替换#333 */
  border-radius: 8px;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.08);
}

.push-title {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 15px;
  padding-bottom: 10px;
  border-bottom: 1px solid #eee;
  color: var(--text-color); /* 替换#333 */
}

.push-title h3 {
  margin: 0;
  font-size: 18px;
  color: #333;
}

.more-link {
  color: #409eff;
  text-decoration: none;
  font-size: 14px;
}

.push-list {
  display: flex;
  flex-direction: column;
  gap: 12px;
}

.push-item {
  padding: 10px;
  border-radius: 4px;
  border-left: 3px solid #409eff;
  color: var(--text-color); /* 替换#333 */
  cursor: pointer;
  transition: all 0.3s;
}

.push-item:hover {
  transform: translateY(-2px);
  box-shadow: 0 2px 10px rgba(0, 0, 0, 0.1);
}

.push-content .push-title {
  margin: 0 0 5px 0;
  font-size: 16px;
  color: #333;
  border: none;
  padding: 0;
}

.push-desc {
  margin: 0;
  font-size: 14px;
  color: #666;
  display: -webkit-box;
  -webkit-box-orient: vertical;
  overflow: hidden;
}

.push-meta {
  display: flex;
  justify-content: space-between;
  margin-top: 8px;
  font-size: 12px;
  color: #999;
}

.empty-state {
  text-align: center;
  padding: 30px 0;
  color: #999;
  font-size: 14px;
}
</style>
