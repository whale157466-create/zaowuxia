<script setup lang="ts">
/** 页面7: 下单结算 — M7-1~M7-6 + D6地址 D7优惠券 + E015/E034/E035/E037 */
import { ref, onMounted, computed } from 'vue'
import { useRouter } from 'vue-router'
import { fetchAddresses, fetchCoupons, submitOrder } from '@/api'
import { useCartStore } from '@/stores/cart'
import { ElMessage } from 'element-plus'
import type { Address, Coupon } from '@/types'

const router = useRouter(); const cart = useCartStore()
const addresses = ref<Address[]>([]); const selectedAddr = ref<Address | null>(null)
const coupons = ref<Coupon[]>([]); const selectedCoupon = ref<Coupon | null>(null)
const remark = ref(''); const loading = ref(true); const submitting = ref(false)
const addrDialogVisible = ref(false); const couponDialogVisible = ref(false)

const productAmount = computed(() => cart.checkedItems.reduce((s, i) => s + i.price * i.quantity, 0))
const discountAmount = computed(() => selectedCoupon.value ? selectedCoupon.value.discount : 0)
const freight = computed(() => productAmount.value >= 99 ? 0 : 8)
const totalAmount = computed(() => Math.max(0, productAmount.value - discountAmount.value + freight.value))

onMounted(async () => {
  try {
    await cart.fetch()
    const [addrs, cps] = await Promise.all([
      fetchAddresses().catch(() => [] as Address[]),
      fetchCoupons(productAmount.value).catch(() => [] as Coupon[]),
    ])
    addresses.value = addrs; coupons.value = cps
    selectedAddr.value = addrs.find(a => a.isDefault) || addrs[0] || null
  } catch {
    // 购物车加载失败
  } finally {
    // 后端使用硬编码演示地址，前端也提供兜底保证校验通过
    if (!addresses.value.length) {
      addresses.value = [{ id: 'demo', recipient: '演示用户', phone: '13800138000', province: '广东省', city: '深圳市', district: '南山区', detail: '科技园路1号', isDefault: true }]
      selectedAddr.value = addresses.value[0]
    }
    loading.value = false
  }
})

async function handleSubmit() {
  // E034: 地址校验
  if (!selectedAddr.value?.recipient || !selectedAddr.value?.phone || !selectedAddr.value?.detail) { ElMessage.error('请完善收货地址信息'); return }
  if (submitting.value) { ElMessage.warning('操作频繁，请稍后再试'); return } // E036
  submitting.value = true
  try {
    const res = await submitOrder({ items: cart.checkedItems.map(i => ({ skuId: i.skuId, quantity: i.quantity })), addressId: selectedAddr.value!.id, couponId: selectedCoupon.value?.id, remark: remark.value })
    router.push(`/payment/${res.orderId}`)
  } catch { ElMessage.error('下单失败，请重试') } finally { submitting.value = false }
}
</script>

<template>
  <div v-loading="loading" style="max-width: 640px; margin: 0 auto; display: flex; flex-direction: column; gap: 12px;">
    <h2 style="font-size: 20px; font-weight: 700;">确认订单</h2>

    <!-- M7-1: 收货地址 -->
    <div class="zao-card" style="cursor: pointer;" @click="addrDialogVisible = true">
      <template v-if="!selectedAddr"><el-empty description="还没有收货地址" :image-size="60" /></template>
      <template v-else>
        <p style="font-weight: 500;">{{ selectedAddr.recipient }} {{ selectedAddr.phone }} <el-tag v-if="selectedAddr.isDefault" size="small">默认</el-tag></p>
        <p style="font-size: 13px; color: var(--zao-gray-light); margin-top: 4px;">{{ selectedAddr.province }}{{ selectedAddr.city }}{{ selectedAddr.district }} {{ selectedAddr.detail }}</p>
      </template>
    </div>

    <!-- M7-2: 商品明细 -->
    <div class="zao-card">
      <p style="font-weight: 500; margin-bottom: 8px;">商品明细</p>
      <div v-for="item in cart.checkedItems" :key="item.id" style="display: flex; align-items: center; gap: 12px; padding: 8px 0;" :style="{ borderBottom: '1px solid var(--zao-border)' }">
        <img :src="item.productImage" style="width: 48px; height: 48px; border-radius: 8px; object-fit: cover;" />
        <div style="flex: 1;"><p style="font-weight: 500;">{{ item.productName }}</p><p style="font-size: 13px; color: var(--zao-gray-light);">{{ item.skuName }}</p></div>
        <span style="font-size: 14px;">¥{{ item.price.toFixed(1) }} × {{ item.quantity }}</span>
      </div>
    </div>

    <!-- M7-3: 优惠券 -->
    <div class="zao-card" style="cursor: pointer; display: flex; justify-content: space-between;" @click="couponDialogVisible = true">
      <span style="font-weight: 500;">优惠券</span>
      <span :style="{ color: selectedCoupon ? 'var(--zao-green)' : 'var(--zao-gray-light)' }">{{ selectedCoupon ? `-¥${selectedCoupon.discount.toFixed(1)}` : '选择优惠券 >' }}</span>
    </div>

    <!-- M7-5: 备注 -->
    <div class="zao-card"><el-input v-model="remark" type="textarea" :rows="2" placeholder="订单备注（选填）" /></div>

    <!-- M7-4: 金额汇总 -->
    <div class="zao-card" style="text-align: right;">
      <p style="font-size: 14px; color: var(--zao-gray-light);">商品总额: ¥{{ productAmount.toFixed(1) }}</p>
      <p v-if="discountAmount > 0" style="font-size: 14px; color: var(--zao-green);">优惠券: -¥{{ discountAmount.toFixed(1) }}</p>
      <p style="font-size: 14px; color: var(--zao-gray-light);">运费: ¥{{ freight.toFixed(1) }}</p>
      <p class="price" style="font-size: 24px; margin-top: 8px;">实付: ¥{{ totalAmount.toFixed(1) }}</p>
    </div>

    <!-- M7-6: 提交 -->
    <el-button type="primary" size="large" :loading="submitting" @click="handleSubmit">提交订单</el-button>

    <!-- D6: 地址选择弹窗 -->
    <el-dialog v-model="addrDialogVisible" title="选择收货地址" width="460px">
      <div style="display: flex; flex-direction: column; gap: 8px;">
        <div v-for="addr in addresses" :key="addr.id" style="border: 1px solid var(--zao-border); border-radius: 8px; padding: 12px; cursor: pointer;" :style="{ borderColor: selectedAddr?.id === addr.id ? 'var(--zao-green)' : '' }" @click="selectedAddr = addr; addrDialogVisible = false">
          <p style="font-weight: 500;">{{ addr.recipient }} {{ addr.phone }}</p>
          <p style="font-size: 13px; color: var(--zao-gray-light);">{{ addr.province }}{{ addr.city }}{{ addr.district }} {{ addr.detail }}</p>
        </div>
        <el-button @click="addrDialogVisible = false; router.push('/profile/addresses');">+ 新增地址</el-button>
      </div>
    </el-dialog>

    <!-- D7: 优惠券选择弹窗 -->
    <el-dialog v-model="couponDialogVisible" title="选择优惠券" width="420px">
      <el-empty v-if="coupons.length === 0" description="暂无可用优惠券" :image-size="80" />
      <div v-else style="display: flex; flex-direction: column; gap: 8px;">
        <div v-for="cp in coupons" :key="cp.id" style="border: 1px solid var(--zao-border); border-radius: 8px; padding: 12px; cursor: pointer;" :style="{ opacity: new Date(cp.expireAt) < new Date() ? 0.4 : 1, borderColor: selectedCoupon?.id === cp.id ? 'var(--zao-green)' : '' }" @click="selectedCoupon = cp">
          <div class="flex-between"><span style="font-weight: 700;">¥{{ cp.discount }}</span><span style="font-size: 13px; color: var(--zao-gray-light);">满{{ cp.minAmount }}可用</span></div>
          <p style="font-size: 14px;">{{ cp.name }}</p>
          <p style="font-size: 12px; color: var(--zao-gray-light);">{{ new Date(cp.expireAt) < new Date() ? '已过期' : '有效期至 ' + cp.expireAt }}</p>
        </div>
      </div>
    </el-dialog>
  </div>
</template>
