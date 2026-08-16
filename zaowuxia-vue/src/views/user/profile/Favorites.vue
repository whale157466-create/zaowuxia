<script setup lang="ts">
/** 我的收藏 — M11-6 M11-7 + E013空 E019下架 */
import { ref, onMounted } from 'vue'
import { useRouter } from 'vue-router'
import { ElMessage, ElMessageBox } from 'element-plus'
import { fetchFavorites, removeFavorite } from '@/api'
import type { Favorite } from '@/types'
import EmptyState from '@/components/common/EmptyState.vue'

const router = useRouter()
const loading = ref(true)
const favorites = ref<Favorite[]>([])
const labels: Record<string, string> = { beginner: '入门', intermediate: '进阶', advanced: '高阶' }

onMounted(async () => { favorites.value = await fetchFavorites(); loading.value = false })

async function handleRemove(item: Favorite) {
  await ElMessageBox.confirm('确定取消收藏？', '取消收藏', { type: 'warning' })
  await removeFavorite(item.productId)
  ElMessage.success('已取消收藏')
  favorites.value = await fetchFavorites()
}
</script>

<template>
  <div v-loading="loading" style="max-width: 520px; margin: 0 auto;">
    <h2 style="font-size: 20px; margin-bottom: 16px;">我的收藏</h2>
    <EmptyState v-if="favorites.length === 0" type="favorite" />
    <div v-else style="display: flex; flex-direction: column; gap: 12px;">
      <div v-for="item in favorites" :key="item.id" class="zao-card" style="display: flex; align-items: center; gap: 12px;" :style="{ opacity: item.status === 'off' ? 0.5 : 1 }">
        <img :src="item.image" style="width: 56px; height: 56px; border-radius: 8px; object-fit: cover; cursor: pointer;" @click="item.status === 'on' && router.push(`/products/${item.productId}`)" />
        <div style="flex: 1;"><p style="font-weight: 500;">{{ item.productName }}<span v-if="item.status === 'off'" style="color: #e85d3a; font-size: 12px;">(已下架)</span></p><el-tag size="small">{{ labels[item.difficulty] }}</el-tag><span class="price" style="margin-left: 8px;">¥{{ item.price.toFixed(1) }}</span></div>
        <el-button link type="danger" @click="handleRemove(item)"><el-icon><Delete /></el-icon></el-button>
      </div>
    </div>
  </div>
</template>
