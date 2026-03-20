<template>
  <div class="activity-detail-page">
    <FrontLoadingState
      v-if="loading"
      title="活动详情加载中"
      description="正在整理这场活动的最新信息。"
    />

    <FrontErrorState
      v-else-if="error"
      :description="error"
      @retry="fetchActivityDetail"
    />

    <FrontEmptyState
      v-else-if="!activityDetail"
      title="没有找到这场活动"
      description="活动可能已下线或链接有误，你可以返回活动列表继续查看其他内容。"
      action-text="返回活动列表"
      @action="router.push('/activity')"
    />

    <el-card v-else>
      <div class="activity-header">
        <div class="activity-heading">
          <h1 class="activity-title">{{ activityDetail.title }}</h1>
          <ActivitySignUpStatus :activity="activityDetail" />
        </div>

        <div class="activity-actions">
          <LoginRequiredState
            v-if="!userStore.isLogin"
            compact
            :redirect="route.fullPath"
            description="登录后即可继续报名这场活动。"
          />
          <template v-else>
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
          </template>
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
import { computed, ref, watch } from "vue";
import { useRoute, useRouter } from "vue-router";
import { ElMessage } from "element-plus";
import {
  getActivityDetailAPI,
  signUpActivityAPI,
  cancelSignUpAPI,
} from "@/apis/activity";
import ActivitySignUpStatus from "@/components/business/ActivitySignUpStatus.vue";
import FrontLoadingState from "@/components/business/FrontLoadingState.vue";
import FrontEmptyState from "@/components/business/FrontEmptyState.vue";
import FrontErrorState from "@/components/business/FrontErrorState.vue";
import LoginRequiredState from "@/components/business/LoginRequiredState.vue";
import { getActivitySignupStatusMeta, getErrorMessage } from "@/utils/frontBusiness";
import { useUserStore } from "@/stores/userStore";

const route = useRoute();
const router = useRouter();
const userStore = useUserStore();
const activityId = computed(() => route.params.id);

const activityDetail = ref(null);
const loading = ref(true);
const error = ref("");
const signUpLoading = ref(false);
const cancelLoading = ref(false);
const signUpStatusMeta = computed(() => getActivitySignupStatusMeta(activityDetail.value || {}));
const canSignUp = computed(() => signUpStatusMeta.value.key === "available");
const canCancelSignUp = computed(() => Boolean(activityDetail.value?.isSigned));

const formatActivityType = (type) => {
  const typeMap = {
    lecture: "学术讲座",
    recreation: "文体活动",
    volunteer: "志愿服务",
    other: "其他活动",
  };
  return typeMap[type] || type;
};

const fetchActivityDetail = async () => {
  const currentActivityId = activityId.value;

  if (!currentActivityId || Number.isNaN(Number(currentActivityId))) {
    activityDetail.value = null;
    error.value = "活动编号无效，请返回活动列表重新选择。";
    loading.value = false;
    return;
  }

  try {
    loading.value = true;
    error.value = "";
    const res = await getActivityDetailAPI(currentActivityId);
    activityDetail.value = res.data || null;
  } catch (err) {
    activityDetail.value = null;
    error.value = getErrorMessage(err, "获取活动详情失败，请稍后重试");
  } finally {
    loading.value = false;
  }
};

const handleSignUp = async () => {
  if (!userStore.isLogin) {
    ElMessage.warning("你还未登录，登录后可继续报名");
    return;
  }

  if (!canSignUp.value) {
    ElMessage.warning(signUpStatusMeta.value.text);
    return;
  }

  try {
    signUpLoading.value = true;
    await signUpActivityAPI(activityId.value);
    ElMessage.success("报名成功！");
    await fetchActivityDetail();
  } catch (error) {
    ElMessage.error(
      "报名失败：" + getErrorMessage(error, "请稍后重试")
    );
  } finally {
    signUpLoading.value = false;
  }
};

const handleCancelSignUp = async () => {
  try {
    cancelLoading.value = true;
    await cancelSignUpAPI(activityId.value);
    ElMessage.success("取消报名成功！");
    await fetchActivityDetail();
  } catch (error) {
    ElMessage.error(
      "取消报名失败：" + getErrorMessage(error, "请稍后重试")
    );
  } finally {
    cancelLoading.value = false;
  }
};

watch(activityId, fetchActivityDetail, { immediate: true });
</script>

<style scoped>
.activity-detail-page {
  padding: 20px;
}

.activity-header {
  display: flex;
  justify-content: space-between;
  align-items: flex-start;
  gap: 16px;
  margin-bottom: 20px;
}

.activity-heading {
  display: flex;
  flex-direction: column;
  gap: 10px;
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

@media (max-width: 768px) {
  .activity-header {
    flex-direction: column;
  }
}
</style>
