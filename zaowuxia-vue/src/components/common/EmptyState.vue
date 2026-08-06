<script setup lang="ts">
/** 空状态组件 — 覆盖原型 E010~E018 全部空状态场景 */
import { useRouter } from 'vue-router'
const props = defineProps<{ type: string; actionLabel?: string }>()
const emit = defineEmits<{ action: [] }>()
const router = useRouter()

const config: Record<string, { message: string; defaultAction?: string }> = {
  search:     { message: '没有找到相关商品',         defaultAction: '修改关键词' },
  cart:       { message: '购物车空空如也',           defaultAction: '去逛逛' },
  order:      { message: '暂无订单',                 defaultAction: '去逛逛' },
  favorite:   { message: '还没有收藏商品',           defaultAction: '去逛逛' },
  history:    { message: '暂无浏览记录',             defaultAction: '去逛逛' },
  address:    { message: '还没有收货地址',           defaultAction: '新增地址' },
  coupon:     { message: '暂无可用优惠券',           defaultAction: undefined },
  category:   { message: '该分类暂无商品',           defaultAction: '返回首页' },
  afterSales: { message: '暂无售后记录',             defaultAction: undefined },
}

const cfg = config[props.type]
const label = props.actionLabel || cfg?.defaultAction
function handleClick() { if (props.actionLabel) emit('action'); else router.push('/') }
</script>

<template>
  <el-empty :description="cfg?.message || '暂无数据'" :image-size="120">
    <template v-if="label" #default>
      <el-button type="primary" @click="handleClick">{{ label }}</el-button>
    </template>
  </el-empty>
</template>
