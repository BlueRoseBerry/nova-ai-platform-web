// 基础响应类型
export interface BaseResponse<T = any> {
  code: number
  message: string
  data: T
  timestamp: number
}

// 分页请求参数
export interface PageRequest {
  pageNum: number
  pageSize: number
}

// 分页响应数据
export interface PageResponse<T> {
  total: number
  pages: number
  current: number
  size: number
  records: T[]
}

// 数字人创建请求
export interface DigitalHumanCreateRequest {
  name: string
  avatarUrl?: string
  voiceModel?: string
  personality?: string
  skills?: string[]
  agentId?: string
  workflowId?: string
}

// 数字人更新请求
export interface DigitalHumanUpdateRequest {
  id: number
  name?: string
  avatarUrl?: string
  voiceModel?: string
  personality?: string
  skills?: string[]
  agentId?: string
  workflowId?: string
}

// 数字人响应
export interface DigitalHumanResponse {
  id: number
  userId: string
  name: string
  avatarUrl: string
  voiceModel: string
  personality: string
  skills: string[]
  agentId: string
  workflowId: string
  publishStatus: 'draft' | 'published'
  createdAt: string
  updatedAt: string
}

// Agent 定义
export interface Agent {
  id: string
  name: string
  role: string
  systemPrompt: string
  skillIds: string[]
  config: Record<string, any>
  modelId: string
  temperature: number
  maxTokens: number
}

// Agent 请求
export interface AgentRequest {
  agentId: string
  sessionId: string
  query: string
  knowledgeBaseId?: string
  toolNames?: string[]
}

// Agent 响应（密封联合类型）
export type AgentResponse = TextResponse | ToolCallResponse | StreamResponse | ErrorResponse

export interface TextResponse {
  type: 'text'
  responseId: string
  content: string
}

export interface ToolCallResponse {
  type: 'toolCall'
  responseId: string
  toolCalls: ToolCall[]
}

export interface StreamResponse {
  type: 'stream'
  responseId: string
  streamId: string
}

export interface ErrorResponse {
  type: 'error'
  responseId: string
  code: number
  message: string
}

export interface ToolCall {
  toolId: string
  toolName: string
  parameters: string
}

// 工作流定义
export interface WorkflowDefinition {
  workflowId: string
  name: string
  description: string
  nodes: NodeDefinition[]
  metadata: Record<string, any>
  createdAt: string
  updatedAt: string
}

// 节点定义
export interface NodeDefinition {
  id: string
  name: string
  type: NodeType
  config: Record<string, any>
  nextNodeIds: string[]
  branches: Record<string, string>
  timeoutMs: number
}

export type NodeType = 'LLM_CALL' | 'API_CALL' | 'CONDITION' | 'LOOP' | 'HUMAN_REVIEW' | 'SKILL_EXECUTION' | 'PARALLEL'

// 工作流实例
export interface WorkflowInstance {
  instanceId: string
  workflowId: string
  status: WorkflowStatus
  currentNodeId: string
  context: Record<string, any>
  startedAt: string
  completedAt: string
}

export type WorkflowStatus = 'PENDING' | 'RUNNING' | 'COMPLETED' | 'FAILED' | 'PAUSED' | 'WAITING_HUMAN_REVIEW'

// 模型请求
export interface ChatRequest {
  model: string
  prompt: string
  temperature: number
  maxTokens: number
  extraParams?: Record<string, any>
}

// 模型响应
export interface ChatResponse {
  content: string
  promptTokens: number
  completionTokens: number
  model: string
}

// 模型提供商
export interface ModelProvider {
  provider: string
  name: string
  status: 'active' | 'inactive'
  endpoint: string
}

// 知识库文档
export interface KnowledgeDocument {
  documentId: string
  knowledgeBaseId: string
  content: string
  status: 'pending' | 'processing' | 'completed' | 'failed'
  chunkCount: number
  createdAt: string
}

// 检索结果
export interface RetrievedChunk {
  chunkId: string
  content: string
  score: number
  metadata: Record<string, any>
}

// 技能定义
export interface Skill {
  id: string
  name: string
  type: SkillType
  status: 'active' | 'inactive'
}

export type SkillType = 'DATA_QUERY' | 'CALCULATION' | 'NOTIFICATION' | 'EXTERNAL_API'

// 技能上下文
export interface SkillContext {
  sessionId: string
  userId: string
  params: Record<string, any>
}

// 技能结果
export type SkillResult = SuccessResult | ErrorResult

export interface SuccessResult {
  type: 'success'
  data: string
}

export interface ErrorResult {
  type: 'error'
  errorMessage: string
}

// 仪表盘统计数据
export interface DashboardStats {
  totalDigitalHumans: number
  activeAgents: number
  workflowExecutions: number
  modelCalls: number
  digitalHumanGrowth: number[]
  modelCallTrend: number[]
  topModels: { name: string; count: number }[]
  systemHealth: {
    cpu: number
    memory: number
    disk: number
    requests: number
  }
}

// 监控指标
export interface MonitorMetrics {
  timestamp: number
  cpu: number
  memory: number
  disk: number
  networkIn: number
  networkOut: number
  requestsPerSecond: number
  avgLatency: number
  errorRate: number
}

// 服务健康状态
export interface ServiceHealth {
  service: string
  status: 'healthy' | 'degraded' | 'unhealthy'
  latency: number
  uptime: string
  version: string
}

// 用户信息
export interface UserInfo {
  userId: string
  username: string
  role: string
  avatar?: string
}
