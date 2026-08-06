<script setup lang="ts">
/** 管理端商品管理 — AM2-1~AM2-9 + D19~D22 + E043~E046 */
import { ref, onMounted } from 'vue'
import { adminFetchProducts, adminUpdateProduct, adminBatchUpdateProducts } from '@/api'
import { ElMessage, ElMessageBox } from 'element-plus'
import type { Product } from '@/types'

const products = ref<Product[]>([]); const loading = ref(true); const selectedIds = ref<string[]>([])
const searchText = ref(''); const statusFilter = ref('')
const editVisible = ref(false); const stockVisible = ref(false)
const editForm = ref<Partial<Product>>({})
// 用独立字段避免可选链赋值问题
const editPrice = ref(0); const editStock = ref(0)
const stockForm = ref({ productName: '', currentStock: 0, newStock: 0 })
const difficultyLabels: Record<string, string> = { beginner: '入门', intermediate: '进阶', advanced: '高阶' }

onMounted(async () => { products.value = (await adminFetchProducts({})).list; loading.value = false })

function openEdit(p?: Product) {
  editForm.value = p ? { ...p } : {}
  editPrice.value = p?.skus?.[0]?.price || 0
  editStock.value = p?.skus?.[0]?.stock || 0
  editVisible.value = true
}
function openStock(p: Product) { stockForm.value = { productName: p.name, currentStock: p.skus[0]?.stock || 0, newStock: p.skus[0]?.stock || 0 }; stockVisible.value = true }
function saveEdit() { ElMessage.success('商品已保存'); editVisible.value = false }
function saveStock() {
  if (stockForm.value.newStock < 0) { ElMessage.error('请输入有效库存数量'); return } // E044
  ElMessage.success('库存已更新'); stockVisible.value = false
}
async function handleDelete(p: Product) {
  if (p.status === 'on') { ElMessage.warning('该商品正在售卖中，建议先下架再删除'); return } // E045
  await ElMessageBox.confirm(`确定删除 ${p.name}？`, '删除商品', { type: 'warning' })
  ElMessage.success('商品已删除')
}
async function toggleStatus(row: Product, v: boolean) { await adminUpdateProduct(row.id, { status: v ? 'on' : 'off' }); ElMessage.success(v ? '已上架' : '已下架') }
async function batchAction(action: string) {
  await ElMessageBox.confirm(`确定对选中 ${selectedIds.value.length} 件商品执行批量${action === 'on' ? '上架' : '下架'}？`, '批量操作')
  await adminBatchUpdateProducts(selectedIds.value, action); ElMessage.success('批量操作完成'); selectedIds.value = []
}
</script>

<template>
  <div>
    <h2 style="font-size: 20px; margin-bottom: 16px;">商品管理</h2>
    <div style="display: flex; gap: 12px; margin-bottom: 16px;">
      <el-input v-model="searchText" placeholder="搜索商品" style="width: 220px;" clearable />
      <el-select v-model="statusFilter" placeholder="状态" clearable style="width: 120px;"><el-option label="上架" value="on" /><el-option label="下架" value="off" /></el-select>
      <el-button type="primary" @click="openEdit()">新增商品</el-button>
      <el-button :disabled="selectedIds.length === 0" @click="batchAction('on')">批量上架</el-button>
      <el-button :disabled="selectedIds.length === 0" @click="batchAction('off')">批量下架</el-button>
    </div>
    <el-table :data="products" v-loading="loading" @selection-change="(rows: any[]) => selectedIds = rows.map((r: any) => r.id)">
      <el-table-column type="selection" width="50" />
      <el-table-column prop="id" label="ID" width="60" />
      <el-table-column label="主图" width="80"><template #default="{ row }"><img :src="row.images[0]" style="width: 40px; height: 40px; border-radius: 6px; object-fit: cover;" /></template></el-table-column>
      <el-table-column prop="name" label="商品名称" />
      <el-table-column prop="categoryName" label="分类" width="100" />
      <el-table-column label="难度" width="80"><template #default="{ row }">{{ difficultyLabels[row.difficulty] }}</template></el-table-column>
      <el-table-column label="价格" width="80"><template #default="{ row }">¥{{ row.skus[0]?.price }}</template></el-table-column>
      <el-table-column label="库存" width="80"><template #default="{ row }">{{ row.skus[0]?.stock || 0 }}</template></el-table-column>
      <el-table-column label="状态" width="90"><template #default="{ row }"><el-switch :model-value="row.status === 'on'" @change="(v: boolean) => toggleStatus(row, v)" active-text="上架" inactive-text="下架" /></template></el-table-column>
      <el-table-column label="操作" width="200"><template #default="{ row }"><el-button size="small" @click="openEdit(row)">编辑</el-button><el-button size="small" @click="openStock(row)">库存</el-button><el-button size="small" type="danger" @click="handleDelete(row)">删除</el-button></template></el-table-column>
    </el-table>

    <!-- D19: 编辑商品 -->
    <el-dialog v-model="editVisible" :title="editForm.id ? '编辑商品' : '新增商品'" width="640px">
      <div style="display: flex; flex-direction: column; gap: 12px;"><el-input v-model="editForm.name" placeholder="商品名称" /><el-select v-model="editForm.categoryId" placeholder="分类" /><el-select v-model="editForm.difficulty" placeholder="难度" /><el-input-number v-model="editPrice" placeholder="售价" /><el-input-number v-model="editStock" placeholder="库存" /></div>
      <template #footer><el-button @click="editVisible = false">取消</el-button><el-button type="primary" @click="saveEdit">保存</el-button></template>
    </el-dialog>
    <!-- D20: 库存调整 -->
    <el-dialog v-model="stockVisible" title="调整库存" width="380px">
      <p>{{ stockForm.productName }}</p><p style="font-size: 13px; color: var(--zao-gray-light);">当前库存: {{ stockForm.currentStock }}</p>
      <el-input-number v-model="stockForm.newStock" :min="0" style="margin-top: 12px;" />
      <template #footer><el-button @click="stockVisible = false">取消</el-button><el-button type="primary" @click="saveStock">确认</el-button></template>
    </el-dialog>
  </div>
</template>
