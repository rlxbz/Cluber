<template>
  <el-card>
    <div slot="header">
      <span>创建社团申请</span>
    </div>

    <el-form ref="formRef" :model="form" :rules="rules" label-width="120px">
      <!-- 社团名称 -->
      <el-form-item label="社团名称" prop="name">
        <el-input v-model="form.name" placeholder="请输入社团名称" />
      </el-form-item>

      <!-- 社团类型 -->
      <el-form-item label="社团类型" prop="category">
        <el-select v-model="form.category" placeholder="请选择社团类型">
          <el-option label="学术研究" value="academic" />
          <el-option label="文化体育" value="culture" />
          <el-option label="志愿公益" value="volunteer" />
          <el-option label="兴趣爱好" value="hobby" />
        </el-select>
      </el-form-item>

      <!-- 社团简介 -->
      <el-form-item label="社团简介" prop="description">
        <el-input
          v-model="form.description"
          type="textarea"
          rows="4"
          placeholder="请输入社团简介"
        />
      </el-form-item>

      <!-- 申请理由 -->
      <el-form-item label="申请理由" prop="reason">
        <el-input
          v-model="form.reason"
          type="textarea"
          rows="4"
          placeholder="请说明创建社团的理由"
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
import { ref, reactive } from "vue";
import { ElMessage } from "element-plus";
import { applyCreateClubAPI } from "@/apis/apply.js";

// 表单引用
const formRef = ref(null);
// 提交状态
const isSubmitting = ref(false);

// 表单数据
const form = reactive({
  name: "", // 社团名称
  category: "", // 社团类型
  description: "", // 社团简介
  reason: "", // 申请理由
});

// 表单验证规则
const rules = {
  name: [
    { required: true, message: "请输入社团名称", trigger: "blur" },
    { min: 2, max: 20, message: "名称长度在 2-20 个字符", trigger: "blur" },
  ],
  category: [{ required: true, message: "请选择社团类型", trigger: "change" }],
  description: [
    { required: true, message: "请输入社团简介", trigger: "blur" },
    { min: 10, max: 500, message: "简介长度在 10-500 个字符", trigger: "blur" },
  ],
  reason: [
    { required: true, message: "请输入申请理由", trigger: "blur" },
    { min: 20, max: 1000, message: "理由长度在 20-1000 个字符", trigger: "blur" },
  ],
};

/**
 * 提交申请表单
 */
const submitForm = async () => {
  if (!formRef.value) return;

  try {
    // 表单验证
    await formRef.value.validate();
    isSubmitting.value = true;

    // 调用API提交申请
    await applyCreateClubAPI(form);
    ElMessage.success("社团创建申请提交成功，等待审核");

    // 重置表单
    formRef.value.resetFields();
  } catch (error) {
    if (error.name !== "ValidationError") {
      ElMessage.error("提交失败：" + (error.message || "未知错误"));
    }
  } finally {
    isSubmitting.value = false;
  }
};
</script>
