<script setup lang="ts">
/** 页面9: 订单列表 — M9-1~M9-3 + D9取消 D11删除 + E012空 */
import { ref, onMounted, watch } from 'vue'
import { useRouter } from 'vue-router'
import { fetchOrders, cancelOrder } from '@/api'
import { ElMessage, ElMessageBox } from 'element-plus'
import type { Order } from '@/types'
import EmptyState from '@/components/common/EmptyState.vue'

const router = useRouter()
const orders = ref<Order[]>([]); const loading = ref(true)
const activeTab = ref('pending_payment')
const tabs = [
  { key: 'pending_payment', label: '待付款' }, { key: 'pending_ship', label: '待发货' },
  { key: 'pending_receive', label: '待收货' }, { key: 'completed', label: '已完成' }, { key: 'after_sales', label: '售后' },
]
const statusLabels: Record<string, string> = { pending_payment: '待付款', pending_ship: '待发货', pending_receive: '待收货', completed: '已完成', cancelled: '已取消' }

async function load() { loading.value = true; orders.value = await fetchOrders(activeTab.value); loading.value = false }
onMounted(load); watch(activeTab, load)

function handleCancel(orderId: string) {
  ElMessageBox.confirm('确定取消该订单？', '取消订单', { type: 'warning' }).then(async () => { await cancelOrder(orderId); ElMessage.success('订单已取消'); load() }).catch(() => {})
}

function getActions(order: Order) {
  switch (order.status) {
    case 'pending_payment': return { primary: { label: '去付款', fn: () => router.push(`/payment/${order.id}`) }, secondary: { label: '取消订单', fn: () => handleCancel(order.id) } }
    case 'pending_ship': return { primary: { label: '提醒发货', fn: () => ElMessage.info('已提醒卖家') } }
    case 'pending_receive': return { primary: { label: '查看物流', fn: () => router.push(`/orders/${order.id}`) }, secondary: { label: '确认收货', fn: () => router.push(`/orders/${order.id}`) } }
    case 'completed': return { primary: { label: '查看详情', fn: () => router.push(`/orders/${order.id}`) } }
    default: return {}
  }
}
</script>

<template>
  <div style="max-width: 800px; margin: 0 auto;">
    <h2 style="font-size: 20px; font-weight: 700; margin-bottom: 16px;">我的订单</h2>
    <!-- M9-1: Tabs -->
    <el-tabs v-model="activeTab" @tab-change="load">
      <el-tab-pane v-for="t in tabs" :key="t.key" :label="t.label" :name="t.key" />
    </el-tabs>

    <div v-loading="loading">
      <EmptyState v-if="!loading && orders.length === 0" :type="activeTab === 'after_sales' ? 'afterSales' : 'order'" /> <!-- E012/E018 -->
      <div v-else style="display: flex; flex-direction: column; gap: 12px;">
        <div v-for="order in orders" :key="order.id" class="zao-card">
          <div class="flex-between" style="padding-bottom: 8px; border-bottom: 1px solid var(--zao-border);">
            <span style="font-size: 13px; color: var(--zao-gray-light);">订单号: {{ order.orderNo }}</span>
            <el-tag>{{ statusLabels[order.status] }}</el-tag>
          </div>
          <div v-for="item in order.items" :key="item.skuId" style="display: flex; align-items: center; gap: 12px; padding: 8px 0;">
            <img :src="item.productImage" style="width: 48px; height: 48px; border-radius: 8px; object-fit: cover;" />
            <div style="flex: 1;"><p style="font-weight: 500;">{{ item.productName }}</p><p style="font-size: 13px; color: var(--zao-gray-light);">{{ item.skuName }} × {{ item.quantity }}</p></div>
            <span style="font-weight: 500;">¥{{ item.price.toFixed(1) }}</span>
          </div>
          <!-- M9-3: 操作按钮 -->
          <div class="flex-between" style="padding-top: 8px; border-top: 1px solid var(--zao-border);">
            <span style="font-weight: 500;">合计: <span class="price">¥{{ order.totalAmount.toFixed(1) }}</span></span>
            <div style="display: flex; gap: 8px;">
              <template v-if="getActions(order).secondary"><el-button size="small" @click="getActions(order).secondary!.fn()">{{ getActions(order).secondary!.label }}</el-button></template>
              <template v-if="getActions(order).primary"><el-button size="small" type="primary" @click="getActions(order).primary!.fn()">{{ getActions(order).primary!.label }}</el-button></template>
            </div>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>
