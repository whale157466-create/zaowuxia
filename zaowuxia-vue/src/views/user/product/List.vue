<script setup lang="ts">
/** 页面3: 商品列表与搜索 — M3-1搜索 M3-2历史 M3-3筛选 M3-4列表 M3-5空结果 + D5筛选抽屉 */
import { ref, onMounted, watch } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import { fetchProducts } from '@/api'
import type { Product } from '@/types'
import EmptyState from '@/components/common/EmptyState.vue'

const route = useRoute(); const router = useRouter()
const list = ref<Product[]>([]); const loading = ref(true); const drawerVisible = ref(false)
const keyword = ref((route.query.keyword as string) || '')
const categoryId = ref((route.query.categoryId as string) || '')
const difficulty = ref('')
const sort = ref('')
const searchHistory = ref<string[]>(JSON.parse(localStorage.getItem('search_history') || '[]'))
const difficultyLabels: Record<string, string> = { beginner: '入门', intermediate: '进阶', advanced: '高阶' }

async function load() {
  loading.value = true
  const res = await fetchProducts({ keyword: keyword.value, categoryId: categoryId.value, difficulty: difficulty.value, sort: sort.value, page: 1, pageSize: 20 })
  list.value = res.list; loading.value = false
}

function doSearch(kw: string) {
  keyword.value = kw
  if (kw) { searchHistory.value = [kw, ...searchHistory.value.filter(h => h !== kw)].slice(0, 10); localStorage.setItem('search_history', JSON.stringify(searchHistory.value)) }
  load()
}

function clearHistory() { searchHistory.value = []; localStorage.removeItem('search_history') }

onMounted(load)
watch([categoryId, difficulty, sort], load)
</script>

<template>
  <div>
    <!-- M3-1: 搜索 -->
    <el-input v-model="keyword" placeholder="搜索商品关键词…" size="large" clearable @keyup.enter="doSearch(keyword)" @clear="doSearch('')" style="margin-bottom: 16px;">
      <template #prefix><el-icon><Search /></el-icon></template>
    </el-input>

    <!-- M3-2: 搜索历史 -->
    <div v-if="searchHistory.length && !keyword" style="margin-bottom: 12px; display: flex; flex-wrap: wrap; gap: 8px; align-items: center;">
      <span style="font-size: 13px; color: var(--zao-gray-light);">历史搜索:</span>
      <el-tag v-for="h in searchHistory" :key="h" style="cursor: pointer;" @click="doSearch(h)">{{ h }}</el-tag>
      <el-button size="small" link @click="clearHistory">清空</el-button>
    </div>

    <!-- M3-3: 筛选 + D5 抽屉 -->
    <div style="margin-bottom: 16px; display: flex; gap: 12px;">
      <el-button @click="drawerVisible = true"><el-icon><Filter /></el-icon> 筛选 {{ difficulty ? '(已选)' : '' }}</el-button>
      <el-select v-model="sort" placeholder="排序" clearable style="width: 160px;">
        <el-option label="价格从低到高" value="price_asc" />
        <el-option label="价格从高到低" value="price_desc" />
      </el-select>
    </div>

    <!-- M3-4: 商品列表 / M3-5: 空结果 -->
    <div v-loading="loading">
      <EmptyState v-if="!loading && list.length === 0" type="search" />
      <div v-else style="display: flex; flex-wrap: wrap; gap: 16px;">
        <div v-for="p in list" :key="p.id"
          style="flex: 1; min-width: 200px; max-width: 280px; background: #fff; border-radius: 12px; overflow: hidden; cursor: pointer; box-shadow: 0 1px 4px rgba(0,0,0,0.06);"
          @click="router.push(`/products/${p.id}`)">
          <img :src="p.images[0]" style="width: 100%; height: 180px; object-fit: cover;" />
          <div style="padding: 12px;">
            <p style="font-weight: 500; overflow: hidden; text-overflow: ellipsis; white-space: nowrap;">{{ p.name }}</p>
            <div class="flex-between" style="margin-top: 6px;">
              <span class="price" style="font-size: 18px;">¥{{ p.skus[0]?.price }}
                <span v-if="p.skus[0]?.stock === 0" style="font-size: 12px; color: var(--zao-gray-light);">(售罄)</span>
              </span>
              <el-tag size="small">{{ difficultyLabels[p.difficulty] }}</el-tag>
            </div>
          </div>
        </div>
      </div>
    </div>

    <!-- D5: 筛选抽屉 -->
    <el-drawer v-model="drawerVisible" title="筛选条件" size="300px">
      <div style="display: flex; flex-direction: column; gap: 20px;">
        <div><p style="font-weight: 500; margin-bottom: 8px;">制作难度</p>
          <el-radio-group v-model="difficulty">
            <el-radio value="">全部</el-radio>
            <el-radio v-for="(v, k) in difficultyLabels" :key="k" :value="k">{{ v }}</el-radio>
          </el-radio-group>
        </div>
        <div style="display: flex; gap: 12px;">
          <el-button @click="difficulty = ''; categoryId = ''; sort = ''; load()" style="flex: 1;">重置</el-button>
          <el-button type="primary" @click="drawerVisible = false" style="flex: 1;">确认</el-button>
        </div>
      </div>
    </el-drawer>
  </div>
</template>
