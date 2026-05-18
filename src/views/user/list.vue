<template>
  <div class="user-list page-container">
    <div class="page-header">
      <div>
        <h2 class="page-title">用户管理</h2>
        <p class="page-subtitle">创建、查询与维护平台登录账号及角色信息</p>
      </div>
      <el-button type="primary" @click="openCreate">
        <el-icon><Plus /></el-icon>
        新建用户
      </el-button>
    </div>

    <el-table v-loading="loading" :data="tableData" stripe style="width: 100%">
      <el-table-column prop="id" label="ID" width="96" />
      <el-table-column prop="account" label="账号" min-width="120" />
      <el-table-column prop="name" label="姓名" min-width="100" show-overflow-tooltip />
      <el-table-column prop="email" label="邮箱" min-width="160" show-overflow-tooltip />
      <el-table-column prop="phone" label="手机" width="120" show-overflow-tooltip />
      <el-table-column prop="role" label="角色" width="100" show-overflow-tooltip />
      <el-table-column prop="group" label="用户组" width="100" show-overflow-tooltip />
      <el-table-column prop="tenant" label="租户" width="100" show-overflow-tooltip />
      <el-table-column prop="createDate" label="创建时间" min-width="160" show-overflow-tooltip />
      <el-table-column label="操作" width="180" fixed="right">
        <template #default="{ row }">
          <el-button link type="primary" @click="openEdit(row)">编辑</el-button>
          <el-button link type="danger" @click="confirmDelete(row)">删除</el-button>
        </template>
      </el-table-column>
    </el-table>

    <div class="pagination-container">
      <el-pagination
        v-model:current-page="pagination.current"
        v-model:page-size="pagination.pageSize"
        :page-sizes="[10, 20, 50, 100]"
        :total="pagination.total"
        layout="total, sizes, prev, pager, next, jumper"
        @size-change="loadData"
        @current-change="loadData"
      />
    </div>

    <el-dialog
      v-model="dialogVisible"
      :title="isEdit ? '编辑用户' : '新建用户'"
      width="560px"
      destroy-on-close
      @closed="resetForm"
    >
      <el-form ref="formRef" :model="form" :rules="formRules" label-width="100px">
        <el-form-item v-if="!isEdit" label="账号" prop="account">
          <el-input v-model="form.account" placeholder="登录账号，不可与其他用户重复" />
        </el-form-item>
        <el-form-item v-if="!isEdit" label="初始密码" prop="password">
          <el-input v-model="form.password" type="password" show-password placeholder="不少于 1 位（以服务端校验为准）" />
        </el-form-item>
        <el-form-item label="姓名" prop="name">
          <el-input v-model="form.name" placeholder="选填" />
        </el-form-item>
        <el-form-item label="邮箱" prop="email">
          <el-input v-model="form.email" placeholder="选填" />
        </el-form-item>
        <el-form-item v-if="isEdit" label="重置密码" prop="password">
          <el-input v-model="form.password" type="password" show-password placeholder="留空则不修改" />
        </el-form-item>
        <el-form-item label="手机" prop="phone">
          <el-input v-model="form.phone" placeholder="选填" />
        </el-form-item>
        <el-form-item label="头像 URL" prop="avatar">
          <el-input v-model="form.avatar" placeholder="选填" />
        </el-form-item>
        <el-form-item label="用户组" prop="group">
          <el-input v-model="form.group" placeholder="选填，对应库字段 user_group" />
        </el-form-item>
        <el-form-item label="角色" prop="role">
          <el-input v-model="form.role" placeholder="选填" />
        </el-form-item>
        <el-form-item label="租户" prop="tenant">
          <el-input v-model="form.tenant" placeholder="选填" />
        </el-form-item>
      </el-form>
      <template #footer>
        <el-button @click="dialogVisible = false">取消</el-button>
        <el-button type="primary" :loading="submitting" @click="submitForm">保存</el-button>
      </template>
    </el-dialog>
  </div>
</template>

<script setup lang="ts">
import { ref, reactive, onMounted } from 'vue'
import type { FormInstance, FormRules } from 'element-plus'
import { Plus } from '@element-plus/icons-vue'
import type { SysUser, UserCreatePayload, UserUpdatePayload } from '@/types'
import { createUser, deleteUser, pageUsers, updateUser } from '@/api/user'

const loading = ref(false)
const submitting = ref(false)
const tableData = ref<SysUser[]>([])
const dialogVisible = ref(false)
const isEdit = ref(false)
const formRef = ref<FormInstance>()

const pagination = reactive({
  current: 1,
  pageSize: 10,
  total: 0,
})

const form = reactive({
  id: 0 as number,
  account: '',
  password: '',
  name: '',
  email: '',
  phone: '',
  avatar: '',
  group: '',
  role: '',
  tenant: '',
})

const formRules: FormRules = {
  account: [{ required: true, message: '请输入账号', trigger: 'blur' }],
  password: [
    {
      validator: (_rule, value, callback) => {
        if (!isEdit.value && (!value || !String(value).trim())) {
          callback(new Error('请设置初始密码'))
        } else {
          callback()
        }
      },
      trigger: 'blur',
    },
  ],
}

const loadData = async () => {
  loading.value = true
  try {
    const res = await pageUsers({
      current: pagination.current,
      pageSize: pagination.pageSize,
    })
    tableData.value = res.records || []
    pagination.total = Number(res.total) || 0
  } finally {
    loading.value = false
  }
}

const resetForm = () => {
  isEdit.value = false
  form.id = 0
  form.account = ''
  form.password = ''
  form.name = ''
  form.email = ''
  form.phone = ''
  form.avatar = ''
  form.group = ''
  form.role = ''
  form.tenant = ''
  formRef.value?.clearValidate()
}

const openCreate = () => {
  resetForm()
  dialogVisible.value = true
}

const openEdit = (row: SysUser) => {
  isEdit.value = true
  form.id = row.id
  form.account = row.account
  form.password = ''
  form.name = row.name || ''
  form.email = row.email || ''
  form.phone = row.phone || ''
  form.avatar = row.avatar || ''
  form.group = row.group || ''
  form.role = row.role || ''
  form.tenant = row.tenant || ''
  dialogVisible.value = true
}

const pickCreatePayload = (): UserCreatePayload => ({
  account: form.account.trim(),
  password: form.password,
  name: form.name.trim() || undefined,
  email: form.email.trim() || undefined,
  phone: form.phone.trim() || undefined,
  avatar: form.avatar.trim() || undefined,
  group: form.group.trim() || undefined,
  role: form.role.trim() || undefined,
  tenant: form.tenant.trim() || undefined,
})

const pickUpdatePayload = (): UserUpdatePayload => {
  const payload: UserUpdatePayload = {
    id: form.id,
  }
  if (form.name.trim()) payload.name = form.name.trim()
  if (form.email.trim()) payload.email = form.email.trim()
  if (form.phone.trim()) payload.phone = form.phone.trim()
  if (form.avatar.trim()) payload.avatar = form.avatar.trim()
  if (form.group.trim()) payload.group = form.group.trim()
  if (form.role.trim()) payload.role = form.role.trim()
  if (form.tenant.trim()) payload.tenant = form.tenant.trim()
  if (form.password.trim()) payload.password = form.password
  return payload
}

const submitForm = async () => {
  const valid = await formRef.value?.validate().catch(() => false)
  if (!valid) return

  submitting.value = true
  try {
    if (isEdit.value) {
      await updateUser(pickUpdatePayload())
      ElMessage.success('用户已更新')
    } else {
      await createUser(pickCreatePayload())
      ElMessage.success('用户已创建')
    }
    dialogVisible.value = false
    await loadData()
  } finally {
    submitting.value = false
  }
}

const confirmDelete = (row: SysUser) => {
  ElMessageBox.confirm(`确定删除用户「${row.account}」吗？`, '删除确认', {
    type: 'warning',
    confirmButtonText: '删除',
    cancelButtonText: '取消',
  })
    .then(async () => {
      await deleteUser(row.id)
      ElMessage.success('已删除')
      await loadData()
    })
    .catch(() => {})
}

onMounted(() => {
  loadData()
})
</script>

<style scoped lang="scss">
.pagination-container {
  margin-top: 16px;
  display: flex;
  justify-content: flex-end;
}
</style>
