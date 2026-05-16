<template>
  <div class="model-chat page-container">
    <div class="page-header">
      <div>
        <h2 class="page-title">模型对话测试</h2>
        <p class="page-subtitle">通过注册模型调用 SSE 流式 `/api/v1/model/chat/completions/stream`（OpenAI兼容上游）</p>
      </div>
      <el-button @click="router.push('/model/providers')">管理模型注册</el-button>
    </div>

    <el-row :gutter="20">
      <el-col :span="6">
        <el-card class="config-panel">
          <template #header>
            <span class="section-title">模型参数配置</span>
          </template>
          <el-form label-position="top" v-loading="modelsLoading">
            <el-form-item label="注册模型" required>
              <el-select
                v-model="chatConfig.registryModelId"
                placeholder="请选择已启用的注册模型"
                style="width: 100%"
                filterable
                @change="onModelChange"
              >
                <el-option
                  v-for="m in enabledModels"
                  :key="m.id"
                  :label="`${m.name} (${m.id})`"
                  :value="m.id"
                />
              </el-select>
            </el-form-item>
            <el-form-item v-if="selectedModel" label="远程模型">
              <el-text size="small" type="info">{{ selectedModel.remoteModel }}</el-text>
            </el-form-item>
            <el-form-item label="Temperature">
              <el-slider
                v-model="chatConfig.temperature"
                :min="0"
                :max="2"
                :step="0.1"
                :marks="{ 0: '精确', 1: '平衡', 2: '创意' }"
              />
            </el-form-item>
            <el-form-item label="Max Tokens">
              <el-input-number
                v-model="chatConfig.maxTokens"
                :min="1"
                :max="1000000"
                :step="256"
                style="width: 100%"
              />
            </el-form-item>
            <el-divider />
            <el-form-item label="Token 统计（本次会话累计）">
              <div class="token-stats">
                <div class="stat-item">
                  <span class="stat-label">Prompt</span>
                  <span class="stat-value">{{ promptTokens }}</span>
                </div>
                <div class="stat-item">
                  <span class="stat-label">Completion</span>
                  <span class="stat-value">{{ completionTokens }}</span>
                </div>
                <div class="stat-item">
                  <span class="stat-label">Total</span>
                  <span class="stat-value">{{ promptTokens + completionTokens }}</span>
                </div>
              </div>
            </el-form-item>
            <el-button size="small" @click="clearChat" :disabled="messages.length === 0">
              清空对话
            </el-button>
          </el-form>
        </el-card>
      </el-col>

      <el-col :span="18">
        <el-card class="chat-card">
          <div class="chat-messages" ref="chatContainerRef">
            <el-empty
              v-if="messages.length === 0"
              description="选择注册模型后开始对话"
            />
            <div v-for="msg in messages" :key="msg.id" class="message-item" :class="msg.role">
              <el-avatar :size="36">
                <el-icon v-if="msg.role === 'user'"><User /></el-icon>
                <el-icon v-else><ChatDotRound /></el-icon>
              </el-avatar>
              <div class="message-content">
                <div class="message-text">{{ msg.content }}</div>
                <div class="message-time">{{ msg.time }}</div>
              </div>
            </div>
            <div
              v-if="streamBusy && !assistantBubbleReady"
              class="message-item assistant"
            >
              <el-avatar :size="36"><el-icon><ChatDotRound /></el-icon></el-avatar>
              <div class="message-content">
                <div class="typing-dots">
                  <span></span><span></span><span></span>
                </div>
              </div>
            </div>
          </div>

          <div class="chat-input-area">
            <el-input
              v-model="userInput"
              type="textarea"
              :rows="3"
              placeholder="输入您的问题..."
              :disabled="!chatConfig.registryModelId || streamBusy"
              @keydown.ctrl.enter="sendMessage"
            />
            <div class="input-actions">
              <span class="shortcut-hint">Ctrl + Enter 发送</span>
              <el-button
                type="primary"
                @click="sendMessage"
                :loading="streamBusy"
                :disabled="!chatConfig.registryModelId"
                class="send-btn"
              >
                <el-icon><Promotion /></el-icon> 发送
              </el-button>
            </div>
          </div>
        </el-card>
      </el-col>
    </el-row>
  </div>
</template>

<script setup lang="ts">
import { ref, reactive, computed, nextTick, onMounted } from 'vue'
import { useRouter } from 'vue-router'
import { User, ChatDotRound, Promotion } from '@element-plus/icons-vue'
import { chatCompletionsStream, pageLlmModels } from '@/api/modelRegistry'
import type { ChatMessagePayload, LlmModelResponse } from '@/types'

interface ChatMessage {
  id: string
  role: 'user' | 'assistant'
  content: string
  time: string
}

const router = useRouter()
const modelsLoading = ref(false)
const enabledModels = ref<LlmModelResponse[]>([])

const chatConfig = reactive({
  registryModelId: '',
  temperature: 0.7,
  maxTokens: 2048,
})

const userInput = ref('')
const messages = ref<ChatMessage[]>([])
const streamBusy = ref(false)
/** 已向 UI 追加空的助手消息后为 true（此前显示输入中的点点动画） */
const assistantBubbleReady = ref(false)
const promptTokens = ref(0)
const completionTokens = ref(0)
const chatContainerRef = ref<HTMLElement>()

const selectedModel = computed(() =>
  enabledModels.value.find((m) => m.id === chatConfig.registryModelId)
)

const loadEnabledModels = async () => {
  modelsLoading.value = true
  try {
    const res = await pageLlmModels({ pageNum: 1, pageSize: 200, enabled: true })
    enabledModels.value = res.records
    if (!chatConfig.registryModelId && res.records.length > 0) {
      chatConfig.registryModelId = res.records[0].id
      onModelChange()
    }
  } finally {
    modelsLoading.value = false
  }
}

const onModelChange = () => {
  const model = selectedModel.value
  if (!model) return
  if (model.defaultTemperature != null) {
    chatConfig.temperature = model.defaultTemperature
  }
  if (model.defaultMaxTokens != null) {
    chatConfig.maxTokens = model.defaultMaxTokens
  }
}

const buildApiMessages = (): ChatMessagePayload[] => {
  return messages.value.map((m) => ({
    role: m.role,
    content: m.content,
  }))
}

type OpenAiStreamChunk = {
  choices?: Array<{
    delta?: {
      content?: string | null
      reasoning_content?: string | null
      text?: string | null
    }
    message?: { content?: string | null; reasoning_content?: string | null }
    text?: string | null
  }>
  usage?: { prompt_tokens?: number; completion_tokens?: number }
}

/** OpenAI Chat Completions 流式单行 JSON：`delta.content`（或 reasoning）与可选的最终 `usage` */
function parseOpenAiStreamLine(raw: string): {
  delta: string
  usage?: OpenAiStreamChunk['usage']
} {
  const t = raw.trim()
  const empty = { delta: '' }
  if (!t || t === '[DONE]') {
    return empty
  }
  try {
    const j = JSON.parse(t) as OpenAiStreamChunk
    let delta = ''
    const choice = j.choices?.[0]
    const fromDelta = choice?.delta
    if (fromDelta) {
      if (typeof fromDelta.content === 'string' && fromDelta.content.length) {
        delta += fromDelta.content
      }
      if (typeof fromDelta.reasoning_content === 'string' && fromDelta.reasoning_content.length) {
        delta += fromDelta.reasoning_content
      }
      if (typeof fromDelta.text === 'string' && fromDelta.text.length) {
        delta += fromDelta.text
      }
    } else if (choice?.message) {
      if (typeof choice.message.content === 'string' && choice.message.content.length) {
        delta += choice.message.content
      }
      if (typeof choice.message.reasoning_content === 'string' && choice.message.reasoning_content.length) {
        delta += choice.message.reasoning_content
      }
    }
    if (!delta.length && typeof choice?.text === 'string' && choice.text.length) {
      delta += choice.text
    }
    const usage =
      j.usage && (j.usage.prompt_tokens != null || j.usage.completion_tokens != null)
        ? j.usage
        : undefined
    return { delta, usage }
  } catch {
    return empty
  }
}

function applyStreamError(raw: string) {
  let text = raw
  try {
    const o = JSON.parse(raw) as { message?: string }
    if (o?.message) {
      text = o.message
    }
  } catch {
    /* 保持原文 */
  }
  ElMessage.error(text || '对话流失败')
  return text || '对话流中断，请稍后重试。'
}

const sendMessage = async () => {
  if (!userInput.value.trim() || streamBusy.value) return
  if (!chatConfig.registryModelId) {
    ElMessage.warning('请先选择注册模型')
    return
  }

  const content = userInput.value.trim()
  userInput.value = ''

  messages.value.push({
    id: Date.now().toString(),
    role: 'user',
    content,
    time: new Date().toLocaleTimeString(),
  })

  streamBusy.value = true
  assistantBubbleReady.value = false
  await scrollToBottom()

  const payload = {
    registryModelId: chatConfig.registryModelId,
    messages: buildApiMessages(),
    temperature: chatConfig.temperature,
    maxTokens: chatConfig.maxTokens,
  }

  let assistantMsgId = ''
  let countedUsageRound = false
  let receivedStreamPayload = false

  try {
    await chatCompletionsStream(payload, {
      onStreamOpen: () => {
        assistantMsgId = `${Date.now()}-assistant`
        messages.value.push({
          id: assistantMsgId,
          role: 'assistant',
          content: '',
          time: new Date().toLocaleTimeString(),
        })
        assistantBubbleReady.value = true
        scrollToBottom()
      },
      onUpstreamData: (raw) => {
        const trimmed = raw.trim()
        if (trimmed === '[DONE]') {
          return
        }
        receivedStreamPayload = true
        const { delta, usage } = parseOpenAiStreamLine(raw)
        if (delta.length) {
          const row = messages.value.find((m) => m.id === assistantMsgId)
          if (row) {
            row.content += delta
          }
        }
        if (usage != null && !countedUsageRound) {
          countedUsageRound = true
          if (typeof usage.prompt_tokens === 'number') {
            promptTokens.value += usage.prompt_tokens
          }
          if (typeof usage.completion_tokens === 'number') {
            completionTokens.value += usage.completion_tokens
          }
        }
        scrollToBottom()
      },
      onServerError: (raw) => {
        const line = applyStreamError(raw)
        const row = messages.value.find((m) => m.id === assistantMsgId)
        if (row) {
          row.content += row.content ? `\n\n${line}` : line
        } else {
          messages.value.push({
            id: `${Date.now()}-error`,
            role: 'assistant',
            content: line,
            time: new Date().toLocaleTimeString(),
          })
          assistantBubbleReady.value = true
        }
      },
    })
    const bubble = assistantMsgId ? messages.value.find((m) => m.id === assistantMsgId) : undefined
    if (bubble && !bubble.content.trim()) {
      bubble.content = receivedStreamPayload
        ? '已收到流式数据但未解析出正文，请检查模型返回格式是否与 OpenAI Chat Completions 兼容。'
        : '本次未收到任何流式数据包，请确认模型网关已重启、上游支持 stream=true，或查看网关日志。'
    }
  } catch (e: unknown) {
    const fallback =
      typeof e === 'object' && e !== null && 'message' in e && typeof (e as Error).message === 'string'
        ? (e as Error).message
        : '请求失败，请检查模型网关服务、注册配置与 API 密钥。'
    messages.value.push({
      id: `${Date.now()}-error`,
      role: 'assistant',
      content: fallback,
      time: new Date().toLocaleTimeString(),
    })
  } finally {
    streamBusy.value = false
    assistantBubbleReady.value = false
    await scrollToBottom()
  }
}

const clearChat = () => {
  messages.value = []
  promptTokens.value = 0
  completionTokens.value = 0
}

const scrollToBottom = async () => {
  await nextTick()
  if (chatContainerRef.value) {
    chatContainerRef.value.scrollTop = chatContainerRef.value.scrollHeight
  }
}

onMounted(() => {
  loadEnabledModels()
})
</script>

<style scoped lang="scss">
.model-chat {
  .config-panel {
    position: sticky;
    top: 20px;
  }

  .token-stats {
    display: grid;
    grid-template-columns: repeat(3, 1fr);
    gap: 8px;

    .stat-item {
      text-align: center;
      padding: 8px;
      background: var(--bg-color);
      border-radius: 6px;

      .stat-label {
        display: block;
        font-size: 11px;
        color: var(--text-muted);
      }

      .stat-value {
        display: block;
        font-size: 16px;
        font-weight: 700;
        color: var(--text-primary);
      }
    }
  }

  .chat-card {
    display: flex;
    flex-direction: column;
    min-height: 600px;

    :deep(.el-card__body) {
      display: flex;
      flex-direction: column;
      flex: 1;
    }
  }

  .chat-messages {
    flex: 1;
    overflow-y: auto;
    padding: 16px;
    min-height: 400px;
    max-height: 450px;

    .message-item {
      display: flex;
      gap: 12px;
      margin-bottom: 16px;

      &.user {
        flex-direction: row-reverse;

        .message-text {
          background: linear-gradient(135deg, #667eea, #764ba2);
          color: #fff;
        }
      }

      .message-text {
        padding: 12px 16px;
        border-radius: 12px;
        background: var(--bg-color);
        font-size: 14px;
        line-height: 1.6;
        white-space: pre-wrap;
        word-break: break-word;
      }

      .message-time {
        font-size: 11px;
        color: var(--text-muted);
        margin-top: 4px;
      }
    }

    .typing-dots {
      display: flex;
      gap: 4px;
      padding: 12px 16px;
      background: var(--bg-color);
      border-radius: 12px;

      span {
        width: 8px;
        height: 8px;
        background: var(--text-muted);
        border-radius: 50%;
        animation: typingBounce 1.4s infinite;

        &:nth-child(2) {
          animation-delay: 0.2s;
        }
        &:nth-child(3) {
          animation-delay: 0.4s;
        }
      }
    }
  }

  .chat-input-area {
    padding-top: 16px;
    border-top: 1px solid var(--border-color);

    .input-actions {
      display: flex;
      justify-content: space-between;
      align-items: center;
      margin-top: 8px;

      .shortcut-hint {
        font-size: 12px;
        color: var(--text-muted);
      }
    }
  }
}

@keyframes typingBounce {
  0%,
  60%,
  100% {
    transform: translateY(0);
  }
  30% {
    transform: translateY(-6px);
  }
}
</style>
