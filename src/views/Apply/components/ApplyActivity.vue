<template>
  <el-card>
    <div slot="header">
      <span>活动举办申请</span>
    </div>

    <el-form
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
          提交申请
        </el-button>
      </el-form-item>
    </el-form>
  </el-card>
</template>

<script setup>
import { ref, reactive, onMounted } from "vue";
import { ElMessage } from "element-plus";
import { applyActivityAPI } from "@/apis/apply.js";
import { useClubStore } from "@/stores/clubStore";

// 表单引用
const activityFormRef = ref(null);
// 提交状态
const isSubmitting = ref(false);
// 我的社团列表
const myClubs = ref([]);
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
  try {
    const clubs = await clubStore.getMyClubList();
    myClubs.value = clubs;
    // 如果只有一个社团，默认选中
    if (myClubs.value.length === 1) {
      activityForm.clubId = myClubs.value[0].id;
    }
  } catch (error) {
    ElMessage.error("获取社团列表失败：" + (error.message || ""));
  }
};

/**
 * 提交活动申请
 */
const submitForm = async () => {
  if (!activityFormRef.value) return;

  try {
    await activityFormRef.value.validate();
    isSubmitting.value = true;

    // 调用API提交申请
    await applyActivityAPI(activityForm);

    ElMessage.success("活动举办申请提交成功，等待审核");
    resetForm(); // 重置表单
  } catch (error) {
    if (error.name !== "ValidationError") {
      ElMessage.error("提交失败：" + (error.message || "未知错误"));
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
  getMyClubs();
});
</script>

<style scoped>
.action-area {
  margin-top: 20px;
  text-align: right;
}
</style>
