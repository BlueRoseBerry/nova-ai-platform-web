<template>
  <div class="agent-list page-container">
    <div class="page-header">
      <div>
        <h2 class="page-title">Agent 管理</h2>
        <p class="page-subtitle">管理和配置智能体 Agent</p>
      </div>
      <el-button type="primary" @click="showCreateDialog = true">
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
      <el-table-column label="操作" width="180" fixed="right">
        <template #default="{ row }">
          <el-button size="small" @click="viewDetail(row)">查看</el-button>
          <el-button size="small" type="primary" @click="testAgent(row)">测试</el-button>
          <el-button size="small" type="danger" @click="deleteAgent(row)">删除</el-button>
        </template>
      </el-table-column>
    </el-table>

    <!-- 创建/编辑对话框 -->
    <el-dialog v-model="showCreateDialog" title="注册新 Agent" width="600px">
      <el-form :model="createForm" label-width="120px">
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
        <el-button type="primary" @click="handleCreateAgent">确认注册</el-button>
      </template>
    </el-dialog>
  </div>
</template>

<script setup lang="ts">
import { ref, reactive } from 'vue'
import { useRouter } from 'vue-router'
import { Plus, Cpu } from '@element-plus/icons-vue'

const router = useRouter()
const loading = ref(false)
const showCreateDialog = ref(false)

const agentStats = [
  { label: '总 Agent 数', value: 12 },
  { label: '活跃 Agent', value: 8 },
  { label: '今日调用', value: '2,345' },
  { label: '平均响应', value: '1.2s' },
]

const agentList = ref([
  {
    id: 'agent-001',
    name: '智能客服 Agent',
    role: '客服',
    systemPrompt: '你是一个专业的客服助手...',
    skillIds: ['skill-001', 'skill-002'],
    config: {},
    modelId: 'gpt-4',
    temperature: 0.7,
    maxTokens: 2000,
  },
  {
    id: 'agent-002',
    name: '金融顾问 Agent',
    role: '顾问',
    systemPrompt: '你是一个专业的金融顾问...',
    skillIds: ['skill-003', 'skill-004'],
    config: {},
    modelId: 'gpt-4',
    temperature: 0.5,
    maxTokens: 3000,
  },
  {
    id: 'agent-003',
    name: '政务咨询 Agent',
    role: '咨询',
    systemPrompt: '你是一个政务咨询助手...',
    skillIds: ['skill-001'],
    config: {},
    modelId: 'qwen-max',
    temperature: 0.3,
    maxTokens: 2000,
  },
  {
    id: 'agent-004',
    name: '技术支持 Agent',
    role: '技术支持',
    systemPrompt: '你是一个技术支持专家...',
    skillIds: ['skill-002', 'skill-004'],
    config: {},
    modelId: 'claude-3',
    temperature: 0.6,
    maxTokens: 4000,
  },
])

const createForm = reactive({
  name: '',
  role: '',
  systemPrompt: '',
  modelId: 'gpt-4',
  temperature: 0.7,
  maxTokens: 2000,
})

const temperatureColor = (temp: number) => {
  if (temp < 0.4) return '#10b981'
  if (temp < 0.7) return '#f59e0b'
  return '#ef4444'
}

const viewDetail = (row: any) => {
  ElMessage.info(`查看 ${row.name} 详情`)
}

const testAgent = (row: any) => {
  router.push('/agent/test')
}

const deleteAgent = async (row: any) => {
  try {
    await ElMessageBox.confirm(`确定要删除 Agent「${row.name}」吗？`, '删除确认', { type: 'warning' })
    ElMessage.success('删除成功')
  } catch {}
}

const handleCreateAgent = () => {
  ElMessage.success('Agent 注册成功')
  showCreateDialog.value = false
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
