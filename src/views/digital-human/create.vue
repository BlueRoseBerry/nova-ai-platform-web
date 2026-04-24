<template>
  <div class="digital-human-create page-container">
    <div class="page-header">
      <div>
        <h2 class="page-title">创建数字人</h2>
        <p class="page-subtitle">配置新的数字人智能体</p>
      </div>
    </div>

    <el-form
      ref="formRef"
      :model="form"
      :rules="rules"
      label-width="120px"
      class="create-form"
    >
      <!-- 基本信息 -->
      <el-card class="form-section">
        <template #header>
          <span class="section-title">基本信息</span>
        </template>

        <el-form-item label="数字人名称" prop="name">
          <el-input v-model="form.name" placeholder="请输入数字人名称" maxlength="50" show-word-limit />
        </el-form-item>

        <el-form-item label="头像URL" prop="avatarUrl">
          <el-input v-model="form.avatarUrl" placeholder="请输入头像URL地址" />
          <div class="avatar-preview" v-if="form.avatarUrl">
            <el-avatar :size="64" :src="form.avatarUrl" />
          </div>
        </el-form-item>

        <el-form-item label="声音模型" prop="voiceModel">
          <el-select v-model="form.voiceModel" placeholder="请选择声音模型" style="width: 100%">
            <el-option label="晓晓 (女声)" value="zh-CN-XiaoxiaoNeural" />
            <el-option label="云希 (男声)" value="zh-CN-YunxiNeural" />
            <el-option label="云扬 (男声)" value="zh-CN-YunyangNeural" />
            <el-option label="晓晓 (童声)" value="zh-CN-XiaoyiNeural" />
          </el-select>
        </el-form-item>

        <el-form-item label="人格设定" prop="personality">
          <el-input
            v-model="form.personality"
            type="textarea"
            :rows="4"
            placeholder="描述数字人的性格特点、语言风格和行为特征"
            maxlength="500"
            show-word-limit
          />
        </el-form-item>
      </el-card>

      <!-- 绑定配置 -->
      <el-card class="form-section">
        <template #header>
          <span class="section-title">绑定配置</span>
        </template>

        <el-form-item label="关联 Agent" prop="agentId">
          <el-select v-model="form.agentId" placeholder="请选择关联的Agent" style="width: 100%" filterable>
            <el-option
              v-for="agent in agentOptions"
              :key="agent.value"
              :label="agent.label"
              :value="agent.value"
            />
          </el-select>
        </el-form-item>

        <el-form-item label="关联工作流" prop="workflowId">
          <el-select v-model="form.workflowId" placeholder="请选择关联的工作流" style="width: 100%" filterable>
            <el-option
              v-for="wf in workflowOptions"
              :key="wf.value"
              :label="wf.label"
              :value="wf.value"
            />
          </el-select>
        </el-form-item>

        <el-form-item label="技能列表">
          <el-select
            v-model="form.skills"
            multiple
            placeholder="请选择技能"
            style="width: 100%"
            filterable
          >
            <el-option
              v-for="skill in skillOptions"
              :key="skill.value"
              :label="skill.label"
              :value="skill.value"
            />
          </el-select>
        </el-form-item>
      </el-card>

      <!-- 操作按钮 -->
      <div class="form-actions">
        <el-button @click="router.back()">取消</el-button>
        <el-button type="primary" @click="handleSubmit" :loading="submitting">
          创建数字人
        </el-button>
      </div>
    </el-form>
  </div>
</template>

<script setup lang="ts">
import { ref, reactive } from 'vue'
import { useRouter } from 'vue-router'
import type { FormInstance } from 'element-plus'
import type { DigitalHumanCreateRequest } from '@/types'
import { createDigitalHuman } from '@/api/digitalHuman'

const router = useRouter()
const formRef = ref<FormInstance>()
const submitting = ref(false)

const form = reactive<DigitalHumanCreateRequest>({
  name: '',
  avatarUrl: '',
  voiceModel: '',
  personality: '',
  skills: [],
  agentId: '',
  workflowId: '',
})

const rules = {
  name: [
    { required: true, message: '请输入数字人名称', trigger: 'blur' },
    { min: 2, max: 50, message: '长度在 2 到 50 个字符', trigger: 'blur' },
  ],
}

const agentOptions = [
  { label: '智能客服 Agent', value: 'agent-001' },
  { label: '金融顾问 Agent', value: 'agent-002' },
  { label: '政务咨询 Agent', value: 'agent-003' },
  { label: '技术支持 Agent', value: 'agent-004' },
]

const workflowOptions = [
  { label: '客服处理流程', value: 'workflow-001' },
  { label: '投资分析流程', value: 'workflow-002' },
  { label: '政策解答流程', value: 'workflow-003' },
]

const skillOptions = [
  { label: '数据查询', value: 'skill-001' },
  { label: '计算工具', value: 'skill-002' },
  { label: '通知推送', value: 'skill-003' },
  { label: '外部API调用', value: 'skill-004' },
]

const handleSubmit = async () => {
  const valid = await formRef.value?.validate().catch(() => false)
  if (!valid) return

  submitting.value = true
  try {
    await createDigitalHuman(form)
    ElMessage.success('创建成功')
    router.push('/digital-human/list')
  } catch {
    ElMessage.error('创建失败')
  } finally {
    submitting.value = false
  }
}
</script>

<style scoped lang="scss">
.digital-human-create {
  .form-section {
    margin-bottom: 24px;

    .section-title {
      font-size: 16px;
      font-weight: 600;
    }
  }

  .avatar-preview {
    margin-top: 8px;
  }

  .form-actions {
    display: flex;
    justify-content: flex-end;
    gap: 12px;
    padding-top: 24px;
    border-top: 1px solid var(--border-color);
  }
}
</style>
