<script setup lang="ts">
/** 页面6: 购物车 — M6-1~M6-6 + E011空 E019~E023异常 + D18确认删除 */
import { onMounted, ref } from 'vue'
import { useRouter } from 'vue-router'
import { useCartStore } from '@/stores/cart'
import { ElMessage, ElMessageBox } from 'element-plus'
import EmptyState from '@/components/common/EmptyState.vue'

const router = useRouter(); const cart = useCartStore(); const loading = ref(true)

onMounted(async () => { await cart.fetch(); loading.value = false })

function handleDelete(id: string) {
  ElMessageBox.confirm('确定要删除该商品吗？', '确认删除', { type: 'warning', confirmButtonText: '删除', cancelButtonText: '取消' }).then(async () => {
    await cart.remove(id); ElMessage.success('已删除')
  }).catch(() => {})
}

function goCheckout() {
  // E025: 校验已选商品库存
  const invalid = cart.checkedItems.filter(i => i.stock === 0)
  if (invalid.length > 0) { ElMessage.error(`以下商品已失效：${invalid.map(i => i.productName).join('、')}`); return }
  router.push('/checkout')
}
</script>

<template>
  <div v-loading="loading" style="max-width: 800px; margin: 0 auto;">
    <h2 style="font-size: 20px; font-weight: 700; margin-bottom: 16px;">购物车</h2>
    <!-- E011: 空 -->
    <EmptyState v-if="cart.items.length === 0" type="cart" />

    <template v-else>
      <!-- M6-3: 全选 + M6-6: 失效区 -->
      <div class="flex-between" style="background: var(--zao-surface); border-radius: var(--zao-radius); padding: 12px 16px; margin-bottom: 12px;">
        <el-checkbox :model-value="cart.validItems.length > 0 && cart.validItems.every(i => i.checked)" @change="(v: boolean) => cart.toggleAll(v)">全选</el-checkbox>
        <el-button v-if="cart.invalidItems.length" size="small" @click="cart.removeInvalid()">清除失效商品({{ cart.invalidItems.length }})</el-button>
      </div>

      <!-- M6-1: 商品列表 -->
      <div style="display: flex; flex-direction: column; gap: 8px;">
        <div v-for="item in cart.items" :key="item.id" style="background: var(--zao-surface); border-radius: var(--zao-radius); padding: 16px; display: flex; align-items: center; gap: 12px;" :style="{ opacity: item.invalid ? 0.5 : 1 }">
          <el-checkbox v-model="item.checked" :disabled="item.invalid" @change="(v: boolean) => cart.update(item.id, { checked: v })" />
          <img :src="item.productImage" style="width: 64px; height: 64px; border-radius: 8px; object-fit: cover;" />
          <div style="flex: 1;">
            <p style="font-weight: 500;">{{ item.productName }} <span v-if="item.invalid" style="color: var(--zao-danger); font-size: 12px;">(已失效)</span></p>
            <p style="font-size: 13px; color: var(--zao-gray-light);">{{ item.skuName }}</p>
            <p class="price">¥{{ item.price.toFixed(1) }}</p>
          </div>
          <!-- M6-2: 数量 -->
          <el-input-number v-model="item.quantity" :min="1" :max="item.stock" :disabled="item.invalid" size="small" @change="(v: number | undefined) => { if (v && v > item.stock) { ElMessage.warning('已达库存上限'); return } cart.update(item.id, { quantity: v || 1 }) }" />
          <el-button link type="danger" @click="handleDelete(item.id)"><el-icon><Delete /></el-icon></el-button>
        </div>
      </div>

      <!-- M6-4 + M6-5: 汇总 + 结算 -->
      <div class="flex-between" style="position: sticky; bottom: 0; margin-top: 16px; background: var(--zao-surface); border-radius: var(--zao-radius); padding: 16px 20px; box-shadow: var(--zao-shadow-up);">
        <span>已选 <strong>{{ cart.totalCount }}</strong> 件｜合计 <span class="price" style="font-size: 22px;">¥{{ cart.totalAmount.toFixed(1) }}</span></span>
        <el-button type="primary" size="large" :disabled="cart.totalCount === 0" @click="goCheckout">去结算</el-button>
      </div>
    </template>
  </div>
</template>
