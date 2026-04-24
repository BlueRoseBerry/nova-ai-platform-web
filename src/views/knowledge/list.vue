<template>
  <div class="knowledge-list page-container">
    <div class="page-header">
      <div>
        <h2 class="page-title">知识库管理</h2>
        <p class="page-subtitle">管理 RAG 检索增强所需的知识库</p>
      </div>
      <el-button type="primary" @click="showCreateDialog = true">
        <el-icon><Plus /></el-icon>
        创建知识库
      </el-button>
    </div>

    <!-- 知识库卡片 -->
    <div class="kb-grid">
      <el-card
        v-for="kb in knowledgeBases"
        :key="kb.id"
        class="kb-card"
      >
        <div class="kb-header">
          <el-icon :size="24" color="#667eea"><Files /></el-icon>
          <div class="kb-title">
            <h3>{{ kb.name }}</h3>
            <span class="kb-id">{{ kb.id }}</span>
          </div>
        </div>

        <p class="kb-desc">{{ kb.description }}</p>

        <div class="kb-stats">
          <div class="kb-stat">
            <span class="kb-stat-value">{{ kb.documentCount }}</span>
            <span class="kb-stat-label">文档数</span>
          </div>
          <div class="kb-stat">
            <span class="kb-stat-value">{{ kb.chunkCount }}</span>
            <span class="kb-stat-label">分块数</span>
          </div>
          <div class="kb-stat">
            <span class="kb-stat-value">{{ kb.vectorSize }}</span>
            <span class="kb-stat-label">向量数</span>
          </div>
        </div>

        <div class="kb-footer">
          <span class="kb-time">更新于 {{ kb.updatedAt }}</span>
          <div class="kb-actions">
            <el-button size="small" @click="manageDocuments(kb)">管理文档</el-button>
            <el-button size="small" type="danger" @click="deleteKB(kb)">删除</el-button>
          </div>
        </div>
      </el-card>

      <!-- 添加新知识库 -->
      <el-card class="kb-card add-kb-card" @click="showCreateDialog = true">
        <div class="add-kb-content">
          <el-icon :size="48" color="#667eea"><Plus /></el-icon>
          <span>新建知识库</span>
        </div>
      </el-card>
    </div>

    <!-- 检索测试 -->
    <el-card class="retrieval-test">
      <template #header>
        <span class="section-title">检索测试</span>
      </template>
      <el-form :inline="true" class="retrieval-form">
        <el-form-item label="知识库">
          <el-select v-model="retrievalForm.kbId" style="width: 200px">
            <el-option
              v-for="kb in knowledgeBases"
              :key="kb.id"
              :label="kb.name"
              :value="kb.id"
            />
          </el-select>
        </el-form-item>
        <el-form-item label="查询文本">
          <el-input v-model="retrievalForm.query" placeholder="输入检索查询" style="width: 300px" />
        </el-form-item>
        <el-form-item label="Top K">
          <el-input-number v-model="retrievalForm.topK" :min="1" :max="20" />
        </el-form-item>
        <el-form-item>
          <el-button type="primary" @click="testRetrieval">检索</el-button>
        </el-form-item>
      </el-form>

      <!-- 检索结果 -->
      <div v-if="retrievalResults.length" class="retrieval-results">
        <div
          v-for="(result, idx) in retrievalResults"
          :key="idx"
          class="retrieval-result-item"
        >
          <div class="result-score">
            <el-icon color="#667eea"><Star /></el-icon>
            <span>Score: {{ result.score.toFixed(3) }}</span>
          </div>
          <div class="result-content">{{ result.content }}</div>
          <div class="result-meta">Chunk ID: {{ result.chunkId }}</div>
        </div>
      </div>
    </el-card>

    <!-- 创建知识库对话框 -->
    <el-dialog v-model="showCreateDialog" title="创建知识库" width="500px">
      <el-form :model="createForm" label-width="100px">
        <el-form-item label="名称" required>
          <el-input v-model="createForm.name" placeholder="请输入知识库名称" />
        </el-form-item>
        <el-form-item label="描述">
          <el-input
            v-model="createForm.description"
            type="textarea"
            :rows="3"
            placeholder="请输入知识库描述"
          />
        </el-form-item>
      </el-form>
      <template #footer>
        <el-button @click="showCreateDialog = false">取消</el-button>
        <el-button type="primary" @click="handleCreate">创建</el-button>
      </template>
    </el-dialog>
  </div>
</template>

<script setup lang="ts">
import { ref, reactive } from 'vue'
import { useRouter } from 'vue-router'
import { Plus, Files, Star } from '@element-plus/icons-vue'

const router = useRouter()
const showCreateDialog = ref(false)

const knowledgeBases = ref([
  {
    id: 'kb-001',
    name: '金融知识库',
    description: '包含金融产品、投资理财、风险管理等相关知识',
    documentCount: 156,
    chunkCount: 1248,
    vectorSize: 1248,
    updatedAt: '2026-04-20 15:30',
  },
  {
    id: 'kb-002',
    name: '政务知识库',
    description: '政策法规、办事指南、便民服务指南',
    documentCount: 89,
    chunkCount: 712,
    vectorSize: 712,
    updatedAt: '2026-04-19 10:00',
  },
  {
    id: 'kb-003',
    name: '产品知识库',
    description: '产品说明、使用手册、FAQ 常见问题解答',
    documentCount: 234,
    chunkCount: 1872,
    vectorSize: 1872,
    updatedAt: '2026-04-21 09:15',
  },
])

const retrievalForm = reactive({
  kbId: 'kb-001',
  query: '',
  topK: 5,
})

const retrievalResults = ref<any[]>([])

const createForm = reactive({
  name: '',
  description: '',
})

const testRetrieval = () => {
  if (!retrievalForm.query) {
    ElMessage.warning('请输入查询文本')
    return
  }

  // Mock results
  retrievalResults.value = [
    { chunkId: 'chunk-001', content: '关于投资理财，建议您根据自身的风险承受能力选择合适的产品。低风险投资者可以选择货币基金或国债，中等风险投资者可以考虑债券基金或混合基金。', score: 0.92 },
    { chunkId: 'chunk-002', content: '风险管理是投资过程中重要的一环，建议投资者做好资产配置，分散投资风险，避免将全部资金投入单一资产。', score: 0.85 },
    { chunkId: 'chunk-003', content: '当前市场环境下，建议保持适度仓位，关注宏观经济政策走向和行业趋势变化。', score: 0.78 },
  ]
}

const manageDocuments = (kb: any) => {
  router.push(`/knowledge/documents/${kb.id}`)
}

const deleteKB = async (kb: any) => {
  try {
    await ElMessageBox.confirm(`确定要删除知识库「${kb.name}」吗？`, '删除确认', { type: 'error' })
    ElMessage.success('删除成功')
  } catch {}
}

const handleCreate = () => {
  ElMessage.success('知识库创建成功')
  showCreateDialog.value = false
}
</script>

<style scoped lang="scss">
.knowledge-list {
  .kb-grid {
    display: grid;
    grid-template-columns: repeat(auto-fill, minmax(320px, 1fr));
    gap: 20px;
    margin-bottom: 24px;
  }

  .kb-card {
    .kb-header {
      display: flex;
      align-items: center;
      gap: 12px;
      margin-bottom: 12px;

      .kb-title {
        h3 {
          font-size: 16px;
          font-weight: 600;
          margin: 0;
        }

        .kb-id {
          font-size: 11px;
          color: var(--text-muted);
        }
      }
    }

    .kb-desc {
      font-size: 13px;
      color: var(--text-secondary);
      margin-bottom: 16px;
    }

    .kb-stats {
      display: flex;
      gap: 12px;
      padding: 12px;
      background: var(--bg-color);
      border-radius: 8px;
      margin-bottom: 16px;

      .kb-stat {
        flex: 1;
        text-align: center;

        .kb-stat-value {
          display: block;
          font-size: 18px;
          font-weight: 700;
          color: var(--text-primary);
        }

        .kb-stat-label {
          font-size: 11px;
          color: var(--text-muted);
        }
      }
    }

    .kb-footer {
      display: flex;
      justify-content: space-between;
      align-items: center;

      .kb-time {
        font-size: 12px;
        color: var(--text-muted);
      }

      .kb-actions {
        display: flex;
        gap: 8px;
      }
    }
  }

  .add-kb-card {
    cursor: pointer;
    min-height: 200px;
    display: flex;
    align-items: center;
    justify-content: center;

    &:hover {
      border-color: #667eea;
    }

    .add-kb-content {
      display: flex;
      flex-direction: column;
      align-items: center;
      gap: 12px;
      color: var(--text-secondary);
    }
  }

  .retrieval-test {
    .retrieval-form {
      margin-bottom: 16px;
    }

    .retrieval-results {
      display: flex;
      flex-direction: column;
      gap: 12px;

      .retrieval-result-item {
        padding: 16px;
        background: var(--bg-color);
        border-radius: 8px;

        .result-score {
          display: flex;
          align-items: center;
          gap: 4px;
          font-size: 13px;
          color: #667eea;
          margin-bottom: 8px;
        }

        .result-content {
          font-size: 14px;
          line-height: 1.6;
          color: var(--text-primary);
          margin-bottom: 8px;
        }

        .result-meta {
          font-size: 12px;
          color: var(--text-muted);
        }
      }
    }
  }
}
</style>
