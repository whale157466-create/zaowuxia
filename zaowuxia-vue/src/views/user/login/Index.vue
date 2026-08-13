<script setup lang="ts">
/**
 * 统一登录页
 * - 微信扫码 → 普通用户 → / 首页
 * - 账号密码（含 admin）→ 管理员 → /admin 看板
 * - 账号密码（普通）   → 普通用户 → / 首页
 * - 游客浏览 → / 首页
 */
import { ref } from 'vue'
import { useRouter } from 'vue-router'
import { useUserStore } from '@/stores/user'
import { ElMessage } from 'element-plus'

const router = useRouter()
const userStore = useUserStore()
const activeTab = ref('wechat')
const loading = ref(false)
const qrVisible = ref(false)
const privacyVisible = ref(false)
const form = ref({ account: '', password: '' })

async function handleWechatLogin() {
  qrVisible.value = true
  setTimeout(async () => {
    try {
      loading.value = true
      await userStore.loginByWechat('mock_code')
      ElMessage.success('登录成功')
      qrVisible.value = false
      router.push('/') // 微信登录始终进用户端
    } catch {
      ElMessage.error('获取用户信息失败，请重试')
    } finally { loading.value = false }
  }, 2000)
}

async function handlePasswordLogin() {
  if (!form.value.account.trim() || !form.value.password.trim()) {
    ElMessage.warning('请输入账号和密码')
    return
  }
  loading.value = true
  try {
    await userStore.loginByPassword(form.value.account, form.value.password)
    ElMessage.success(userStore.isAdmin ? '管理员登录成功' : '登录成功')
    // 根据角色自动跳转
    if (userStore.isAdmin) {
      router.push('/admin') // → 数据看板
    } else {
      router.push('/') // → 用户首页
    }
  } catch {
    ElMessage.error('登录失败，请检查账号密码')
  } finally { loading.value = false }
}
</script>

<template>
  <div class="flex-center" style="min-height: 70vh;">
    <div style="width: 420px; background: var(--zao-surface); border-radius: var(--zao-radius); padding: 36px; box-shadow: var(--zao-shadow-lg);">
      <!-- Logo -->
      <div style="text-align: center; margin-bottom: 24px;">
        <h1 style="font-size: 30px; font-weight: 700; color: var(--zao-green);">造物匣</h1>
        <p style="font-size: 14px; color: var(--zao-gray-light); margin-top: 4px;">每个人都是手艺人</p>
      </div>

      <el-tabs v-model="activeTab" style="text-align: center;">
        <!-- 微信扫码登录 -->
        <el-tab-pane label="微信登录" name="wechat">
          <div style="display: flex; flex-direction: column; align-items: center; gap: 16px; padding: 16px 0;">
            <p style="font-size: 13px; color: var(--zao-gray-light);">打开微信扫描二维码登录</p>
            <div
              style="width: 180px; height: 180px; border: 2px dashed var(--zao-border); border-radius: 10px; cursor: pointer; display: flex; align-items: center; justify-content: center; transition: border-color 0.2s;"
              @click="handleWechatLogin"
            >
              <span style="color: var(--zao-gray-light); font-size: 14px; text-align: center;">点击<br>显示二维码</span>
            </div>
            <p style="font-size: 12px; color: var(--zao-gray-light);">微信登录仅限普通用户</p>
          </div>
        </el-tab-pane>

        <!-- 统一账号登录 -->
        <el-tab-pane label="账号登录" name="password">
          <el-form :model="form" @submit.prevent="handlePasswordLogin" style="margin-top: 16px;">
            <el-form-item>
              <el-input v-model="form.account" placeholder="邮箱 / 手机号" size="large" clearable>
                <template #prefix><el-icon><User /></el-icon></template>
              </el-input>
            </el-form-item>
            <el-form-item>
              <el-input v-model="form.password" type="password" placeholder="密码" size="large" show-password @keyup.enter="handlePasswordLogin">
                <template #prefix><el-icon><Lock /></el-icon></template>
              </el-input>
            </el-form-item>

            <!-- 提示：管理员入口 -->
            <div style="background: var(--zao-green-pale); border-radius: 8px; padding: 10px 14px; margin-bottom: 16px; font-size: 12px; color: var(--zao-green); display: flex; align-items: center; gap: 6px;">
              <el-icon><InfoFilled /></el-icon>
              <span>管理员请使用含 <strong>admin</strong> 的账号登录，将自动进入管理后台</span>
            </div>

            <el-button type="primary" :loading="loading" native-type="submit" size="large" style="width: 100%;">
              登录
            </el-button>
          </el-form>
        </el-tab-pane>
      </el-tabs>

      <!-- 隐私协议 + 游客 -->
      <div style="text-align: center; font-size: 12px; color: var(--zao-gray-light); margin: 16px 0 12px;">
        登录即表示同意
        <span style="color: var(--zao-green); cursor: pointer;" @click="privacyVisible = true">《用户协议》《隐私政策》</span>
      </div>
      <el-button style="width: 100%;" @click="userStore.enterAsGuest(); router.push('/');">游客浏览</el-button>
    </div>
  </div>

  <!-- 微信扫码弹窗 -->
  <el-dialog v-model="qrVisible" title="微信扫码登录" width="340px" align-center>
    <div style="text-align: center;">
      <img src="https://picsum.photos/seed/qr/200/200" style="width: 180px; height: 180px; border-radius: 10px;" alt="微信二维码" />
      <p style="font-size: 13px; color: var(--zao-gray-light); margin-top: 10px;">请使用微信扫一扫</p>
    </div>
  </el-dialog>

  <!-- 隐私协议弹窗 -->
  <el-dialog v-model="privacyVisible" title="用户协议 & 隐私政策" width="500px">
    <div style="max-height: 400px; overflow-y: auto; font-size: 14px; line-height: 1.8; color: var(--zao-gray);">
      <h3>用户协议</h3><p>欢迎使用造物匣…（协议内容占位）</p>
      <h3 style="margin-top: 16px;">隐私政策</h3><p>我们重视您的隐私…</p>
    </div>
  </el-dialog>
</template>
