<template>
  <el-card class="notice-item" @click="handleClick">
    <div class="notice-header">
      <h3 class="notice-title">{{ notice.title }}</h3>
      <span class="notice-date">{{ formatDate(notice.createTime) }}</span>
    </div>
    <div class="notice-content">
      <p>{{ ellipsisContent(notice.content) }}</p>
    </div>
  </el-card>
</template>

<script setup>
import { defineProps, defineEmits } from "vue";
import dayjs from "dayjs"; // 统一使用 dayjs（项目中已有该依赖）

const props = defineProps({
  notice: {
    type: Object,
    required: true,
    default: () => ({
      id: "",
      title: "",
      content: "",
      createTime: "", // 添加 author 的默认值
    }),
  },
});

const emit = defineEmits(["click"]);

// 格式化日期（现在 format 函数已导入）
const formatDate = (time) => {
  return time ? dayjs(time).format("yyyy-MM-dd HH:mm") : "";
};

// 内容过长省略
const ellipsisContent = (content) => {
  if (content && content.length > 100) {
    return content.slice(0, 100) + "...";
  }
  return content || "";
};

const handleClick = () => {
  emit("click", props.notice.id);
};
</script>

<style scoped>
.notice-item {
  transition: all 0.3s;
  cursor: pointer;
  margin-bottom: 16px;
}

.notice-item:hover {
  transform: translateY(-3px);
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.1);
}

.notice-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 10px;
  padding-bottom: 10px;
  border-bottom: 1px dashed #e5e7eb;
}

.notice-title {
  font-size: 16px;
  font-weight: 500;
  color: var(--text-color); /* 替换#333 */
  margin: 0;
}

.notice-date {
  font-size: 12px;
  color: var(--text-light-color); /* 替换#666 */
}

.notice-content p {
  color: var(--text-light-color); /* 替换#666 */
}

.notice-content {
  margin-bottom: 15px;
}

.notice-footer {
  padding-top: 10px;
  border-top: 1px dashed #e5e7eb;
}

.notice-author {
  font-size: 12px;
  color: #666;
}
</style>
