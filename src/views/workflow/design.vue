<template>
  <div class="workflow-design page-container">
    <div class="page-header">
      <div>
        <h2 class="page-title">工作流设计</h2>
        <p class="page-subtitle">可视化设计工作流流程</p>
      </div>
      <div class="header-actions">
        <el-button @click="router.back()">返回</el-button>
        <el-button type="primary" @click="saveWorkflow">
          <el-icon><Check /></el-icon>
          保存工作流
        </el-button>
      </div>
    </div>

    <el-row :gutter="20">
      <!-- 左侧节点面板 -->
      <el-col :span="5">
        <el-card class="node-panel">
          <template #header>
            <span class="section-title">节点库</span>
          </template>
          <div class="node-list">
            <div
              v-for="nodeType in nodeTypes"
              :key="nodeType.type"
              class="node-item"
              draggable="true"
            >
              <el-icon :size="20" :style="{ color: nodeType.color }"><component :is="nodeType.icon" /></el-icon>
              <span>{{ nodeType.label }}</span>
            </div>
          </div>
        </el-card>

        <el-card class="config-panel" style="margin-top: 16px;">
          <template #header>
            <span class="section-title">节点配置</span>
          </template>
          <div v-if="selectedNode" class="node-config">
            <el-form label-position="top">
              <el-form-item label="节点名称">
                <el-input v-model="selectedNode.name" />
              </el-form-item>
              <el-form-item label="节点类型">
                <el-tag>{{ nodeTypeMap[selectedNode.type]?.label }}</el-tag>
              </el-form-item>
              <el-form-item label="超时时间 (ms)">
                <el-input-number v-model="selectedNode.timeoutMs" :min="1000" :step="1000" />
              </el-form-item>
              <el-form-item label="配置 JSON">
                <el-input
                  v-model="nodeConfigJson"
                  type="textarea"
                  :rows="6"
                  @change="updateNodeConfig"
                />
              </el-form-item>
            </el-form>
          </div>
          <el-empty v-else description="请选择一个节点" :image-size="80" />
        </el-card>
      </el-col>

      <!-- 中间画布 -->
      <el-col :span="14">
        <el-card class="canvas-card">
          <div class="canvas-toolbar">
            <el-button-group>
              <el-button @click="zoomIn"><el-icon><ZoomIn /></el-icon></el-button>
              <el-button @click="zoomOut"><el-icon><ZoomOut /></el-icon></el-button>
              <el-button @click="resetZoom">适应</el-button>
            </el-button-group>
            <span class="zoom-level">{{ zoomLevel }}%</span>
          </div>

          <div class="canvas-area" ref="canvasRef">
            <svg class="canvas-svg">
              <!-- 连接线 -->
              <line
                v-for="(conn, idx) in connections"
                :key="idx"
                :x1="getNodeCenter(conn.from).x"
                :y1="getNodeCenter(conn.from).y"
                :x2="getNodeCenter(conn.to).x"
                :y2="getNodeCenter(conn.to).y"
                stroke="#667eea"
                stroke-width="2"
                marker-end="url(#arrowhead)"
              />
              <defs>
                <marker id="arrowhead" markerWidth="10" markerHeight="7" refX="10" refY="3.5" orient="auto">
                  <polygon points="0 0, 10 3.5, 0 7" fill="#667eea" />
                </marker>
              </defs>
            </svg>

            <!-- 节点 -->
            <div
              v-for="node in nodes"
              :key="node.id"
              class="canvas-node"
              :class="{ selected: selectedNode?.id === node.id }"
              :style="{ left: node.x + 'px', top: node.y + 'px' }"
              @click="selectNode(node)"
            >
              <div class="node-icon" :style="{ background: getNodeColor(node.type) }">
                <el-icon><component :is="nodeTypeMap[node.type]?.icon" /></el-icon>
              </div>
              <div class="node-label">{{ node.name }}</div>
              <div class="node-type">{{ nodeTypeMap[node.type]?.label }}</div>
              <!-- 连接点 -->
              <div class="node-handle node-handle-right" @click.stop="startConnection(node)"></div>
              <div class="node-handle node-handle-left"></div>
            </div>
          </div>
        </el-card>
      </el-col>

      <!-- 右侧属性面板 -->
      <el-col :span="5">
        <el-card class="prop-panel">
          <template #header>
            <span class="section-title">工作流属性</span>
          </template>
          <el-form label-position="top">
            <el-form-item label="工作流名称">
              <el-input v-model="workflowName" placeholder="请输入工作流名称" />
            </el-form-item>
            <el-form-item label="描述">
              <el-input
                v-model="workflowDesc"
                type="textarea"
                :rows="3"
                placeholder="请输入工作流描述"
              />
            </el-form-item>
            <el-form-item label="节点数">
              <el-tag>{{ nodes.length }}</el-tag>
            </el-form-item>
            <el-form-item label="连接数">
              <el-tag>{{ connections.length }}</el-tag>
            </el-form-item>
          </el-form>
        </el-card>
      </el-col>
    </el-row>
  </div>
</template>

<script setup lang="ts">
import { ref, reactive, computed, onMounted } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import {
  ChatDotRound, Connection, QuestionFilled, Refresh,
  User, Tools, Share, Check, ZoomIn, ZoomOut
} from '@element-plus/icons-vue'

const route = useRoute()
const router = useRouter()

const nodeTypeMap: Record<string, { label: string; icon: any; color: string }> = {
  LLM_CALL: { label: '大模型调用', icon: ChatDotRound, color: '#667eea' },
  API_CALL: { label: 'API调用', icon: Connection, color: '#10b981' },
  CONDITION: { label: '条件判断', icon: QuestionFilled, color: '#f59e0b' },
  LOOP: { label: '循环', icon: Refresh, color: '#3b82f6' },
  HUMAN_REVIEW: { label: '人工审核', icon: User, color: '#8b5cf6' },
  SKILL_EXECUTION: { label: '技能执行', icon: Tools, color: '#ef4444' },
}

const nodeTypes = Object.entries(nodeTypeMap).map(([type, info]) => ({
  type,
  ...info,
}))

const workflowName = ref('新工作流')
const workflowDesc = ref('')
const zoomLevel = ref(100)

const nodes = ref([
  { id: '1', name: '意图识别', type: 'LLM_CALL', x: 80, y: 180, config: {}, timeoutMs: 10000, nextNodeIds: ['2'] },
  { id: '2', name: '知识检索', type: 'API_CALL', x: 320, y: 180, config: {}, timeoutMs: 5000, nextNodeIds: ['3'] },
  { id: '3', name: '生成回复', type: 'LLM_CALL', x: 560, y: 180, config: {}, timeoutMs: 15000, nextNodeIds: ['4'] },
  { id: '4', name: '发送通知', type: 'SKILL_EXECUTION', x: 800, y: 180, config: {}, timeoutMs: 5000, nextNodeIds: [] },
])

const connections = ref([
  { from: '1', to: '2' },
  { from: '2', to: '3' },
  { from: '3', to: '4' },
])

const selectedNode = ref<typeof nodes.value[0] | null>(null)
const nodeConfigJson = ref('{}')

const getNodeColor = (type: string) => nodeTypeMap[type]?.color || '#999'

const getNodeCenter = (nodeId: string) => {
  const node = nodes.value.find((n) => n.id === nodeId)
  if (!node) return { x: 0, y: 0 }
  return { x: node.x + 100, y: node.y + 35 }
}

const selectNode = (node: typeof nodes.value[0]) => {
  selectedNode.value = node
  nodeConfigJson.value = JSON.stringify(node.config, null, 2)
}

const updateNodeConfig = () => {
  if (selectedNode.value) {
    try {
      selectedNode.value.config = JSON.parse(nodeConfigJson.value)
    } catch {
      ElMessage.warning('JSON 格式错误')
    }
  }
}

const zoomIn = () => { zoomLevel.value = Math.min(200, zoomLevel.value + 10) }
const zoomOut = () => { zoomLevel.value = Math.max(50, zoomLevel.value - 10) }
const resetZoom = () => { zoomLevel.value = 100 }

const startConnection = (node: typeof nodes.value[0]) => {
  ElMessage.info('从节点开始连接: ' + node.name)
}

const saveWorkflow = () => {
  ElMessage.success('工作流保存成功')
  router.back()
}
</script>

<style scoped lang="scss">
.workflow-design {
  .header-actions {
    display: flex;
    gap: 12px;
  }

  .node-panel, .config-panel, .prop-panel {
    .section-title {
      font-size: 14px;
      font-weight: 600;
    }
  }

  .node-list {
    display: flex;
    flex-direction: column;
    gap: 8px;

    .node-item {
      display: flex;
      align-items: center;
      gap: 8px;
      padding: 10px 12px;
      background: var(--bg-color);
      border-radius: 8px;
      cursor: grab;
      font-size: 13px;
      transition: background 0.2s;

      &:hover {
        background: #eef2ff;
      }
    }
  }

  .canvas-card {
    min-height: 600px;

    .canvas-toolbar {
      display: flex;
      align-items: center;
      gap: 12px;
      margin-bottom: 12px;

      .zoom-level {
        font-size: 13px;
        color: var(--text-secondary);
      }
    }

    .canvas-area {
      position: relative;
      height: 520px;
      background: #fafbfc;
      background-image: radial-gradient(#e5e7eb 1px, transparent 1px);
      background-size: 20px 20px;
      border-radius: 8px;
      overflow: hidden;

      .canvas-svg {
        position: absolute;
        inset: 0;
        width: 100%;
        height: 100%;
        pointer-events: none;
      }

      .canvas-node {
        position: absolute;
        width: 200px;
        padding: 12px;
        background: #fff;
        border: 2px solid #e5e7eb;
        border-radius: 10px;
        cursor: pointer;
        transition: border-color 0.2s, box-shadow 0.2s;

        &.selected {
          border-color: #667eea;
          box-shadow: 0 0 0 3px rgba(102, 126, 234, 0.2);
        }

        &:hover {
          box-shadow: 0 4px 12px rgba(0, 0, 0, 0.08);
        }

        .node-icon {
          width: 32px;
          height: 32px;
          border-radius: 6px;
          display: flex;
          align-items: center;
          justify-content: center;
          color: #fff;
          margin-bottom: 8px;
        }

        .node-label {
          font-size: 13px;
          font-weight: 600;
          color: var(--text-primary);
        }

        .node-type {
          font-size: 11px;
          color: var(--text-muted);
          margin-top: 2px;
        }

        .node-handle {
          position: absolute;
          width: 10px;
          height: 10px;
          background: #667eea;
          border-radius: 50%;
          top: 50%;
          transform: translateY(-50%);

          &-right { right: -5px; cursor: crosshair; }
          &-left { left: -5px; }
        }
      }
    }
  }
}
</style>
