<script setup lang="ts">
/** 管理端订单管理 — AM3-1~AM3-7 + D23~D25 + E047~E050 */
import { ref, onMounted } from 'vue'
import { adminFetchOrders, adminShipOrder, adminReviewAfterSales } from '@/api'
import { ElMessage, ElMessageBox } from 'element-plus'
import type { Order } from '@/types'

const orders = ref<Order[]>([]); const loading = ref(true)
const searchText = ref(''); const statusFilter = ref('')
const shipVisible = ref(false); const reviewVisible = ref(false); const exportVisible = ref(false)
const selectedOrder = ref<Order | null>(null)
const shipForm = ref({ company: '顺丰速运', trackingNo: '' })
const reviewReason = ref('')
const statusLabels: Record<string, string> = { pending_payment: '待付款', pending_ship: '待发货', pending_receive: '待收货', completed: '已完成', cancelled: '已取消' }
const companies = ['顺丰速运', '中通快递', '圆通速递', '韵达快递', '邮政EMS']

onMounted(async () => { orders.value = (await adminFetchOrders({})).list; loading.value = false })

async function handleShip() {
  if (!shipForm.value.trackingNo.trim()) { ElMessage.warning('请填写物流单号'); return }
  if (orders.value.some(o => o.logistics?.trackingNo === shipForm.value.trackingNo)) { ElMessage.error('物流单号已存在'); return } // E047
  if (selectedOrder.value?.status === 'cancelled') { ElMessage.error('该订单已退款，无法发货'); return } // E048
  await adminShipOrder(selectedOrder.value!.id, shipForm.value.company, shipForm.value.trackingNo)
  ElMessage.success('发货成功'); shipVisible.value = false
}
async function handleReview(approved: boolean) {
  await ElMessageBox.confirm(`确定${approved ? '通过' : '拒绝'}该售后申请？`, '售后审核') // E050
  await adminReviewAfterSales(selectedOrder.value!.afterSales!.id, approved, reviewReason.value)
  ElMessage.success(approved ? '已通过' : '已拒绝'); reviewVisible.value = false
}
</script>

<template>
  <div>
    <h2 style="font-size: 20px; margin-bottom: 16px;">订单管理</h2>
    <div style="display: flex; gap: 12px; margin-bottom: 16px;">
      <el-input v-model="searchText" placeholder="搜索订单号/用户" style="width: 220px;" clearable />
      <el-select v-model="statusFilter" placeholder="状态" clearable style="width: 140px;"><el-option v-for="(v, k) in statusLabels" :key="k" :label="v" :value="k" /></el-select>
      <el-button @click="exportVisible = true">批量导出</el-button> <!-- D25 -->
    </div>

    <el-table :data="orders" v-loading="loading" row-key="id">
      <el-table-column type="expand"><template #default="{ row: order }"><div style="padding: 12px;"><p><strong>地址:</strong> {{ order.address.recipient }} {{ order.address.phone }} {{ order.address.province }}{{ order.address.city }}{{ order.address.district }} {{ order.address.detail }}</p><p v-if="order.logistics"><strong>物流:</strong> {{ order.logistics.company }} {{ order.logistics.trackingNo }}</p></div></template></el-table-column>
      <el-table-column prop="orderNo" label="订单号" width="140" />
      <el-table-column label="用户" width="80"><template #default="{ row }">{{ row.address.recipient }}</template></el-table-column>
      <el-table-column label="商品" width="240"><template #default="{ row }">{{ row.items.map((i: any) => i.productName).join('、') }}</template></el-table-column>
      <el-table-column label="金额" width="100"><template #default="{ row }">¥{{ row.totalAmount.toFixed(1) }}</template></el-table-column>
      <el-table-column label="状态" width="90"><template #default="{ row }"><el-tag>{{ statusLabels[row.status] }}</el-tag></template></el-table-column>
      <el-table-column prop="createdAt" label="时间" width="140" />
      <el-table-column label="操作" width="160"><template #default="{ row }">
        <el-button v-if="row.status === 'pending_ship'" size="small" type="primary" @click="selectedOrder = row; shipVisible = true">发货</el-button>
        <el-button v-if="row.afterSales?.status === 'reviewing'" size="small" @click="selectedOrder = row; reviewVisible = true">审核</el-button>
      </template></el-table-column>
    </el-table>

    <!-- D23: 发货 -->
    <el-dialog v-model="shipVisible" title="发货操作" width="420px">
      <p>订单号: {{ selectedOrder?.orderNo }}</p>
      <el-select v-model="shipForm.company" style="width: 100%; margin-top: 12px;"><el-option v-for="c in companies" :key="c" :label="c" :value="c" /></el-select>
      <el-input v-model="shipForm.trackingNo" placeholder="物流单号" style="margin-top: 12px;" />
      <template #footer><el-button @click="shipVisible = false">取消</el-button><el-button type="primary" @click="handleShip">确认发货</el-button></template>
    </el-dialog>

    <!-- D24: 售后审核 -->
    <el-dialog v-model="reviewVisible" title="售后审核" width="460px">
      <div v-if="selectedOrder?.afterSales"><p><strong>类型:</strong> {{ selectedOrder.afterSales.type }}</p><p><strong>原因:</strong> {{ selectedOrder.afterSales.reason }}</p><el-input v-model="reviewReason" type="textarea" :rows="2" placeholder="审核备注（选填）" style="margin-top: 12px;" /></div>
      <template #footer><el-button @click="reviewVisible = false">关闭</el-button><el-button type="primary" @click="handleReview(true)">通过</el-button><el-button type="danger" @click="handleReview(false)">拒绝</el-button></template>
    </el-dialog>

    <!-- D25: 导出 -->
    <el-dialog v-model="exportVisible" title="导出订单" width="400px">
      <p>选择导出时间范围和字段，确认后开始导出。</p>
      <p style="font-size: 13px; color: var(--zao-gray-light); margin-top: 8px;">大量数据将在后台异步生成，完成后通知下载。</p> <!-- E049 -->
      <template #footer><el-button @click="exportVisible = false">取消</el-button><el-button type="primary" @click="exportVisible = false; ElMessage.info('数据量较大，将后台生成后通知您下载')">确认导出</el-button></template>
    </el-dialog>
  </div>
</template>
