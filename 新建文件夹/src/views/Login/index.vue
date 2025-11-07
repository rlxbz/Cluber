<template>
  <div class="login-container">
    <el-card class="login-card">
      <h2 class="login-title">Cluber系统登录</h2>
      <el-form 
        ref="loginFormRef" 
        :model="loginForm" 
        :rules="loginRules" 
        label-width="80px"
        class="login-form"
      >
        <el-form-item label="用户名" prop="username">
          <CommonInput 
            v-model="loginForm.username" 
            placeholder="请输入用户名"
          />
        </el-form-item>
        <el-form-item label="密码" prop="password">
          <CommonInput 
            v-model="loginForm.password" 
            type="password" 
            placeholder="请输入密码"
          />
        </el-form-item>
        <el-form-item>
          <CommonButton 
            type="primary" 
            @click="handleLogin"
            class="login-btn"
          >
            登录
          </CommonButton>
        </el-form-item>
        <el-form-item>
          <p class="register-link">
            还没有账号？<a @click="toRegister">去注册</a>
          </p>
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
const loginForm = ref({
  username: '',
  password: ''
})

// 表单验证规则
const loginRules = ref({
  username: [
    { required: true, message: '请输入用户名', trigger: 'blur' },
    { min: 3, max: 10, message: '用户名长度在 3-10 之间', trigger: 'blur' }
  ],
  password: [
    { required: true, message: '请输入密码', trigger: 'blur' },
    { min: 6, message: '密码长度至少 6 位', trigger: 'blur' }
  ]
})

// 表单引用
const loginFormRef = ref(null)
// 路由实例
const router = useRouter()
// 用户Store
const userStore = useUserStore()


// 新增：跳转到注册页
const toRegister = () => {
  router.push('/register')
}

// 登录处理
const handleLogin = async () => {
  // 表单验证
  const valid = await loginFormRef.value.validate()
  if (!valid) return

  // 调用登录方法
  const success = await userStore.login(loginForm.value)
  if (success) {
    // 登录成功跳转首页
    router.push('/home')
    
  }
}
</script>

<style scoped>
.login-container {
  display: flex;
  justify-content: center;
  align-items: center;
  min-height: 100vh;
  background-color: #f5f7fa;
}
.login-card {
  width: 400px;
  padding: 2rem;
  box-shadow: 0 2px 12px rgba(0, 0, 0, 0.1);
}
.login-title {
  text-align: center;
  margin-bottom: 1.5rem;
  color: #333;
}
.login-form {
  margin-top: 1rem;
}
.login-btn {
  width: 100%;
}
.register-link {
  text-align: center;
  margin-top: 1rem;
  color: #666;
}
.register-link a {
  color: #409eff;
  cursor: pointer;
  text-decoration: none;
}
.register-link a:hover {
  text-decoration: underline;
}
</style>