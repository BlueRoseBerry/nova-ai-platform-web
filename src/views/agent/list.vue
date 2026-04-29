<template>
  <div class="agent-list page-container">
    <div class="page-header">
      <div>
        <h2 class="page-title">Agent 管理</h2>
        <p class="page-subtitle">管理和配置智能体 Agent</p>
      </div>
      <el-button type="primary" @click="openCreateDialog">
        <el-icon><Plus /></el-icon>
        注册 Agent
      </el-button>
    </div>

    <!-- 统计概览 -->
    <el-row :gutter="16" class="stat-row">
      <el-col :span="6" v-for="stat in agentStats" :key="stat.label">
        <div class="stat-card">
          <div class="stat-value">{{ stat.value }}</div>
          <div class="stat-label">{{ stat.label }}</div>
        </div>
      </el-col>
    </el-row>

    <!-- Agent 列表 -->
    <el-table :data="agentList" style="width: 100%" v-loading="loading">
      <el-table-column prop="id" label="ID" width="120" />
      <el-table-column prop="name" label="Agent 名称" min-width="150">
        <template #default="{ row }">
          <div class="agent-name-cell">
            <el-icon :size="20" color="#667eea"><Cpu /></el-icon>
            <strong>{{ row.name }}</strong>
          </div>
        </template>
      </el-table-column>
      <el-table-column prop="role" label="角色" width="120" />
      <el-table-column prop="modelId" label="模型" width="140">
        <template #default="{ row }">
          <el-tag size="small" effect="plain">{{ row.modelId }}</el-tag>
        </template>
      </el-table-column>
      <el-table-column prop="temperature" label="Temperature" width="120">
        <template #default="{ row }">
          <el-progress :percentage="row.temperature * 100" :color="temperatureColor(row.temperature)" :stroke-width="8" />
        </template>
      </el-table-column>
      <el-table-column prop="maxTokens" label="Max Tokens" width="100" />
      <el-table-column label="技能数" width="80">
        <template #default="{ row }">
          <el-tag type="info" size="small">{{ row.skillIds?.length || 0 }}</el-tag>
        </template>
      </el-table-column>
      <el-table-column label="操作" width="240" fixed="right">
        <template #default="{ row }">
          <el-button size="small" @click="viewDetail(row)">查看</el-button>
          <el-button size="small" type="warning" @click="openEditDialog(row)">编辑</el-button>
          <el-button size="small" type="primary" @click="testAgent(row)">测试</el-button>
          <el-button size="small" type="danger" @click="confirmDeleteAgent(row)">删除</el-button>
        </template>
      </el-table-column>
    </el-table>

    <!-- 创建/编辑对话框 -->
    <el-dialog v-model="showCreateDialog" :title="dialogTitle" width="600px">
      <el-form :model="createForm" label-width="120px">
        <el-form-item label="Agent ID" required>
          <el-input
            v-model="createForm.id"
            placeholder="唯一标识，可与名称不同；留空则自动生成"
            :disabled="isEditMode"
          >
            <template #append>
              <el-button @click="createForm.id = generateAgentId()">生成 ID</el-button>
            </template>
          </el-input>
        </el-form-item>
        <el-form-item label="Agent 名称" required>
          <el-input v-model="createForm.name" placeholder="请输入 Agent 名称" />
        </el-form-item>
        <el-form-item label="角色">
          <el-input v-model="createForm.role" placeholder="如：客服、顾问、分析师等" />
        </el-form-item>
        <el-form-item label="系统提示词" required>
          <el-input
            v-model="createForm.systemPrompt"
            type="textarea"
            :rows="4"
            placeholder="请输入系统提示词，定义 Agent 的行为"
          />
        </el-form-item>
        <el-form-item label="使用模型">
          <el-select v-model="createForm.modelId" placeholder="选择模型" style="width: 100%">
            <el-option label="GPT-4" value="gpt-4" />
            <el-option label="GPT-3.5-Turbo" value="gpt-3.5-turbo" />
            <el-option label="通义千问" value="qwen-max" />
            <el-option label="Claude 3" value="claude-3" />
          </el-select>
        </el-form-item>
        <el-form-item label="Temperature">
          <el-slider v-model="createForm.temperature" :min="0" :max="1" :step="0.1" />
        </el-form-item>
        <el-form-item label="Max Tokens">
          <el-input-number v-model="createForm.maxTokens" :min="100" :max="8000" :step="100" />
        </el-form-item>
      </el-form>
      <template #footer>
        <el-button @click="showCreateDialog = false">取消</el-button>
        <el-button type="primary" @click="submitAgent">{{ submitButtonLabel }}</el-button>
      </template>
    </el-dialog>
  </div>
</template>

<script setup lang="ts">
import { ref, reactive, computed, onMounted } from 'vue'
import { useRouter } from 'vue-router'
import { Plus, Cpu } from '@element-plus/icons-vue'
import {
  deleteRegisteredAgent,
  listAgents,
  registerAgent,
  updateAgent,
} from '@/api'
import type { Agent } from '@/types'

const router = useRouter()
const loading = ref(false)
const showCreateDialog = ref(false)
const isEditMode = ref(false)
/** 编辑时保留服务端已有 skillIds / config（表单暂未编辑这些字段） */
const editingSnapshot = ref<Agent | null>(null)

const createForm = reactive({
  id: '',
  name: '',
  role: '',
  systemPrompt: '',
  modelId: 'gpt-4',
  temperature: 0.7,
  maxTokens: 2000,
})

const generateAgentId = () => `agent-${Date.now().toString(36)}`

const resetCreateForm = () => {
  createForm.id = ''
  createForm.name = ''
  createForm.role = ''
  createForm.systemPrompt = ''
  createForm.modelId = 'gpt-4'
  createForm.temperature = 0.7
  createForm.maxTokens = 2000
}

const dialogTitle = computed(() => (isEditMode.value ? '编辑 Agent' : '注册新 Agent'))
const submitButtonLabel = computed(() => (isEditMode.value ? '保存' : '确认注册'))

const openCreateDialog = () => {
  isEditMode.value = false
  editingSnapshot.value = null
  resetCreateForm()
  showCreateDialog.value = true
}

const openEditDialog = (row: Agent) => {
  isEditMode.value = true
  editingSnapshot.value = row
  createForm.id = row.id
  createForm.name = row.name
  createForm.role = row.role ?? ''
  createForm.systemPrompt = row.systemPrompt
  createForm.modelId = row.modelId
  createForm.temperature = row.temperature
  createForm.maxTokens = row.maxTokens
  showCreateDialog.value = true
}

const agentList = ref<Agent[]>([])

const agentStats = computed(() => {
  const n = agentList.value.length
  return [
    { label: '总 Agent 数', value: String(n) },
    { label: '数据源', value: '后端实时' },
    { label: 'Agent 服务', value: ':8082' },
    { label: '加载中', value: loading.value ? '是' : '否' },
  ]
})

const loadAgents = async () => {
  loading.value = true
  try {
    const data = await listAgents()
    agentList.value = Array.isArray(data) ? data : []
  } catch {
    agentList.value = []
  } finally {
    loading.value = false
  }
}

onMounted(() => {
  loadAgents()
})

const temperatureColor = (temp: number) => {
  if (temp < 0.4) return '#10b981'
  if (temp < 0.7) return '#f59e0b'
  return '#ef4444'
}

const viewDetail = (row: Agent) => {
  ElMessage.info(`Agent「${row.name}」(${row.id}) — 详情可在列表与测试页查看`)
}

const testAgent = (row: Agent) => {
  router.push({ path: '/agent/test', query: { agentId: row.id } })
}

const confirmDeleteAgent = async (row: Agent) => {
  try {
    await ElMessageBox.confirm(`确定要删除 Agent「${row.name}」(${row.id}) 吗？此操作不可恢复。`, '删除确认', {
      type: 'error',
      confirmButtonText: '删除',
      cancelButtonText: '取消',
    })
  } catch {
    return
  }
  try {
    await deleteRegisteredAgent(row)
    ElMessage.success('已删除')
    await loadAgents()
  } catch {
    /* 失败由 request 拦截器提示 */
  }
}

const submitAgent = async () => {
  if (!createForm.name?.trim()) {
    ElMessage.warning('请填写 Agent 名称')
    return
  }
  if (!createForm.systemPrompt?.trim()) {
    ElMessage.warning('请填写系统提示词')
    return
  }
  const id = createForm.id.trim() || generateAgentId()
  const snap = editingSnapshot.value
  const payload: Agent = {
    id,
    name: createForm.name.trim(),
    role: (createForm.role || 'assistant').trim(),
    systemPrompt: createForm.systemPrompt.trim(),
    skillIds: isEditMode.value && snap ? [...(snap.skillIds ?? [])] : [],
    config: isEditMode.value && snap ? { ...(snap.config ?? {}) } : {},
    modelId: createForm.modelId,
    temperature: createForm.temperature,
    maxTokens: createForm.maxTokens,
  }
  try {
    if (isEditMode.value) {
      await updateAgent(payload)
      ElMessage.success('Agent 已更新')
    } else {
      await registerAgent(payload)
      ElMessage.success('Agent 注册成功')
    }
    showCreateDialog.value = false
    editingSnapshot.value = null
    resetCreateForm()
    isEditMode.value = false
    await loadAgents()
  } catch {
    /* 全局已提示 */
  }
}
</script>

<style scoped lang="scss">
.agent-list {
  .stat-row {
    margin-bottom: 20px;

    .stat-card {
      background: var(--card-bg);
      padding: 20px;
      border-radius: 12px;
      text-align: center;
      box-shadow: 0 2px 8px rgba(0, 0, 0, 0.04);

      .stat-value {
        font-size: 24px;
        font-weight: 700;
        color: var(--text-primary);
      }

      .stat-label {
        font-size: 13px;
        color: var(--text-secondary);
        margin-top: 4px;
      }
    }
  }

  .agent-name-cell {
    display: flex;
    align-items: center;
    gap: 8px;
  }
}
</style>
