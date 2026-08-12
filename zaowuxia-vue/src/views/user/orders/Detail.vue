<script setup lang="ts">
/** 页面9子: 订单详情 — M9-4~M9-7 + D10确认收货 D12售后类型 */
import { ref, onMounted, computed } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import { fetchOrderDetail, confirmReceive } from '@/api'
import { ElMessage, ElMessageBox } from 'element-plus'
import type { Order } from '@/types'

const route = useRoute(); const router = useRouter()
const order = ref<Order | null>(null); const loading = ref(true)
const afterSalesVisible = ref(false)
const statusFlow = ['pending_payment', 'pending_ship', 'pending_receive', 'completed']
const statusLabels: Record<string, string> = { pending_payment: '待付款', pending_ship: '待发货', pending_receive: '待收货', completed: '已完成' }
const currentStep = computed(() => statusFlow.indexOf(order.value?.status || ''))

onMounted(async () => { order.value = await fetchOrderDetail(route.params.id as string); loading.value = false })

async function handleConfirmReceive() {
  await ElMessageBox.confirm('确认已收到商品？确认后将无法撤销。', '确认收货', { type: 'warning' })
  await confirmReceive(order.value!.id)
  order.value = await fetchOrderDetail(order.value!.id)
  ElMessage.success('已确认收货')
}

function goAfterSales(type: string) { afterSalesVisible.value = false; router.push(`/after-sales/new?orderId=${order.value!.id}&type=${type}`) }
</script>

<template>
  <div v-loading="loading" style="max-width: 640px; margin: 0 auto; display: flex; flex-direction: column; gap: 12px;">
    <el-result v-if="!order" icon="error" title="订单不存在" />

    <template v-else>
      <h2 style="font-size: 20px; font-weight: 700;">订单详情</h2>
      <p style="font-size: 13px; color: var(--zao-gray-light);">订单号: {{ order.orderNo }}</p>

      <!-- M9-4: 状态进度 -->
      <div class="zao-card">
        <el-steps :active="currentStep >= 0 ? currentStep : 0" :process-status="order.status === 'cancelled' ? 'error' : 'process'">
          <el-step v-for="s in statusFlow" :key="s" :title="statusLabels[s]" />
        </el-steps>
      </div>

      <!-- M9-5: 物流 -->
      <div v-if="order.logistics" class="zao-card">
        <p style="font-weight: 500;">物流信息</p>
        <p style="margin-top: 4px;">{{ order.logistics.company }} · {{ order.logistics.trackingNo }}</p>
        <div v-for="t in order.logistics.traces" :key="t.time" style="margin-top: 4px; font-size: 13px; display: flex; gap: 12px;">
          <span style="color: var(--zao-gray-light);">{{ t.time }}</span><span>{{ t.desc }}</span>
        </div>
      </div>

      <!-- M9-6: 商品明细 -->
      <div class="zao-card">
        <p style="font-weight: 500; margin-bottom: 8px;">商品明细</p>
        <div v-for="item in order.items" :key="item.skuId" style="display: flex; align-items: center; gap: 12px; padding: 8px 0;">
          <img :src="item.productImage" style="width: 48px; height: 48px; border-radius: 8px; object-fit: cover;" />
          <div style="flex: 1;"><p>{{ item.productName }}</p><p style="font-size: 13px; color: var(--zao-gray-light);">{{ item.skuName }} × {{ item.quantity }}</p></div>
          <span>¥{{ item.price.toFixed(1) }}</span>
        </div>
      </div>

      <div class="zao-card"><p style="font-weight: 500;">收货信息</p><p style="margin-top: 4px;">{{ order.address.recipient }} {{ order.address.phone }}</p><p style="font-size: 13px; color: var(--zao-gray-light);">{{ order.address.province }}{{ order.address.city }}{{ order.address.district }} {{ order.address.detail }}</p></div>
      <div class="zao-card" style="text-align: right;"><p>商品总额: ¥{{ order.productAmount.toFixed(1) }}</p><p>运费: ¥{{ order.freight.toFixed(1) }}</p><p class="price" style="font-size: 18px;">实付: ¥{{ order.totalAmount.toFixed(1) }}</p></div>

      <!-- M9-7: 操作 -->
      <div style="display: flex; gap: 12px;">
        <el-button v-if="order.status === 'pending_receive'" type="primary" @click="handleConfirmReceive">确认收货</el-button> <!-- D10 -->
        <el-button v-if="order.status === 'completed' && !order.afterSales" @click="afterSalesVisible = true">申请售后</el-button> <!-- M9-7 -->
        <el-tag v-if="order.afterSales">{{ order.afterSales.status === 'completed' ? '售后已完成' : '售后处理中' }}</el-tag> <!-- E042 -->
      </div>

      <!-- D12: 售后类型选择 -->
      <el-dialog v-model="afterSalesVisible" title="选择售后类型" width="380px">
        <div style="display: flex; flex-direction: column; gap: 8px;">
          <div v-for="opt in [{ key: 'refund', label: '💰 退款', desc: '仅退款' }, { key: 'return', label: '📦 退货', desc: '退货退款' }, { key: 'reissue', label: '🔧 缺件补发', desc: '少发漏发' }]" :key="opt.key" style="border: 1px solid var(--zao-border); border-radius: 8px; padding: 12px; cursor: pointer;" @click="goAfterSales(opt.key)">
            <p style="font-weight: 500;">{{ opt.label }}</p><p style="font-size: 13px; color: var(--zao-gray-light);">{{ opt.desc }}</p>
          </div>
        </div>
      </el-dialog>
    </template>
  </div>
</template>
