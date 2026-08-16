<script setup lang="ts">
/** 页面11: 个人中心 — M11-1~M11-3 + D13头像 D14昵称 D16退出 */
import { ref } from 'vue'
import { useRouter } from 'vue-router'
import { useUserStore } from '@/stores/user'
import { updateProfile } from '@/api'
import { ElMessage, ElMessageBox } from 'element-plus'

const router = useRouter(); const userStore = useUserStore()
const avatarVisible = ref(false); const nicknameVisible = ref(false)
const nickname = ref(userStore.user?.nickname || '')

const menus = [
  { icon: 'Document', label: '我的订单', path: '/orders' },
  { icon: 'Star', label: '我的收藏', path: '/profile/favorites' },
  { icon: 'Clock', label: '浏览记录', path: '/profile/history' },
  { icon: 'Location', label: '收货地址', path: '/profile/addresses' },
]

async function handleLogout() {
  await ElMessageBox.confirm('确定要退出当前账号吗？', '退出登录', { type: 'warning' })
  userStore.logout(); ElMessage.success('已退出登录'); router.push('/')
}

async function saveNickname() {
  const name = nickname.value.trim()
  if (!name) { ElMessage.warning('昵称不能为空'); return }
  await updateProfile({ nickname: name })
  if (userStore.user) userStore.user.nickname = name
  nicknameVisible.value = false
  ElMessage.success('昵称已更新')
}
</script>

<template>
  <div style="max-width: 480px; margin: 0 auto;">
    <!-- M11-1: 头像昵称 -->
    <div class="zao-card" style="text-align: center; display: flex; flex-direction: column; align-items: center;">
      <el-avatar :size="80" :src="userStore.user?.avatar" style="background: var(--zao-blue-bg); color: var(--zao-blue); font-size: 32px; cursor: pointer;" @click="avatarVisible = true">{{ userStore.user?.nickname?.[0] || 'U' }}</el-avatar>
      <p style="font-size: 18px; font-weight: 700; margin-top: 12px; cursor: pointer;" @click="nicknameVisible = true">{{ userStore.user?.nickname || '未登录' }}</p>
      <p style="font-size: 12px; color: var(--zao-gray-light);">点击头像或昵称编辑</p>
    </div>

    <!-- M11-2: 功能入口 -->
    <div class="zao-card" style="margin-top: 12px; padding: 0;">
      <div v-for="m in menus" :key="m.path" style="padding: 14px 20px; display: flex; align-items: center; gap: 12px; cursor: pointer; border-bottom: 1px solid var(--zao-border);" @click="router.push(m.path)">
        <el-icon><component :is="m.icon" /></el-icon><span style="font-weight: 500;">{{ m.label }}</span>
      </div>
    </div>

    <!-- M11-3: 退出 -->
    <div class="zao-card" style="margin-top: 12px; padding: 0;">
      <div style="padding: 14px 20px; display: flex; align-items: center; gap: 12px; cursor: pointer; color: #e85d3a;" @click="handleLogout"><el-icon><SwitchButton /></el-icon><span style="font-weight: 500;">退出登录</span></div>
    </div>

    <!-- D13: 头像 -->
    <el-dialog v-model="avatarVisible" title="编辑头像" width="340px"><div style="text-align: center;"><el-avatar :size="100" style="background: var(--zao-blue-bg); color: var(--zao-blue); font-size: 32px;">{{ userStore.user?.nickname?.[0] }}</el-avatar><div style="margin-top: 16px; display: flex; gap: 12px; justify-content: center;"><el-button size="small">拍照</el-button><el-button size="small">从相册选择</el-button></div></div></el-dialog>

    <!-- D14: 昵称 -->
    <el-dialog v-model="nicknameVisible" title="编辑昵称" width="360px">
      <el-input v-model="nickname" maxlength="20" show-word-limit placeholder="请输入昵称（最多20字）" />
      <template #footer><el-button @click="nicknameVisible = false">取消</el-button><el-button type="primary" @click="saveNickname">保存</el-button></template>
    </el-dialog>
  </div>
</template>
