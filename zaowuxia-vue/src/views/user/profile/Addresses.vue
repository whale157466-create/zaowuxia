<script setup lang="ts">
/** 地址管理 — M11-4 M11-5 + E015空 */
import { ref, onMounted } from 'vue'
import { fetchAddresses } from '@/api'
import { ElMessage, ElMessageBox } from 'element-plus'
import type { Address } from '@/types'
import EmptyState from '@/components/common/EmptyState.vue'

const addresses = ref<Address[]>([]); const loading = ref(true)
const editVisible = ref(false); const editForm = ref<Partial<Address>>({})

onMounted(async () => { addresses.value = await fetchAddresses(); loading.value = false })

function openEdit(addr?: Address) { editForm.value = addr ? { ...addr } : {}; editVisible.value = true }
function save() { ElMessage.success('地址已保存'); editVisible.value = false }
async function handleDelete(id: string) { await ElMessageBox.confirm('确定删除该地址？', '删除', { type: 'warning' }); ElMessage.success('地址已删除') }
</script>

<template>
  <div v-loading="loading" style="max-width: 520px; margin: 0 auto;">
    <div class="flex-between" style="margin-bottom: 16px;"><h2 style="font-size: 20px;">收货地址</h2><el-button type="primary" @click="openEdit()">+ 新增地址</el-button></div>
    <EmptyState v-if="addresses.length === 0" type="address" @action="openEdit()" /> <!-- E015 -->
    <div v-else style="display: flex; flex-direction: column; gap: 12px;">
      <div v-for="addr in addresses" :key="addr.id" class="zao-card">
        <div class="flex-between"><p style="font-weight: 500;">{{ addr.recipient }} <span style="font-size: 13px; color: var(--zao-gray-light);">{{ addr.phone }}</span></p><el-tag v-if="addr.isDefault" size="small" type="success">默认</el-tag></div>
        <p style="font-size: 13px; color: var(--zao-gray-light); margin-top: 4px;">{{ addr.province }}{{ addr.city }}{{ addr.district }} {{ addr.detail }}</p>
        <div style="margin-top: 8px; display: flex; gap: 8px;"><el-button size="small" @click="openEdit(addr)">编辑</el-button><el-button size="small" type="danger" @click="handleDelete(addr.id)">删除</el-button></div>
      </div>
    </div>
    <el-dialog v-model="editVisible" :title="editForm.id ? '编辑地址' : '新增地址'" width="480px">
      <div style="display: flex; flex-direction: column; gap: 12px;"><el-input v-model="editForm.recipient" placeholder="收货人" /><el-input v-model="editForm.phone" placeholder="手机号" /><el-input v-model="editForm.detail" placeholder="详细地址" /></div>
      <template #footer><el-button @click="editVisible = false">取消</el-button><el-button type="primary" @click="save">保存</el-button></template>
    </el-dialog>
  </div>
</template>
