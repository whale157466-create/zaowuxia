<script setup lang="ts">
/** 页面4: 商品详情 — M4-1~M4-7 + D3规格确认 D4图片预览 */
import { ref, onMounted, computed } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import { fetchProductDetail } from '@/api'
import { useCartStore } from '@/stores/cart'
import { ElMessage } from 'element-plus'
import type { Product } from '@/types'

const route = useRoute(); const router = useRouter(); const cart = useCartStore()
const product = ref<Product | null>(null)
const loading = ref(true); const skuModalVisible = ref(false)
const selectedSkuId = ref(''); const quantity = ref(1); const favorited = ref(false)
const buyAction = ref<'cart' | 'buy'>('cart')

const currentSku = computed(() => product.value?.skus.find(s => s.id === selectedSkuId.value))
const isSoldOut = computed(() => currentSku.value?.stock === 0) // E020
const difficultyLabels: Record<string, string> = { beginner: '入门', intermediate: '进阶', advanced: '高阶' }

onMounted(async () => {
  const id = route.params.id as string
  product.value = await fetchProductDetail(id)
  selectedSkuId.value = product.value.skus[0]?.id || ''
  loading.value = false
})

function handleAction(action: 'cart' | 'buy') {
  buyAction.value = action
  skuModalVisible.value = true // D3
}

async function confirmSku() {
  if (!currentSku.value || currentSku.value.stock === 0) { ElMessage.warning('该规格暂时缺货'); return } // E021
  await cart.add(currentSku.value.id, quantity.value)
  skuModalVisible.value = false
  if (buyAction.value === 'cart') { ElMessage.success('已加入购物车') } else { router.push('/checkout') }
}

function toggleFav() { favorited.value = !favorited.value; ElMessage.success(favorited.value ? '已收藏' : '已取消收藏') }
</script>

<template>
  <div v-loading="loading">
    <!-- E019: 商品已下架 -->
    <el-result v-if="!loading && product?.status === 'off'" icon="warning" title="商品已下架" sub-title="该商品已不可用">
      <template #extra><el-button type="primary" @click="router.push('/')">返回首页</el-button></template>
    </el-result>

    <template v-else-if="product">
      <div style="display: flex; gap: 32px; flex-wrap: wrap;">
        <!-- M4-1: 主图轮播 → D4 -->
        <div style="flex: 1; min-width: 360px; max-width: 500px;">
          <el-image :src="product.images[0]" fit="cover" style="width: 100%; border-radius: 12px;" :preview-src-list="product.images" />
        </div>

        <!-- M4-2: 基本信息 + M4-3 规格 -->
        <div style="flex: 1; min-width: 300px;">
          <h1 style="font-size: 24px;">{{ product.name }}</h1>
          <div style="margin-top: 8px; display: flex; gap: 8px;">
            <el-tag>{{ difficultyLabels[product.difficulty] }}</el-tag>
            <el-tag type="info">{{ product.categoryName }}</el-tag>
            <el-tag v-if="isSoldOut" type="danger">已售罄</el-tag> <!-- E020 -->
          </div>
          <p class="price" style="font-size: 28px; margin-top: 16px;">¥{{ currentSku?.price || product.skus[0]?.price }}</p>

          <!-- M4-3: 规格 -->
          <div style="margin-top: 20px;">
            <p style="font-weight: 500; margin-bottom: 8px;">规格选择</p>
            <el-radio-group v-model="selectedSkuId">
              <el-radio-button v-for="sku in product.skus" :key="sku.id" :value="sku.id" :disabled="sku.stock === 0"> <!-- E021 -->
                {{ sku.name }}{{ sku.stock === 0 ? ' (缺货)' : '' }}
              </el-radio-button>
            </el-radio-group>
          </div>

          <!-- 数量 -->
          <div style="margin-top: 16px; display: flex; align-items: center; gap: 8px;">
            <span style="font-weight: 500;">数量:</span>
            <el-input-number v-model="quantity" :min="1" :max="currentSku?.stock || 1" />
            <span style="font-size: 13px; color: var(--zao-gray-light);">库存 {{ currentSku?.stock || 0 }} 件</span>
          </div>

          <!-- M4-7: 收藏 -->
          <div style="margin-top: 16px;">
            <el-button @click="toggleFav">
              <el-icon><StarFilled v-if="favorited" style="color: #e85d3a;" /><Star v-else /></el-icon>
              {{ favorited ? '已收藏' : '收藏' }}
            </el-button>
          </div>

          <!-- M4-6: 操作栏 -->
          <div style="margin-top: 24px; display: flex; gap: 12px;">
            <el-button size="large" :disabled="isSoldOut" @click="handleAction('cart')">
              <el-icon><ShoppingCart /></el-icon> {{ isSoldOut ? '已售罄' : '加入购物车' }}
            </el-button>
            <el-button size="large" type="primary" :disabled="isSoldOut" @click="handleAction('buy')">立即购买</el-button>
          </div>
          <el-button v-if="isSoldOut" link style="margin-top: 8px;">到货通知我</el-button>
        </div>
      </div>

      <!-- M4-4: 一键配齐入口 -->
      <div style="margin-top: 20px; background: var(--zao-green-pale); border-radius: 12px; padding: 16px;">
        <p style="font-weight: 500;">🔧 一键配齐</p>
        <p style="font-size: 13px; color: var(--zao-gray-light);">该项目所需全部材料 + 工具</p>
        <el-button type="primary" link @click="router.push(`/kit/${product.id}`)">查看配齐清单 →</el-button>
      </div>

      <!-- M4-5: 商品详情 -->
      <div style="margin-top: 24px; background: #fff; border-radius: 12px; padding: 20px;">
        <h3 style="margin-bottom: 12px;">商品详情</h3>
        <div v-html="product.description" />
      </div>

      <!-- D3: 规格确认弹窗 -->
      <el-dialog v-model="skuModalVisible" title="确认规格" width="400px">
        <div style="display: flex; flex-direction: column; gap: 12px;">
          <p><strong>商品:</strong> {{ product.name }}</p>
          <p><strong>规格:</strong> {{ currentSku?.name }}</p>
          <p><strong>数量:</strong> {{ quantity }}</p>
          <p><strong>小计:</strong> <span class="price" style="font-size: 20px;">¥{{ ((currentSku?.price || 0) * quantity).toFixed(1) }}</span></p>
        </div>
        <template #footer>
          <el-button @click="skuModalVisible = false">取消</el-button>
          <el-button type="primary" @click="confirmSku">确认</el-button>
        </template>
      </el-dialog>
    </template>
  </div>
</template>
