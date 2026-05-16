import { request } from '@/utils/request'
import type {
  Agent,
  AgentRequest,
  AgentResponse,
  WorkflowDefinition,
  WorkflowInstance,
  KnowledgeDocument,
  RetrievedChunk,
  Skill,
  SkillContext,
  SkillResult,
} from '@/types'

export {
  createLlmModel,
  getLlmModel,
  updateLlmModel,
  deleteLlmModel,
  pageLlmModels,
  chatCompletions,
} from '@/api/modelRegistry'

// ==================== Agent 相关 API ====================
/** 对齐 nova-ai-agent AgentController：`/api/v1/agents/**`（默认服务端口 8082，见 vite 代理配置） */
export const executeAgent = (data: AgentRequest) => {
  return request.post<AgentResponse>('/api/v1/agents/execute', data)
}

export const getAgent = (agentId: string) => {
  return request.get<Agent>(`/api/v1/agents/${encodeURIComponent(agentId)}`)
}

export const listAgents = () => {
  return request.get<Agent[]>('/api/v1/agents/lists')
}

export const registerAgent = (data: Agent) => {
  return request.post<void>('/api/v1/agents/register', data)
}

export const updateAgent = (data: Agent) => {
  return request.post<Agent>('/api/v1/agents/update', data)
}

/** 请求体使用完整 Agent，后端仅读取 id 字段 */
export const deleteRegisteredAgent = (data: Agent) => {
  return request.post<boolean>('/api/v1/agents/delete', data)
}

// ==================== Workflow 相关 API ====================
export const createWorkflowDefinition = (data: WorkflowDefinition) => {
  return request.post<WorkflowDefinition>('/api/v1/workflow/definition/create', data)
}

export const executeWorkflow = (workflowId: string, context: Record<string, any>) => {
  return request.post<WorkflowInstance>(`/api/v1/workflow/${workflowId}/execute`, { context })
}

export const getWorkflowDefinition = (workflowId: string) => {
  return request.get<WorkflowDefinition>(`/api/v1/workflow/definition/${workflowId}`)
}

export const listWorkflowDefinitions = () => {
  return request.get<WorkflowDefinition[]>('/api/v1/workflow/definitions')
}

export const getWorkflowInstance = (instanceId: string) => {
  return request.get<WorkflowInstance>(`/api/v1/workflow/instance/${instanceId}`)
}

// ==================== RAG 相关 API ====================
export const ingestDocument = (documentId: string, content: string, knowledgeBaseId: string) => {
  return request.post<void>('/api/v1/rag/ingest', { documentId, content, knowledgeBaseId })
}

export const retrieveKnowledge = (query: string, knowledgeBaseId: string, topK: number = 5) => {
  return request.post<RetrievedChunk[]>('/api/v1/rag/retrieve', { query, knowledgeBaseId, topK })
}

export const augmentPrompt = (userQuery: string, knowledgeBaseId: string) => {
  return request.post<string>('/api/v1/rag/augment', { userQuery, knowledgeBaseId })
}

export const listKnowledgeDocuments = (knowledgeBaseId: string) => {
  return request.get<KnowledgeDocument[]>(`/api/v1/rag/documents/${knowledgeBaseId}`)
}

export const deleteKnowledgeDocument = (documentId: string) => {
  return request.post<void>(`/api/v1/rag/document/delete/${documentId}`)
}

// ==================== Skill 相关 API ====================
export const executeSkill = (skillId: string, context: SkillContext) => {
  return request.post<SkillResult>(`/api/v1/skill/${skillId}/execute`, context)
}

export const registerSkill = (data: Skill) => {
  return request.post<Skill>('/api/v1/skill/register', data)
}

export const getSkill = (skillId: string) => {
  return request.get<Skill>(`/api/v1/skill/${skillId}`)
}

export const listSkills = (type?: string) => {
  const params = type ? { type } : {}
  return request.get<Skill[]>('/api/v1/skills', params)
}
