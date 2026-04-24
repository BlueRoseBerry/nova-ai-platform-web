<template>
  <div class="agent-test page-container">
    <div class="page-header">
      <div>
        <h2 class="page-title">Agent 对话测试</h2>
        <p class="page-subtitle">测试 Agent 的对话和执行能力</p>
      </div>
    </div>

    <el-row :gutter="24">
      <!-- 左侧配置面板 -->
      <el-col :xs="24" :lg="6">
        <el-card class="config-panel">
          <template #header>
            <span class="section-title">Agent 配置</span>
          </template>
          <el-form label-position="top">
            <el-form-item label="选择 Agent">
              <el-select v-model="selectedAgent" style="width: 100%" @change="handleAgentChange">
                <el-option
                  v-for="agent in agentList"
                  :key="agent.id"
                  :label="agent.name"
                  :value="agent.id"
                />
              </el-select>
            </el-form-item>
            <el-form-item label="会话 ID">
              <el-input v-model="sessionId" placeholder="自动生成或手动输入" />
              <template #append>
                <el-button @click="sessionId = generateId()">生成</el-button>
              </template>
            </el-form-item>
            <el-form-item label="知识库">
              <el-select v-model="knowledgeBaseId" placeholder="可选" style="width: 100%" clearable>
                <el-option label="金融知识库" value="kb-001" />
                <el-option label="政务知识库" value="kb-002" />
                <el-option label="产品知识库" value="kb-003" />
              </el-select>
            </el-form-item>
            <el-form-item label="启用工具">
              <el-select v-model="selectedTools" multiple placeholder="选择工具" style="width: 100%">
                <el-option label="数据查询" value="tool-001" />
                <el-option label="计算工具" value="tool-002" />
                <el-option label="通知推送" value="tool-003" />
                <el-option label="API调用" value="tool-004" />
              </el-select>
            </el-form-item>
          </el-form>
        </el-card>
      </el-col>

      <!-- 右侧对话面板 -->
      <el-col :xs="24" :lg="18">
        <el-card class="chat-panel">
          <div class="chat-messages" ref="chatContainerRef">
            <div
              v-for="msg in messages"
              :key="msg.id"
              class="message-item"
              :class="msg.role"
            >
              <el-avatar :size="36" :class="msg.role">
                <el-icon v-if="msg.role === 'user'"><User /></el-icon>
                <el-icon v-else><Cpu /></el-icon>
              </el-avatar>
              <div class="message-bubble">
                <div class="message-content">{{ msg.content }}</div>
                <div class="message-time">{{ msg.time }}</div>
              </div>
            </div>
            <div v-if="isTyping" class="message-item assistant typing">
              <el-avatar :size="36"><el-icon><Cpu /></el-icon></el-avatar>
              <div class="message-bubble">
                <span class="typing-indicator">
                  <span></span><span></span><span></span>
                </span>
              </div>
            </div>
          </div>

          <div class="chat-input">
            <el-input
              v-model="userInput"
              type="textarea"
              :rows="2"
              placeholder="输入消息，按 Enter 发送..."
              @keydown.enter.prevent="sendMessage"
            />
            <el-button type="primary" :loading="isTyping" @click="sendMessage" class="send-btn">
              <el-icon><Promotion /></el-icon>
            </el-button>
          </div>
        </el-card>
      </el-col>
    </el-row>
  </div>
</template>

<script setup lang="ts">
import { ref, nextTick, onMounted } from 'vue'
import { User, Cpu, Promotion } from '@element-plus/icons-vue'

interface Message {
  id: string
  role: 'user' | 'assistant' | 'system'
  content: string
  time: string
}

const selectedAgent = ref('agent-001')
const sessionId = ref('')
const knowledgeBaseId = ref('')
const selectedTools = ref<string[]>([])
const userInput = ref('')
const messages = ref<Message[]>([
  {
    id: '1',
    role: 'system',
    content: '欢迎使用 Agent 对话测试。请选择一个 Agent 并开始对话。',
    time: new Date().toLocaleTimeString(),
  },
])
const isTyping = ref(false)
const chatContainerRef = ref<HTMLElement>()

const agentList = [
  { id: 'agent-001', name: '智能客服 Agent' },
  { id: 'agent-002', name: '金融顾问 Agent' },
  { id: 'agent-003', name: '政务咨询 Agent' },
  { id: 'agent-004', name: '技术支持 Agent' },
]

const generateId = () => `session-${Date.now().toString(36)}`

const handleAgentChange = () => {
  messages.value.push({
    id: generateId(),
    role: 'system',
    content: `已切换到 Agent: ${agentList.find(a => a.id === selectedAgent.value)?.name}`,
    time: new Date().toLocaleTimeString(),
  })
}

const sendMessage = async () => {
  if (!userInput.value.trim() || isTyping.value) return

  const userMsg: Message = {
    id: generateId(),
    role: 'user',
    content: userInput.value,
    time: new Date().toLocaleTimeString(),
  }
  messages.value.push(userMsg)
  const input = userInput.value
  userInput.value = ''

  scrollToBottom()

  isTyping.value = true
  try {
    // Simulate agent response
    await new Promise((resolve) => setTimeout(resolve, 1000 + Math.random() * 2000))

    const responses = [
      `收到您的问题。基于当前配置和知识库，我来为您分析解答：\n\n关于"${input.substring(0, 30)}..."的问题，根据系统检索到的相关信息，我建议您可以尝试以下步骤：\n\n1. 首先确认需求的具体范围\n2. 查找相关的解决方案\n3. 执行相应的处理流程\n\n如需进一步了解，请随时告诉我。`,
      `感谢您的提问！根据我的理解，这个问题涉及以下几个方面：\n\n• 首先，需要明确问题的核心要素\n• 其次，分析可能的解决方案\n• 最后，给出最优建议\n\n希望这些信息对您有帮助！`,
      `这是一个很好的问题！让我为您详细解答：\n\n根据当前 Agent 的配置和知识库内容，我为您提供以下信息和建议。如果您需要更详细的说明，请随时追问。`,
    ]

    messages.value.push({
      id: generateId(),
      role: 'assistant',
      content: responses[Math.floor(Math.random() * responses.length)],
      time: new Date().toLocaleTimeString(),
    })
  } finally {
    isTyping.value = false
    scrollToBottom()
  }
}

const scrollToBottom = async () => {
  await nextTick()
  if (chatContainerRef.value) {
    chatContainerRef.value.scrollTop = chatContainerRef.value.scrollHeight
  }
}

onMounted(() => {
  sessionId.value = generateId()
})
</script>

<style scoped lang="scss">
.agent-test {
  .config-panel {
    position: sticky;
    top: 20px;
  }

  .chat-panel {
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
    min-height: 450px;
    max-height: 500px;

    .message-item {
      display: flex;
      gap: 12px;
      margin-bottom: 20px;

      &.user {
        flex-direction: row-reverse;

        .message-bubble {
          background: linear-gradient(135deg, #667eea, #764ba2);
          color: #fff;
        }
      }

      &.assistant {
        .message-bubble {
          background: var(--bg-color);
        }
      }

      &.system {
        .message-bubble {
          background: transparent;
          box-shadow: none;
          color: var(--text-muted);
        }
      }

      .message-bubble {
        max-width: 70%;
        padding: 12px 16px;
        border-radius: 12px;
        box-shadow: 0 2px 4px rgba(0, 0, 0, 0.05);

        .message-content {
          font-size: 14px;
          line-height: 1.6;
          white-space: pre-wrap;
        }

        .message-time {
          font-size: 11px;
          opacity: 0.6;
          margin-top: 4px;
        }
      }
    }

    .typing-indicator {
      display: flex;
      gap: 4px;
      padding: 4px 0;

      span {
        width: 8px;
        height: 8px;
        background: var(--text-muted);
        border-radius: 50%;
        animation: typing 1.4s infinite;

        &:nth-child(2) { animation-delay: 0.2s; }
        &:nth-child(3) { animation-delay: 0.4s; }
      }
    }
  }

  .chat-input {
    display: flex;
    gap: 12px;
    padding-top: 16px;
    border-top: 1px solid var(--border-color);

    .send-btn {
      align-self: flex-end;
      border-radius: 8px;
    }
  }
}

@keyframes typing {
  0%, 60%, 100% { transform: translateY(0); opacity: 0.4; }
  30% { transform: translateY(-6px); opacity: 1; }
}
</style>
