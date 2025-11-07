<template>
  <div class="activity-detail-page">
    <el-card v-if="!loading && activityDetail">
      <div class="activity-header">
        <h1 class="activity-title">{{ activityDetail.title }}</h1>
        <div class="activity-actions">
          <el-button
            v-if="canCancelSignUp"
            @click="handleCancelSignUp"
            :loading="cancelLoading"
            type="warning"
          >
            取消报名
          </el-button>
          <el-button
            v-if="canSignUp"
            @click="handleSignUp"
            :loading="signUpLoading"
            type="primary"
          >
            立即报名
          </el-button>
        </div>
      </div>

      <div class="activity-info">
        <div class="info-item">
          <span class="label">活动类型：</span>
          <span>{{ formatActivityType(activityDetail.type) }}</span>
        </div>
        <div class="info-item">
          <span class="label">活动时间：</span>
          <span>{{ activityDetail.time }}</span>
        </div>
        <div class="info-item">
          <span class="label">活动地点：</span>
          <span>{{ activityDetail.location }}</span>
        </div>
        <div class="info-item">
          <span class="label">所属社团：</span>
          <span>{{ activityDetail.clubName }}</span>
        </div>
        <div class="info-item">
          <span class="label">报名人数：</span>
          <span
            >{{ activityDetail.currentParticipants }}/{{
              activityDetail.maxParticipants
            }}</span
          >
        </div>
      </div>

      <div class="activity-content">
        <h3>活动简介</h3>
        <p>{{ activityDetail.intro }}</p>
      </div>

      <div class="activity-content">
        <h3>活动详情</h3>
        <p>{{ activityDetail.content }}</p>
      </div>
    </el-card>
  </div>
</template>

<script setup>
import { ref, onMounted } from "vue";
import { useRoute } from "vue-router";
import { ElMessage } from "element-plus";
import {
  getActivityDetailAPI,
  signUpActivityAPI,
  cancelSignUpAPI,
} from "@/apis/activity";

// 路由参数
const route = useRoute();
const activityId = route.params.id;

// 页面状态
const activityDetail = ref(null);
const loading = ref(true);
const signUpLoading = ref(false);
const cancelLoading = ref(false);

// 计算属性：是否可报名
const canSignUp = ref(false);
// 计算属性：是否可取消报名
const canCancelSignUp = ref(false);

/**
 * 格式化活动类型显示文本
 */
const formatActivityType = (type) => {
  const typeMap = {
    lecture: "学术讲座",
    recreation: "文体活动",
    volunteer: "志愿服务",
    other: "其他活动",
  };
  return typeMap[type] || type;
};

/**
 * 获取活动详情
 */
const fetchActivityDetail = async () => {
  try {
    loading.value = true;
    const res = await getActivityDetailAPI(activityId);
    activityDetail.value = res.data;

    // 更新报名状态
    canSignUp.value =
      res.data.currentParticipants < res.data.maxParticipants && !res.data.isSigned;
    canCancelSignUp.value = res.data.isSigned;
  } catch (error) {
    ElMessage.error("获取活动详情失败：" + (error.message || "未知错误"));
  } finally {
    loading.value = false;
  }
};

/**
 * 处理活动报名
 */
const handleSignUp = async () => {
  if (!canSignUp.value) {
    ElMessage.warning("活动名额已满，无法报名");
    return;
  }

  try {
    signUpLoading.value = true;
    await signUpActivityAPI(activityId);
    ElMessage.success("报名成功！");
    fetchActivityDetail(); // 刷新详情
  } catch (error) {
    ElMessage.error(
      "报名失败：" + (error.response?.data?.message || error.message || "操作失败")
    );
  } finally {
    signUpLoading.value = false;
  }
};

/**
 * 处理取消报名
 */
const handleCancelSignUp = async () => {
  try {
    cancelLoading.value = true;
    await cancelSignUpAPI(activityId);
    ElMessage.success("取消报名成功！");
    fetchActivityDetail(); // 刷新详情
  } catch (error) {
    ElMessage.error(
      "取消报名失败：" + (error.response?.data?.message || error.message || "操作失败")
    );
  } finally {
    cancelLoading.value = false;
  }
};

// 页面挂载时加载数据
onMounted(() => {
  fetchActivityDetail();
});
</script>

<style scoped>
.activity-detail-page {
  padding: 20px;
}

.activity-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 20px;
}

.activity-title {
  margin: 0;
  font-size: 24px;
}

.activity-info {
  margin: 20px 0;
  border-bottom: 1px solid #eee;
  padding-bottom: 20px;
}

.info-item {
  margin: 10px 0;
}

.label {
  font-weight: bold;
  margin-right: 10px;
}

.activity-content {
  margin: 20px 0;
}

.activity-content h3 {
  border-left: 4px solid #409eff;
  padding-left: 10px;
  margin-bottom: 10px;
}
</style>
