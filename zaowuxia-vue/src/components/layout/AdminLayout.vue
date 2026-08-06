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
    <el-aside width="220px" style="background: #2c3e2d;">
      <div style="padding: 20px; text-align: center; font-size: 18px; font-weight: 700; color: #eaf5e9;">
        造物匣 · 管理后台
      </div>
      <el-menu
        :default-active="route.path"
        background-color="#2c3e2d"
        text-color="#a8c8a5"
        active-text-color="#fff"
        @select="(path: string) => router.push(path)"
      >
        <el-menu-item v-for="m in menuItems" :key="m.path" :index="m.path">
          <el-icon><component :is="m.icon" /></el-icon>
          <span>{{ m.title }}</span>
        </el-menu-item>
      </el-menu>
      <div style="position: absolute; bottom: 20px; left: 0; right: 0; padding: 0 20px;">
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
