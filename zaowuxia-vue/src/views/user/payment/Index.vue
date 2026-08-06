<script setup lang="ts">
/** 页面8: 支付页 — M8-1~M8-5 + E030取消 E031余额不足 E032重复支付 */
import { ref, onMounted } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import { createPayment, fetchOrderDetail, confirmPayment } from '@/api'
import { ElMessage } from 'element-plus'
import type { Order } from '@/types'

const route = useRoute(); const router = useRouter()
const order = ref<Order | null>(null)
const loading = ref(true); const paying = ref(false); const qrCodeUrl = ref<string | null>(null)
type PayResult = 'pending' | 'success' | 'fail' | 'cancelled'
const payResult = ref<PayResult>('pending')

onMounted(async () => {
  try { order.value = await fetchOrderDetail(route.params.orderId as string) } catch { ElMessage.error('获取订单信息失败') } finally { loading.value = false }
})

async function handlePay() {
  paying.value = true
  try { const res = await createPayment(route.params.orderId as string); qrCodeUrl.value = res.qrCodeUrl || 'https://picsum.photos/seed/qr/300/300'; ElMessage.info('请使用微信扫码完成支付') } catch { ElMessage.error('支付发起失败') } finally { paying.value = false }
}

async function simulate(r: PayResult) {
  if (r === 'success') {
    try {
      await confirmPayment(route.params.orderId as string)
      payResult.value = r
    } catch { ElMessage.error('支付确认失败') }
  } else {
    payResult.value = r
  }
}
</script>

<template>
  <div v-loading="loading" style="max-width: 400px; margin: 0 auto; text-align: center;">

    <!-- M8-5: 支付结果 -->
    <template v-if="payResult !== 'pending'">
      <el-result :icon="payResult === 'success' ? 'success' : payResult === 'fail' ? 'error' : 'info'" :title="payResult === 'success' ? '支付成功' : payResult === 'fail' ? '支付失败' : '支付已取消'" :sub-title="payResult === 'success' ? '感谢您的购买！' : payResult === 'fail' ? '余额不足或其他原因导致支付失败' : '订单保留为待付款'">
        <template #extra>
          <el-button type="primary" @click="router.push(`/orders/${route.params.orderId}`)">查看订单</el-button>
          <el-button v-if="payResult !== 'success'" @click="payResult = 'pending'">重新支付</el-button>
        </template>
      </el-result>
    </template>

    <template v-else>
      <h2 style="font-size: 20px;">确认支付</h2>
      <!-- M8-1: 金额 M8-2: 订单号 -->
      <p style="margin-top: 16px; font-size: 14px; color: var(--zao-gray-light);">支付金额</p>
      <p class="price" style="font-size: 36px;">¥{{ order?.totalAmount?.toFixed(1) ?? '0.0' }}</p>
      <p style="font-size: 13px; color: var(--zao-gray-light);">订单号: {{ order?.orderNo }}</p>
      <!-- M8-4: 倒计时 -->
      <p v-if="order?.expireAt" style="font-size: 13px; color: var(--zao-warning); margin-top: 4px;">订单将在 {{ order.expireAt }} 后自动关闭</p>

      <!-- M8-3: 扫码支付 -->
      <div v-if="qrCodeUrl" style="margin-top: 20px;">
        <img :src="qrCodeUrl" alt="支付二维码" style="width: 220px; height: 220px; border-radius: 8px;" />
        <p style="font-size: 13px; color: var(--zao-gray-light); margin-top: 8px;">请使用微信扫一扫</p>
        <div style="margin-top: 12px; display: flex; gap: 8px; justify-content: center;">
          <el-button size="small" type="primary" @click="simulate('success')">模拟成功</el-button>
          <el-button size="small" @click="simulate('fail')">模拟失败</el-button>
          <el-button size="small" @click="simulate('cancelled')">模拟取消</el-button>
        </div>
      </div>
      <el-button v-else type="primary" size="large" :loading="paying" style="margin-top: 24px;" @click="handlePay">发起微信支付</el-button>
    </template>
  </div>
</template>
