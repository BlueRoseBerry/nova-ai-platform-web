<template>
  <div class="model-providers page-container">
    <div class="page-header">
      <div>
        <h2 class="page-title">模型提供商管理</h2>
        <p class="page-subtitle">配置和管理大模型提供商接入</p>
      </div>
    </div>

    <el-row :gutter="20">
      <el-col :xs="24" :sm="12" :lg="8" v-for="provider in providers" :key="provider.id">
        <el-card class="provider-card">
          <div class="provider-header">
            <div class="provider-icon" :style="{ background: provider.color }">
              <span class="provider-emoji">{{ provider.emoji }}</span>
            </div>
            <div class="provider-info">
              <h3>{{ provider.name }}</h3>
              <p>{{ provider.description }}</p>
            </div>
          </div>

          <el-descriptions :column="1" size="small">
            <el-descriptions-item label="端点">{{ provider.endpoint }}</el-descriptions-item>
            <el-descriptions-item label="支持模型">{{ provider.models.join(', ') }}</el-descriptions-item>
            <el-descriptions-item label="状态">
              <el-tag :type="provider.status === 'active' ? 'success' : 'info'" size="small">
                {{ provider.status === 'active' ? '已启用' : '未启用' }}
              </el-tag>
            </el-descriptions-item>
          </el-descriptions>

          <div class="provider-actions">
            <el-button size="small" @click="editProvider(provider)">配置</el-button>
            <el-button
              size="small"
              :type="provider.status === 'active' ? 'warning' : 'success'"
              @click="toggleProvider(provider)"
            >
              {{ provider.status === 'active' ? '禁用' : '启用' }}
            </el-button>
          </div>
        </el-card>
      </el-col>

      <!-- 添加新提供商 -->
      <el-col :xs="24" :sm="12" :lg="8">
        <el-card class="add-provider-card" @click="showAddDialog = true">
          <div class="add-provider-content">
            <el-icon :size="48" color="#667eea"><Plus /></el-icon>
            <span>添加新的模型提供商</span>
          </div>
        </el-card>
      </el-col>
    </el-row>

    <!-- 配置对话框 -->
    <el-dialog v-model="showConfigDialog" :title="configDialogTitle" width="500px">
      <el-form :model="configForm" label-width="120px">
        <el-form-item label="API 端点">
          <el-input v-model="configForm.endpoint" placeholder="请输入 API 端点" />
        </el-form-item>
        <el-form-item label="API Key">
          <el-input v-model="configForm.apiKey" type="password" show-password placeholder="请输入 API Key" />
        </el-form-item>
        <el-form-item label="默认模型">
          <el-input v-model="configForm.defaultModel" placeholder="请输入默认模型" />
        </el-form-item>
        <el-form-item label="超时时间">
          <el-input-number v-model="configForm.timeout" :min="1000" :step="1000" />
        </el-form-item>
      </el-form>
      <template #footer>
        <el-button @click="showConfigDialog = false">取消</el-button>
        <el-button type="primary" @click="saveConfig">保存</el-button>
      </template>
    </el-dialog>
  </div>
</template>

<script setup lang="ts">
import { ref, reactive } from 'vue'
import { Plus } from '@element-plus/icons-vue'

interface Provider {
  id: string
  name: string
  emoji: string
  description: string
  endpoint: string
  models: string[]
  status: 'active' | 'inactive'
  color: string
}

const providers = ref<Provider[]>([
  {
    id: 'openai',
    name: 'OpenAI',
    emoji: '🤖',
    description: '全球领先的 AI 模型提供商',
    endpoint: 'https://api.openai.com/v1',
    models: ['GPT-4', 'GPT-3.5-Turbo', 'DALL-E'],
    status: 'active',
    color: 'linear-gradient(135deg, #10a37f, #0d8a6a)',
  },
  {
    id: 'anthropic',
    name: 'Anthropic',
    emoji: '🧠',
    description: 'Claude 系列模型，强大的理解能力',
    endpoint: 'https://api.anthropic.com',
    models: ['Claude 3 Opus', 'Claude 3 Sonnet', 'Claude 3 Haiku'],
    status: 'active',
    color: 'linear-gradient(135deg, #d97706, #b45309)',
  },
  {
    id: 'tongyi',
    name: '通义千问',
    emoji: '💡',
    description: '阿里巴巴旗下大语言模型',
    endpoint: 'https://dashscope.aliyuncs.com',
    models: ['qwen-max', 'qwen-plus', 'qwen-turbo'],
    status: 'active',
    color: 'linear-gradient(135deg, #6366f1, #4f46e5)',
  },
  {
    id: 'local',
    name: '本地模型',
    emoji: '💻',
    description: '本地部署的开源模型',
    endpoint: 'http://localhost:8080',
    models: ['Llama 2', 'Mistral', 'Qwen'],
    status: 'inactive',
    color: 'linear-gradient(135deg, #64748b, #475569)',
  },
])

const showConfigDialog = ref(false)
const showAddDialog = ref(false)
const configDialogTitle = ref('')
const configForm = reactive({
  endpoint: '',
  apiKey: '',
  defaultModel: '',
  timeout: 30000,
})

const editProvider = (provider: Provider) => {
  configDialogTitle.value = `配置 ${provider.name}`
  configForm.endpoint = provider.endpoint
  showConfigDialog.value = true
}

const toggleProvider = (provider: Provider) => {
  provider.status = provider.status === 'active' ? 'inactive' : 'active'
  ElMessage.success(`${provider.name} 已${provider.status === 'active' ? '启用' : '禁用'}`)
}

const saveConfig = () => {
  ElMessage.success('配置保存成功')
  showConfigDialog.value = false
}
</script>

<style scoped lang="scss">
.model-providers {
  .provider-card {
    margin-bottom: 20px;

    .provider-header {
      display: flex;
      gap: 16px;
      margin-bottom: 16px;

      .provider-icon {
        width: 56px;
        height: 56px;
        border-radius: 12px;
        display: flex;
        align-items: center;
        justify-content: center;

        .provider-emoji {
          font-size: 28px;
        }
      }

      .provider-info {
        h3 {
          font-size: 16px;
          font-weight: 600;
          margin: 0 0 4px;
        }

        p {
          font-size: 12px;
          color: var(--text-secondary);
          margin: 0;
        }
      }
    }

    .provider-actions {
      display: flex;
      gap: 8px;
      margin-top: 16px;
    }
  }

  .add-provider-card {
    margin-bottom: 20px;
    cursor: pointer;
    min-height: 260px;

    &:hover {
      border-color: #667eea;
    }

    .add-provider-content {
      display: flex;
      flex-direction: column;
      align-items: center;
      justify-content: center;
      height: 180px;
      color: var(--text-secondary);
      gap: 12px;
    }
  }
}
</style>
