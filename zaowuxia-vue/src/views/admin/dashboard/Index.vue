<script setup lang="ts">
/**
 * 管理端首页 — 数据看板
 * 概览卡片 + 订单趋势 + 分类销售占比 + 最近订单 + 热门商品排行
 * 当前使用 Mock 数据，接入后端时替换 API 调用即可。
 */
import { ref, onMounted, computed } from 'vue'
import { useRouter } from 'vue-router'

const router = useRouter()

/* ===== 时间筛选 ===== */
const dateRange = ref<'today' | 'week' | 'month'>('today')
const dateLabels: Record<string, string> = { today: '今日', week: '近7天', month: '近30天' }

/* ===== 概览卡片数据 ===== */
const overviewCards = ref([
  { key: 'orders',   title: '订单总数', value: 0, unit: '笔', trend: 0, icon: 'Document', color: '#5b8c5a' },
  { key: 'revenue',  title: '销售额',   value: 0, unit: '元', trend: 0, icon: 'Money',   color: '#409eff' },
  { key: 'users',    title: '新增用户', value: 0, unit: '人', trend: 0, icon: 'User',    color: '#e6a23c' },
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

/* ===== Mock 数据加载 ===== */
function loadMockData() {
  // 概览
  overviewCards.value = [
    { key: 'orders',   title: '订单总数', value: dateRange.value === 'today' ? 28 : dateRange.value === 'week' ? 186 : 742, unit: '笔', trend: +12, icon: 'Document', color: '#5b8c5a' },
    { key: 'revenue',  title: '销售额',   value: dateRange.value === 'today' ? 3860 : dateRange.value === 'week' ? 24500 : 98500, unit: '元', trend: +8, icon: 'Money', color: '#409eff' },
    { key: 'users',    title: '新增用户', value: dateRange.value === 'today' ? 15 : dateRange.value === 'week' ? 103 : 420, unit: '人', trend: +23, icon: 'User', color: '#e6a23c' },
    { key: 'products', title: '在售商品', value: 56, unit: '件', trend: -2, icon: 'Goods', color: '#67c23a' },
  ]

  // 订单趋势（近7天）
  trendData.value = [
    { date: '07-25', count: 22, amount: 3200 }, { date: '07-26', count: 28, amount: 4100 },
    { date: '07-27', count: 35, amount: 5800 }, { date: '07-28', count: 30, amount: 4400 },
    { date: '07-29', count: 26, amount: 3600 }, { date: '07-30', count: 32, amount: 4900 },
    { date: '07-31', count: 28, amount: 3860 },
  ]
  const maxAmount = Math.max(...trendData.value.map(d => d.amount))

  // 分类销售
  categorySales.value = [
    { name: '微缩蛋糕', count: 82, amount: 38500, percent: 39 },
    { name: '篆刻入门', count: 56, amount: 27500, percent: 28 },
    { name: '热缩片耳环', count: 38, amount: 18800, percent: 19 },
    { name: '其他手工', count: 24, amount: 13700, percent: 14 },
  ]

  // 最近订单
  recentOrders.value = [
    { orderNo: '202607310001', user: '手工爱好者', item: '微缩蛋糕·草莓奶油杯', amount: 39.9, status: 'pending_ship', time: '10:30' },
    { orderNo: '202607310002', user: '创意达人', item: '篆刻入门·姓氏印章', amount: 89.0, status: 'pending_payment', time: '10:15' },
    { orderNo: '202607310003', user: 'DIY小能手', item: '热缩片耳环·星空系列', amount: 49.9, status: 'pending_ship', time: '09:48' },
    { orderNo: '202607300004', user: '手工爱好者', item: '微缩蛋糕·马卡龙塔', amount: 99.0, status: 'completed', time: '昨天' },
    { orderNo: '202607300005', user: '创意达人', item: '塑形工具套装', amount: 25.0, status: 'pending_receive', time: '昨天' },
  ]

  // 热门商品
  hotProducts.value = [
    { rank: 1, name: '微缩蛋糕·草莓奶油杯', sales: 128, amount: 5107 },
    { rank: 2, name: '篆刻入门·姓氏印章', sales: 96, amount: 8544 },
    { rank: 3, name: '热缩片耳环·星空系列', sales: 74, amount: 3693 },
    { rank: 4, name: '超轻粘土（3色套装）', sales: 62, amount: 930 },
    { rank: 5, name: '塑形工具套装', sales: 55, amount: 1375 },
  ]

  loading.value = false
}

onMounted(loadMockData)

const statusLabels: Record<string, string> = { pending_payment: '待付款', pending_ship: '待发货', pending_receive: '待收货', completed: '已完成' }

// 趋势图每列高度（相对最大值）
const barMaxHeight = 160
function barHeight(val: number) { return Math.max(4, (val / Math.max(...trendData.value.map(d => d.amount))) * barMaxHeight) + 'px' }
</script>

<template>
  <div v-loading="loading">
    <!-- 时间筛选 -->
    <div class="flex-between" style="margin-bottom: 20px;">
      <h2 style="font-size: 22px; font-weight: 700;">数据看板</h2>
      <el-radio-group v-model="dateRange" @change="loadMockData" size="small">
        <el-radio-button v-for="(v, k) in dateLabels" :key="k" :value="k">{{ v }}</el-radio-button>
      </el-radio-group>
    </div>

    <!-- ===== 概览卡片 ===== -->
    <div style="display: flex; gap: 16px; flex-wrap: wrap; margin-bottom: 20px;">
      <div v-for="card in overviewCards" :key="card.key"
        style="flex: 1; min-width: 200px; background: #fff; border-radius: 12px; padding: 20px; box-shadow: 0 1px 6px rgba(0,0,0,0.06);">
        <div class="flex-between">
          <span style="font-size: 14px; color: var(--zao-gray-light);">{{ card.title }}</span>
          <el-icon :size="22" :color="card.color"><component :is="card.icon" /></el-icon>
        </div>
        <div style="margin-top: 12px; display: flex; align-items: baseline; gap: 6px;">
          <span style="font-size: 28px; font-weight: 700;">{{ card.value.toLocaleString() }}</span>
          <span style="font-size: 13px; color: var(--zao-gray-light);">{{ card.unit }}</span>
        </div>
        <div style="margin-top: 6px; font-size: 13px;" :style="{ color: card.trend >= 0 ? '#67c23a' : '#e85d3a' }">
          {{ card.trend >= 0 ? '↑' : '↓' }} {{ Math.abs(card.trend) }}% 较上期
        </div>
      </div>
    </div>

    <!-- ===== 图表区：订单趋势 + 分类占比 ===== -->
    <div style="display: flex; gap: 16px; flex-wrap: wrap; margin-bottom: 20px;">
      <!-- 订单趋势 — 纯 CSS 柱状图 -->
      <div style="flex: 2; min-width: 400px; background: #fff; border-radius: 12px; padding: 20px; box-shadow: 0 1px 6px rgba(0,0,0,0.06);">
        <h4 style="margin-bottom: 16px; font-weight: 500;">近7天订单趋势</h4>
        <div style="display: flex; align-items: flex-end; gap: 12px; height: 200px;">
          <div v-for="d in trendData" :key="d.date"
            style="flex: 1; display: flex; flex-direction: column; align-items: center; gap: 6px;">
            <span style="font-size: 11px; color: var(--zao-gray-light);">¥{{ (d.amount / 1000).toFixed(1) }}k</span>
            <div :style="{ width: '100%', maxWidth: '48px', height: barHeight(d.amount), background: 'linear-gradient(180deg, #5b8c5a, #7dab7c)', borderRadius: '6px 6px 0 0', minHeight: '4px', transition: 'height 0.3s' }" />
            <span style="font-size: 11px; color: var(--zao-gray-light);">{{ d.date }}</span>
          </div>
        </div>
        <div style="display: flex; justify-content: space-around; margin-top: 12px; font-size: 13px; color: var(--zao-gray-light);">
          <span>订单量: {{ trendData.reduce((s, d) => s + d.count, 0) }} 笔</span>
          <span>销售额: ¥{{ trendData.reduce((s, d) => s + d.amount, 0).toLocaleString() }}</span>
        </div>
      </div>

      <!-- 分类销售占比 -->
      <div style="flex: 1; min-width: 280px; background: #fff; border-radius: 12px; padding: 20px; box-shadow: 0 1px 6px rgba(0,0,0,0.06);">
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
      <div style="flex: 3; min-width: 420px; background: #fff; border-radius: 12px; padding: 20px; box-shadow: 0 1px 6px rgba(0,0,0,0.06);">
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
      <div style="flex: 2; min-width: 260px; background: #fff; border-radius: 12px; padding: 20px; box-shadow: 0 1px 6px rgba(0,0,0,0.06);">
        <div class="flex-between" style="margin-bottom: 12px;">
          <h4 style="font-weight: 500;">热门商品 TOP5</h4>
          <el-button size="small" link @click="router.push('/admin/products')">商品管理 →</el-button>
        </div>
        <div style="display: flex; flex-direction: column; gap: 10px;">
          <div v-for="p in hotProducts" :key="p.rank"
            style="display: flex; align-items: center; gap: 12px; padding: 8px 0; border-bottom: 1px solid var(--zao-border);">
            <span style="width: 24px; height: 24px; border-radius: 50%; display: flex; align-items: center; justify-content: center; font-size: 12px; font-weight: 700; color: #fff;"
              :style="{ background: p.rank === 1 ? '#e85d3a' : p.rank === 2 ? '#f0ad4e' : p.rank === 3 ? '#5b8c5a' : '#999' }">
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
