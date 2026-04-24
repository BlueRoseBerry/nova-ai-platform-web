# Nova AI Platform Web

Nova AI 平台前端管理系统 - 基于 Vue 3 + TypeScript + Element Plus 构建的数字人智能体管理平台。

## 技术栈

- **框架**: Vue 3 (Composition API)
- **语言**: TypeScript
- **构建工具**: Vite 5
- **UI 组件库**: Element Plus
- **路由**: Vue Router 4
- **状态管理**: Pinia
- **HTTP 客户端**: Axios
- **数据可视化**: ECharts 5
- **日期处理**: Day.js

## 项目结构

```
nova-ai-platform-web/
├── src/
│   ├── api/                    # API 接口
│   │   ├── digitalHuman.ts     # 数字人 API
│   │   ├── index.ts            # 其他 API (Agent/Workflow/Model/RAG/Skill)
│   │   └── monitor.ts          # 监控 API
│   ├── assets/
│   │   ├── images/             # 图片资源
│   │   └── styles/
│   │       └── global.scss     # 全局样式
│   ├── components/
│   │   ├── common/             # 公共组件
│   │   └── layout/             # 布局组件
│   │       ├── index.vue       # 主布局
│   │       └── SidebarMenu.vue # 侧边栏菜单
│   ├── router/
│   │   └── index.ts            # 路由配置
│   ├── store/
│   │   ├── index.ts            # Pinia 入口
│   │   └── modules/            # 状态模块
│   │       ├── app.ts
│   │       ├── user.ts
│   │       └── digitalHuman.ts
│   ├── types/
│   │   └── index.ts            # 类型定义
│   ├── utils/
│   │   ├── constants.ts        # 常量
│   │   ├── format.ts           # 格式化工具
│   │   └── request.ts          # HTTP 请求封装
│   └── views/
│       ├── dashboard/          # 首页仪表盘
│       ├── digital-human/      # 数字人管理
│       ├── agent/              # Agent 管理
│       ├── workflow/           # 工作流管理
│       ├── model/              # 模型管理
│       ├── knowledge/          # 知识库管理
│       ├── skill/              # 技能管理
│       ├── monitor/            # 系统监控
│       └── login/              # 登录页面
├── public/                     # 静态资源
├── index.html                  # HTML 入口
├── package.json
├── tsconfig.json
└── vite.config.ts
```

## 快速开始

### 安装依赖

```bash
npm install
```

### 开发模式

```bash
npm run dev
```

访问 http://localhost:3000

### 构建生产版本

```bash
npm run build
```

### 预览生产版本

```bash
npm run preview
```

## 功能模块

### 1. 登录系统
- 用户名密码登录
- 登录状态保持
- 自动路由保护

### 2. 首页仪表盘
- 数据统计卡片（数字人、Agent、工作流、模型调用）
- 增长趋势折线图
- 模型调用分布饼图
- 工作流执行柱状图
- 最近活动时间线
- 快捷入口

### 3. 数字人管理
- 卡片式列表展示
- 搜索和筛选
- 创建数字人（名称、头像、声音、人格、Agent/Workflow 绑定、技能）
- 编辑数字人
- 查看详情（人格设定、绑定配置、技能列表、运行统计）
- 发布数字人

### 4. Agent 管理
- Agent 列表（表格展示）
- 注册新 Agent
- Agent 对话测试（实时交互界面）
- Agent 配置面板

### 5. 工作流管理
- 工作流卡片列表
- 可视化流程设计（节点拖拽、连线）
- 节点配置编辑
- 工作流执行
- 执行记录查看

### 6. 模型管理
- 模型提供商管理（OpenAI、Anthropic、通义千问、本地模型）
- 模型对话测试
- Token 用量统计
- 模型参数配置（Temperature、Max Tokens）

### 7. 知识库管理
- 知识库卡片列表
- 创建知识库
- 文档上传和管理
- 检索测试（Top K 检索、相似度评分）

### 8. 技能管理
- 技能列表（按类型筛选）
- 注册新技能
- 启用/禁用技能
- 技能测试

### 9. 系统监控
- 实时监控面板（CPU/内存/网络趋势）
- 请求量和延迟统计
- 服务请求分布
- 错误率统计（带告警线）
- 各微服务健康状态
- 基础设施状态

## 后端 API 对接

前端默认将 API 请求代理到 `http://localhost:8080`（后端网关）。
在 `vite.config.ts` 中修改代理配置。

### 覆盖的后端接口

| 模块 | 接口路径前缀 |
|------|-------------|
| 数字人 | `/api/v1/digital-human/**` |
| Agent | `/api/v1/agent/**` |
| 工作流 | `/api/v1/workflow/**` |
| 模型 | `/api/v1/model/**` |
| RAG | `/api/v1/rag/**` |
| 技能 | `/api/v1/skill/**` |
| 监控 | `/api/v1/monitor/**` |

## 默认登录

- 用户名: 任意（不少于6位）
- 密码: 任意（不少于6位）

（当前为演示模式，使用 Mock 登录）

## License

MIT
