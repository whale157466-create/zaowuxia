<script setup lang="ts">
import { useRouter, useRoute } from 'vue-router'

const router = useRouter()
const route = useRoute()

const menuItems = [
  { path: '/admin', title: '数据看板', icon: 'DataBoard' },
  { path: '/admin/products', title: '商品管理', icon: 'Goods' },
  { path: '/admin/orders', title: '订单管理', icon: 'Document' },
]

function handleLogout() {
  localStorage.removeItem('token')
  localStorage.removeItem('role')
  router.push('/login')
}
</script>

<template>
  <el-container style="min-height: 100vh;">
    <el-aside width="220px" style="background: var(--zao-sidebar); display: flex; flex-direction: column;">
      <div style="padding: var(--zao-space-5); text-align: center; font-size: 18px; font-weight: 700; color: var(--zao-green-pale);">
        造物匣 · 管理后台
      </div>
      <el-menu
        :default-active="route.path"
        background-color="var(--zao-sidebar)"
        text-color="#a8c8a5"
        active-text-color="#f2f7f2"
        @select="(path: string) => router.push(path)"
        style="flex: 1; border-right: none;"
      >
        <el-menu-item v-for="m in menuItems" :key="m.path" :index="m.path">
          <el-icon><component :is="m.icon" /></el-icon>
          <span>{{ m.title }}</span>
        </el-menu-item>
      </el-menu>
      <!-- 退出登录：固定在左侧栏底部 -->
      <div style="padding: var(--zao-space-4) var(--zao-space-5); border-top: 1px solid oklch(0.98 0.012 142 / 0.1);">
        <el-button style="width: 100%;" @click="handleLogout">退出登录</el-button>
      </div>
    </el-aside>
    <el-container>
      <el-main style="background: var(--zao-gray-bg);">
        <router-view />
      </el-main>
    </el-container>
  </el-container>
</template>
