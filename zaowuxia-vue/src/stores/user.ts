import { defineStore } from 'pinia'
import { ref, computed } from 'vue'
import type { User } from '@/types'
import * as api from '@/api'

/**
 * 用户状态管理 — 统一登录，根据 role 分流用户端 / 管理端。
 * Token + role 存储于 localStorage。
 */
export const useUserStore = defineStore('user', () => {
  const user = ref<User | null>(null)
  const token = ref<string | null>(localStorage.getItem('token'))
  const role = ref<'user' | 'admin' | null>((localStorage.getItem('role') as any) || null)
  const loading = ref(false)

  const isLoggedIn = computed(() => !!user.value && !!token.value)
  const isAdmin = computed(() => role.value === 'admin')

  /** 微信扫码登录 — 只能进入用户端 */
  async function loginByWechat(code: string) {
    loading.value = true
    try {
      const res = await api.loginByWechat(code)
      token.value = res.token; role.value = res.role
      localStorage.setItem('token', res.token); localStorage.setItem('role', res.role)
      user.value = { id: 'u1', nickname: '手工爱好者', avatar: '', openId: 'oxxx' }
    } finally { loading.value = false }
  }

  /**
   * 统一账号密码登录
   * - admin 账号 → 跳转 /admin 看板
   * - 普通账号 → 跳转 / 首页
   */
  async function loginByPassword(account: string, password: string) {
    loading.value = true
    try {
      const res = await api.loginByPassword(account, password)
      token.value = res.token; role.value = res.role
      localStorage.setItem('token', res.token); localStorage.setItem('role', res.role)
      user.value = { id: 'u1', nickname: account, avatar: '', email: account }
    } finally { loading.value = false }
  }

  /** 游客模式 — 仅用户端 */
  function enterAsGuest() {
    user.value = { id: 'guest', nickname: '游客', avatar: '' }
    token.value = null; role.value = 'user'
  }

  /** 退出登录 — 清除 token + role */
  function logout() {
    localStorage.removeItem('token'); localStorage.removeItem('role')
    token.value = null; role.value = null; user.value = null
  }

  return { user, token, role, loading, isLoggedIn, isAdmin, loginByWechat, loginByPassword, enterAsGuest, logout }
})
