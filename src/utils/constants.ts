// 常量配置
export const APP_TITLE = 'Nova AI Platform'
export const APP_LOGO = '/logo.png'

// 路由常量
export const DEFAULT_ROUTE = '/dashboard'
export const LOGIN_ROUTE = '/login'

// 存储键名
export const STORAGE_KEYS = {
  TOKEN: 'nova_ai_token',
  USER_ID: 'userId',
  USER_INFO: 'userInfo',
  THEME: 'nova_ai_theme',
  SIDEBAR_STATUS: 'nova_ai_sidebar',
} as const

// API 路径
export const API_PATHS = {
  DIGITAL_HUMAN: {
    CREATE: '/api/v1/digital-human/create',
    GET: (id: number) => `/api/v1/digital-human/get/${id}`,
    UPDATE: '/api/v1/digital-human/update',
    DELETE: (id: number) => `/api/v1/digital-human/delete/${id}`,
    PAGE: '/api/v1/digital-human/page',
    PUBLISH: (id: number) => `/api/v1/digital-human/publish/${id}`,
  },
} as const

// 状态映射
export const PUBLISH_STATUS_MAP = {
  draft: { label: '草稿', type: 'info' as const },
  published: { label: '已发布', type: 'success' as const },
} as const

export const WORKFLOW_STATUS_MAP = {
  PENDING: { label: '待执行', type: 'info' as const },
  RUNNING: { label: '运行中', type: 'warning' as const },
  COMPLETED: { label: '已完成', type: 'success' as const },
  FAILED: { label: '失败', type: 'danger' as const },
  PAUSED: { label: '已暂停', type: 'info' as const },
  WAITING_HUMAN_REVIEW: { label: '等待审核', type: 'warning' as const },
} as const

export const SKILL_TYPE_MAP = {
  DATA_QUERY: { label: '数据查询', icon: 'Search' },
  CALCULATION: { label: '计算', icon: 'Calculator' },
  NOTIFICATION: { label: '通知', icon: 'Bell' },
  EXTERNAL_API: { label: '外部API', icon: 'Connection' },
} as const

export const NODE_TYPE_MAP = {
  LLM_CALL: { label: '大模型调用', icon: 'ChatDotRound' },
  API_CALL: { label: 'API调用', icon: 'Connection' },
  CONDITION: { label: '条件判断', icon: 'QuestionFilled' },
  LOOP: { label: '循环', icon: 'Refresh' },
  HUMAN_REVIEW: { label: '人工审核', icon: 'User' },
  SKILL_EXECUTION: { label: '技能执行', icon: 'Tools' },
  PARALLEL: { label: '并行执行', icon: 'Share' },
} as const

export const MODEL_PROVIDER_MAP = {
  openai: { label: 'OpenAI', icon: '🤖' },
  anthropic: { label: 'Anthropic', icon: '🧠' },
  tongyi: { label: '通义千问', icon: '💡' },
  local: { label: '本地模型', icon: '💻' },
} as const

// 默认分页配置
export const DEFAULT_PAGE_SIZE = 10
export const PAGE_SIZE_OPTIONS = ['10', '20', '50', '100']

// 默认用户 ID（开发环境）
export const DEFAULT_USER_ID = 'dev-user-001'
