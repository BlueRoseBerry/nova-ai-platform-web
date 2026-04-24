<template>
  <div class="skill-list page-container">
    <div class="page-header">
      <div>
        <h2 class="page-title">技能管理</h2>
        <p class="page-subtitle">管理和配置 Agent 可用的技能插件</p>
      </div>
      <el-button type="primary" @click="showCreateDialog = true">
        <el-icon><Plus /></el-icon>
        注册技能
      </el-button>
    </div>

    <!-- 技能类型筛选 -->
    <el-tabs v-model="activeTab">
      <el-tab-pane label="全部" name="all" />
      <el-tab-pane label="数据查询" name="DATA_QUERY" />
      <el-tab-pane label="计算" name="CALCULATION" />
      <el-tab-pane label="通知" name="NOTIFICATION" />
      <el-tab-pane label="外部API" name="EXTERNAL_API" />
    </el-tabs>

    <!-- 技能列表 -->
    <el-table :data="filteredSkills" style="width: 100%">
      <el-table-column prop="id" label="ID" width="120" />
      <el-table-column prop="name" label="技能名称" min-width="150">
        <template #default="{ row }">
          <div class="skill-name-cell">
            <el-icon :size="20" :color="skillTypeColor(row.type)"><component :is="skillTypeIcon(row.type)" /></el-icon>
            <strong>{{ row.name }}</strong>
          </div>
        </template>
      </el-table-column>
      <el-table-column label="类型" width="120">
        <template #default="{ row }">
          <el-tag :color="skillTypeColor(row.type)" style="color: #fff; border: none;">
            {{ skillTypeLabel(row.type) }}
          </el-tag>
        </template>
      </el-table-column>
      <el-table-column label="状态" width="100">
        <template #default="{ row }">
          <el-tag :type="row.status === 'active' ? 'success' : 'info'" size="small">
            {{ row.status === 'active' ? '已启用' : '未启用' }}
          </el-tag>
        </template>
      </el-table-column>
      <el-table-column prop="description" label="描述" min-width="200" show-overflow-tooltip />
      <el-table-column label="操作" width="200" fixed="right">
        <template #default="{ row }">
          <el-button size="small" @click="testSkill(row)">测试</el-button>
          <el-button size="small" @click="editSkill(row)">编辑</el-button>
          <el-button
            size="small"
            :type="row.status === 'active' ? 'warning' : 'success'"
            @click="toggleSkill(row)"
          >
            {{ row.status === 'active' ? '禁用' : '启用' }}
          </el-button>
        </template>
      </el-table-column>
    </el-table>

    <!-- 创建/编辑对话框 -->
    <el-dialog v-model="showCreateDialog" :title="dialogTitle" width="600px">
      <el-form :model="form" label-width="120px">
        <el-form-item label="技能名称" required>
          <el-input v-model="form.name" placeholder="请输入技能名称" />
        </el-form-item>
        <el-form-item label="技能类型" required>
          <el-select v-model="form.type" style="width: 100%">
            <el-option label="数据查询" value="DATA_QUERY" />
            <el-option label="计算" value="CALCULATION" />
            <el-option label="通知" value="NOTIFICATION" />
            <el-option label="外部API" value="EXTERNAL_API" />
          </el-select>
        </el-form-item>
        <el-form-item label="描述">
          <el-input v-model="form.description" type="textarea" :rows="3" />
        </el-form-item>
        <el-form-item label="配置参数">
          <el-input v-model="form.config" type="textarea" :rows="4" placeholder="JSON 格式配置" />
        </el-form-item>
      </el-form>
      <template #footer>
        <el-button @click="showCreateDialog = false">取消</el-button>
        <el-button type="primary" @click="handleSave">保存</el-button>
      </template>
    </el-dialog>
  </div>
</template>

<script setup lang="ts">
import { ref, reactive, computed } from 'vue'
import { Plus, Search, Odometer, Bell, Connection } from '@element-plus/icons-vue'

interface Skill {
  id: string
  name: string
  type: string
  status: 'active' | 'inactive'
  description: string
}

const activeTab = ref('all')
const showCreateDialog = ref(false)
const dialogTitle = ref('注册新技能')

const skillList = ref<Skill[]>([
  { id: 'skill-001', name: '数据库查询', type: 'DATA_QUERY', status: 'active', description: '通过 SQL 模板查询数据库，支持多数据源' },
  { id: 'skill-002', name: '数学计算', type: 'CALCULATION', status: 'active', description: '执行各种数学计算，包括统计、财务等' },
  { id: 'skill-003', name: '邮件通知', type: 'NOTIFICATION', status: 'active', description: '发送邮件、短信、钉钉等通知消息' },
  { id: 'skill-004', name: '天气查询', type: 'EXTERNAL_API', status: 'active', description: '调用外部天气 API 获取实时天气信息' },
  { id: 'skill-005', name: '股票行情', type: 'EXTERNAL_API', status: 'inactive', description: '获取实时股票行情数据' },
  { id: 'skill-006', name: '翻译工具', type: 'EXTERNAL_API', status: 'active', description: '多语言翻译服务' },
])

const form = reactive({
  name: '',
  type: 'DATA_QUERY',
  description: '',
  config: '{}',
})

const filteredSkills = computed(() => {
  if (activeTab.value === 'all') return skillList.value
  return skillList.value.filter((s) => s.type === activeTab.value)
})

const skillTypeIcon = (type: string) => {
  const map: Record<string, any> = {
    DATA_QUERY: Search,
    CALCULATION: Odometer,
    NOTIFICATION: Bell,
    EXTERNAL_API: Connection,
  }
  return map[type] || Search
}

const skillTypeColor = (type: string) => {
  const map: Record<string, string> = {
    DATA_QUERY: '#667eea',
    CALCULATION: '#10b981',
    NOTIFICATION: '#f59e0b',
    EXTERNAL_API: '#3b82f6',
  }
  return map[type] || '#999'
}

const skillTypeLabel = (type: string) => {
  const map: Record<string, string> = {
    DATA_QUERY: '数据查询',
    CALCULATION: '计算',
    NOTIFICATION: '通知',
    EXTERNAL_API: '外部API',
  }
  return map[type] || type
}

const testSkill = (row: Skill) => {
  ElMessage.info(`测试技能: ${row.name}`)
}

const editSkill = (row: Skill) => {
  dialogTitle.value = '编辑技能'
  form.name = row.name
  form.type = row.type
  form.description = row.description
  showCreateDialog.value = true
}

const toggleSkill = (row: Skill) => {
  row.status = row.status === 'active' ? 'inactive' : 'active'
  ElMessage.success(`${row.name} 已${row.status === 'active' ? '启用' : '禁用'}`)
}

const handleSave = () => {
  ElMessage.success('保存成功')
  showCreateDialog.value = false
}
</script>

<style scoped lang="scss">
.skill-list {
  .skill-name-cell {
    display: flex;
    align-items: center;
    gap: 8px;
  }
}
</style>
