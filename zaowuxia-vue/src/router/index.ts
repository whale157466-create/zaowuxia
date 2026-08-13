import { createRouter, createWebHistory } from 'vue-router'
import UserLayout from '@/components/layout/UserLayout.vue'
import AdminLayout from '@/components/layout/AdminLayout.vue'

const router = createRouter({
  history: createWebHistory(),
  routes: [
    {
      path: '/',
      component: UserLayout,
      children: [
        { path: '', name: 'home', component: () => import('@/views/user/home/Index.vue') },
        { path: 'login', name: 'login', component: () => import('@/views/user/login/Index.vue') },
        { path: 'categories', name: 'categories', component: () => import('@/views/user/product/List.vue') },
        { path: 'products', name: 'products', component: () => import('@/views/user/product/List.vue') },
        { path: 'products/:id', name: 'productDetail', component: () => import('@/views/user/product/Detail.vue') },
        { path: 'kit/:productId', name: 'kit', component: () => import('@/views/user/kit/Index.vue') },
        { path: 'tutorials', name: 'tutorials', component: () => import('@/views/user/tutorial/List.vue') },
        { path: 'tutorials/:id', name: 'tutorialDetail', component: () => import('@/views/user/tutorial/Detail.vue') },
        { path: 'cart', name: 'cart', component: () => import('@/views/user/cart/Index.vue') },
        { path: 'checkout', name: 'checkout', component: () => import('@/views/user/checkout/Index.vue') },
        { path: 'payment/:orderId', name: 'payment', component: () => import('@/views/user/payment/Index.vue') },
        { path: 'orders', name: 'orders', component: () => import('@/views/user/orders/Index.vue') },
        { path: 'orders/:id', name: 'orderDetail', component: () => import('@/views/user/orders/Detail.vue') },
        { path: 'after-sales/new', name: 'afterSales', component: () => import('@/views/user/afterSales/Index.vue') },
        { path: 'profile', name: 'profile', component: () => import('@/views/user/profile/Index.vue') },
        { path: 'profile/addresses', name: 'addresses', component: () => import('@/views/user/profile/Addresses.vue') },
        { path: 'profile/favorites', name: 'favorites', component: () => import('@/views/user/profile/Favorites.vue') },
        { path: 'profile/history', name: 'history', component: () => import('@/views/user/profile/History.vue') },
        { path: ':pathMatch(.*)*', name: 'notFound', component: () => import('@/components/common/NotFound.vue') },
      ],
    },
    {
      path: '/admin',
      component: AdminLayout,
      meta: { requiresAdmin: true },
      children: [
        { path: '', name: 'adminDashboard', component: () => import('@/views/admin/dashboard/Index.vue') },
        { path: 'products', name: 'adminProducts', component: () => import('@/views/admin/products/Index.vue') },
        { path: 'orders', name: 'adminOrders', component: () => import('@/views/admin/orders/Index.vue') },
      ],
    },
    { path: '/admin/login', name: 'adminLogin', component: () => import('@/views/admin/login/Index.vue') },
  ],
})

// ===== 路由守卫：管理端需 admin 角色 =====
router.beforeEach((to) => {
  const role = localStorage.getItem('role')
  if (to.path.startsWith('/admin') && to.path !== '/admin/login') {
    if (role !== 'admin') {
      return { name: 'adminLogin' }
    }
  }
})

export default router
