<script setup lang="ts">
/** 页面2: 首页 — M2-1搜索 M2-2轮播推荐 M2-3分类卡片 */
import { ref, onMounted } from 'vue'
import { useRouter } from 'vue-router'
import { fetchCategories, fetchProducts, fetchTutorials } from '@/api'
import type { Category, Product, Tutorial } from '@/types'

const router = useRouter()
const categories = ref<Category[]>([])
const featured = ref<Product[]>([])
const tutorials = ref<Tutorial[]>([])
const loading = ref(true)

onMounted(async () => {
  const [cats, prods, tuts] = await Promise.all([fetchCategories(), fetchProducts({ page: 1, pageSize: 4 }), fetchTutorials()])
  categories.value = cats; featured.value = prods.list; tutorials.value = tuts.slice(0, 3); loading.value = false
})

const difficultyLabels: Record<string, string> = { beginner: '入门', intermediate: '进阶', advanced: '高阶' }
</script>

<template>
  <div v-loading="loading" style="display: flex; flex-direction: column; gap: 24px;">
    <!-- M2-2: Banner 轮播 -->
    <el-carousel height="280px" style="border-radius: 12px; overflow: hidden;">
      <el-carousel-item v-for="p in featured" :key="p.id" @click="router.push(`/products/${p.id}`)" style="cursor: pointer;">
        <img :src="p.images[0]" style="width: 100%; height: 100%; object-fit: cover;" />
        <div style="position: absolute; bottom: 0; left: 0; right: 0; padding: 24px; background: linear-gradient(transparent, rgba(0,0,0,0.5)); color: #fff;">
          <h3 style="font-size: 20px;">{{ p.name }}</h3>
          <p style="font-size: 13px; opacity: 0.8;">{{ p.categoryName }} · {{ difficultyLabels[p.difficulty] }}</p>
        </div>
      </el-carousel-item>
    </el-carousel>

    <!-- M2-3: 项目分类卡片 -->
    <section>
      <h2 style="margin-bottom: 16px; font-size: 20px;">手工项目</h2>
      <div style="display: flex; flex-wrap: wrap; gap: 16px;">
        <div
          v-for="cat in categories" :key="cat.id"
          style="flex: 1; min-width: 160px; max-width: 200px; background: #fff; border-radius: 12px; padding: 28px 16px; text-align: center; cursor: pointer; box-shadow: 0 1px 4px rgba(0,0,0,0.06);"
          @click="router.push({ name: 'products', query: { categoryId: cat.id } })"
        >
          <span style="font-size: 36px;">{{ cat.icon }}</span>
          <p style="margin-top: 8px; font-weight: 500;">{{ cat.name }}</p>
        </div>
      </div>
    </section>

    <!-- 手作教程 -->
    <section>
      <div class="flex-between" style="margin-bottom: 16px;">
        <h2 style="font-size: 20px;">手作教程</h2>
        <el-button text type="primary" @click="router.push('/tutorials')">查看全部 ></el-button>
      </div>
      <div style="display: flex; flex-wrap: wrap; gap: 16px;">
        <div
          v-for="t in tutorials" :key="t.id"
          style="flex: 1; min-width: 200px; max-width: 280px; background: #fff; border-radius: 12px; overflow: hidden; cursor: pointer; box-shadow: 0 1px 4px rgba(0,0,0,0.06);"
          @click="router.push(`/tutorials/${t.id}`)"
        >
          <img :src="t.coverImage" style="width: 100%; height: 140px; object-fit: cover;" />
          <div style="padding: 12px;">
            <el-tag :type="t.bloggerType === 'merchant' ? 'success' : 'warning'" size="small">{{ t.bloggerType === 'merchant' ? '博主同款' : '博主种草' }}</el-tag>
            <p style="font-weight: 500; margin-top: 6px; overflow: hidden; text-overflow: ellipsis; white-space: nowrap;">{{ t.title }}</p>
            <p style="font-size: 12px; color: var(--zao-gray-light); margin-top: 4px;">{{ t.authorName }}</p>
          </div>
        </div>
      </div>
    </section>

    <!-- 热门推荐 -->
    <section>
      <h2 style="margin-bottom: 16px; font-size: 20px;">热门推荐</h2>
      <div style="display: flex; flex-wrap: wrap; gap: 16px;">
        <div
          v-for="p in featured" :key="p.id"
          style="flex: 1; min-width: 200px; max-width: 280px; background: #fff; border-radius: 12px; overflow: hidden; cursor: pointer; box-shadow: 0 1px 4px rgba(0,0,0,0.06);"
          @click="router.push(`/products/${p.id}`)"
        >
          <img :src="p.images[0]" style="width: 100%; height: 180px; object-fit: cover;" />
          <div style="padding: 12px;">
            <p style="font-weight: 500; overflow: hidden; text-overflow: ellipsis; white-space: nowrap;">{{ p.name }}</p>
            <div class="flex-between" style="margin-top: 6px;">
              <span class="price" style="font-size: 18px;">¥{{ p.skus[0]?.price }}</span>
              <el-tag size="small" type="info">{{ difficultyLabels[p.difficulty] }}</el-tag>
            </div>
          </div>
        </div>
      </div>
    </section>
  </div>
</template>
