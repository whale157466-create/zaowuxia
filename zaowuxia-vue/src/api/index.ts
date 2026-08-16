/**
 * API 服务层 — 统一封装所有前后端交互请求。
 *
 * 当前使用 Mock 数据；切换到真实后端只需将 USE_MOCK 改为 false，
 * 并确保 baseURL 指向正确后端地址即可。
 */
import axios from 'axios'
import type { ApiResponse, Product, CartItem, Order, Address, Coupon, KitItem, Category, Paginated, Tutorial, Shop, Favorite, HistoryItem, DashboardData, User } from '@/types'

const http = axios.create({ baseURL: '/api', timeout: 15000 })

// 请求拦截：自动携带 Token
http.interceptors.request.use(config => {
  const token = localStorage.getItem('token')
  if (token) config.headers.Authorization = `Bearer ${token}`
  return config
})

// 响应拦截：统一错误处理
http.interceptors.response.use(
  res => res,
  err => {
    const msg = err.response?.data?.message || '网络异常，请稍后重试'
    return Promise.reject(new Error(msg))
  },
)

/* ============================== Mock 开关 ============================== */
const USE_MOCK = false

function delay<T>(data: T, ms = 300): Promise<T> {
  return new Promise(r => setTimeout(() => r(data), ms))
}

/* ============================== Mock 数据 ============================== */
const mockAddresses: Address[] = [
  { id: 'a1', recipient: '张三', phone: '13800138000', province: '广东省', city: '深圳市', district: '南山区', detail: '科技园路1号', isDefault: true },
  { id: 'a2', recipient: '张三', phone: '13800138000', province: '北京市', city: '北京市', district: '朝阳区', detail: '望京SOHO 12层', isDefault: false },
]

const mockProducts: Product[] = [
  { id: 'p1', name: '微缩蛋糕·草莓奶油杯', categoryId: 'c1', categoryName: '微缩蛋糕', difficulty: 'beginner', images: ['https://picsum.photos/seed/p1/400/400'], description: '<h3>材料清单</h3><ul><li>超轻粘土 x3色</li><li>树脂杯托 x1</li></ul><h3>制作步骤</h3><p>1. 揉制粘土成型…</p>', skus: [{ id: 's1a', name: '基础套装', price: 39.9, stock: 50 }, { id: 's1b', name: '豪华套装', price: 69.9, stock: 20 }], status: 'on', createdAt: '2026-07-01' },
  { id: 'p2', name: '篆刻入门·姓氏印章', categoryId: 'c2', categoryName: '篆刻入门', difficulty: 'intermediate', images: ['https://picsum.photos/seed/p2/400/400'], description: '<h3>材料清单</h3><ul><li>寿山石章料 x1</li><li>篆刻刀 x1</li></ul>', skus: [{ id: 's2a', name: '标准套装', price: 89.0, stock: 30 }], status: 'on', createdAt: '2026-07-05' },
  { id: 'p3', name: '热缩片耳环·星空系列', categoryId: 'c3', categoryName: '热缩片耳环', difficulty: 'beginner', images: ['https://picsum.photos/seed/p3/400/400'], description: '<h3>材料清单</h3><ul><li>热缩片 x5张</li><li>耳钩配件 x2对</li></ul>', skus: [{ id: 's3a', name: '单色套装', price: 29.9, stock: 0 }, { id: 's3b', name: '混色套装', price: 49.9, stock: 40 }], status: 'on', createdAt: '2026-07-10' },
  { id: 'p4', name: '微缩蛋糕·马卡龙塔', categoryId: 'c1', categoryName: '微缩蛋糕', difficulty: 'advanced', images: ['https://picsum.photos/seed/p4/400/400'], description: '高级手工项目', skus: [{ id: 's4a', name: '单层塔套装', price: 99.0, stock: 15 }], status: 'off', createdAt: '2026-06-20' },
]

const mockCartItems: CartItem[] = [
  { id: 'c1', productId: 'p1', productName: '微缩蛋糕·草莓奶油杯', productImage: 'https://picsum.photos/seed/p1/100/100', skuId: 's1a', skuName: '基础套装', price: 39.9, quantity: 2, stock: 50, checked: true },
  { id: 'c2', productId: 'p2', productName: '篆刻入门·姓氏印章', productImage: 'https://picsum.photos/seed/p2/100/100', skuId: 's2a', skuName: '标准套装', price: 89.0, quantity: 1, stock: 30, checked: true },
]

const mockCoupons: Coupon[] = [
  { id: 'cp1', name: '新人专享券', discount: 10, minAmount: 50, expireAt: '2026-12-31', used: false },
  { id: 'cp2', name: '满100减20', discount: 20, minAmount: 100, expireAt: '2026-08-01', used: false },
]

const mockOrders: Order[] = [
  { id: 'o1', orderNo: '202607240001', status: 'pending_payment', items: [{ productId: 'p1', productName: '微缩蛋糕·草莓奶油杯', productImage: 'https://picsum.photos/seed/p1/100/100', skuId: 's1a', skuName: '基础套装', price: 39.9, quantity: 1 }], address: mockAddresses[0], productAmount: 39.9, discountAmount: 0, freight: 8, totalAmount: 47.9, createdAt: '2026-07-24 10:30', expireAt: '2026-07-24 22:30' },
  { id: 'o2', orderNo: '202607230002', status: 'pending_ship', items: [{ productId: 'p2', productName: '篆刻入门·姓氏印章', productImage: 'https://picsum.photos/seed/p2/100/100', skuId: 's2a', skuName: '标准套装', price: 89, quantity: 1 }], address: mockAddresses[0], productAmount: 89, discountAmount: 10, freight: 0, totalAmount: 79, createdAt: '2026-07-23 14:00' },
  { id: 'o3', orderNo: '202607200003', status: 'pending_receive', items: [{ productId: 'p1', productName: '微缩蛋糕·草莓奶油杯', productImage: 'https://picsum.photos/seed/p1/100/100', skuId: 's1b', skuName: '豪华套装', price: 69.9, quantity: 1 }], address: mockAddresses[1], productAmount: 69.9, discountAmount: 0, freight: 8, totalAmount: 77.9, logistics: { company: '顺丰速运', trackingNo: 'SF1234567890', traces: [{ time: '2026-07-22 08:00', desc: '已签收' }] }, createdAt: '2026-07-20 16:00' },
  { id: 'o4', orderNo: '202607150004', status: 'completed', items: [{ productId: 'p3', productName: '热缩片耳环·星空系列', productImage: 'https://picsum.photos/seed/p3/100/100', skuId: 's3b', skuName: '混色套装', price: 49.9, quantity: 2 }], address: mockAddresses[0], productAmount: 99.8, discountAmount: 0, freight: 0, totalAmount: 99.8, createdAt: '2026-07-15 09:00' },
]

const mockKitItems: KitItem[] = [
  { productId: 'p_mat1', productName: '超轻粘土（3色套装）', skuId: 'sk_mat1', skuName: '标准装', price: 15.0, stock: 100, quantity: 1, type: 'material', checked: true },
  { productId: 'p_mat2', productName: '树脂杯托', skuId: 'sk_mat2', skuName: '透明款', price: 8.0, stock: 60, quantity: 1, type: 'material', checked: true },
  { productId: 'p_tool1', productName: '塑形工具套装', skuId: 'sk_tool1', skuName: '5件套', price: 25.0, stock: 40, quantity: 1, type: 'tool', checked: true },
  { productId: 'p_tool2', productName: '迷你擀面杖', skuId: 'sk_tool2', skuName: '小号', price: 12.0, stock: 0, quantity: 1, type: 'tool', checked: false },
]

/* ============================== 用户端 API ============================== */

/** 统一登录返回 */
export interface LoginResult { token: string; role: 'user' | 'admin' }

/** 微信扫码登录 — 仅限普通用户 */
export async function loginByWechat(code: string): Promise<LoginResult> {
  if (USE_MOCK) return delay({ token: 'mock_user_token_' + Date.now(), role: 'user' })
  const { data } = await http.post<ApiResponse<LoginResult>>('/user/login/wechat', { code })
  return data.data
}

/**
 * 统一账号密码登录 — 根据账号自动判断角色
 * - 账号包含 "admin" → 管理员
 * - 其他 → 普通用户
 * 真实后端由数据库角色字段决定，此处 Mock 规则仅用于开发演示
 */
export async function loginByPassword(account: string, password: string): Promise<LoginResult> {
  if (USE_MOCK) {
    const isAdmin = account.toLowerCase().includes('admin')
    return delay({ token: (isAdmin ? 'mock_admin_token_' : 'mock_user_token_') + Date.now(), role: isAdmin ? 'admin' : 'user' })
  }
  const { data } = await http.post<ApiResponse<LoginResult>>('/user/login/password', { account, password })
  return data.data
}

/** 获取分类列表 */
export async function fetchCategories(): Promise<Category[]> {
  if (USE_MOCK) return delay([{ id: 'c1', name: '微缩蛋糕', icon: '🍰' }, { id: 'c2', name: '篆刻入门', icon: '🔖' }, { id: 'c3', name: '热缩片耳环', icon: '💎' }])
  const { data } = await http.get<ApiResponse<Category[]>>('/categories')
  return data.data
}

/** 商品列表 — 分页 + 筛选 + 搜索 */
export async function fetchProducts(params: { keyword?: string; categoryId?: string; difficulty?: string; sort?: string; page?: number; pageSize?: number }): Promise<Paginated<Product>> {
  if (USE_MOCK) {
    let list = [...mockProducts].filter(p => p.status === 'on') // 默认只展示上架商品
    if (params.keyword) list = list.filter(p => p.name.includes(params.keyword!))
    if (params.categoryId) list = list.filter(p => p.categoryId === params.categoryId)
    if (params.difficulty) list = list.filter(p => p.difficulty === params.difficulty)
    if (params.sort === 'price_asc') list.sort((a, b) => a.skus[0].price - b.skus[0].price)
    if (params.sort === 'price_desc') list.sort((a, b) => b.skus[0].price - a.skus[0].price)
    return delay({ list, total: list.length, page: params.page || 1, pageSize: params.pageSize || 10 })
  }
  const { data } = await http.get<ApiResponse<Paginated<Product>>>('/products', { params })
  return data.data
}

/** 商品详情 */
export async function fetchProductDetail(id: string): Promise<Product> {
  if (USE_MOCK) { const p = mockProducts.find(x => x.id === id); return delay(p || mockProducts[0]) }
  const { data } = await http.get<ApiResponse<Product>>(`/products/${id}`)
  return data.data
}

/** 一键配齐物料清单 */
export async function fetchKitItems(productId: string): Promise<KitItem[]> {
  if (USE_MOCK) return delay(mockKitItems)
  const { data } = await http.get<ApiResponse<KitItem[]>>(`/products/${productId}/kit`)
  return data.data
}

/** 获取购物车 */
export async function fetchCart(): Promise<CartItem[]> {
  if (USE_MOCK) return delay(mockCartItems)
  const { data } = await http.get<ApiResponse<CartItem[]>>('/cart')
  return data.data
}

/** 加入购物车 */
export async function addToCart(skuId: string, quantity: number): Promise<void> {
  if (USE_MOCK) return delay(undefined)
  await http.post('/cart', { skuId, quantity })
}

/** 更新购物车商品（数量/勾选） */
export async function updateCartItem(id: string, body: Partial<Pick<CartItem, 'quantity' | 'checked'>>): Promise<void> {
  if (USE_MOCK) return delay(undefined)
  await http.put(`/cart/${id}`, body)
}

/** 删除购物车商品 */
export async function deleteCartItem(id: string): Promise<void> {
  if (USE_MOCK) return delay(undefined)
  await http.delete(`/cart/${id}`)
}

/** 批量加入购物车（一键配齐） */
export async function batchAddToCart(items: { skuId: string; quantity: number }[]): Promise<void> {
  if (USE_MOCK) return delay(undefined)
  await http.post('/cart/batch', { items })
}

/** 收货地址列表 */
export async function fetchAddresses(): Promise<Address[]> {
  if (USE_MOCK) return delay(mockAddresses)
  const { data } = await http.get<ApiResponse<Address[]>>('/addresses')
  return data.data
}

/** 新增收货地址 */
export async function createAddress(body: Partial<Address>): Promise<Address> {
  const { data } = await http.post<ApiResponse<Address>>('/addresses', body)
  return data.data
}

/** 更新收货地址 */
export async function updateAddress(id: string, body: Partial<Address>): Promise<Address> {
  const { data } = await http.put<ApiResponse<Address>>(`/addresses/${id}`, body)
  return data.data
}

/** 删除收货地址 */
export async function deleteAddress(id: string): Promise<void> {
  await http.delete<ApiResponse<null>>(`/addresses/${id}`)
}

/* ===== 收藏 ===== */
export async function fetchFavorites(): Promise<Favorite[]> {
  const { data } = await http.get<ApiResponse<Favorite[]>>('/favorites')
  return data.data
}
export async function addFavorite(productId: string): Promise<void> {
  await http.post('/favorites', { productId })
}
export async function removeFavorite(productId: string): Promise<void> {
  await http.delete(`/favorites/${productId}`)
}

/* ===== 浏览记录 ===== */
export async function fetchHistory(): Promise<HistoryItem[]> {
  const { data } = await http.get<ApiResponse<HistoryItem[]>>('/history')
  return data.data
}
export async function recordHistory(productId: string): Promise<void> {
  await http.post('/history', { productId })
}
export async function clearHistory(): Promise<void> {
  await http.delete('/history')
}

/* ===== 用户信息 ===== */
export async function fetchProfile(): Promise<User> {
  const { data } = await http.get<ApiResponse<User>>('/user/profile')
  return data.data
}
export async function updateProfile(body: { nickname?: string; avatar?: string }): Promise<User> {
  const { data } = await http.put<ApiResponse<User>>('/user/profile', body)
  return data.data
}

/** 优惠券列表 */
export async function fetchCoupons(amount: number): Promise<Coupon[]> {
  if (USE_MOCK) return delay(mockCoupons)
  const { data } = await http.get<ApiResponse<Coupon[]>>('/coupons', { params: { amount } })
  return data.data
}

/** 提交订单 */
export async function submitOrder(body: { items: { skuId: string; quantity: number }[]; addressId: string; couponId?: string; remark?: string }): Promise<{ orderId: string; orderNo: string; totalAmount: number }> {
  if (USE_MOCK) return delay({ orderId: 'o_new', orderNo: '202607240005', totalAmount: 168.8 })
  const { data } = await http.post<ApiResponse<{ orderId: string; orderNo: string; totalAmount: number }>>('/orders', body)
  return data.data
}

/** 发起支付 — 返回二维码或 H5 链接 */
export async function createPayment(orderId: string): Promise<{ qrCodeUrl?: string; h5Url?: string }> {
  if (USE_MOCK) return delay({ qrCodeUrl: 'https://picsum.photos/seed/qr/300/300' })
  const { data } = await http.post<ApiResponse<{ qrCodeUrl?: string; h5Url?: string }>>(`/orders/${orderId}/pay`)
  return data.data
}

/** 确认支付 — 模拟付款成功后更新订单状态 */
export async function confirmPayment(orderId: string): Promise<void> {
  if (USE_MOCK) return delay(undefined)
  await http.post(`/orders/${orderId}/pay/confirm`)
}

/** 订单列表 */
export async function fetchOrders(status?: string): Promise<Order[]> {
  if (USE_MOCK) { let list = mockOrders; if (status && status !== 'after_sales') list = list.filter(o => o.status === status); if (status === 'after_sales') list = list.filter(o => o.afterSales); return delay(list) }
  const { data } = await http.get<ApiResponse<Order[]>>('/orders', { params: { status } })
  return data.data
}

/** 订单详情 */
export async function fetchOrderDetail(id: string): Promise<Order> {
  if (USE_MOCK) return delay(mockOrders.find(o => o.id === id) || mockOrders[0])
  const { data } = await http.get<ApiResponse<Order>>(`/orders/${id}`)
  return data.data
}

/** 取消订单 */
export async function cancelOrder(orderId: string): Promise<void> {
  if (USE_MOCK) return delay(undefined)
  await http.put(`/orders/${orderId}/cancel`)
}

/** 确认收货 */
export async function confirmReceive(orderId: string): Promise<void> {
  if (USE_MOCK) return delay(undefined)
  await http.put(`/orders/${orderId}/receive`)
}

/** 提交售后申请 */
export async function submitAfterSales(body: { orderId: string; type: string; reason: string; images: string[] }): Promise<void> {
  if (USE_MOCK) return delay(undefined)
  await http.post('/after-sales', body)
}

/* ============================== 管理端 API ============================== */

/** 管理端商品列表 */
export async function adminFetchProducts(params: Record<string, unknown>): Promise<Paginated<Product>> {
  if (USE_MOCK) return delay({ list: mockProducts, total: mockProducts.length, page: 1, pageSize: 10 })
  const { data } = await http.get<ApiResponse<Paginated<Product>>>('/admin/products', { params })
  return data.data
}

/** 管理端更新商品 */
export async function adminUpdateProduct(id: string, body: Partial<Product>): Promise<void> {
  if (USE_MOCK) return delay(undefined)
  await http.put(`/admin/products/${id}`, body)
}

/** 管理端批量操作商品 */
export async function adminBatchUpdateProducts(ids: string[], action: string): Promise<void> {
  if (USE_MOCK) return delay(undefined)
  await http.post('/admin/products/batch', { ids, action })
}

/** 管理端新增商品 */
export async function adminCreateProduct(body: Partial<Product>): Promise<Product> {
  const { data } = await http.post<ApiResponse<Product>>('/admin/products', body)
  return data.data
}

/** 管理端删除商品 */
export async function adminDeleteProduct(id: string): Promise<void> {
  await http.delete<ApiResponse<null>>(`/admin/products/${id}`)
}

/** 管理端订单列表 */
export async function adminFetchOrders(params: Record<string, unknown>): Promise<Paginated<Order>> {
  if (USE_MOCK) return delay({ list: mockOrders, total: mockOrders.length, page: 1, pageSize: 10 })
  const { data } = await http.get<ApiResponse<Paginated<Order>>>('/admin/orders', { params })
  return data.data
}

/** 管理端发货 */
export async function adminShipOrder(orderId: string, company: string, trackingNo: string): Promise<void> {
  if (USE_MOCK) return delay(undefined)
  await http.post(`/admin/orders/${orderId}/ship`, { company, trackingNo })
}

/** 管理端售后审核 */
export async function adminReviewAfterSales(afterSalesId: string, approved: boolean, reason?: string): Promise<void> {
  if (USE_MOCK) return delay(undefined)
  await http.post(`/admin/after-sales/${afterSalesId}/review`, { approved, reason })
}

/** 管理端数据看板 */
export async function fetchDashboard(range: string = 'week'): Promise<DashboardData> {
  const { data } = await http.get<ApiResponse<DashboardData>>('/admin/dashboard', { params: { range } })
  return data.data
}

/* ============================== 教程 ============================== */

/** 教程列表（可按博主类型筛选） */
export async function fetchTutorials(bloggerType?: string): Promise<Tutorial[]> {
  const { data } = await http.get<ApiResponse<Tutorial[]>>('/tutorials', { params: { bloggerType } })
  return data.data
}

/** 教程详情（含套装/种草/材料清单） */
export async function fetchTutorialDetail(id: string): Promise<Tutorial> {
  const { data } = await http.get<ApiResponse<Tutorial>>(`/tutorials/${id}`)
  return data.data
}

/* ============================== 店铺 ============================== */

/** 店铺列表 */
export async function fetchShops(): Promise<Shop[]> {
  const { data } = await http.get<ApiResponse<Shop[]>>('/shops')
  return data.data
}

/** 店铺详情 */
export async function fetchShopDetail(id: string): Promise<Shop> {
  const { data } = await http.get<ApiResponse<Shop>>(`/shops/${id}`)
  return data.data
}
