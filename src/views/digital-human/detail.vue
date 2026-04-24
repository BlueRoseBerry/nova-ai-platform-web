<template>
  <div class="digital-human-detail page-container">
    <div class="page-header">
      <div>
        <h2 class="page-title">数字人详情</h2>
        <p class="page-subtitle">查看数字人配置信息和运行状态</p>
      </div>
      <div class="header-actions">
        <el-tag :type="detail.publishStatus === 'published' ? 'success' : 'info'" size="large">
          {{ detail.publishStatus === 'published' ? '已发布' : '草稿' }}
        </el-tag>
        <el-button @click="router.back()">返回</el-button>
        <el-button type="primary" @click="handleEdit">编辑</el-button>
      </div>
    </div>

    <el-row :gutter="24">
      <el-col :xs="24" :lg="8">
        <el-card class="profile-card">
          <div class="profile-header">
            <el-avatar :size="100" :src="detail.avatarUrl || ''">
              <el-icon :size="48"><Avatar /></el-icon>
            </el-avatar>
            <h2 class="profile-name">{{ detail.name }}</h2>
            <p class="profile-id">ID: {{ detail.id }}</p>
          </div>

          <el-descriptions :column="1" border>
            <el-descriptions-item label="声音模型">{{ detail.voiceModel || '未设置' }}</el-descriptions-item>
            <el-descriptions-item label="创建时间">{{ formatDate(detail.createdAt) }}</el-descriptions-item>
            <el-descriptions-item label="更新时间">{{ formatDate(detail.updatedAt) }}</el-descriptions-item>
          </el-descriptions>
        </el-card>
      </el-col>

      <el-col :xs="24" :lg="16">
        <el-card class="info-section">
          <template #header>
            <span class="section-title">人格设定</span>
          </template>
          <div class="personality-content">
            {{ detail.personality || '暂无人格设定' }}
          </div>
        </el-card>

        <el-card class="info-section">
          <template #header>
            <span class="section-title">绑定配置</span>
          </template>
          <el-descriptions :column="2" border>
            <el-descriptions-item label="关联 Agent">
              <el-tag v-if="detail.agentId" type="primary">{{ detail.agentId }}</el-tag>
              <span v-else class="text-muted">未绑定</span>
            </el-descriptions-item>
            <el-descriptions-item label="关联工作流">
              <el-tag v-if="detail.workflowId" type="success">{{ detail.workflowId }}</el-tag>
              <span v-else class="text-muted">未绑定</span>
            </el-descriptions-item>
          </el-descriptions>
        </el-card>

        <el-card class="info-section">
          <template #header>
            <span class="section-title">技能列表 ({{ detail.skills?.length || 0 }})</span>
          </template>
          <div class="skill-tags">
            <el-tag
              v-for="skill in detail.skills"
              :key="skill"
              class="skill-tag"
              effect="plain"
            >
              {{ skill }}
            </el-tag>
            <span v-if="!detail.skills?.length" class="text-muted">未配置技能</span>
          </div>
        </el-card>

        <el-card class="info-section">
          <template #header>
            <span class="section-title">运行统计</span>
          </template>
          <el-row :gutter="16">
            <el-col :span="8" v-for="stat in runStats" :key="stat.label">
              <div class="run-stat">
                <div class="stat-value">{{ stat.value }}</div>
                <div class="stat-label">{{ stat.label }}</div>
              </div>
            </el-col>
          </el-row>
        </el-card>
      </el-col>
    </el-row>
  </div>
</template>

<script setup lang="ts">
import { ref, onMounted } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import type { DigitalHumanResponse } from '@/types'
import { formatDate } from '@/utils/format'
import { getDigitalHuman } from '@/api/digitalHuman'
import { Avatar } from '@element-plus/icons-vue'

const route = useRoute()
const router = useRouter()

const detail = ref<DigitalHumanResponse>({
  id: Number(route.params.id),
  userId: 'user-001',
  name: '智能客服助手',
  avatarUrl: '',
  voiceModel: 'zh-CN-XiaoxiaoNeural',
  personality: '热情友好，专业耐心，能够快速响应用户需求。善于理解用户意图，提供准确、有帮助的信息。在交流过程中保持礼貌和友善的态度，让用户感到舒适。',
  skills: ['skill-001', 'skill-002'],
  agentId: 'agent-001',
  workflowId: 'workflow-001',
  publishStatus: 'published',
  createdAt: '2026-04-15T10:00:00Z',
  updatedAt: '2026-04-20T15:30:00Z',
})

const runStats = [
  { label: '对话次数', value: '1,234' },
  { label: '活跃用户', value: '89' },
  { label: '满意度', value: '96.5%' },
]

onMounted(async () => {
  // In production: const data = await getDigitalHuman(Number(route.params.id))
})

const handleEdit = () => {
  ElMessage.info('编辑功能开发中')
}
</script>

<style scoped lang="scss">
.digital-human-detail {
  .header-actions {
    display: flex;
    align-items: center;
    gap: 12px;
  }

  .profile-card {
    .profile-header {
      text-align: center;
      padding: 20px 0;

      .profile-name {
        font-size: 20px;
        font-weight: 600;
        margin: 12px 0 4px;
      }

      .profile-id {
        font-size: 12px;
        color: var(--text-muted);
      }
    }
  }

  .info-section {
    margin-bottom: 20px;

    .section-title {
      font-size: 16px;
      font-weight: 600;
    }

    .personality-content {
      line-height: 1.8;
      color: var(--text-secondary);
      padding: 8px 0;
    }

    .skill-tags {
      display: flex;
      flex-wrap: wrap;
      gap: 8px;

      .skill-tag {
        margin: 0;
      }
    }
  }

  .run-stat {
    text-align: center;
    padding: 16px;
    background: var(--bg-color);
    border-radius: 8px;

    .stat-value {
      font-size: 28px;
      font-weight: 700;
      color: var(--text-primary);
    }

    .stat-label {
      font-size: 13px;
      color: var(--text-secondary);
      margin-top: 4px;
    }
  }

  .text-muted {
    color: var(--text-muted);
  }
}
</style>
