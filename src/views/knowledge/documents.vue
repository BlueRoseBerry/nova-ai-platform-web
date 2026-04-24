<template>
  <div class="knowledge-documents page-container">
    <div class="page-header">
      <div>
        <h2 class="page-title">文档管理</h2>
        <p class="page-subtitle">知识库「{{ knowledgeBaseName }}」的文档列表</p>
      </div>
      <div class="header-actions">
        <el-upload
          action="/api/v1/rag/upload"
          :show-file-list="false"
          :before-upload="handleUpload"
        >
          <el-button type="primary">
            <el-icon><Upload /></el-icon>
            上传文档
          </el-button>
        </el-upload>
        <el-button @click="showAddDialog = true">
          <el-icon><Plus /></el-icon>
          添加文本
        </el-button>
      </div>
    </div>

    <!-- 文档列表 -->
    <el-table :data="documents" style="width: 100%" v-loading="loading">
      <el-table-column prop="documentId" label="文档ID" width="140" />
      <el-table-column prop="name" label="文档名称" min-width="200" />
      <el-table-column prop="type" label="类型" width="80">
        <template #default="{ row }">
          <el-tag size="small">{{ row.type }}</el-tag>
        </template>
      </el-table-column>
      <el-table-column prop="chunkCount" label="分块数" width="80" />
      <el-table-column prop="status" label="处理状态" width="120">
        <template #default="{ row }">
          <el-tag :type="docStatusType(row.status)" size="small">{{ docStatusLabel(row.status) }}</el-tag>
        </template>
      </el-table-column>
      <el-table-column prop="size" label="大小" width="100" />
      <el-table-column prop="createdAt" label="创建时间" width="180" />
      <el-table-column label="操作" width="150" fixed="right">
        <template #default="{ row }">
          <el-button size="small" @click="viewDocument(row)">查看</el-button>
          <el-button size="small" type="danger" @click="deleteDocument(row)">删除</el-button>
        </template>
      </el-table-column>
    </el-table>

    <!-- 添加文本对话框 -->
    <el-dialog v-model="showAddDialog" title="添加文本内容" width="600px">
      <el-form :model="addForm" label-width="80px">
        <el-form-item label="标题">
          <el-input v-model="addForm.name" placeholder="请输入标题" />
        </el-form-item>
        <el-form-item label="内容">
          <el-input
            v-model="addForm.content"
            type="textarea"
            :rows="8"
            placeholder="粘贴文本内容"
          />
        </el-form-item>
      </el-form>
      <template #footer>
        <el-button @click="showAddDialog = false">取消</el-button>
        <el-button type="primary" @click="handleAddDocument">确认添加</el-button>
      </template>
    </el-dialog>
  </div>
</template>

<script setup lang="ts">
import { ref, reactive } from 'vue'
import { useRoute } from 'vue-router'
import { Plus, Upload } from '@element-plus/icons-vue'

const route = useRoute()
const loading = ref(false)
const showAddDialog = ref(false)
const knowledgeBaseName = ref('金融知识库')

const documents = ref([
  { documentId: 'doc-001', name: '2026年Q1投资策略报告.pdf', type: 'PDF', chunkCount: 15, status: 'completed', size: '2.3 MB', createdAt: '2026-04-20 10:30' },
  { documentId: 'doc-002', name: '理财产品说明文档.docx', type: 'DOCX', chunkCount: 8, status: 'completed', size: '567 KB', createdAt: '2026-04-19 15:20' },
  { documentId: 'doc-003', name: '风险管理手册.txt', type: 'TXT', chunkCount: 12, status: 'processing', size: '128 KB', createdAt: '2026-04-21 09:00' },
  { documentId: 'doc-004', name: 'FAQ常见问题.txt', type: 'TXT', chunkCount: 20, status: 'completed', size: '45 KB', createdAt: '2026-04-18 14:45' },
])

const addForm = reactive({
  name: '',
  content: '',
})

const docStatusType = (status: string) => {
  const map: Record<string, any> = { completed: 'success', processing: 'warning', failed: 'danger', pending: 'info' }
  return map[status] || 'info'
}

const docStatusLabel = (status: string) => {
  const map: Record<string, string> = { completed: '已完成', processing: '处理中', failed: '失败', pending: '待处理' }
  return map[status] || status
}

const handleUpload = (file: File) => {
  ElMessage.success(`上传文件: ${file.name}`)
  return false
}

const handleAddDocument = () => {
  ElMessage.success('文档添加成功')
  showAddDialog.value = false
}

const viewDocument = (row: any) => {
  ElMessage.info(`查看文档: ${row.name}`)
}

const deleteDocument = async (row: any) => {
  try {
    await ElMessageBox.confirm(`确定要删除文档「${row.name}」吗？`, '删除确认', { type: 'error' })
    ElMessage.success('删除成功')
  } catch {}
}
</script>

<style scoped lang="scss">
.knowledge-documents {
  .header-actions {
    display: flex;
    gap: 12px;
  }
}
</style>
