<template>
  <el-card title="活动举办申请" class="mt-20">
    <el-form
      ref="activityFormRef"
      :model="activityForm"
      :rules="formRules"
      label-width="120px"
      class="mt-10"
    >
      <el-form-item label="活动名称" prop="title">
        <el-input
          v-model="activityForm.title"
          placeholder="请输入活动名称"
          maxlength="50"
        />
      </el-form-item>

      <el-form-item label="活动类型" prop="type">
        <el-select v-model="activityForm.type" placeholder="请选择活动类型">
          <el-option label="学术讲座" value="lecture" />
          <el-option label="文体活动" value="recreation" />
          <el-option label="志愿服务" value="volunteer" />
          <el-option label="其他活动" value="other" />
        </el-select>
      </el-form-item>

      <el-form-item label="活动时间" prop="time">
        <el-date-picker
          v-model="activityForm.time"
          type="datetime"
          placeholder="选择活动时间"
          format="YYYY-MM-DD HH:mm"
          value-format="YYYY-MM-DD HH:mm"
        />
      </el-form-item>

      <el-form-item label="活动地点" prop="location">
        <el-input
          v-model="activityForm.location"
          placeholder="请输入活动地点"
          maxlength="100"
        />
      </el-form-item>

      <el-form-item label="活动简介" prop="intro">
        <el-input
          v-model="activityForm.intro"
          type="textarea"
          rows="3"
          placeholder="请输入活动简介"
          maxlength="200"
        />
      </el-form-item>

      <el-form-item label="活动详情" prop="content">
        <el-input
          v-model="activityForm.content"
          type="textarea"
          rows="6"
          placeholder="请详细描述活动内容、流程等信息"
          maxlength="2000"
        />
      </el-form-item>

      <el-form-item label="预计人数" prop="maxParticipants">
        <el-input-number
          v-model="activityForm.maxParticipants"
          :min="1"
          :max="500"
          placeholder="请输入预计参与人数"
        />
      </el-form-item>

      <el-form-item label="所属社团" prop="clubId">
        <el-select v-model="activityForm.clubId" placeholder="请选择举办活动的社团">
          <el-option
            v-for="club in myClubs"
            :key="club.id"
            :label="club.name"
            :value="club.id"
          />
        </el-select>
      </el-form-item>

      <el-form-item>
        <div class="action-area" style="text-align: center">
          <el-button type="primary" @click="submitForm" :loading="isSubmitting">
            提交申请
          </el-button>
          <el-button @click="resetForm">重置</el-button>
        </div>
      </el-form-item>
    </el-form>
  </el-card>
</template>

<script setup>
import { ref, reactive, onMounted } from "vue";
import { useToast } from "element-plus";
import { applyActivityAPI } from "@/apis/apply";
import { useClubStore } from "@/stores/clubStore";

// 表单引用
const activityFormRef = ref(null);
const isSubmitting = ref(false);
const toast = useToast();
const clubStore = useClubStore();

// 我的社团列表
const myClubs = ref([]);

// 表单数据
const activityForm = reactive({
  title: "",
  type: "",
  time: "",
  location: "",
  intro: "",
  content: "",
  maxParticipants: 30,
  clubId: "",
});

// 表单验证规则
const formRules = reactive({
  title: [
    { required: true, message: "请输入活动名称", trigger: "blur" },
    { max: 50, message: "活动名称不能超过50个字符", trigger: "blur" },
  ],
  type: [{ required: true, message: "请选择活动类型", trigger: "change" }],
  time: [{ required: true, message: "请选择活动时间", trigger: "change" }],
  location: [
    { required: true, message: "请输入活动地点", trigger: "blur" },
    { max: 100, message: "活动地点不能超过100个字符", trigger: "blur" },
  ],
  intro: [
    { required: true, message: "请输入活动简介", trigger: "blur" },
    { max: 200, message: "活动简介不能超过200个字符", trigger: "blur" },
  ],
  content: [
    { required: true, message: "请输入活动详情", trigger: "blur" },
    { max: 2000, message: "活动详情不能超过2000个字符", trigger: "blur" },
  ],
  maxParticipants: [{ required: true, message: "请输入预计人数", trigger: "blur" }],
  clubId: [{ required: true, message: "请选择所属社团", trigger: "change" }],
});

/**
 * 获取我的社团列表
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
    toast.error("获取社团列表失败：" + (error.message || ""));
  }
};

/**
 * 提交表单
 */
const submitForm = async () => {
  if (!activityFormRef.value) return;

  try {
    await activityFormRef.value.validate();
    isSubmitting.value = true;

    // 调用API提交申请
    await applyActivityAPI(activityForm);

    toast.success("活动举办申请提交成功，等待审核");
    resetForm();
  } catch (error) {
    if (error.name !== "ValidationError") {
      toast.error("提交失败：" + (error.message || "未知错误"));
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
