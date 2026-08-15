<script setup lang="ts">
/**
 * 教程详情页 — MVP 核心页面
 * 商家博主：博主同款套装（整套购买 + 拆开单买）
 * 纯爱好博主：博主种草推荐（独立跳转）+ 算法材料清单（只读）
 */
import { ref, onMounted } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import { fetchTutorialDetail, batchAddToCart } from '@/api'
import { useCartStore } from '@/stores/cart'
import { ElMessage } from 'element-plus'
import type { Tutorial } from '@/types'

const route = useRoute(); const router = useRouter(); const cart = useCartStore()
const tutorial = ref<Tutorial | null>(null)
const loading = ref(true); const buyingAll = ref(false)

onMounted(async () => {
  tutorial.value = await fetchTutorialDetail(route.params.id as string)
  loading.value = false
})

/** 整套购买：把套装内所有单品批量加入购物车 */
async function buyWholeBundle() {
  if (!tutorial.value?.bundleItems?.length) return
  buyingAll.value = true
  try {
    await batchAddToCart(tutorial.value.bundleItems.map(i => ({ skuId: i.skuId, quantity: 1 })))
    ElMessage.success('已加入购物车')
    await cart.fetch()
    router.push('/cart')
  } catch { ElMessage.error('加入失败，请重试') } finally { buyingAll.value = false }
}

/** 拆开单买：套装内单个商品加入购物车 */
async function buySingleItem(skuId: string, name: string) {
  try {
    await cart.add(skuId, 1)
    ElMessage.success(`${name} 已加入购物车`)
  } catch { ElMessage.error('加入失败，请重试') }
}

/** 种草推荐：跳转到商品详情页独立结算 */
function goProduct(productId: string) { router.push(`/products/${productId}`) }
</script>

<template>
  <div v-loading="loading" style="max-width: 720px; margin: 0 auto; display: flex; flex-direction: column; gap: 16px;">
    <el-result v-if="!tutorial" icon="error" title="教程不存在" />

    <template v-else>
      <!-- 教程头部 -->
      <div style="display: flex; gap: 12px; align-items: center;">
        <img :src="tutorial.authorAvatar" style="width: 44px; height: 44px; border-radius: 50%;" />
        <div>
          <p style="font-weight: 600;">{{ tutorial.authorName }}</p>
          <el-tag :type="tutorial.bloggerType === 'merchant' ? 'success' : 'warning'" size="small">
            {{ tutorial.bloggerType === 'merchant' ? '商家博主' : '纯爱好博主' }}
          </el-tag>
        </div>
      </div>

      <h1 style="font-size: 22px; font-weight: 700;">{{ tutorial.title }}</h1>
      <img :src="tutorial.coverImage" style="width: 100%; height: 280px; border-radius: 12px; object-fit: cover;" />
      <p style="color: var(--zao-gray-light);">{{ tutorial.description }}</p>

      <!-- 教程正文（简化展示） -->
      <div class="zao-card" style="font-size: 14px; line-height: 1.8;" v-html="tutorial.content" />

      <!-- ============ 商家博主：博主同款套装 ============ -->
      <div v-if="tutorial.bloggerType === 'merchant'" class="zao-card" style="border: 1px solid var(--zao-blue);">
        <div style="display: flex; justify-content: space-between; align-items: center;">
          <div style="display: flex; align-items: center; gap: 8px;">
            <el-tag type="success">博主同款</el-tag>
            <span style="font-weight: 600;">{{ tutorial.bundleName }}</span>
          </div>
          <el-button type="primary" size="small" :loading="buyingAll" @click="buyWholeBundle">
            整套购买 ¥{{ (tutorial.bundleItems || []).reduce((s, i) => s + i.price, 0).toFixed(1) }}
          </el-button>
        </div>

        <!-- 套装内单品列表：支持拆开单买 -->
        <div style="margin-top: 12px; display: flex; flex-direction: column; gap: 10px;">
          <div v-for="item in tutorial.bundleItems" :key="item.skuId" style="display: flex; align-items: center; gap: 12px; padding: 10px; border: 1px solid var(--zao-border); border-radius: 8px;">
            <img :src="item.productImage" style="width: 56px; height: 56px; border-radius: 8px; object-fit: cover;" />
            <div style="flex: 1;">
              <p style="font-weight: 500;">{{ item.productName }}</p>
              <p style="font-size: 12px; color: var(--zao-gray-light);">{{ item.skuName }}</p>
              <span class="price" style="font-size: 15px;">¥{{ item.price.toFixed(1) }}</span>
            </div>
            <el-button size="small" @click="buySingleItem(item.skuId, item.productName)">单独选购</el-button>
          </div>
        </div>
        <p style="font-size: 12px; color: var(--zao-gray-light); margin-top: 8px;">套装商品均来自本博主店铺</p>
      </div>

      <!-- ============ 纯爱好博主：种草推荐 + 算法材料清单 ============ -->
      <template v-else>
        <!-- 博主种草推荐 -->
        <div class="zao-card">
          <div style="display: flex; align-items: center; gap: 8px;">
            <el-tag type="warning">博主种草推荐</el-tag>
            <span style="font-weight: 600;">博主精选好物</span>
          </div>
          <div style="margin-top: 12px; display: flex; flex-direction: column; gap: 10px;">
            <div v-for="item in tutorial.recommendationItems" :key="item.skuId" style="display: flex; align-items: center; gap: 12px; padding: 10px; border: 1px solid var(--zao-border); border-radius: 8px; cursor: pointer;" @click="goProduct(item.productId)">
              <img :src="item.productImage" style="width: 56px; height: 56px; border-radius: 8px; object-fit: cover;" />
              <div style="flex: 1;">
                <p style="font-weight: 500;">{{ item.productName }}</p>
                <p style="font-size: 12px; color: var(--zao-gray-light);">来自「{{ item.shopName }}」</p>
                <span class="price" style="font-size: 15px;">¥{{ item.price.toFixed(1) }}</span>
              </div>
              <el-button size="small" type="primary" plain @click.stop="goProduct(item.productId)">查看详情</el-button>
            </div>
          </div>
          <p style="font-size: 12px; color: var(--zao-gray-light); margin-top: 8px;">种草商品独立跳转结算，不支持合并下单</p>
        </div>

        <!-- 算法自动生成的材料清单（只读） -->
        <div class="zao-card">
          <div style="display: flex; align-items: center; gap: 8px;">
            <el-tag type="info">系统推荐材料</el-tag>
            <span style="font-weight: 600;">算法自动生成</span>
          </div>
          <div style="margin-top: 12px; display: flex; flex-direction: column; gap: 10px;">
            <div v-for="item in tutorial.materialItems" :key="item.skuId" style="display: flex; align-items: center; gap: 12px; padding: 10px; border: 1px dashed var(--zao-border); border-radius: 8px;">
              <img :src="item.productImage" style="width: 48px; height: 48px; border-radius: 8px; object-fit: cover;" />
              <div style="flex: 1;">
                <p style="font-weight: 500;">{{ item.productName }}</p>
                <p style="font-size: 12px; color: var(--zao-gray-light);">🤖 {{ item.reason }}</p>
              </div>
              <span class="price" style="font-size: 15px;">¥{{ item.price.toFixed(1) }}</span>
            </div>
          </div>
          <p style="font-size: 12px; color: var(--zao-gray-light); margin-top: 8px;">此清单由算法自动生成，纯爱好博主无权修改</p>
        </div>
      </template>
    </template>
  </div>
</template>
