<script setup lang="ts">
/** 教程列表页 — 展示手作教程，区分商家博主/纯爱好博主 */
import { ref, onMounted } from 'vue'
import { useRouter } from 'vue-router'
import { fetchTutorials } from '@/api'
import type { Tutorial } from '@/types'
import EmptyState from '@/components/common/EmptyState.vue'

const router = useRouter()
const tutorials = ref<Tutorial[]>([]); const loading = ref(true)
const activeTab = ref<'all' | 'merchant' | 'hobbyist'>('all')

const tabs = [
  { key: 'all', label: '全部教程' },
  { key: 'merchant', label: '博主同款' },
  { key: 'hobbyist', label: '博主种草' },
]

async function load() {
  loading.value = true
  tutorials.value = await fetchTutorials(activeTab.value === 'all' ? undefined : activeTab.value)
  loading.value = false
}
onMounted(load)

function goDetail(id: string) { router.push(`/tutorials/${id}`) }
</script>

<template>
  <div style="max-width: 800px; margin: 0 auto;">
    <h2 style="font-size: 20px; font-weight: 700; margin-bottom: 16px;">手作教程</h2>

    <el-tabs v-model="activeTab" @tab-change="load">
      <el-tab-pane v-for="t in tabs" :key="t.key" :label="t.label" :name="t.key" />
    </el-tabs>

    <div v-loading="loading">
      <EmptyState v-if="!loading && tutorials.length === 0" type="order" />
      <div v-else style="display: flex; flex-direction: column; gap: 16px;">
        <div v-for="t in tutorials" :key="t.id" class="zao-card" style="cursor: pointer;" @click="goDetail(t.id)">
          <div style="display: flex; gap: 16px;">
            <img :src="t.coverImage" style="width: 160px; height: 100px; border-radius: 8px; object-fit: cover; flex-shrink: 0;" />
            <div style="flex: 1; display: flex; flex-direction: column; gap: 6px;">
              <div style="display: flex; align-items: center; gap: 8px;">
                <el-tag :type="t.bloggerType === 'merchant' ? 'success' : 'warning'" size="small">
                  {{ t.bloggerType === 'merchant' ? '博主同款' : '博主种草推荐' }}
                </el-tag>
                <span style="font-size: 15px; font-weight: 600; line-height: 1.3;">{{ t.title }}</span>
              </div>
              <p style="font-size: 13px; color: var(--zao-gray-light);">{{ t.description }}</p>
              <div style="display: flex; align-items: center; gap: 8px; margin-top: auto;">
                <img :src="t.authorAvatar" style="width: 24px; height: 24px; border-radius: 50%;" />
                <span style="font-size: 13px; color: var(--zao-gray-light);">{{ t.authorName }}</span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>
