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

/* ==================== 收藏 ==================== */
export interface Favorite {
  id: string
  productId: string
  productName: string
  categoryName: string
  difficulty: Difficulty
  price: number
  image: string
  status: 'on' | 'off'
}

/* ==================== 浏览记录 ==================== */
export interface HistoryItem {
  id: string
  productId: string
  productName: string
  price: number
  image: string
  createdAt: string
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

/* ==================== 数据看板 ==================== */
export interface DashboardData {
  overview: { orders: number; revenue: number; users: number; products: number; orderTrend: number; revenueTrend: number }
  trend: { date: string; count: number; amount: number }[]
  categorySales: { name: string; count: number; amount: number; percent: number }[]
  recentOrders: { orderNo: string; user: string; item: string; amount: number; status: string; time: string }[]
  hotProducts: { rank: number; name: string; sales: number; amount: number }[]
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

/* ==================== 店铺 ==================== */
export interface Shop {
  id: string
  userId: string
  name: string
  description: string
  logo: string
  status: 'on' | 'off'
  createdAt: string
}

/* ==================== 教程 ==================== */
export type BloggerType = 'merchant' | 'hobbyist'

/** 博主同款套装单品 */
export interface BundleItem {
  productId: string; productName: string; productImage: string
  skuId: string; skuName: string; price: number; stock: number
}

/** 博主种草推荐单品 */
export interface RecommendationItem {
  productId: string; productName: string; productImage: string
  skuId: string; skuName: string; price: number
  shopName: string
}

/** 算法推荐材料 */
export interface MaterialItem {
  productId: string; productName: string; productImage: string
  skuId: string; skuName: string; price: number
  reason: string
}

export interface Tutorial {
  id: string
  authorId: string
  authorName: string
  authorAvatar: string
  bloggerType: BloggerType
  title: string
  description: string
  coverImage: string
  videoUrl: string
  content: string
  bundleName?: string
  bundleItems?: BundleItem[]
  recommendationItems?: RecommendationItem[]
  materialItems?: MaterialItem[]
  status: string
  createdAt: string
}
