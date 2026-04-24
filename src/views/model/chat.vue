<template>
  <div class="model-chat page-container">
    <div class="page-header">
      <div>
        <h2 class="page-title">模型对话测试</h2>
        <p class="page-subtitle">直接与大模型进行对话测试</p>
      </div>
    </div>

    <el-row :gutter="20">
      <!-- 配置面板 -->
      <el-col :span="6">
        <el-card class="config-panel">
          <template #header>
            <span class="section-title">模型参数配置</span>
          </template>
          <el-form label-position="top">
            <el-form-item label="提供商">
              <el-select v-model="chatConfig.provider" style="width: 100%">
                <el-option label="OpenAI" value="openai" />
                <el-option label="Anthropic" value="anthropic" />
                <el-option label="通义千问" value="tongyi" />
              </el-select>
            </el-form-item>
            <el-form-item label="模型">
              <el-select v-model="chatConfig.model" style="width: 100%">
                <el-option label="GPT-4" value="gpt-4" />
                <el-option label="GPT-3.5-Turbo" value="gpt-3.5-turbo" />
              </el-select>
            </el-form-item>
            <el-form-item label="Temperature">
              <el-slider v-model="chatConfig.temperature" :min="0" :max="2" :step="0.1" :marks="{ 0: '精确', 1: '平衡', 2: '创意' }" />
            </el-form-item>
            <el-form-item label="Max Tokens">
              <el-input-number v-model="chatConfig.maxTokens" :min="100" :max="8000" :step="100" style="width: 100%" />
            </el-form-item>
            <el-divider />
            <el-form-item label="Token 统计">
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
          </el-form>
        </el-card>
      </el-col>

      <!-- 对话面板 -->
      <el-col :span="18">
        <el-card class="chat-card">
          <div class="chat-messages" ref="chatContainerRef">
            <div v-for="msg in messages" :key="msg.id" class="message-item" :class="msg.role">
              <el-avatar :size="36">
                <el-icon v-if="msg.role === 'user'"><User /></el-icon>
                <el-icon v-else><ChatDotRound /></el-icon>
              </el-avatar>
              <div class="message-content">
                <div class="message-text" v-html="msg.content"></div>
                <div class="message-time">{{ msg.time }}</div>
              </div>
            </div>
            <div v-if="isTyping" class="message-item assistant">
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
              @keydown.ctrl.enter="sendMessage"
            />
            <div class="input-actions">
              <span class="shortcut-hint">Ctrl + Enter 发送</span>
              <el-button type="primary" @click="sendMessage" :loading="isTyping" class="send-btn">
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
import { ref, reactive, nextTick } from 'vue'
import { User, ChatDotRound, Promotion } from '@element-plus/icons-vue'

interface ChatMessage {
  id: string
  role: 'user' | 'assistant'
  content: string
  time: string
}

const chatConfig = reactive({
  provider: 'openai',
  model: 'gpt-4',
  temperature: 0.7,
  maxTokens: 2000,
})

const userInput = ref('')
const messages = ref<ChatMessage[]>([])
const isTyping = ref(false)
const promptTokens = ref(0)
const completionTokens = ref(0)
const chatContainerRef = ref<HTMLElement>()

const sendMessage = async () => {
  if (!userInput.value.trim() || isTyping.value) return

  const content = userInput.value
  userInput.value = ''

  messages.value.push({
    id: Date.now().toString(),
    role: 'user',
    content: `<p>${content}</p>`,
    time: new Date().toLocaleTimeString(),
  })

  isTyping.value = true
  await scrollToBottom()

  // Simulate response
  setTimeout(async () => {
    isTyping.value = false
    const response = `这是来自 ${chatConfig.provider} 的模拟响应。\n\n您的问题"${content.substring(0, 50)}..."已收到。在实际部署中，这里将显示真实的模型返回结果。\n\n当前配置：\n- Temperature: ${chatConfig.temperature}\n- Max Tokens: ${chatConfig.maxTokens}`

    messages.value.push({
      id: Date.now().toString(),
      role: 'assistant',
      content: response.split('\n').map(l => l.trim() ? `<p>${l}</p>` : '').join(''),
      time: new Date().toLocaleTimeString(),
    })

    promptTokens.value += Math.floor(Math.random() * 50 + 10)
    completionTokens.value += Math.floor(Math.random() * 100 + 50)

    await scrollToBottom()
  }, 1500)
}

const scrollToBottom = async () => {
  await nextTick()
  if (chatContainerRef.value) {
    chatContainerRef.value.scrollTop = chatContainerRef.value.scrollHeight
  }
}
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

        &:nth-child(2) { animation-delay: 0.2s; }
        &:nth-child(3) { animation-delay: 0.4s; }
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
  0%, 60%, 100% { transform: translateY(0); }
  30% { transform: translateY(-6px); }
}
</style>
