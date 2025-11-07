<template>
  <div class="register-container">
    <el-card class="register-card">
      <h2 class="title">用户注册</h2>
      <el-form 
        ref="registerFormRef" 
        :model="registerForm" 
        :rules="registerRules" 
        label-width="80px"
        class="register-form"
      >
        <el-form-item label="用户名" prop="username">
          <CommonInput 
            v-model="registerForm.username" 
            placeholder="请输入用户名"
          />
        </el-form-item>
        <el-form-item label="密码" prop="password">
          <CommonInput 
            v-model="registerForm.password" 
            type="password" 
            placeholder="请输入密码"
          />
        </el-form-item>
        <el-form-item label="确认密码" prop="confirmPassword">
          <CommonInput 
            v-model="registerForm.confirmPassword" 
            type="password" 
            placeholder="请确认密码"
          />
        </el-form-item>
        <el-form-item label="邮箱" prop="email">
          <CommonInput 
            v-model="registerForm.email" 
            placeholder="请输入邮箱"
          />
        </el-form-item>
        <el-form-item>
          <CommonButton 
            type="primary" 
            @click="handleRegister"
          >
            注册
          </CommonButton>
          <el-link type="info" @click="$router.push('/login')" class="login-link">
            已有账号？去登录
          </el-link>
        </el-form-item>
      </el-form>
    </el-card>
  </div>
</template>

<script setup>
import { ref } from 'vue'
import { useRouter } from 'vue-router'
import { useUserStore } from '@/stores/userStore'

// 表单数据
const registerForm = ref({
  username: '',
  password: '',
  confirmPassword: '',
  email: ''
})

// 表单验证规则
const registerRules = ref({
  username: [
    { required: true, message: '请输入用户名', trigger: 'blur' },
    { min: 3, max: 16, message: '用户名长度在 3-16 之间', trigger: 'blur' }
  ],
  password: [
    { required: true, message: '请输入密码', trigger: 'blur' },
    { min: 6, message: '密码长度至少 6 位', trigger: 'blur' }
  ],
  confirmPassword: [
    { required: true, message: '请确认密码', trigger: 'blur' },
    { 
      validator: (rule, value, callback) => {
        if (value !== registerForm.value.password) {
          callback(new Error('两次密码输入不一致'))
        } else {
          callback()
        }
      },
      trigger: 'blur'
    }
  ],
  email: [
    { required: true, message: '请输入邮箱', trigger: 'blur' },
    { type: 'email', message: '请输入正确的邮箱格式', trigger: 'blur' }
  ]
})

// 表单引用及路由
const registerFormRef = ref(null)
const router = useRouter()
const userStore = useUserStore()

// 注册处理
const handleRegister = async () => {
  try {
    await registerFormRef.value.validate()
    const res = await userStore.register(registerForm.value)
    if (res.code === 200) {
      ElMessage.success('注册成功，即将跳转登录页')
      setTimeout(() => {
        router.push('/login')
      }, 1500)
    }
  } catch (error) {
    if (error.name === 'ValidationError') {
      return // 表单验证失败不处理
    }
    ElMessage.error(error.message || '注册失败')
  }
}
</script>

<style scoped>
.register-container {
  display: flex;
  justify-content: center;
  align-items: center;
  min-height: 100vh;
  background-color: var(--bg-color);
}
.register-card {
  width: 400px;
  padding: 30px;
  box-shadow: 0 2px 12px rgba(0, 0, 0, 0.1);
}
.title {
  text-align: center;
  margin-bottom: 20px;
  color: var(--text-color);
}
.register-form {
  margin-top: 20px;
}
.login-link {
  margin-left: 20px;
}
</style>