<template>
  <el-card class="push-item" hoverable @click="handleClick">
    <div class="push-header">
      <h3 class="push-title">{{ push.title }}</h3>
      <span class="push-date">{{ formatDate(push.createTime) }}</span>
    </div>
    <div class="push-content">
      <p>{{ push.content }}</p>
    </div>
    <div class="push-footer">
      <span class="push-club">{{ push.clubName }}</span>
      <el-tag size="small" v-if="push.isTop">置顶</el-tag>
    </div>
  </el-card>
</template>

<script setup>
import { format } from "date-fns";
import { useRouter } from "vue-router";

const router = useRouter();
const props = defineProps({
  push: {
    type: Object,
    required: true,
    default: () => ({
      id: "",
      title: "",
      content: "",
      createTime: "",
      clubName: "",
      isTop: false,
    }),
  },
});

// 格式化日期
const formatDate = (time) => {
  return time ? format(new Date(time), "yyyy-MM-dd HH:mm") : "";
};

// 点击跳转详情页
const handleClick = () => {
  router.push(`/push/${props.push.id}`);
};
</script>

<style scoped>
.push-item {
  transition: transform 0.2s;
  cursor: pointer;
}

.push-item:hover {
  transform: translateY(-3px);
}

.push-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 10px;
}

.push-title {
  font-size: 16px;
  font-weight: 500;
  color: var(--text-color);
  margin: 0;
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
  max-width: 70%;
}

.push-date {
  font-size: 12px;
  color: var(--text-light-color);
}

.push-content {
  margin-bottom: 15px;
}

.push-content p {
  margin: 0;
  font-size: 14px;
  color: var(--text-light-color);
  display: -webkit-box;
  -webkit-box-orient: vertical;
  -webkit-line-clamp: 2;
  overflow: hidden;
}

.push-footer {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding-top: 10px;
  border-top: 1px dashed var(--border-color);
}

.push-club {
  font-size: 12px;
  color: var(--primary-color);
}
</style>
