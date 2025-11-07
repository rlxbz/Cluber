<template>
  <div class="member-info">
    <el-card>
      <div slot="header" class="card-header">
        <h2>个人信息</h2>
        <el-button v-if="!isEditing" type="primary" @click="isEditing = true">
          编辑信息
        </el-button>
      </div>

      <el-form ref="infoForm" :model="userInfo" label-width="120px" class="info-form">
        <el-form-item label="用户名">
          <span>{{ userInfo.username || "未设置" }}</span>
        </el-form-item>

        <el-form-item label="姓名" prop="name" v-if="isEditing">
          <el-input v-model="userInfo.name" />
        </el-form-item>
        <el-form-item label="姓名" v-else>
          <span>{{ userInfo.name || "未设置" }}</span>
        </el-form-item>

        <el-form-item label="邮箱" prop="email" v-if="isEditing">
          <el-input v-model="userInfo.email" type="email" />
        </el-form-item>
        <el-form-item label="邮箱" v-else>
          <span>{{ userInfo.email || "未设置" }}</span>
        </el-form-item>

        <el-form-item label="手机号" prop="phone" v-if="isEditing">
          <el-input v-model="userInfo.phone" />
        </el-form-item>
        <el-form-item label="手机号" v-else>
          <span>{{ userInfo.phone || "未设置" }}</span>
        </el-form-item>

        <el-form-item label="个人简介" v-if="isEditing">
          <el-input v-model="userInfo.introduction" type="textarea" rows="4" />
        </el-form-item>
        <el-form-item label="个人简介" v-else>
          <p class="introduction-content">{{ userInfo.introduction || "未填写简介" }}</p>
        </el-form-item>

        <el-form-item v-if="isEditing">
          <el-button type="primary" @click="handleUpdate"> 保存修改 </el-button>
          <el-button @click="handleCancel" style="margin-left: 10px"> 取消 </el-button>
        </el-form-item>
      </el-form>
    </el-card>
  </div>
</template>

<script setup>
import { ref, onMounted, reactive, toRefs } from "vue";
import { useUserStore } from "@/stores/userStore";
import { ElMessage } from "element-plus";

const userStore = useUserStore();
const infoForm = ref(null);
const isEditing = ref(false);
const originInfo = ref({}); // 保存原始信息用于取消编辑时恢复

const userInfo = reactive({
  username: "",
  name: "",
  email: "",
  phone: "",
  introduction: "",
});

// 初始化用户信息
onMounted(async () => {
  await fetchUserInfo();
});

// 获取用户信息
const fetchUserInfo = async () => {
  try {
    const info = await userStore.getUserInfo();
    Object.assign(userInfo, info);
    Object.assign(originInfo.value, info); // 保存原始信息
  } catch (error) {
    ElMessage.error("获取用户信息失败");
    console.error(error);
  }
};

// 提交更新
const handleUpdate = async () => {
  try {
    await infoForm.value.validate();
    const result = await userStore.updateUserInfo(userInfo);
    if (result) {
      ElMessage.success("信息更新成功");
      isEditing.value = false;
      Object.assign(originInfo.value, userInfo); // 更新原始信息缓存
    }
  } catch (error) {
    if (error.name === "ValidationError") return;
    ElMessage.error("信息更新失败");
    console.error(error);
  }
};

// 取消编辑
const handleCancel = () => {
  // 恢复原始信息
  Object.assign(userInfo, originInfo.value);
  isEditing.value = false;
  // 清除表单验证状态
  infoForm.value.clearValidate();
};
</script>

<style scoped>
.card-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
}

.info-form {
  margin-top: 20px;
}

.el-form-item {
  margin-bottom: 20px;
}

.introduction-content {
  line-height: 1.6;
  margin: 0;
  white-space: pre-wrap; /* 保留换行 */
}
</style>
