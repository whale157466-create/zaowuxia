<script setup lang="ts">
/** 用户端前台全局布局 — 顶部导航 + 内容区 + 底部 */
import { useRouter } from 'vue-router'
import { useCartStore } from '@/stores/cart'
import { useUserStore } from '@/stores/user'
import { ElMessage } from 'element-plus'
import { computed, onMounted, ref } from 'vue'

const router = useRouter()
const cart = useCartStore()
const userStore = useUserStore()
const isLoggedIn = computed(() => userStore.isLoggedIn)
const isAdmin = computed(() => userStore.isAdmin)

const searchWord = ref('')
onMounted(() => cart.fetch())

function goSearch(keyword: string) {
  if (keyword.trim()) router.push({ name: 'products', query: { keyword } })
}
</script>

<template>
  <div class="min-h-screen flex-col" style="display: flex;">
    <!-- 顶部导航栏 -->
    <header style="background: var(--zao-white); border-bottom: 1px solid var(--zao-border); position: sticky; top: 0; z-index: 100;">
      <div class="page-container flex-between" style="padding-top: 12px; padding-bottom: 12px;">
        <!-- Logo -->
        <router-link to="/" style="font-size: 22px; font-weight: 700; color: var(--zao-blue);">造物匣</router-link>

        <!-- 搜索 -->
        <div style="width: 320px;">
          <el-input v-model="searchWord" placeholder="搜索手工项目、材料…" clearable @keyup.enter="goSearch(searchWord)">
            <template #prefix><el-icon><Search /></el-icon></template>
          </el-input>
        </div>

        <!-- 导航 -->
        <nav style="display: flex; align-items: center; gap: 24px;">
          <router-link to="/" class="nav-link">首页</router-link>
          <router-link to="/categories" class="nav-link">项目分类</router-link>
          <router-link to="/cart" class="nav-link" style="position: relative;">
            <el-icon size="20"><ShoppingCart /></el-icon>
            <el-badge v-if="cart.totalCount > 0" :value="cart.totalCount" :offset="[6, -6]" />
          </router-link>
          <router-link to="/orders" class="nav-link">我的订单</router-link>
          <template v-if="isLoggedIn">
            <router-link v-if="isAdmin" to="/admin" class="nav-link" style="color: var(--zao-blue); font-weight: 500;">管理后台</router-link>
            <router-link to="/profile" class="nav-link">{{ userStore.user?.nickname }}</router-link>
          </template>
          <template v-else>
            <router-link to="/login" class="nav-link" style="color: var(--zao-blue);">登录</router-link>
          </template>
        </nav>
      </div>
    </header>

    <!-- 主内容 -->
    <main style="flex: 1; min-height: calc(100vh - 140px);">
      <div class="page-container">
        <router-view />
      </div>
    </main>

    <!-- 底部 -->
    <footer style="background: var(--zao-white); border-top: 1px solid var(--zao-border); text-align: center; padding: 20px; font-size: 13px; color: var(--zao-gray-light);">
      © 2026 造物匣 - 每个人都是手艺人
    </footer>
  </div>
</template>

<style scoped>
.nav-link { font-size: 14px; color: var(--zao-gray); transition: color 0.2s; }
.nav-link:hover, .router-link-active { color: var(--zao-blue) !important; }
</style>
