/**
 * 将后端返回的 AgentResponse（Jackson 通常为扁平字段，不一定含 type）格式化为可读文本。
 */
export function formatAgentExecuteResult(raw: unknown): string {
  if (raw == null) {
    return ''
  }
  if (typeof raw === 'string') {
    return raw
  }
  if (typeof raw !== 'object') {
    return String(raw)
  }
  const r = raw as Record<string, unknown>

  // TextResponse：content + responseId
  if (typeof r.content === 'string') {
    return r.content
  }

  // ErrorResponse：code + message
  if (typeof r.message === 'string' && r.code != null) {
    return `[错误] ${r.message}`
  }

  // ToolCallResponse
  if (Array.isArray(r.toolCalls) && r.toolCalls.length > 0) {
    return `[工具调用]\n${JSON.stringify(r.toolCalls, null, 2)}`
  }

  // StreamResponse
  if (typeof r.streamId === 'string') {
    return `[流式] streamId: ${r.streamId}`
  }

  return JSON.stringify(raw, null, 2)
}
