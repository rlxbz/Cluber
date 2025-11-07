<template>
  <div class="home-push-container">
    <div class="push-title">
      <h3>社团推送</h3>
      <a href="/push" class="more-link">查看更多 →</a>
    </div>

    <div class="push-list">
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

      <div v-if="pushList.length === 0" class="empty-state">暂无推送内容</div>
    </div>
  </div>
</template>

<script setup>
import { onMounted, ref } from "vue";
import { usePushStore } from "@/stores/pushStore";
import { useRouter } from "vue-router";
import dayjs from "dayjs";

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

// 页面加载时获取推送列表
onMounted(async () => {
  const list = await pushStore.getPushList({ limit: 5 }); // 获取前5条推送
  pushList.value = list;
});
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
