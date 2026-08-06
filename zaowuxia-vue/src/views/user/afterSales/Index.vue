<script setup lang="ts">
/** 页面10: 售后申请 — M10-1~M10-7 + E039上传校验 */
import { ref } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import { submitAfterSales } from '@/api'
import { ElMessage } from 'element-plus'
import type { AfterSalesType } from '@/types'

const route = useRoute(); const router = useRouter()
const orderId = (route.query.orderId as string) || ''
const type = (['refund', 'return', 'reissue'] as const).includes(route.query.type as any) ? (route.query.type as AfterSalesType) : 'refund'
const reason = ref(''); const imageList = ref<string[]>([]); const submitting = ref(false); const submitted = ref(false)
const typeLabels: Record<string, string> = { refund: '退款', return: '退货', reissue: '缺件补发' }

function beforeUpload(file: File) {
  const isImage = file.type === 'image/jpeg' || file.type === 'image/png'
  if (!isImage) { ElMessage.error('仅支持JPG/PNG格式'); return false } // E039
  if (file.size > 10 * 1024 * 1024) { ElMessage.error('图片大小不超过10M'); return false } // E039
  const reader = new FileReader(); reader.onload = () => imageList.value.push(reader.result as string); reader.readAsDataURL(file)
  return false
}

async function handleSubmit() {
  if (!reason.value.trim()) { ElMessage.warning('请填写申请原因'); return }
  submitting.value = true
  try { await submitAfterSales({ orderId, type, reason: reason.value, images: imageList.value }); submitted.value = true; ElMessage.success('售后申请已提交') } catch { ElMessage.error('提交失败') } finally { submitting.value = false }
}
</script>

<template>
  <div style="max-width: 520px; margin: 0 auto; display: flex; flex-direction: column; gap: 16px;">
    <!-- M10-7: 提交后进度 -->
    <template v-if="submitted">
      <el-result icon="success" title="售后申请已提交" sub-title="我们将在1-3个工作日内审核您的申请">
        <template #extra><el-button @click="router.push('/orders')">返回订单</el-button><el-button type="primary" @click="router.push('/')">回首页</el-button></template>
      </el-result>
      <div class="zao-card"><p style="font-weight: 500;">售后进度</p><div style="display: flex; gap: 12px; margin-top: 8px;"><el-tag type="primary">审核中</el-tag><span>→</span><el-tag>已通过</el-tag><span>→</span><el-tag>处理中</el-tag><span>→</span><el-tag>已完成</el-tag></div></div>
    </template>

    <template v-else>
      <h2 style="font-size: 20px;">申请售后</h2>
      <!-- M10-1: 类型 -->
      <div class="zao-card"><p style="font-weight: 500; margin-bottom: 8px;">售后类型</p><el-radio-group :model-value="type" disabled><el-radio-button v-for="(v, k) in typeLabels" :key="k" :value="k">{{ v }}</el-radio-button></el-radio-group></div>
      <!-- M10-2: 关联订单 -->
      <div class="zao-card"><p style="font-weight: 500;">关联订单</p><p style="font-size: 13px; color: var(--zao-gray-light);">订单号: {{ orderId }}</p></div>
      <!-- M10-3: 原因 -->
      <div class="zao-card"><p style="font-weight: 500; margin-bottom: 8px;">申请原因</p><el-input v-model="reason" type="textarea" :rows="3" maxlength="500" show-word-limit placeholder="请详细描述售后原因…" /></div>
      <!-- M10-4: 凭证 -->
      <div class="zao-card"><p style="font-weight: 500; margin-bottom: 8px;">上传凭证（最多9张，每张≤10M，JPG/PNG）</p><el-upload list-type="picture-card" :before-upload="beforeUpload" :auto-upload="false" :file-list="[] as any" /><!-- E039校验 --></div>
      <!-- M10-5: 退款金额 -->
      <div v-if="type === 'refund'" class="zao-card"><p style="font-weight: 500;">预计退款金额</p><p class="price" style="font-size: 24px;">¥0.00</p><p style="font-size: 12px; color: var(--zao-gray-light);">实际退款金额以审核结果为准</p></div>
      <!-- M10-6: 提交 -->
      <el-button type="primary" size="large" :loading="submitting" @click="handleSubmit">提交申请</el-button>
    </template>
  </div>
</template>
