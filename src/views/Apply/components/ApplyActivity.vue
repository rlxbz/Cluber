<template>
  <el-card>
    <div slot="header">
      <span>本社团活动发布</span>
    </div>

    <LoginRequiredState
      v-if="!userStore.isLogin"
      :redirect="route.fullPath"
      description="登录后可继续提交活动发布申请。"
    />

    <FrontLoadingState
      v-else-if="clubsLoading"
      compact
      title="社团信息加载中"
      description="正在准备你可以发布活动的社团列表。"
    />

    <FrontErrorState
      v-else-if="clubLoadError"
      compact
      :description="clubLoadError"
      @retry="getMyClubs"
    />

    <FrontEmptyState
      v-else-if="myClubs.length === 0"
      compact
      title="还没有可发布活动的社团"
      description="你当前没有可管理的社团，暂时无法提交活动发布。"
    />

    <el-form
      v-else
      ref="activityFormRef"
      :model="activityForm"
      :rules="rules"
      label-width="120px"
    >
      <!-- 活动名称 -->
      <el-form-item label="活动名称" prop="title">
        <el-input v-model="activityForm.title" placeholder="请输入活动名称" />
      </el-form-item>

      <!-- 所属社团 -->
      <el-form-item label="所属社团" prop="clubId">
        <el-select v-model="activityForm.clubId" placeholder="请选择所属社团">
          <el-option
            v-for="club in myClubs"
            :key="club.id"
            :label="club.name"
            :value="club.id"
          />
        </el-select>
      </el-form-item>

      <!-- 活动时间 -->
      <el-form-item label="活动时间" prop="time">
        <el-date-picker
          v-model="activityForm.time"
          type="datetime"
          placeholder="选择活动时间"
          style="width: 100%"
        />
      </el-form-item>

      <!-- 活动地点 -->
      <el-form-item label="活动地点" prop="location">
        <el-input v-model="activityForm.location" placeholder="请输入活动地点" />
      </el-form-item>

      <!-- 预计人数 -->
      <el-form-item label="预计人数" prop="maxParticipants">
        <el-input
          v-model.number="activityForm.maxParticipants"
          type="number"
          min="1"
          placeholder="请输入预计参与人数"
        />
      </el-form-item>

      <!-- 活动详情 -->
      <el-form-item label="活动详情" prop="description">
        <el-input
          v-model="activityForm.description"
          type="textarea"
          rows="6"
          placeholder="请输入活动详情"
        />
      </el-form-item>

      <!-- 提交按钮 -->
      <el-form-item>
        <el-button type="primary" @click="submitForm" :loading="isSubmitting">
          提交发布
        </el-button>
      </el-form-item>
    </el-form>
  </el-card>
</template>

<script setup>
import { ref, reactive, onMounted } from "vue";
import { useRoute } from "vue-router";
import { ElMessage } from "element-plus";
import { applyActivityAPI } from "@/apis/apply.js";
import { useClubStore } from "@/stores/clubStore";
import { useUserStore } from "@/stores/userStore";
import LoginRequiredState from "@/components/business/LoginRequiredState.vue";
import FrontLoadingState from "@/components/business/FrontLoadingState.vue";
import FrontEmptyState from "@/components/business/FrontEmptyState.vue";
import FrontErrorState from "@/components/business/FrontErrorState.vue";
import { getErrorMessage } from "@/utils/frontBusiness";

// 表单引用
const activityFormRef = ref(null);
// 提交状态
const isSubmitting = ref(false);
const route = useRoute();
const userStore = useUserStore();
// 我的社团列表
const myClubs = ref([]);
const clubsLoading = ref(false);
const clubLoadError = ref("");
const clubStore = useClubStore();

// 表单数据
const activityForm = reactive({
  title: "", // 活动名称
  clubId: "", // 所属社团ID
  time: "", // 活动时间
  location: "", // 活动地点
  maxParticipants: 0, // 预计人数
  description: "", // 活动详情
});

// 表单验证规则
const rules = {
  title: [
    { required: true, message: "请输入活动名称", trigger: "blur" },
    { min: 2, max: 50, message: "名称长度在 2-50 个字符", trigger: "blur" },
  ],
  clubId: [{ required: true, message: "请选择所属社团", trigger: "change" }],
  time: [{ required: true, message: "请选择活动时间", trigger: "change" }],
  location: [
    { required: true, message: "请输入活动地点", trigger: "blur" },
    { min: 2, max: 100, message: "地点长度在 2-100 个字符", trigger: "blur" },
  ],
  maxParticipants: [
    { required: true, message: "请输入预计人数", trigger: "blur" },
    { type: "number", min: 1, message: "人数不能小于1", trigger: "blur" },
  ],
  description: [
    { required: true, message: "请输入活动详情", trigger: "blur" },
    { max: 2000, message: "活动详情不能超过2000个字符", trigger: "blur" },
  ],
};

/**
 * 获取我的社团列表（用于选择所属社团）
 */
const getMyClubs = async () => {
  clubsLoading.value = true;
  clubLoadError.value = "";
  try {
    const clubs = await clubStore.getMyClubList();
    myClubs.value = clubs;
    // 如果只有一个社团，默认选中
    if (myClubs.value.length === 1) {
      activityForm.clubId = myClubs.value[0].id;
    }
  } catch (error) {
    clubLoadError.value = getErrorMessage(error, "获取社团列表失败，请稍后重试");
  } finally {
    clubsLoading.value = false;
  }
};

/**
 * 提交活动申请
 */
const submitForm = async () => {
  if (!activityFormRef.value) return;

  try {
    await activityFormRef.value.validate();

    if (!userStore.isLogin) {
      ElMessage.warning("你还未登录，登录后可继续提交活动发布");
      return;
    }

    isSubmitting.value = true;

    // 调用API提交申请
    await applyActivityAPI(activityForm);

    ElMessage.success("活动发布信息已提交，请留意后续审核结果");
    resetForm(); // 重置表单
  } catch (error) {
    if (error?.name !== "ValidationError") {
      ElMessage.error("提交失败：" + getErrorMessage(error, "未知错误"));
    }
  } finally {
    isSubmitting.value = false;
  }
};

/**
 * 重置表单
 */
const resetForm = () => {
  if (activityFormRef.value) {
    activityFormRef.value.resetFields();
  }
};

// 页面加载时获取社团列表
onMounted(() => {
  if (userStore.isLogin) {
    getMyClubs();
  }
});
</script>

<style scoped>
.action-area {
  margin-top: 20px;
  text-align: right;
}
</style>
