import { request } from '@/utils/request'
import type {
  LlmModelResponse,
  ModelCreatePayload,
  ModelUpdatePayload,
  LlmModelPageParams,
  PageResponse,
  OpenAiCompletionRequest,
  OpenAiCompletionResponse,
} from '@/types'
import { API_PATHS } from '@/utils/constants'

export const createLlmModel = (data: ModelCreatePayload) => {
  return request.post<LlmModelResponse>(API_PATHS.MODEL_REGISTRY.CREATE, data)
}

export const getLlmModel = (id: string) => {
  return request.get<LlmModelResponse>(API_PATHS.MODEL_REGISTRY.GET(id))
}

export const updateLlmModel = (data: ModelUpdatePayload) => {
  return request.post<LlmModelResponse>(API_PATHS.MODEL_REGISTRY.UPDATE, data)
}

export const deleteLlmModel = (id: string) => {
  return request.post<void>(API_PATHS.MODEL_REGISTRY.DELETE(id))
}

export const pageLlmModels = (params: LlmModelPageParams) => {
  return request.get<PageResponse<LlmModelResponse>>(API_PATHS.MODEL_REGISTRY.PAGE, params)
}

export const chatCompletions = (data: OpenAiCompletionRequest) => {
  return request.post<OpenAiCompletionResponse>(API_PATHS.MODEL_CHAT.COMPLETIONS, data)
}

function modelChatStreamUrl(): string {
  const base = (import.meta.env.VITE_API_BASE_URL || '').replace(/\/$/, '')
  return `${base}${API_PATHS.MODEL_CHAT.COMPLETIONS_STREAM}`
}

export type ChatCompletionsStreamCallbacks = {
  /** 响应头已就绪、正文开始读出前调用（可做「连接成功」占位，再插入助手消息气泡）。 */
  onStreamOpen?: () => void
  /** 网关透传的每条上游 `data:` 内容（不含 `data:` 前缀），通常为 OpenAI chunk JSON，或 `[DONE]` */
  onUpstreamData: (rawPayload: string) => void
  /** SSE `event:error` 的合并 data 载荷（常为 JSON：`{"message":"..."}`） */
  onServerError?: (rawPayload: string) => void
}

/**
 * POST `text/event-stream`：SSE 增量对话；不可用 axios 封装（需 ReadableStream）。
 */
export async function chatCompletionsStream(
  payload: OpenAiCompletionRequest,
  callbacks: ChatCompletionsStreamCallbacks,
  signal?: AbortSignal,
): Promise<void> {
  const userId = localStorage.getItem('userId') || 'default-user'
  const url = modelChatStreamUrl()
  const res = await fetch(url, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      Accept: 'text/event-stream',
      'X-User-Id': userId,
    },
    body: JSON.stringify(payload),
    signal,
  })
  if (!res.ok || !res.body) {
    const text = await res.text().catch(() => '')
    let msg = text || `${res.status} ${res.statusText}`
    try {
      const j = JSON.parse(text) as { message?: string }
      if (j?.message) msg = j.message
    } catch {
      /* 非 JSON 错误体 */
    }
    throw new Error(msg)
  }

  callbacks.onStreamOpen?.()

  let backlog = ''
  const decoder = new TextDecoder()
  const reader = res.body.getReader()

  const dispatchBlock = (rawBlock: string) => {
    const trimmed = rawBlock.trim()
    if (!trimmed) {
      return
    }
    let eventKind: string | null = null
    const datas: string[] = []
    for (const inner of trimmed.split('\n')) {
      const lineNoCr = inner.replace(/\r$/, '')
      const lineTrim = lineNoCr.trimStart()
      if (!lineTrim) {
        continue
      }
      if (lineTrim.startsWith('event:')) {
        eventKind = lineTrim.slice(6).trim()
      } else if (lineTrim.startsWith('data:')) {
        const payload = lineNoCr.slice(lineNoCr.indexOf('data:') + 5)
        datas.push(payload.startsWith(' ') ? payload.slice(1) : payload)
      } else if (lineTrim.startsWith('{') || lineTrim.startsWith('[')) {
        datas.push(lineTrim)
      }
    }
    const combined = datas.join('\n')
    if (combined === '') {
      return
    }
    if (eventKind === 'error') {
      callbacks.onServerError?.(combined)
    } else {
      callbacks.onUpstreamData(combined)
    }
  }

  const drainBacklog = () => {
    backlog = backlog.replace(/\r\n/g, '\n')
    while (true) {
      const sep = backlog.indexOf('\n\n')
      if (sep < 0) {
        break
      }
      const rawBlock = backlog.slice(0, sep)
      backlog = backlog.slice(sep + 2)
      dispatchBlock(rawBlock)
    }
  }

  try {
    while (true) {
      const { value, done } = await reader.read()
      if (value) {
        backlog += decoder.decode(value, { stream: true })
      }
      drainBacklog()
      if (done) {
        break
      }
    }
    backlog += decoder.decode()
    drainBacklog()
    if (backlog.trim()) {
      dispatchBlock(backlog)
      backlog = ''
    }
  } finally {
    reader.releaseLock()
  }
}
