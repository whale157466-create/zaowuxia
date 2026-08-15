<script setup lang="ts">
/** 管理端快捷登录页 — 实际使用统一登录，账号含 admin 即进管理后台 */
import { ref } from 'vue'
import { useRouter } from 'vue-router'
import { useUserStore } from '@/stores/user'
import { ElMessage } from 'element-plus'

const router = useRouter()
const userStore = useUserStore()
const form = ref({ account: 'admin', password: '' })
const loading = ref(false)

async function handleLogin() {
  loading.value = true
  try {
    await userStore.loginByPassword(form.value.account, form.value.password)
    if (userStore.isAdmin) {
      ElMessage.success('欢迎进入管理后台')
      router.push('/admin')
    } else {
      ElMessage.error('该账号无管理权限，请使用管理员账号')
    }
  } catch {
    ElMessage.error('登录失败')
  } finally { loading.value = false }
}
</script>

<template>
  <div class="flex-center" style="min-height: 100vh; background: var(--zao-gray-bg);">
    <div style="width: 380px; background: var(--zao-surface); border-radius: var(--zao-radius); padding: 36px; box-shadow: var(--zao-shadow-lg);">
      <div style="text-align: center; margin-bottom: 24px;">
        <h1 style="font-size: 24px; font-weight: 700; color: var(--zao-sidebar);">造物匣 · 管理后台</h1>
        <p style="font-size: 13px; color: var(--zao-gray-light); margin-top: 4px;">请使用管理员账号登录</p>
      </div>

      <el-form :model="form" @submit.prevent="handleLogin">
        <el-form-item><el-input v-model="form.account" placeholder="管理员账号（含 admin）" size="large" /></el-form-item>
        <el-form-item><el-input v-model="form.password" type="password" placeholder="密码" size="large" show-password /></el-form-item>
        <el-button type="primary" :loading="loading" native-type="submit" size="large" style="width: 100%;">进入管理后台</el-button>
      </el-form>

      <div style="margin-top: 16px; text-align: center;">
        <el-button link @click="router.push('/login')">← 返回统一登录</el-button>
      </div>

      <div style="margin-top: 12px; background: var(--zao-blue-pale); border-radius: 8px; padding: 10px 14px; font-size: 12px; color: var(--zao-blue); text-align: center;">
        <el-icon><InfoFilled /></el-icon>
        演示账号: <strong>admin</strong>，密码任意
      </div>
    </div>
  </div>
</template>
