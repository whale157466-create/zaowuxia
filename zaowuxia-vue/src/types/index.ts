/* ==================== 用户 ==================== */
export interface User {
  id: string
  openId?: string
  nickname: string
  avatar: string
  phone?: string
  email?: string
}

/* ==================== 收货地址 ==================== */
export interface Address {
  id: string
  recipient: string
  phone: string
  province: string
  city: string
  district: string
  detail: string
  isDefault: boolean
}

/* ==================== 商品 ==================== */
export type Difficulty = 'beginner' | 'intermediate' | 'advanced'

export interface Sku {
  id: string
  name: string
  price: number
  stock: number
  image?: string
}

export interface Product {
  id: string
  name: string
  categoryId: string
  categoryName: string
  difficulty: Difficulty
  images: string[]
  description: string
  skus: Sku[]
  status: 'on' | 'off'
  createdAt: string
}

/* ==================== 一键配齐 ==================== */
export interface KitItem {
  productId: string
  productName: string
  skuId: string
  skuName: string
  price: number
  stock: number
  quantity: number
  type: 'material' | 'tool'
  checked: boolean
}

/* ==================== 购物车 ==================== */
export interface CartItem {
  id: string
  productId: string
  productName: string
  productImage: string
  skuId: string
  skuName: string
  price: number
  quantity: number
  stock: number
  checked: boolean
  invalid?: boolean
}

/* ==================== 优惠券 ==================== */
export interface Coupon {
  id: string
  name: string
  discount: number
  minAmount: number
  expireAt: string
  used: boolean
}

/* ==================== 订单 ==================== */
export type OrderStatus = 'pending_payment' | 'pending_ship' | 'pending_receive' | 'completed' | 'cancelled'
export type AfterSalesType = 'refund' | 'return' | 'reissue'
export type AfterSalesStatus = 'reviewing' | 'approved' | 'processing' | 'completed' | 'rejected'

export interface OrderItem {
  productId: string; productName: string; productImage: string
  skuId: string; skuName: string; price: number; quantity: number
}

export interface Logistics {
  company: string; trackingNo: string
  traces: { time: string; desc: string }[]
}

export interface AfterSales {
  id: string; orderId: string; type: AfterSalesType
  reason: string; images: string[]; refundAmount?: number
  status: AfterSalesStatus; rejectReason?: string; createdAt: string
}

export interface Order {
  id: string; orderNo: string; items: OrderItem[]
  address: Address; coupon?: Coupon
  productAmount: number; discountAmount: number; freight: number; totalAmount: number
  status: OrderStatus; remark?: string; logistics?: Logistics
  afterSales?: AfterSales; createdAt: string; expireAt?: string
}

/* ==================== 通用 ==================== */
export interface Paginated<T> {
  list: T[]; total: number; page: number; pageSize: number
}

export interface ApiResponse<T = any> {
  code: number
  message: string
  data: T
}

/* 分类 */
export interface Category {
  id: string; name: string; icon: string
}
