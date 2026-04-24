<template>
  <div class="workflow-list page-container">
    <div class="page-header">
      <div>
        <h2 class="page-title">工作流管理</h2>
        <p class="page-subtitle">设计、管理和执行工作流流程</p>
      </div>
      <el-button type="primary" @click="createWorkflow">
        <el-icon><Plus /></el-icon>
        创建工作流
      </el-button>
    </div>

    <!-- 工作流列表 -->
    <div class="workflow-grid">
      <el-card
        v-for="wf in workflowList"
        :key="wf.workflowId"
        class="workflow-card"
      >
        <div class="wf-header">
          <div class="wf-icon">
            <el-icon :size="28"><Share /></el-icon>
          </div>
          <div class="wf-title">
            <h3>{{ wf.name }}</h3>
            <p>{{ wf.description || '暂无描述' }}</p>
          </div>
        </div>

        <div class="wf-stats">
          <div class="wf-stat">
            <span class="stat-num">{{ wf.nodes?.length || 0 }}</span>
            <span class="stat-label">节点数</span>
          </div>
          <div class="wf-stat">
            <span class="stat-num">{{ wf.executions || 0 }}</span>
            <span class="stat-label">执行次数</span>
          </div>
          <div class="wf-stat">
            <span class="stat-num">{{ wf.successRate || '--' }}</span>
            <span class="stat-label">成功率</span>
          </div>
        </div>

        <div class="wf-actions">
          <el-button size="small" @click="editWorkflow(wf)">
            <el-icon><Edit /></el-icon> 设计
          </el-button>
          <el-button size="small" type="success" @click="executeWorkflow(wf)">
            <el-icon><VideoPlay /></el-icon> 执行
          </el-button>
          <el-button size="small" type="danger" @click="deleteWorkflow(wf)">
            <el-icon><Delete /></el-icon> 删除
          </el-button>
        </div>
      </el-card>
    </div>

    <!-- 最近执行记录 -->
    <el-card class="recent-executions">
      <template #header>
        <span class="section-title">最近执行记录</span>
      </template>
      <el-table :data="recentExecutions" style="width: 100%">
        <el-table-column prop="instanceId" label="实例 ID" width="180" />
        <el-table-column prop="workflowName" label="工作流" width="160" />
        <el-table-column prop="status" label="状态" width="120">
          <template #default="{ row }">
            <el-tag :type="statusType(row.status)" size="small">{{ statusLabel(row.status) }}</el-tag>
          </template>
        </el-table-column>
        <el-table-column prop="duration" label="耗时" width="100" />
        <el-table-column prop="startedAt" label="开始时间" width="180">
          <template #default="{ row }">
            {{ formatDate(row.startedAt) }}
          </template>
        </el-table-column>
        <el-table-column label="操作" width="100">
          <template #default="{ row }">
            <el-button size="small" @click="viewExecution(row)">详情</el-button>
          </template>
        </el-table-column>
      </el-table>
    </el-card>
  </div>
</template>

<script setup lang="ts">
import { ref } from 'vue'
import { useRouter } from 'vue-router'
import { Plus, Share, Edit, VideoPlay, Delete } from '@element-plus/icons-vue'
import { formatDate } from '@/utils/format'

const router = useRouter()

const workflowList = ref([
  {
    workflowId: 'workflow-001',
    name: '客服处理流程',
    description: '自动处理客户咨询、投诉和建议的标准化流程',
    nodes: [
      { id: '1', name: '意图识别', type: 'LLM_CALL' },
      { id: '2', name: '知识检索', type: 'API_CALL' },
      { id: '3', name: '生成回复', type: 'LLM_CALL' },
      { id: '4', name: '发送通知', type: 'SKILL_EXECUTION' },
    ],
    executions: 1234,
    successRate: '98.5%',
  },
  {
    workflowId: 'workflow-002',
    name: '投资分析流程',
    description: '基于市场数据和用户画像的投资建议生成流程',
    nodes: [
      { id: '1', name: '数据获取', type: 'API_CALL' },
      { id: '2', name: '风险评估', type: 'CONDITION' },
      { id: '3', name: '策略生成', type: 'LLM_CALL' },
      { id: '4', name: '人工审核', type: 'HUMAN_REVIEW' },
    ],
    executions: 567,
    successRate: '95.2%',
  },
  {
    workflowId: 'workflow-003',
    name: '政策解答流程',
    description: '政务政策咨询的标准解答流程',
    nodes: [
      { id: '1', name: '问题分类', type: 'LLM_CALL' },
      { id: '2', name: '政策检索', type: 'API_CALL' },
      { id: '3', name: '答案生成', type: 'LLM_CALL' },
    ],
    executions: 890,
    successRate: '97.8%',
  },
])

const recentExecutions = ref([
  {
    instanceId: 'inst-001',
    workflowName: '客服处理流程',
    status: 'COMPLETED',
    duration: '2.3s',
    startedAt: '2026-04-21 10:23:45',
  },
  {
    instanceId: 'inst-002',
    workflowName: '投资分析流程',
    status: 'RUNNING',
    duration: '--',
    startedAt: '2026-04-21 10:25:12',
  },
  {
    instanceId: 'inst-003',
    workflowName: '政策解答流程',
    status: 'FAILED',
    duration: '1.1s',
    startedAt: '2026-04-21 10:20:00',
  },
])

const statusType = (status: string) => {
  const map: Record<string, any> = {
    COMPLETED: 'success',
    RUNNING: 'warning',
    FAILED: 'danger',
    PENDING: 'info',
  }
  return map[status] || 'info'
}

const statusLabel = (status: string) => {
  const map: Record<string, string> = {
    COMPLETED: '已完成',
    RUNNING: '运行中',
    FAILED: '失败',
    PENDING: '待执行',
  }
  return map[status] || status
}

const createWorkflow = () => {
  router.push('/workflow/design/new')
}

const editWorkflow = (wf: any) => {
  router.push(`/workflow/design/${wf.workflowId}`)
}

const executeWorkflow = async (wf: any) => {
  try {
    await ElMessageBox.confirm(`确定要执行工作流「${wf.name}」吗？`, '执行确认', { type: 'warning' })
    ElMessage.success('工作流已开始执行')
  } catch {}
}

const deleteWorkflow = async (wf: any) => {
  try {
    await ElMessageBox.confirm(`确定要删除工作流「${wf.name}」吗？`, '删除确认', { type: 'error' })
    ElMessage.success('删除成功')
  } catch {}
}

const viewExecution = (row: any) => {
  ElMessage.info(`查看执行记录: ${row.instanceId}`)
}
</script>

<style scoped lang="scss">
.workflow-list {
  .workflow-grid {
    display: grid;
    grid-template-columns: repeat(auto-fill, minmax(300px, 1fr));
    gap: 20px;
    margin-bottom: 24px;
  }

  .workflow-card {
    .wf-header {
      display: flex;
      gap: 12px;
      margin-bottom: 16px;

      .wf-icon {
        width: 48px;
        height: 48px;
        background: linear-gradient(135deg, #667eea, #764ba2);
        border-radius: 10px;
        display: flex;
        align-items: center;
        justify-content: center;
        color: #fff;
      }

      .wf-title {
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

    .wf-stats {
      display: flex;
      gap: 16px;
      margin-bottom: 16px;
      padding: 12px;
      background: var(--bg-color);
      border-radius: 8px;

      .wf-stat {
        flex: 1;
        text-align: center;

        .stat-num {
          display: block;
          font-size: 18px;
          font-weight: 700;
          color: var(--text-primary);
        }

        .stat-label {
          font-size: 11px;
          color: var(--text-muted);
        }
      }
    }

    .wf-actions {
      display: flex;
      gap: 8px;
    }
  }

  .recent-executions {
    .section-title {
      font-size: 16px;
      font-weight: 600;
    }
  }
}
</style>
