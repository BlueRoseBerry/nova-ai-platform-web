import { createRouter, createWebHistory } from 'vue-router'
import type { RouteRecordRaw } from 'vue-router'
import { useUserStore } from '@/store/modules/user'
import NProgress from 'nprogress'
import 'nprogress/nprogress.css'
import { LOGIN_ROUTE, DEFAULT_ROUTE } from '@/utils/constants'

const routes: RouteRecordRaw[] = [
  {
    path: LOGIN_ROUTE,
    name: 'Login',
    component: () => import('@/views/login/index.vue'),
    meta: { title: '登录', hidden: true },
  },
  {
    path: '/',
    component: () => import('@/components/layout/index.vue'),
    redirect: DEFAULT_ROUTE,
    children: [
      {
        path: DEFAULT_ROUTE,
        name: 'Dashboard',
        component: () => import('@/views/dashboard/index.vue'),
        meta: { title: '首页', icon: 'HomeFilled', affix: true },
      },
      {
        path: '/digital-human',
        name: 'DigitalHuman',
        redirect: '/digital-human/list',
        meta: { title: '数字人管理', icon: 'Avatar' },
        children: [
          {
            path: 'list',
            name: 'DigitalHumanList',
            component: () => import('@/views/digital-human/list.vue'),
            meta: { title: '数字人列表', icon: 'List' },
          },
          {
            path: 'create',
            name: 'DigitalHumanCreate',
            component: () => import('@/views/digital-human/create.vue'),
            meta: { title: '创建数字人', icon: 'Plus' },
          },
          {
            path: 'detail/:id',
            name: 'DigitalHumanDetail',
            component: () => import('@/views/digital-human/detail.vue'),
            meta: { title: '数字人详情', icon: 'View', hidden: true },
          },
        ],
      },
      {
        path: '/agent',
        name: 'Agent',
        redirect: '/agent/list',
        meta: { title: 'Agent 管理', icon: 'Cpu' },
        children: [
          {
            path: 'list',
            name: 'AgentList',
            component: () => import('@/views/agent/list.vue'),
            meta: { title: 'Agent 列表', icon: 'Grid' },
          },
          {
            path: 'test',
            name: 'AgentTest',
            component: () => import('@/views/agent/test.vue'),
            meta: { title: 'Agent 测试', icon: 'Promotion' },
          },
        ],
      },
      {
        path: '/workflow',
        name: 'Workflow',
        redirect: '/workflow/list',
        meta: { title: '工作流管理', icon: 'Share' },
        children: [
          {
            path: 'list',
            name: 'WorkflowList',
            component: () => import('@/views/workflow/list.vue'),
            meta: { title: '工作流列表', icon: 'List' },
          },
          {
            path: 'design/:id?',
            name: 'WorkflowDesign',
            component: () => import('@/views/workflow/design.vue'),
            meta: { title: '工作流设计', icon: 'EditPen', hidden: true },
          },
        ],
      },
      {
        path: '/model',
        name: 'Model',
        redirect: '/model/providers',
        meta: { title: '模型管理', icon: 'Connection' },
        children: [
          {
            path: 'providers',
            name: 'ModelProviders',
            component: () => import('@/views/model/providers.vue'),
            meta: { title: '模型提供商', icon: 'Setting' },
          },
          {
            path: 'chat',
            name: 'ModelChat',
            component: () => import('@/views/model/chat.vue'),
            meta: { title: '模型对话', icon: 'ChatDotRound' },
          },
        ],
      },
      {
        path: '/knowledge',
        name: 'Knowledge',
        redirect: '/knowledge/list',
        meta: { title: '知识库管理', icon: 'Files' },
        children: [
          {
            path: 'list',
            name: 'KnowledgeList',
            component: () => import('@/views/knowledge/list.vue'),
            meta: { title: '知识库列表', icon: 'Folder' },
          },
          {
            path: 'documents/:kbId',
            name: 'KnowledgeDocuments',
            component: () => import('@/views/knowledge/documents.vue'),
            meta: { title: '文档管理', icon: 'Document', hidden: true },
          },
        ],
      },
      {
        path: '/skill',
        name: 'Skill',
        redirect: '/skill/list',
        meta: { title: '技能管理', icon: 'Tools' },
        children: [
          {
            path: 'list',
            name: 'SkillList',
            component: () => import('@/views/skill/list.vue'),
            meta: { title: '技能列表', icon: 'Grid' },
          },
        ],
      },
      {
        path: '/monitor',
        name: 'Monitor',
        redirect: '/monitor/dashboard',
        meta: { title: '系统监控', icon: 'Monitor' },
        children: [
          {
            path: 'dashboard',
            name: 'MonitorDashboard',
            component: () => import('@/views/monitor/dashboard.vue'),
            meta: { title: '监控面板', icon: 'DataAnalysis' },
          },
          {
            path: 'health',
            name: 'ServiceHealth',
            component: () => import('@/views/monitor/health.vue'),
            meta: { title: '服务健康', icon: 'SemiSelect' },
          },
        ],
      },
    ],
  },
]

const router = createRouter({
  history: createWebHistory(),
  routes,
})

NProgress.configure({ showSpinner: false })

router.beforeEach((to, _from, next) => {
  NProgress.start()
  document.title = (to.meta?.title as string) || 'Nova AI Platform'

  const userStore = useUserStore()
  if (to.path !== LOGIN_ROUTE && !userStore.isLoggedIn) {
    next({ path: LOGIN_ROUTE })
  } else {
    next()
  }
})

router.afterEach(() => {
  NProgress.done()
})

export default router
