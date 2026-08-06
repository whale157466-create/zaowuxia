<script setup lang="ts">
/** 浏览记录 — M11-8 M11-9 + E014空 D15清空 */
import { ref } from 'vue'
import { useRouter } from 'vue-router'
import { ElMessage, ElMessageBox } from 'element-plus'
import EmptyState from '@/components/common/EmptyState.vue'

const router = useRouter()
const histories = ref([
  { id: 'h1', productId: 'p1', name: '微缩蛋糕·草莓奶油杯', price: 39.9, image: 'https://picsum.photos/seed/p1/200/200', time: '2026-07-24 15:30' },
])

async function handleClear() {
  await ElMessageBox.confirm('确定清空所有浏览记录？', '清空', { type: 'warning' })
  histories.value = []; ElMessage.success('浏览记录已清空')
}
</script>

<template>
  <div style="max-width: 520px; margin: 0 auto;">
    <div class="flex-between" style="margin-bottom: 16px;"><h2 style="font-size: 20px;">浏览记录</h2><el-button v-if="histories.length" @click="handleClear">清空记录</el-button></div>
    <EmptyState v-if="histories.length === 0" type="history" />
    <div v-else style="display: flex; flex-direction: column; gap: 8px;">
      <div v-for="h in histories" :key="h.id" class="zao-card" style="display: flex; align-items: center; gap: 12px; cursor: pointer;" @click="router.push(`/products/${h.productId}`)">
        <img :src="h.image" style="width: 48px; height: 48px; border-radius: 8px; object-fit: cover;" />
        <div style="flex: 1;"><p style="font-weight: 500;">{{ h.name }}</p><p style="font-size: 13px; color: var(--zao-gray-light);">{{ h.time }}</p></div>
        <span class="price">¥{{ h.price.toFixed(1) }}</span>
      </div>
    </div>
  </div>
</template>
