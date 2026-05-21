<template>
  <div class="agent-chat page-container">
    <div class="page-header">
      <div>
        <h2 class="page-title">Agent 对话</h2>
        <p class="page-subtitle">与智能体进行实时对话，支持同步与流式模式</p>
      </div>
    </div>

    <el-row :gutter="24">
      <!-- 左侧配置面板 -->
      <el-col :xs="24" :lg="6">
        <el-card class="config-panel" shadow="hover">
          <template #header>
            <div class="section-title-row">
              <el-icon :size="18"><Setting /></el-icon>
              <span class="section-title">对话配置</span>
            </div>
          </template>
          <el-form label-position="top" size="default">
            <el-form-item label="选择 Agent">
              <el-select
                v-model="selectedAgent"
                style="width: 100%"
                @change="handleAgentChange"
                filterable
                placeholder="选择一个智能体"
              >
                <el-option
                  v-for="agent in agentOptions"
                  :key="agent.id"
                  :label="`${agent.name} (${agent.role || 'assistant'})`"
                  :value="agent.id"
                />
              </el-select>
            </el-form-item>
            <el-form-item label="对话模式">
              <el-radio-group v-model="chatMode">
                <el-radio-button value="stream">流式</el-radio-button>
                <el-radio-button value="sync">同步</el-radio-button>
              </el-radio-group>
            </el-form-item>
            <el-form-item label="Temperature">
              <el-slider
                v-model="overrideTemperature"
                :min="0"
                :max="1"
                :step="0.1"
                show-input
                :show-input-controls="false"
                input-size="small"
              />
            </el-form-item>
            <el-form-item label="Max Tokens">
              <el-input-number
                v-model="overrideMaxTokens"
                :min="100"
                :max="32000"
                :step="100"
                style="width: 100%"
              />
            </el-form-item>

            <el-divider />

            <el-form-item>
              <el-button style="width: 100%" @click="clearConversation" :disabled="messages.length <= 1">
                <el-icon><Delete /></el-icon>
                清空对话
              </el-button>
            </el-form-item>

            <!-- 当前 Agent 信息 -->
            <div v-if="currentAgent" class="agent-info-card">
              <div class="agent-info-header">
                <el-icon :size="16" color="#667eea"><Cpu /></el-icon>
                <strong>{{ currentAgent.name }}</strong>
              </div>
              <div class="agent-info-body">
                <div class="info-row">
                  <span class="info-label">角色</span>
                  <span class="info-value">{{ currentAgent.role || 'assistant' }}</span>
                </div>
                <div class="info-row">
                  <span class="info-label">模型</span>
                  <el-tag size="small" effect="plain">{{ currentAgent.modelId }}</el-tag>
                </div>
                <div class="info-row">
                  <span class="info-label">Temperature</span>
                  <span class="info-value">{{ currentAgent.temperature }}</span>
                </div>
                <div class="info-row">
                  <span class="info-label">Max Tokens</span>
                  <span class="info-value">{{ currentAgent.maxTokens }}</span>
                </div>
              </div>
            </div>
          </el-form>
        </el-card>
      </el-col>

      <!-- 右侧对话面板 -->
      <el-col :xs="24" :lg="18">
        <el-card class="chat-panel" shadow="hover">
          <div class="chat-messages" ref="chatContainerRef">
            <div
              v-for="msg in visibleMessages"
              :key="msg.id"
              class="message-item"
              :class="msg.role"
            >
              <div class="avatar-wrapper" :class="msg.role">
                <el-icon v-if="msg.role === 'user'" :size="18"><User /></el-icon>
                <el-icon v-else-if="msg.role === 'assistant'" :size="18"><Cpu /></el-icon>
                <el-icon v-else :size="18"><InfoFilled /></el-icon>
              </div>
              <div class="message-bubble" :class="msg.role">
                <div class="message-content" v-html="renderContent(msg.content)"></div>
                <div v-if="msg.role === 'assistant' && msg.tokens" class="message-meta">
                  <el-tag size="small" type="info" effect="plain">
                    Tokens: {{ msg.tokens }}
                  </el-tag>
                  <el-tag v-if="msg.modelUsed" size="small" effect="plain">
                    {{ msg.modelUsed }}
                  </el-tag>
                </div>
                <div class="message-time">{{ msg.time }}</div>
              </div>
            </div>

            <!-- 流式输出时的打字指示器 -->
            <div v-if="isStreaming && !streamingContent" class="message-item assistant typing">
              <div class="avatar-wrapper assistant">
                <el-icon :size="18"><Cpu /></el-icon>
              </div>
              <div class="message-bubble assistant">
                <span class="typing-indicator">
                  <span></span><span></span><span></span>
                </span>
              </div>
            </div>

            <!-- 流式输出时实时显示的内容 -->
            <div v-if="isStreaming && streamingContent" class="message-item assistant streaming">
              <div class="avatar-wrapper assistant">
                <el-icon :size="18"><Cpu /></el-icon>
              </div>
              <div class="message-bubble assistant streaming-bubble">
                <div class="message-content" v-html="renderContent(streamingContent)"></div>
                <span class="streaming-cursor"></span>
              </div>
            </div>
          </div>

          <div class="chat-input-area">
            <el-input
              v-model="userInput"
              type="textarea"
              :rows="2"
              placeholder="输入消息，按 Enter 发送，Shift+Enter 换行..."
              @keydown.enter.exact.prevent="sendMessage"
              :disabled="isStreaming || isTyping"
              resize="none"
            />
            <div class="input-actions">
              <el-button
                type="primary"
                :loading="isTyping || isStreaming"
                @click="sendMessage"
                :disabled="!userInput.trim()"
                class="send-btn"
              >
                <el-icon v-if="!isTyping && !isStreaming"><Promotion /></el-icon>
                <span v-else>发送中</span>
              </el-button>
              <el-button
                v-if="isStreaming"
                type="danger"
                @click="stopStreaming"
                class="stop-btn"
              >
                <el-icon><VideoPause /></el-icon>
                停止
              </el-button>
            </div>
          </div>
        </el-card>
      </el-col>
    </el-row>
  </div>
</template>

<script setup lang="ts">
import { ref, computed, nextTick, onMounted, watch } from 'vue'
import { useRoute } from 'vue-router'
import { User, Cpu, Promotion, Setting, Delete, InfoFilled, VideoPause } from '@element-plus/icons-vue'
import { listAgents, chatAgent, chatStreamAgent } from '@/api'
import type { Agent, AgentPageResponse, ChatMessage as ApiChatMessage } from '@/types'

const route = useRoute()

interface DisplayMessage {
  id: string
  role: 'user' | 'assistant' | 'system'
  content: string
  time: string
  tokens?: string
  modelUsed?: string
}

const agentOptions = ref<Agent[]>([])
const selectedAgent = ref('')
const chatMode = ref<'stream' | 'sync'>('stream')
const overrideTemperature = ref(0.7)
const overrideMaxTokens = ref(2048)
const userInput = ref('')
const messages = ref<DisplayMessage[]>([
  {
    id: 'welcome',
    role: 'system',
    content: '欢迎使用 Agent 对话。请选择一个 Agent 并开始对话。',
    time: new Date().toLocaleTimeString(),
  },
])
const isTyping = ref(false)
const isStreaming = ref(false)
const streamingContent = ref('')
let abortController: AbortController | null = null
const chatContainerRef = ref<HTMLElement>()

const currentAgent = computed(() =>
  agentOptions.value.find((a) => a.id === selectedAgent.value)
)

const visibleMessages = computed(() =>
  messages.value.filter((m) => m.role !== 'system' || m.content.startsWith('已切换'))
)

const generateId = () => `msg-${Date.now().toString(36)}-${Math.random().toString(36).slice(2, 6)}`

/** 构造发送给后端的 messages 数组（包含对话历史） */
const buildApiMessages = (): ApiChatMessage[] => {
  const result: ApiChatMessage[] = []
  // 只取 user 和 assistant 的历史消息
  for (const msg of messages.value) {
    if (msg.role === 'user' || msg.role === 'assistant') {
      result.push({ role: msg.role, content: msg.content })
    }
  }
  return result
}

const loadAgentOptions = async () => {
  try {
    const data = await listAgents() as AgentPageResponse
    agentOptions.value = Array.isArray(data?.records) ? data.records : []
    if (!selectedAgent.value && agentOptions.value.length > 0) {
      selectedAgent.value = agentOptions.value[0].id
      syncAgentConfig()
    }
    const qId = typeof route.query.agentId === 'string' ? route.query.agentId : ''
    if (qId && agentOptions.value.some((a) => a.id === qId)) {
      selectedAgent.value = qId
      syncAgentConfig()
    }
  } catch {
    agentOptions.value = []
    ElMessage.error('加载 Agent 列表失败，请先确认后端已启动且代理指向 8082')
  }
}

const syncAgentConfig = () => {
  const agent = currentAgent.value
  if (agent) {
    overrideTemperature.value = agent.temperature ?? 0.7
    overrideMaxTokens.value = agent.maxTokens ?? 2048
  }
}

const handleAgentChange = () => {
  syncAgentConfig()
  const name = currentAgent.value?.name ?? selectedAgent.value
  messages.value.push({
    id: generateId(),
    role: 'system',
    content: `已切换到 Agent: ${name}`,
    time: new Date().toLocaleTimeString(),
  })
}

watch(
  () => route.query.agentId,
  async (agentId) => {
    const id = typeof agentId === 'string' ? agentId : ''
    if (id && agentOptions.value.some((a) => a.id === id)) {
      selectedAgent.value = id
      syncAgentConfig()
    }
  }
)

const sendMessage = async () => {
  if (!userInput.value.trim() || isTyping.value || isStreaming.value) return

  if (!selectedAgent.value) {
    ElMessage.warning('请先选择或注册 Agent')
    return
  }

  const userMsg: DisplayMessage = {
    id: generateId(),
    role: 'user',
    content: userInput.value.trim(),
    time: new Date().toLocaleTimeString(),
  }
  messages.value.push(userMsg)
  userInput.value = ''
  scrollToBottom()

  const apiMessages = buildApiMessages()

  const requestPayload = {
    agentId: selectedAgent.value,
    messages: apiMessages,
    temperature: overrideTemperature.value,
    maxTokens: overrideMaxTokens.value,
  }

  if (chatMode.value === 'sync') {
    await sendSyncMessage(requestPayload)
  } else {
    await sendStreamMessage(requestPayload)
  }
}

/** 同步模式：调用 chatAgent */
const sendSyncMessage = async (payload: any) => {
  isTyping.value = true
  try {
    const data = await chatAgent(payload) as any
    messages.value.push({
      id: generateId(),
      role: 'assistant',
      content: data?.content || '(空响应)',
      time: new Date().toLocaleTimeString(),
      tokens: data?.completionTokens ? `${data.promptTokens}/${data.completionTokens}` : undefined,
      modelUsed: data?.remoteModelUsed || undefined,
    })
  } catch {
    messages.value.push({
      id: generateId(),
      role: 'assistant',
      content: '(请求失败，请检查后端服务)',
      time: new Date().toLocaleTimeString(),
    })
  } finally {
    isTyping.value = false
    scrollToBottom()
  }
}

/** 流式模式：调用 chatStreamAgent，逐步渲染 SSE 内容 */
const sendStreamMessage = async (payload: any) => {
  isStreaming.value = true
  streamingContent.value = ''
  abortController = new AbortController()

  try {
    const response = await chatStreamAgent(payload)
    if (!response.ok) {
      throw new Error(`HTTP ${response.status}`)
    }

    const reader = response.body?.getReader()
    if (!reader) {
      throw new Error('无法获取响应流')
    }

    const decoder = new TextDecoder()
    let buffer = ''

    while (true) {
      const { done, value } = await reader.read()
      if (done) break

      buffer += decoder.decode(value, { stream: true })
      const lines = buffer.split('\n')
      buffer = lines.pop() || ''

      for (const line of lines) {
        if (line.startsWith('data:')) {
          const dataStr = line.slice(5).trim()
          if (dataStr === '[DONE]') continue
          try {
            const parsed = JSON.parse(dataStr)
            // OpenAI 兼容 SSE 格式
            const delta = parsed.choices?.[0]?.delta?.content
            if (delta) {
              streamingContent.value += delta
              scrollToBottom()
            }
          } catch {
            // 非 JSON 格式的纯文本 SSE 行
            if (dataStr && dataStr !== '[DONE]') {
              streamingContent.value += dataStr
              scrollToBottom()
            }
          }
        } else if (line.trim()) {
          // 非 SSE 格式，作为纯文本追加
          streamingContent.value += line
          scrollToBottom()
        }
      }
    }
  } catch (e: any) {
    if (e.name !== 'AbortError') {
      streamingContent.value += `\n[错误: ${e.message}]`
    }
  } finally {
    // 将流式内容固定为最终消息
    if (streamingContent.value) {
      messages.value.push({
        id: generateId(),
        role: 'assistant',
        content: streamingContent.value,
        time: new Date().toLocaleTimeString(),
      })
    }
    streamingContent.value = ''
    isStreaming.value = false
    abortController = null
    scrollToBottom()
  }
}

const stopStreaming = () => {
  if (abortController) {
    abortController.abort()
  }
}

const clearConversation = () => {
  messages.value = [
    {
      id: 'welcome',
      role: 'system',
      content: `对话已清空。当前 Agent: ${currentAgent.value?.name || '未选择'}`,
      time: new Date().toLocaleTimeString(),
    },
  ]
}

const scrollToBottom = async () => {
  await nextTick()
  if (chatContainerRef.value) {
    chatContainerRef.value.scrollTop = chatContainerRef.value.scrollHeight
  }
}

/** 简单 Markdown 渲染：换行、粗体、代码块 */
const renderContent = (content: string): string => {
  if (!content) return ''
  let html = content
    // 代码块
    .replace(/```(\w*)\n([\s\S]*?)```/g, '<pre class="code-block"><code>$2</code></pre>')
    // 行内代码
    .replace(/`([^`]+)`/g, '<code class="inline-code">$1</code>')
    // 粗体
    .replace(/\*\*([^*]+)\*\*/g, '<strong>$1</strong>')
    // 换行
    .replace(/\n/g, '<br/>')
  return html
}

onMounted(async () => {
  await loadAgentOptions()
})
</script>

<style scoped lang="scss">
.agent-chat {
  .config-panel {
    position: sticky;
    top: 20px;

    .section-title-row {
      display: flex;
      align-items: center;
      gap: 8px;
    }

    .agent-info-card {
      margin-top: 8px;
      background: rgba(102, 126, 234, 0.06);
      border-radius: 10px;
      padding: 12px 14px;

      .agent-info-header {
        display: flex;
        align-items: center;
        gap: 6px;
        margin-bottom: 8px;
      }

      .agent-info-body {
        .info-row {
          display: flex;
          align-items: center;
          justify-content: space-between;
          margin-bottom: 4px;

          .info-label {
            font-size: 12px;
            color: var(--text-secondary, #909399);
          }

          .info-value {
            font-size: 12px;
            color: var(--text-primary, #303133);
          }
        }
      }
    }
  }

  .chat-panel {
    display: flex;
    flex-direction: column;
    min-height: 600px;
    border-radius: 12px;

    :deep(.el-card__body) {
      display: flex;
      flex-direction: column;
      flex: 1;
      padding: 0;
    }
  }

  .chat-messages {
    flex: 1;
    overflow-y: auto;
    padding: 20px 16px;
    min-height: 420px;
    max-height: 520px;
    background: var(--bg-color, #f5f7fa);
    border-radius: 8px;
    margin: 16px;

    .message-item {
      display: flex;
      gap: 12px;
      margin-bottom: 16px;
      animation: fadeIn 0.3s ease;

      &.user {
        flex-direction: row-reverse;
      }

      .avatar-wrapper {
        width: 36px;
        height: 36px;
        border-radius: 50%;
        display: flex;
        align-items: center;
        justify-content: center;
        flex-shrink: 0;

        &.user {
          background: linear-gradient(135deg, #667eea, #764ba2);
          color: #fff;
        }

        &.assistant {
          background: linear-gradient(135deg, #e0e7ff, #c7d2fe);
          color: #667eea;
        }

        &.system {
          background: #f0f2f5;
          color: #909399;
        }
      }

      .message-bubble {
        max-width: 75%;
        padding: 10px 14px;
        border-radius: 12px;
        box-shadow: 0 2px 6px rgba(0, 0, 0, 0.06);

        &.user {
          background: linear-gradient(135deg, #667eea, #764ba2);
          color: #fff;
          border-bottom-right-radius: 4px;
        }

        &.assistant {
          background: #fff;
          color: var(--text-primary, #303133);
          border-bottom-left-radius: 4px;
        }

        &.system {
          background: transparent;
          box-shadow: none;
          color: var(--text-secondary, #909399);
          padding: 6px 12px;
          font-size: 13px;
        }

        &.streaming-bubble {
          border: 1px solid rgba(102, 126, 234, 0.2);
          background: rgba(255, 255, 255, 0.95);
        }

        .message-content {
          font-size: 14px;
          line-height: 1.7;
          word-break: break-word;

          :deep(.code-block) {
            background: #1e1e2e;
            color: #cdd6f4;
            padding: 12px;
            border-radius: 8px;
            overflow-x: auto;
            font-size: 13px;
            line-height: 1.5;
            margin: 8px 0;
          }

          :deep(.inline-code) {
            background: rgba(102, 126, 234, 0.1);
            padding: 2px 6px;
            border-radius: 4px;
            font-size: 13px;
          }
        }

        .message-meta {
          display: flex;
          gap: 6px;
          margin-top: 6px;
        }

        .message-time {
          font-size: 11px;
          opacity: 0.5;
          margin-top: 4px;
        }
      }
    }

    .typing-indicator {
      display: inline-flex;
      gap: 4px;
      padding: 4px 0;

      span {
        width: 8px;
        height: 8px;
        background: var(--text-muted, #909399);
        border-radius: 50%;
        animation: typing 1.4s infinite;

        &:nth-child(2) { animation-delay: 0.2s; }
        &:nth-child(3) { animation-delay: 0.4s; }
      }
    }

    .streaming-cursor {
      display: inline-block;
      width: 2px;
      height: 16px;
      background: #667eea;
      margin-left: 2px;
      animation: blink 0.8s step-end infinite;
      vertical-align: text-bottom;
    }
  }

  .chat-input-area {
    display: flex;
    gap: 12px;
    padding: 16px;
    border-top: 1px solid var(--border-color, #e4e7ed);
    align-items: flex-end;

    .input-actions {
      display: flex;
      flex-direction: column;
      gap: 6px;
    }

    .send-btn {
      min-width: 80px;
      border-radius: 8px;
    }

    .stop-btn {
      border-radius: 8px;
    }
  }
}

@keyframes fadeIn {
  from { opacity: 0; transform: translateY(8px); }
  to { opacity: 1; transform: translateY(0); }
}

@keyframes typing {
  0%, 60%, 100% { transform: translateY(0); opacity: 0.4; }
  30% { transform: translateY(-6px); opacity: 1; }
}

@keyframes blink {
  0%, 100% { opacity: 1; }
  50% { opacity: 0; }
}
</style>