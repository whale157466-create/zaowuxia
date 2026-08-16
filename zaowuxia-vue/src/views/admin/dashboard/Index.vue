<script setup lang="ts">
/**
 * 管理端首页 — 数据看板
 * 概览卡片 + 订单趋势 + 分类销售占比 + 最近订单 + 热门商品排行
 * 当前使用 Mock 数据，接入后端时替换 API 调用即可。
 */
import { ref, onMounted, computed } from 'vue'
import { useRouter } from 'vue-router'
import { fetchDashboard } from '@/api'

const router = useRouter()

/* ===== 时间筛选 ===== */
const dateRange = ref<'today' | 'week' | 'month'>('today')
const dateLabels: Record<string, string> = { today: '今日', week: '近7天', month: '近30天' }

/* ===== 概览卡片数据 ===== */
const overviewCards = ref([
  { key: 'orders',   title: '订单总数', value: 0, unit: '笔', trend: 0, icon: 'Document', color: '#5b8c5a' },
  { key: 'revenue',  title: '销售额',   value: 0, unit: '元', trend: 0, icon: 'Money',   color: '#409eff' },
  { key: 'users',    title: '用户总数', value: 0, unit: '人', trend: 0, icon: 'User',    color: '#e6a23c' },
  { key: 'products', title: '在售商品', value: 0, unit: '件', trend: 0, icon: 'Goods',   color: '#67c23a' },
])

/* ===== 订单趋势（近7天） ===== */
const trendData = ref<{ date: string; count: number; amount: number }[]>([])

/* ===== 分类销售占比 ===== */
const categorySales = ref<{ name: string; count: number; amount: number; percent: number }[]>([])

/* ===== 最近订单 ===== */
const recentOrders = ref<any[]>([])

/* ===== 热门商品 ===== */
const hotProducts = ref<any[]>([])

const loading = ref(true)

/* ===== 从后端加载 ===== */
async function loadData() {
  loading.value = true
  try {
    const d = await fetchDashboard(dateRange.value)
    overviewCards.value = [
      { key: 'orders',   title: '订单总数', value: d.overview.orders, unit: '笔', trend: d.overview.orderTrend, icon: 'Document', color: '#5b8c5a' },
      { key: 'revenue',  title: '销售额',   value: d.overview.revenue, unit: '元', trend: d.overview.revenueTrend, icon: 'Money', color: '#409eff' },
      { key: 'users',    title: '用户总数', value: d.overview.users, unit: '人', trend: 0, icon: 'User', color: '#e6a23c' },
      { key: 'products', title: '在售商品', value: d.overview.products, unit: '件', trend: 0, icon: 'Goods', color: '#67c23a' },
    ]
    trendData.value = d.trend
    categorySales.value = d.categorySales
    recentOrders.value = d.recentOrders
    hotProducts.value = d.hotProducts
  } finally {
    loading.value = false
  }
}

onMounted(loadData)

const statusLabels: Record<string, string> = { pending_payment: '待付款', pending_ship: '待发货', pending_receive: '待收货', completed: '已完成' }

// 趋势图每列高度（相对最大值）
const barMaxHeight = 160
function barHeight(val: number) { return Math.max(4, (val / Math.max(...trendData.value.map(d => d.amount))) * barMaxHeight) + 'px' }
</script>

<template>
  <div v-loading="loading">
    <!-- 时间筛选 -->
    <div class="flex-between" style="margin-bottom: var(--zao-space-5);">
      <h2 style="font-size: 22px; font-weight: 700;">数据看板</h2>
      <el-radio-group v-model="dateRange" @change="loadData" size="small">
        <el-radio-button v-for="(v, k) in dateLabels" :key="k" :value="k">{{ v }}</el-radio-button>
      </el-radio-group>
    </div>

    <!-- ===== 概览卡片 ===== -->
    <div style="display: flex; gap: 16px; flex-wrap: wrap; margin-bottom: 20px;">
      <div v-for="card in overviewCards" :key="card.key"
        style="flex: 1; min-width: 200px; background: var(--zao-surface); border-radius: var(--zao-radius); padding: var(--zao-space-5); box-shadow: var(--zao-shadow);">
        <div class="flex-between">
          <span style="font-size: 14px; color: var(--zao-gray-light);">{{ card.title }}</span>
          <el-icon :size="22" :color="card.color"><component :is="card.icon" /></el-icon>
        </div>
        <div style="margin-top: 12px; display: flex; align-items: baseline; gap: 6px;">
          <span style="font-size: 28px; font-weight: 700;">{{ card.value.toLocaleString() }}</span>
          <span style="font-size: 13px; color: var(--zao-gray-light);">{{ card.unit }}</span>
        </div>
        <div style="margin-top: 6px; font-size: 13px;" :style="{ color: card.trend >= 0 ? 'var(--zao-blue)' : 'var(--zao-danger)' }">
          {{ card.trend >= 0 ? '↑' : '↓' }} {{ Math.abs(card.trend) }}% 较上期
        </div>
      </div>
    </div>

    <!-- ===== 图表区：订单趋势 + 分类占比 ===== -->
    <div style="display: flex; gap: 16px; flex-wrap: wrap; margin-bottom: 20px;">
      <!-- 订单趋势 — 纯 CSS 柱状图 -->
      <div style="flex: 2; min-width: 400px; background: var(--zao-surface); border-radius: var(--zao-radius); padding: var(--zao-space-5); box-shadow: var(--zao-shadow);">
        <h4 style="margin-bottom: 16px; font-weight: 500;">近7天订单趋势</h4>
        <div style="display: flex; align-items: flex-end; gap: 12px; height: 200px;">
          <div v-for="d in trendData" :key="d.date"
            style="flex: 1; display: flex; flex-direction: column; align-items: center; gap: 6px;">
            <span style="font-size: 11px; color: var(--zao-gray-light);">¥{{ (d.amount / 1000).toFixed(1) }}k</span>
            <div :style="{ width: '100%', maxWidth: '48px', height: barHeight(d.amount), background: 'var(--zao-blue)', borderRadius: '6px 6px 0 0', minHeight: '4px' }" />
            <span style="font-size: 11px; color: var(--zao-gray-light);">{{ d.date }}</span>
          </div>
        </div>
        <div style="display: flex; justify-content: space-around; margin-top: 12px; font-size: 13px; color: var(--zao-gray-light);">
          <span>订单量: {{ trendData.reduce((s, d) => s + d.count, 0) }} 笔</span>
          <span>销售额: ¥{{ trendData.reduce((s, d) => s + d.amount, 0).toLocaleString() }}</span>
        </div>
      </div>

      <!-- 分类销售占比 -->
      <div style="flex: 1; min-width: 280px; background: var(--zao-surface); border-radius: var(--zao-radius); padding: var(--zao-space-5); box-shadow: var(--zao-shadow);">
        <h4 style="margin-bottom: 16px; font-weight: 500;">分类销售占比</h4>
        <div style="display: flex; flex-direction: column; gap: 14px;">
          <div v-for="cat in categorySales" :key="cat.name">
            <div class="flex-between" style="margin-bottom: 4px;">
              <span style="font-size: 13px;">{{ cat.name }}</span>
              <span style="font-size: 13px; font-weight: 500;">{{ cat.percent }}%</span>
            </div>
            <el-progress :percentage="cat.percent" :color="['#5b8c5a', '#7dab7c', '#a3c7a2', '#c5e0c4'][categorySales.indexOf(cat)]" :stroke-width="10" :show-text="false" />
            <p style="font-size: 12px; color: var(--zao-gray-light); margin-top: 2px;">{{ cat.count }} 笔 · ¥{{ cat.amount.toLocaleString() }}</p>
          </div>
        </div>
      </div>
    </div>

    <!-- ===== 最近订单 + 热门商品 ===== -->
    <div style="display: flex; gap: 16px; flex-wrap: wrap;">
      <!-- 最近订单 -->
      <div style="flex: 3; min-width: 420px; background: var(--zao-surface); border-radius: var(--zao-radius); padding: var(--zao-space-5); box-shadow: var(--zao-shadow);">
        <div class="flex-between" style="margin-bottom: 12px;">
          <h4 style="font-weight: 500;">最近订单</h4>
          <el-button size="small" link @click="router.push('/admin/orders')">查看全部 →</el-button>
        </div>
        <el-table :data="recentOrders" size="small" stripe>
          <el-table-column prop="orderNo" label="订单号" width="150" />
          <el-table-column prop="user" label="用户" width="100" />
          <el-table-column prop="item" label="商品" show-overflow-tooltip />
          <el-table-column label="金额" width="80"><template #default="{ row }">¥{{ row.amount.toFixed(1) }}</template></el-table-column>
          <el-table-column label="状态" width="90"><template #default="{ row }"><el-tag size="small">{{ statusLabels[row.status] }}</el-tag></template></el-table-column>
          <el-table-column prop="time" label="时间" width="70" />
        </el-table>
      </div>

      <!-- 热门商品排行 -->
      <div style="flex: 2; min-width: 260px; background: var(--zao-surface); border-radius: var(--zao-radius); padding: var(--zao-space-5); box-shadow: var(--zao-shadow);">
        <div class="flex-between" style="margin-bottom: 12px;">
          <h4 style="font-weight: 500;">热门商品 TOP5</h4>
          <el-button size="small" link @click="router.push('/admin/products')">商品管理 →</el-button>
        </div>
        <div style="display: flex; flex-direction: column; gap: 10px;">
          <div v-for="p in hotProducts" :key="p.rank"
            style="display: flex; align-items: center; gap: 12px; padding: 8px 0; border-bottom: 1px solid var(--zao-border);">
            <span style="width: 24px; height: 24px; border-radius: 50%; display: flex; align-items: center; justify-content: center; font-size: 12px; font-weight: 700; color: var(--zao-surface);"
              :style="{ background: p.rank === 1 ? 'var(--zao-danger)' : p.rank === 2 ? 'var(--zao-warning)' : p.rank === 3 ? 'var(--zao-blue)' : 'var(--zao-gray-light)' }">
              {{ p.rank }}
            </span>
            <div style="flex: 1;">
              <p style="font-size: 14px; font-weight: 500; overflow: hidden; text-overflow: ellipsis; white-space: nowrap;">{{ p.name }}</p>
              <p style="font-size: 12px; color: var(--zao-gray-light);">销量 {{ p.sales }} · 销售额 ¥{{ p.amount.toLocaleString() }}</p>
            </div>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>
