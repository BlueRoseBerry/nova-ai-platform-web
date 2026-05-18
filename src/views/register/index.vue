<template>
  <div class="register-container">
    <div class="register-background">
      <div class="circle circle-1"></div>
      <div class="circle circle-2"></div>
      <div class="circle circle-3"></div>
    </div>

    <div class="register-card">
      <div class="register-header">
        <div class="register-logo-icon">
          <el-icon :size="40" color="#667eea"><Cpu /></el-icon>
        </div>
        <h2 class="register-title">注册账户</h2>
        <p class="register-subtitle">创建 Nova AI Platform 账号</p>
      </div>

      <el-form
        ref="formRef"
        :model="registerForm"
        :rules="rules"
        class="register-form"
        @keyup.enter="handleRegister"
      >
        <el-form-item prop="account">
          <el-input
            v-model="registerForm.account"
            placeholder="请输入账号"
            size="large"
            :prefix-icon="User"
          />
        </el-form-item>

        <el-form-item prop="name">
          <el-input
            v-model="registerForm.name"
            placeholder="请输入姓名（选填）"
            size="large"
            :prefix-icon="UserFilled"
          />
        </el-form-item>

        <el-form-item prop="email">
          <el-input
            v-model="registerForm.email"
            placeholder="请输入邮箱（选填）"
            size="large"
            :prefix-icon="Message"
          />
        </el-form-item>

        <el-form-item prop="password">
          <el-input
            v-model="registerForm.password"
            type="password"
            placeholder="请输入密码（至少 6 位）"
            size="large"
            :prefix-icon="Lock"
            show-password
          />
        </el-form-item>

        <el-form-item prop="confirmPassword">
          <el-input
            v-model="registerForm.confirmPassword"
            type="password"
            placeholder="请再次输入密码"
            size="large"
            :prefix-icon="Lock"
            show-password
          />
        </el-form-item>

        <el-form-item>
          <el-button
            type="primary"
            size="large"
            class="register-btn"
            :loading="loading"
            @click="handleRegister"
          >
            {{ loading ? '注册中...' : '注 册' }}
          </el-button>
        </el-form-item>
      </el-form>

      <div class="register-footer">
        <span>已有账号？</span>
        <router-link :to="LOGIN_ROUTE" class="login-link">立即登录</router-link>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, reactive } from 'vue'
import { useRouter } from 'vue-router'
import type { FormInstance, FormRules } from 'element-plus'
import { User, UserFilled, Lock, Cpu, Message } from '@element-plus/icons-vue'
import { registerUser } from '@/api/user'
import { LOGIN_ROUTE } from '@/utils/constants'

const router = useRouter()
const formRef = ref<FormInstance>()
const loading = ref(false)

const registerForm = reactive({
  account: '',
  name: '',
  email: '',
  password: '',
  confirmPassword: '',
})

const validateConfirmPassword = (_rule: unknown, value: string, callback: (err?: Error) => void) => {
  if (!value) {
    callback(new Error('请再次输入密码'))
    return
  }
  if (value !== registerForm.password) {
    callback(new Error('两次输入的密码不一致'))
    return
  }
  callback()
}

const rules: FormRules = {
  account: [
    { required: true, message: '请输入账号', trigger: 'blur' },
    { min: 3, max: 32, message: '账号长度为 3-32 个字符', trigger: 'blur' },
  ],
  email: [{ type: 'email', message: '请输入正确的邮箱格式', trigger: 'blur' }],
  password: [
    { required: true, message: '请输入密码', trigger: 'blur' },
    { min: 6, message: '密码至少 6 位', trigger: 'blur' },
  ],
  confirmPassword: [{ validator: validateConfirmPassword, trigger: 'blur' }],
}

const handleRegister = async () => {
  const valid = await formRef.value?.validate().catch(() => false)
  if (!valid) return

  loading.value = true
  try {
    await registerUser({
      account: registerForm.account.trim(),
      password: registerForm.password,
      name: registerForm.name.trim() || undefined,
      email: registerForm.email.trim() || undefined,
      role: 'user',
    })
    ElMessage.success('注册成功，请登录')
    router.push(LOGIN_ROUTE)
  } finally {
    loading.value = false
  }
}
</script>

<style scoped lang="scss">
.register-container {
  height: 100vh;
  display: flex;
  align-items: center;
  justify-content: center;
  background: linear-gradient(135deg, #1a1a2e 0%, #16213e 50%, #0f3460 100%);
  position: relative;
  overflow: hidden;
}

.register-background {
  position: absolute;
  inset: 0;

  .circle {
    position: absolute;
    border-radius: 50%;
    opacity: 0.15;
  }

  .circle-1 {
    width: 400px;
    height: 400px;
    background: #667eea;
    top: -100px;
    right: -100px;
    animation: float 8s ease-in-out infinite;
  }

  .circle-2 {
    width: 300px;
    height: 300px;
    background: #764ba2;
    bottom: -80px;
    left: -80px;
    animation: float 6s ease-in-out infinite reverse;
  }

  .circle-3 {
    width: 200px;
    height: 200px;
    background: #f093fb;
    top: 50%;
    left: 50%;
    transform: translate(-50%, -50%);
    animation: pulse 4s ease-in-out infinite;
  }
}

@keyframes float {
  0%, 100% { transform: translateY(0); }
  50% { transform: translateY(-20px); }
}

@keyframes pulse {
  0%, 100% { transform: translate(-50%, -50%) scale(1); }
  50% { transform: translate(-50%, -50%) scale(1.1); }
}

.register-card {
  width: 420px;
  padding: 40px 40px 32px;
  background: rgba(255, 255, 255, 0.95);
  border-radius: 16px;
  box-shadow: 0 20px 60px rgba(0, 0, 0, 0.3);
  z-index: 1;
}

.register-header {
  text-align: center;
  margin-bottom: 32px;

  .register-logo-icon {
    width: 64px;
    height: 64px;
    display: inline-flex;
    align-items: center;
    justify-content: center;
    background: linear-gradient(135deg, rgba(102, 126, 234, 0.1), rgba(118, 75, 162, 0.1));
    border-radius: 16px;
    margin-bottom: 16px;
  }

  .register-title {
    font-size: 26px;
    font-weight: 700;
    color: #1a1a2e;
    margin: 0 0 8px;
    background: linear-gradient(90deg, #667eea, #764ba2);
    -webkit-background-clip: text;
    -webkit-text-fill-color: transparent;
  }

  .register-subtitle {
    font-size: 14px;
    color: #606266;
    margin: 0;
  }
}

.register-form {
  .register-btn {
    width: 100%;
    height: 48px;
    font-size: 16px;
    border-radius: 8px;
    background: linear-gradient(90deg, #667eea, #764ba2);
    border: none;

    &:hover {
      opacity: 0.9;
    }
  }
}

.register-footer {
  text-align: center;
  margin-top: 8px;
  font-size: 14px;
  color: #606266;

  .login-link {
    margin-left: 4px;
    color: #667eea;
    text-decoration: none;
    font-weight: 500;

    &:hover {
      color: #764ba2;
    }
  }
}
</style>
