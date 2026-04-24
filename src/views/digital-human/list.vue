<template>
  <div class="digital-human-list page-container">
    <div class="page-header">
      <div>
        <h2 class="page-title">数字人管理</h2>
        <p class="page-subtitle">管理您的数字人配置、发布和运行状态</p>
      </div>
      <el-button type="primary" @click="router.push('/digital-human/create')">
        <el-icon><Plus /></el-icon>
        创建数字人
      </el-button>
    </div>

    <!-- 搜索栏 -->
    <div class="search-bar">
      <el-form :inline="true" :model="searchForm">
        <el-form-item label="名称">
          <el-input v-model="searchForm.name" placeholder="搜索数字人名称" clearable />
        </el-form-item>
        <el-form-item label="状态">
          <el-select v-model="searchForm.status" placeholder="全部" clearable>
            <el-option label="草稿" value="draft" />
            <el-option label="已发布" value="published" />
          </el-select>
        </el-form-item>
        <el-form-item>
          <el-button type="primary" @click="handleSearch">搜索</el-button>
          <el-button @click="handleReset">重置</el-button>
        </el-form-item>
      </el-form>
    </div>

    <!-- 数字人卡片列表 -->
    <div class="card-grid">
      <el-card
        v-for="item in tableData"
        :key="item.id"
        class="dh-card"
        @click="viewDetail(item)"
      >
        <div class="card-header">
          <el-avatar :size="48" :src="item.avatarUrl || ''">
            <el-icon :size="24"><Avatar /></el-icon>
          </el-avatar>
          <div class="card-title">
            <h3>{{ item.name }}</h3>
            <el-tag :type="item.publishStatus === 'published' ? 'success' : 'info'" size="small">
              {{ item.publishStatus === 'published' ? '已发布' : '草稿' }}
            </el-tag>
          </div>
        </div>

        <div class="card-desc">
          {{ item.personality || '暂无人格设定' }}
        </div>

        <div class="card-meta">
          <div class="meta-item">
            <el-icon><Cpu /></el-icon>
            <span>{{ item.agentId || '未绑定Agent' }}</span>
          </div>
          <div class="meta-item">
            <el-icon><Share /></el-icon>
            <span>{{ item.workflowId || '未绑定工作流' }}</span>
          </div>
          <div class="meta-item">
            <el-icon><Tools /></el-icon>
            <span>{{ item.skills?.length || 0 }} 个技能</span>
          </div>
        </div>

        <div class="card-footer">
          <span class="create-time">{{ formatDate(item.createdAt) }}</span>
          <div class="card-actions">
            <el-button size="small" @click.stop="handleEdit(item)">
              <el-icon><Edit /></el-icon> 编辑
            </el-button>
            <el-button
              v-if="item.publishStatus === 'draft'"
              size="small"
              type="success"
              @click.stop="handlePublish(item)"
            >
              <el-icon><Upload /></el-icon> 发布
            </el-button>
            <el-button size="small" type="danger" @click.stop="handleDelete(item)">
              <el-icon><Delete /></el-icon> 删除
            </el-button>
          </div>
        </div>
      </el-card>

      <el-empty v-if="tableData.length === 0" description="暂无数字人数据">
        <el-button type="primary" @click="router.push('/digital-human/create')">
          创建第一个数字人
        </el-button>
      </el-empty>
    </div>

    <!-- 分页 -->
    <div class="pagination-container">
      <el-pagination
        v-model:current-page="pagination.pageNum"
        v-model:page-size="pagination.pageSize"
        :page-sizes="[10, 20, 50]"
        :total="pagination.total"
        layout="total, sizes, prev, pager, next, jumper"
        @size-change="handlePageChange"
        @current-change="handlePageChange"
      />
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, reactive, onMounted } from 'vue'
import { useRouter } from 'vue-router'
import type { DigitalHumanResponse } from '@/types'
import { formatDate } from '@/utils/format'
import { pageDigitalHuman, deleteDigitalHuman, publishDigitalHuman } from '@/api/digitalHuman'
import { Plus, Avatar, Cpu, Share, Tools, Edit, Upload, Delete } from '@element-plus/icons-vue'

const router = useRouter()
const loading = ref(false)
const tableData = ref<DigitalHumanResponse[]>([])

const searchForm = reactive({
  name: '',
  status: '',
})

const pagination = reactive({
  pageNum: 1,
  pageSize: 10,
  total: 0,
})

const loadData = async () => {
  loading.value = true
  try {
    // Mock data for display
    tableData.value = [
      {
        id: 1,
        userId: 'user-001',
        name: '智能客服助手',
        avatarUrl: '',
        voiceModel: 'zh-CN-XiaoxiaoNeural',
        personality: '热情友好，专业耐心，能够快速响应用户需求',
        skills: ['skill-001', 'skill-002'],
        agentId: 'agent-001',
        workflowId: 'workflow-001',
        publishStatus: 'published',
        createdAt: '2026-04-15T10:00:00Z',
        updatedAt: '2026-04-20T15:30:00Z',
      },
      {
        id: 2,
        userId: 'user-001',
        name: '金融顾问数字人',
        avatarUrl: '',
        voiceModel: 'zh-CN-YunxiNeural',
        personality: '专业严谨，善于分析，能够给出合理的投资建议',
        skills: ['skill-003', 'skill-004'],
        agentId: 'agent-002',
        workflowId: 'workflow-002',
        publishStatus: 'draft',
        createdAt: '2026-04-18T09:00:00Z',
        updatedAt: '2026-04-19T11:00:00Z',
      },
      {
        id: 3,
        userId: 'user-001',
        name: '政务咨询助手',
        avatarUrl: '',
        voiceModel: 'zh-CN-YunyangNeural',
        personality: '正式规范，条理清晰，准确传达政策信息',
        skills: ['skill-001'],
        agentId: 'agent-003',
        workflowId: '',
        publishStatus: 'draft',
        createdAt: '2026-04-19T14:00:00Z',
        updatedAt: '2026-04-19T14:00:00Z',
      },
    ]
    pagination.total = 3
  } finally {
    loading.value = false
  }
}

const handleSearch = () => {
  pagination.pageNum = 1
  loadData()
}

const handleReset = () => {
  searchForm.name = ''
  searchForm.status = ''
  handleSearch()
}

const handlePageChange = () => {
  loadData()
}

const viewDetail = (item: DigitalHumanResponse) => {
  router.push(`/digital-human/detail/${item.id}`)
}

const handleEdit = (item: DigitalHumanResponse) => {
  ElMessage.info('编辑功能开发中')
}

const handlePublish = async (item: DigitalHumanResponse) => {
  try {
    await ElMessageBox.confirm(`确定要发布数字人「${item.name}」吗？`, '发布确认', {
      confirmButtonText: '确定发布',
      cancelButtonText: '取消',
      type: 'warning',
    })
    await publishDigitalHuman(item.id)
    ElMessage.success('发布成功')
    item.publishStatus = 'published'
  } catch {}
}

const handleDelete = async (item: DigitalHumanResponse) => {
  try {
    await ElMessageBox.confirm(`确定要删除数字人「${item.name}」吗？此操作不可恢复。`, '删除确认', {
      confirmButtonText: '确定删除',
      cancelButtonText: '取消',
      type: 'error',
    })
    await deleteDigitalHuman(item.id)
    ElMessage.success('删除成功')
    loadData()
  } catch {}
}

onMounted(() => {
  loadData()
})
</script>

<style scoped lang="scss">
.digital-human-list {
  .search-bar {
    background: var(--bg-color);
    padding: 16px;
    border-radius: 8px;
    margin-bottom: 20px;
  }

  .card-grid {
    display: grid;
    grid-template-columns: repeat(auto-fill, minmax(320px, 1fr));
    gap: 20px;
    margin-bottom: 24px;
  }

  .dh-card {
    cursor: pointer;
    transition: transform 0.2s, box-shadow 0.2s;

    &:hover {
      transform: translateY(-4px);
      box-shadow: 0 8px 24px rgba(0, 0, 0, 0.12);
    }

    .card-header {
      display: flex;
      align-items: center;
      gap: 12px;
      margin-bottom: 16px;

      .card-title {
        h3 {
          font-size: 16px;
          font-weight: 600;
          margin: 0 0 4px;
          color: var(--text-primary);
        }
      }
    }

    .card-desc {
      font-size: 13px;
      color: var(--text-secondary);
      margin-bottom: 16px;
      display: -webkit-box;
      -webkit-line-clamp: 2;
      -webkit-box-orient: vertical;
      overflow: hidden;
    }

    .card-meta {
      display: flex;
      gap: 12px;
      margin-bottom: 16px;
      flex-wrap: wrap;

      .meta-item {
        display: flex;
        align-items: center;
        gap: 4px;
        font-size: 12px;
        color: var(--text-secondary);
        background: var(--bg-color);
        padding: 4px 8px;
        border-radius: 6px;
      }
    }

    .card-footer {
      display: flex;
      justify-content: space-between;
      align-items: center;
      padding-top: 12px;
      border-top: 1px solid var(--border-color);

      .create-time {
        font-size: 12px;
        color: var(--text-muted);
      }

      .card-actions {
        display: flex;
        gap: 8px;
      }
    }
  }

  .pagination-container {
    display: flex;
    justify-content: center;
    padding-top: 20px;
  }
}
</style>
