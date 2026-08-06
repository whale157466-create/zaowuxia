<script setup lang="ts">
/** 页面5: 一键配齐 — M5-1~M5-6 + E022部分失效 E023数量超限 */
import { ref, onMounted, computed } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import { fetchKitItems, batchAddToCart } from '@/api'
import { ElMessage } from 'element-plus'
import type { KitItem } from '@/types'

const route = useRoute(); const router = useRouter()
const items = ref<KitItem[]>([]); const loading = ref(true)

onMounted(async () => { items.value = await fetchKitItems(route.params.productId as string); loading.value = false })

const materials = computed(() => items.value.filter(i => i.type === 'material'))
const tools = computed(() => items.value.filter(i => i.type === 'tool'))
const checkedItems = computed(() => items.value.filter(i => i.checked && i.stock > 0))
const totalPrice = computed(() => checkedItems.value.reduce((s, i) => s + i.price * i.quantity, 0))

async function handleAddAll() {
  await batchAddToCart(checkedItems.value.map(i => ({ skuId: i.skuId, quantity: i.quantity })))
  ElMessage.success(`已将 ${checkedItems.value.length} 件物料加入购物车`)
}
</script>

<template>
  <div v-loading="loading" style="max-width: 640px; margin: 0 auto;">
    <!-- M5-1 -->
    <h2 style="font-size: 20px;">🔧 一键配齐</h2>
    <p style="font-size: 13px; color: var(--zao-gray-light); margin-top: 4px;">勾选需要的物料，一键加入购物车</p>

    <!-- M5-2: 材料清单 M5-3: 工具清单 -->
    <div v-for="(group, label) in { '📦 材料清单': materials, '🔨 配套工具': tools }" :key="label" style="margin-top: 20px;">
      <h4 style="font-weight: 500; margin-bottom: 8px;">{{ label }}</h4>
      <div v-for="item in group" :key="item.skuId" style="background: #fff; border-radius: 10px; padding: 12px; margin-bottom: 8px; display: flex; align-items: center; gap: 12px;" :style="{ opacity: item.stock === 0 ? 0.5 : 1 }">
        <el-checkbox v-model="item.checked" :disabled="item.stock === 0" />
        <div style="flex: 1;"><p style="font-weight: 500;">{{ item.productName }} <span style="font-size: 13px; color: var(--zao-gray-light);">{{ item.skuName }}</span></p><p class="price">¥{{ item.price.toFixed(1) }}</p></div>
        <template v-if="item.stock === 0"><span style="font-size: 13px; color: #e85d3a;">缺货</span></template><!-- E022 -->
        <template v-else>
          <el-input-number v-model="item.quantity" :min="1" :max="item.stock" size="small" @change="(v: number | undefined) => { if (v && v > item.stock) { ElMessage.warning('已达库存上限'); return } }" /><!-- E023 -->
          <span style="font-size: 12px; color: var(--zao-gray-light);">库存 {{ item.stock }}</span>
        </template>
      </div>
    </div>

    <!-- M5-5: 汇总 + M5-6: 加入购物车 -->
    <div class="flex-between" style="position: sticky; bottom: 0; margin-top: 16px; background: #fff; border-radius: 12px; padding: 16px; box-shadow: 0 -2px 8px rgba(0,0,0,0.06);">
      <span>已选 <strong>{{ checkedItems.length }}</strong> 件｜合计 <span class="price" style="font-size: 20px;">¥{{ totalPrice.toFixed(1) }}</span></span>
      <el-button type="primary" size="large" :disabled="checkedItems.length === 0" @click="handleAddAll">一键加入购物车</el-button>
    </div>
  </div>
</template>
