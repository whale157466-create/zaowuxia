import { defineStore } from 'pinia'
import { ref, computed } from 'vue'
import type { CartItem } from '@/types'
import * as api from '@/api'

/**
 * 购物车状态管理 — 全局共享。
 * 购物车数量、金额等核心计算由后端返回，前端仅做展示。
 */
export const useCartStore = defineStore('cart', () => {
  const items = ref<CartItem[]>([])
  const loading = ref(false)

  const validItems = computed(() => items.value.filter(i => !i.invalid))
  const invalidItems = computed(() => items.value.filter(i => i.invalid))
  const checkedItems = computed(() => items.value.filter(i => i.checked && !i.invalid))
  const totalCount = computed(() => checkedItems.value.reduce((s, i) => s + i.quantity, 0))
  const totalAmount = computed(() => checkedItems.value.reduce((s, i) => s + i.price * i.quantity, 0))

  async function fetch() {
    loading.value = true
    items.value = await api.fetchCart()
    loading.value = false
  }

  async function add(skuId: string, quantity: number) {
    await api.addToCart(skuId, quantity)
    await fetch()
  }

  async function update(id: string, data: Partial<Pick<CartItem, 'quantity' | 'checked'>>) {
    await api.updateCartItem(id, data)
    items.value = items.value.map(i => i.id === id ? { ...i, ...data } : i)
  }

  async function remove(id: string) {
    await api.deleteCartItem(id)
    items.value = items.value.filter(i => i.id !== id)
  }

  function toggleAll(checked: boolean) {
    items.value = items.value.map(i => (i.invalid ? i : { ...i, checked }))
  }

  function removeInvalid() {
    items.value = items.value.filter(i => !i.invalid)
  }

  return { items, loading, validItems, invalidItems, checkedItems, totalCount, totalAmount, fetch, add, update, remove, toggleAll, removeInvalid }
})
