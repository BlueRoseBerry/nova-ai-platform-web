<template>
  <div class="model-registry page-container">
    <div class="page-header">
      <div>
        <h2 class="page-title">模型注册管理</h2>
        <p class="page-subtitle">对接后端 `/api/v1/model/registry`，维护 llm_model 注册条目</p>
      </div>
      <el-button type="primary" @click="openCreateDialog">
        <el-icon><Plus /></el-icon>
        注册模型
      </el-button>
    </div>

    <div class="search-bar">
      <el-form :inline="true" :model="searchForm">
        <el-form-item label="启用状态">
          <el-select v-model="searchForm.enabled" placeholder="全部" clearable style="width: 140px">
            <el-option label="已启用" :value="true" />
            <el-option label="已禁用" :value="false" />
          </el-select>
        </el-form-item>
        <el-form-item>
          <el-button type="primary" @click="handleSearch">查询</el-button>
          <el-button @click="handleReset">重置</el-button>
        </el-form-item>
      </el-form>
    </div>

    <el-table :data="tableData" v-loading="loading" style="width: 100%">
      <el-table-column prop="id" label="注册 ID" width="160" show-overflow-tooltip />
      <el-table-column prop="name" label="显示名称" min-width="140" />
      <el-table-column prop="provider" label="提供商" width="110">
        <template #default="{ row }">
          <span>{{ providerLabel(row.provider) }}</span>
        </template>
      </el-table-column>
      <el-table-column prop="remoteModel" label="远程模型" min-width="140" show-overflow-tooltip />
      <el-table-column prop="invokeFormat" label="调用格式" width="180" show-overflow-tooltip />
      <el-table-column label="API 密钥" width="100">
        <template #default="{ row }">
          <el-tag :type="row.hasApiSecret ? 'success' : 'info'" size="small">
            {{ row.hasApiSecret ? '已配置' : '未配置' }}
          </el-tag>
        </template>
      </el-table-column>
      <el-table-column label="默认参数" width="140">
        <template #default="{ row }">
          <span class="param-hint">
            T={{ row.defaultTemperature ?? '-' }} / {{ row.defaultMaxTokens ?? '-' }}
          </span>
        </template>
      </el-table-column>
      <el-table-column label="状态" width="90">
        <template #default="{ row }">
          <el-tag :type="row.enabled ? 'success' : 'info'" size="small">
            {{ row.enabled ? '已启用' : '已禁用' }}
          </el-tag>
        </template>
      </el-table-column>
      <el-table-column label="更新时间" width="170">
        <template #default="{ row }">
          {{ formatEpoch(row.updatedAtEpochMillis) }}
        </template>
      </el-table-column>
      <el-table-column label="操作" width="220" fixed="right">
        <template #default="{ row }">
          <el-button size="small" @click="openEditDialog(row)">编辑</el-button>
          <el-button
            size="small"
            :type="row.enabled ? 'warning' : 'success'"
            @click="toggleEnabled(row)"
          >
            {{ row.enabled ? '禁用' : '启用' }}
          </el-button>
          <el-button size="small" type="danger" @click="confirmDelete(row)">删除</el-button>
        </template>
      </el-table-column>
    </el-table>

    <div class="pagination-container">
      <el-pagination
        v-model:current-page="pagination.pageNum"
        v-model:page-size="pagination.pageSize"
        :page-sizes="PAGE_SIZE_OPTIONS.map(Number)"
        :total="pagination.total"
        layout="total, sizes, prev, pager, next, jumper"
        @size-change="loadData"
        @current-change="loadData"
      />
    </div>

    <el-dialog v-model="showDialog" :title="dialogTitle" width="640px" destroy-on-close>
      <el-form ref="formRef" :model="form" :rules="formRules" label-width="130px">
        <el-form-item label="注册 ID" prop="id">
          <el-input
            v-model="form.id"
            placeholder="唯一标识，如 openai-gpt4"
            :disabled="isEditMode"
          />
        </el-form-item>
        <el-form-item label="显示名称" prop="name">
          <el-input v-model="form.name" placeholder="管理界面展示名称" />
        </el-form-item>
        <el-form-item label="提供商" prop="provider">
          <el-select v-model="form.provider" placeholder="选择提供商" style="width: 100%">
            <el-option
              v-for="opt in MODEL_PROVIDER_OPTIONS"
              :key="opt.value"
              :label="opt.label"
              :value="opt.value"
            />
          </el-select>
        </el-form-item>
        <el-form-item label="调用格式" prop="invokeFormat">
          <el-select v-model="form.invokeFormat" style="width: 100%">
            <el-option
              v-for="opt in INVOKE_FORMAT_OPTIONS"
              :key="opt.value"
              :label="opt.label"
              :value="opt.value"
            />
          </el-select>
        </el-form-item>
        <el-form-item label="远程模型名" prop="remoteModel">
          <el-input v-model="form.remoteModel" placeholder="如 gpt-4o-mini、qwen-max" />
        </el-form-item>
        <el-form-item label="Base URL">
          <el-input v-model="form.baseUrl" placeholder="留空则使用提供商默认或环境配置" />
        </el-form-item>
        <el-form-item :label="isEditMode ? '更新 API Key' : 'API Key'">
          <el-input
            v-model="form.apiKeyInput"
            type="password"
            show-password
            :placeholder="isEditMode ? '留空表示不修改已存密钥' : '可选，也可依赖环境变量'"
          />
        </el-form-item>
        <el-form-item label="默认 Temperature">
          <el-input-number
            v-model="form.defaultTemperature"
            :min="0"
            :max="2"
            :step="0.1"
            style="width: 100%"
          />
        </el-form-item>
        <el-form-item label="默认 Max Tokens">
          <el-input-number
            v-model="form.defaultMaxTokens"
            :min="1"
            :max="1000000"
            :step="256"
            style="width: 100%"
          />
        </el-form-item>
        <el-form-item label="启用" prop="enabled">
          <el-switch v-model="form.enabled" />
        </el-form-item>
        <el-form-item label="描述">
          <el-input v-model="form.description" type="textarea" :rows="2" />
        </el-form-item>
      </el-form>
      <template #footer>
        <el-button @click="showDialog = false">取消</el-button>
        <el-button type="primary" :loading="submitting" @click="submitForm">保存</el-button>
      </template>
    </el-dialog>
  </div>
</template>

<script setup lang="ts">
import { ref, reactive, computed, onMounted } from 'vue'
import { Plus } from '@element-plus/icons-vue'
import type { FormInstance, FormRules } from 'element-plus'
import { ElMessageBox } from 'element-plus'
import {
  createLlmModel,
  updateLlmModel,
  deleteLlmModel,
  pageLlmModels,
} from '@/api/modelRegistry'
import type { LlmModelResponse, ModelCreatePayload, ModelUpdatePayload } from '@/types'
import {
  DEFAULT_PAGE_SIZE,
  PAGE_SIZE_OPTIONS,
  MODEL_PROVIDER_OPTIONS,
  INVOKE_FORMAT_OPTIONS,
  MODEL_PROVIDER_MAP,
} from '@/utils/constants'
import { formatDate } from '@/utils/format'

const loading = ref(false)
const submitting = ref(false)
const showDialog = ref(false)
const isEditMode = ref(false)
const formRef = ref<FormInstance>()
const tableData = ref<LlmModelResponse[]>([])

const searchForm = reactive<{ enabled?: boolean }>({
  enabled: undefined,
})

const pagination = reactive({
  pageNum: 1,
  pageSize: DEFAULT_PAGE_SIZE,
  total: 0,
})

const form = reactive({
  id: '',
  name: '',
  provider: 'openai',
  invokeFormat: 'openai_chat_completions',
  remoteModel: '',
  baseUrl: '',
  apiKeyInput: '',
  defaultTemperature: 0.7 as number | undefined,
  defaultMaxTokens: 2048 as number | undefined,
  enabled: true,
  description: '',
})

const formRules: FormRules = {
  id: [{ required: true, message: '请输入注册 ID', trigger: 'blur' }],
  name: [{ required: true, message: '请输入显示名称', trigger: 'blur' }],
  provider: [{ required: true, message: '请选择提供商', trigger: 'change' }],
  invokeFormat: [{ required: true, message: '请选择调用格式', trigger: 'change' }],
  remoteModel: [{ required: true, message: '请输入远程模型名', trigger: 'blur' }],
  enabled: [{ required: true, message: '请设置启用状态', trigger: 'change' }],
}

const dialogTitle = computed(() => (isEditMode.value ? '编辑模型注册' : '注册新模型'))

const providerLabel = (provider: string) => {
  const key = provider as keyof typeof MODEL_PROVIDER_MAP
  return MODEL_PROVIDER_MAP[key]?.label ?? provider
}

const formatEpoch = (ms: number) => {
  if (!ms) return '-'
  return formatDate(new Date(ms))
}

const resetForm = () => {
  form.id = ''
  form.name = ''
  form.provider = 'openai'
  form.invokeFormat = 'openai_chat_completions'
  form.remoteModel = ''
  form.baseUrl = ''
  form.apiKeyInput = ''
  form.defaultTemperature = 0.7
  form.defaultMaxTokens = 2048
  form.enabled = true
  form.description = ''
}

const loadData = async () => {
  loading.value = true
  try {
    const params: { pageNum: number; pageSize: number; enabled?: boolean } = {
      pageNum: pagination.pageNum,
      pageSize: pagination.pageSize,
    }
    if (searchForm.enabled !== undefined && searchForm.enabled !== null) {
      params.enabled = searchForm.enabled
    }
    const res = await pageLlmModels(params)
    tableData.value = res.records
    pagination.total = res.total
  } finally {
    loading.value = false
  }
}

const handleSearch = () => {
  pagination.pageNum = 1
  loadData()
}

const handleReset = () => {
  searchForm.enabled = undefined
  pagination.pageNum = 1
  loadData()
}

const openCreateDialog = () => {
  isEditMode.value = false
  resetForm()
  showDialog.value = true
}

const openEditDialog = (row: LlmModelResponse) => {
  isEditMode.value = true
  form.id = row.id
  form.name = row.name
  form.provider = row.provider
  form.invokeFormat = row.invokeFormat
  form.remoteModel = row.remoteModel
  form.baseUrl = row.baseUrl || ''
  form.apiKeyInput = ''
  form.defaultTemperature = row.defaultTemperature
  form.defaultMaxTokens = row.defaultMaxTokens
  form.enabled = row.enabled
  form.description = row.description || ''
  showDialog.value = true
}

const submitForm = async () => {
  const valid = await formRef.value?.validate().catch(() => false)
  if (!valid) return

  submitting.value = true
  try {
    if (isEditMode.value) {
      const payload: ModelUpdatePayload = {
        id: form.id,
        name: form.name,
        provider: form.provider,
        invokeFormat: form.invokeFormat,
        remoteModel: form.remoteModel,
        baseUrl: form.baseUrl || undefined,
        defaultTemperature: form.defaultTemperature,
        defaultMaxTokens: form.defaultMaxTokens,
        enabled: form.enabled,
        description: form.description || undefined,
      }
      if (form.apiKeyInput !== '') {
        payload.apiKeySecretUpdate = form.apiKeyInput
      }
      await updateLlmModel(payload)
      ElMessage.success('模型已更新')
    } else {
      const payload: ModelCreatePayload = {
        id: form.id,
        name: form.name,
        provider: form.provider,
        invokeFormat: form.invokeFormat,
        remoteModel: form.remoteModel,
        baseUrl: form.baseUrl || undefined,
        defaultTemperature: form.defaultTemperature,
        defaultMaxTokens: form.defaultMaxTokens,
        enabled: form.enabled,
        description: form.description || undefined,
      }
      if (form.apiKeyInput) {
        payload.apiKey = form.apiKeyInput
      }
      await createLlmModel(payload)
      ElMessage.success('模型已注册')
    }
    showDialog.value = false
    await loadData()
  } finally {
    submitting.value = false
  }
}

const toggleEnabled = async (row: LlmModelResponse) => {
  await updateLlmModel({ id: row.id, enabled: !row.enabled })
  ElMessage.success(row.enabled ? '已禁用' : '已启用')
  await loadData()
}

const confirmDelete = (row: LlmModelResponse) => {
  ElMessageBox.confirm(`确定删除模型「${row.name}」（${row.id}）？`, '删除确认', {
    type: 'warning',
  })
    .then(async () => {
      await deleteLlmModel(row.id)
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
.model-registry {
  .param-hint {
    font-size: 12px;
    color: var(--text-secondary);
  }

  .pagination-container {
    display: flex;
    justify-content: flex-end;
    margin-top: 16px;
  }
}
</style>
