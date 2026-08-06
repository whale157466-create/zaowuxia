<script setup lang="ts">
/** 我的收藏 — M11-6 M11-7 + E013空 E019下架 */
import { ref } from 'vue'
import { useRouter } from 'vue-router'
import { ElMessage, ElMessageBox } from 'element-plus'
import EmptyState from '@/components/common/EmptyState.vue'

const router = useRouter()
const favorites = ref([
  { id: 'p1', name: '微缩蛋糕·草莓奶油杯', categoryName: '微缩蛋糕', difficulty: 'beginner', price: 39.9, image: 'https://picsum.photos/seed/p1/200/200', status: 'on' },
  { id: 'p2', name: '篆刻入门·姓氏印章', categoryName: '篆刻入门', difficulty: 'intermediate', price: 89.0, image: 'https://picsum.photos/seed/p2/200/200', status: 'on' },
  { id: 'p4', name: '微缩蛋糕·马卡龙塔', categoryName: '微缩蛋糕', difficulty: 'advanced', price: 99.0, image: 'https://picsum.photos/seed/p4/200/200', status: 'off' },
])
const labels: Record<string, string> = { beginner: '入门', intermediate: '进阶', advanced: '高阶' }

async function handleRemove(id: string) {
  await ElMessageBox.confirm('确定取消收藏？', '取消收藏', { type: 'warning' })
  ElMessage.success('已取消收藏')
}
</script>

<template>
  <div style="max-width: 520px; margin: 0 auto;">
    <h2 style="font-size: 20px; margin-bottom: 16px;">我的收藏</h2>
    <EmptyState v-if="favorites.length === 0" type="favorite" />
    <div v-else style="display: flex; flex-direction: column; gap: 12px;">
      <div v-for="item in favorites" :key="item.id" class="zao-card" style="display: flex; align-items: center; gap: 12px;" :style="{ opacity: item.status === 'off' ? 0.5 : 1 }">
        <img :src="item.image" style="width: 56px; height: 56px; border-radius: 8px; object-fit: cover; cursor: pointer;" @click="item.status === 'on' && router.push(`/products/${item.id}`)" />
        <div style="flex: 1;"><p style="font-weight: 500;">{{ item.name }}<span v-if="item.status === 'off'" style="color: #e85d3a; font-size: 12px;">(已下架)</span></p><el-tag size="small">{{ labels[item.difficulty] }}</el-tag><span class="price" style="margin-left: 8px;">¥{{ item.price.toFixed(1) }}</span></div>
        <el-button link type="danger" @click="handleRemove(item.id)"><el-icon><Delete /></el-icon></el-button>
      </div>
    </div>
  </div>
</template>
