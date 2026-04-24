<template>
  <div class="dashboard-container">
    <!-- 欢迎横幅 -->
    <div class="welcome-banner">
      <div class="welcome-content">
        <h2 class="welcome-title">欢迎回来, {{ userStore.username }} 👋</h2>
        <p class="welcome-subtitle">这里是您的 Nova AI 平台数据概览</p>
      </div>
      <el-date-picker
        v-model="dateRange"
        type="daterange"
        range-separator="至"
        start-placeholder="开始日期"
        end-placeholder="结束日期"
        class="date-picker"
      />
    </div>

    <!-- 统计卡片 -->
    <el-row :gutter="20" class="stat-row">
      <el-col :xs="24" :sm="12" :lg="6" v-for="stat in stats" :key="stat.label">
        <div class="stat-card" :class="`stat-${stat.type}`">
          <div class="stat-icon">
            <el-icon :size="32"><component :is="stat.icon" /></el-icon>
          </div>
          <div class="stat-info">
            <div class="stat-value">{{ stat.value }}</div>
            <div class="stat-label">{{ stat.label }}</div>
            <div class="stat-change" :class="stat.change >= 0 ? 'up' : 'down'">
              <el-icon><component :is="stat.change >= 0 ? 'Top' : 'Bottom'" /></el-icon>
              {{ Math.abs(stat.change) }}% 较上周
            </div>
          </div>
        </div>
      </el-col>
    </el-row>

    <!-- 图表行 -->
    <el-row :gutter="20" class="chart-row">
      <el-col :xs="24" :lg="16">
        <el-card class="chart-card">
          <template #header>
            <div class="card-header">
              <span class="card-title">数字人增长趋势</span>
              <el-radio-group v-model="trendType" size="small">
                <el-radio-button label="week">本周</el-radio-button>
                <el-radio-button label="month">本月</el-radio-button>
                <el-radio-button label="year">全年</el-radio-button>
              </el-radio-group>
            </div>
          </template>
          <div ref="trendChartRef" class="chart-container"></div>
        </el-card>
      </el-col>
      <el-col :xs="24" :lg="8">
        <el-card class="chart-card">
          <template #header>
            <span class="card-title">模型调用分布</span>
          </template>
          <div ref="modelChartRef" class="chart-container pie-chart"></div>
        </el-card>
      </el-col>
    </el-row>

    <!-- 第二行图表 -->
    <el-row :gutter="20" class="chart-row">
      <el-col :xs="24" :lg="12">
        <el-card class="chart-card">
          <template #header>
            <span class="card-title">工作流执行统计</span>
          </template>
          <div ref="workflowChartRef" class="chart-container"></div>
        </el-card>
      </el-col>
      <el-col :xs="24" :lg="12">
        <el-card class="chart-card">
          <template #header>
            <span class="card-title">最近活动</span>
          </template>
          <div class="activity-list">
            <div
              v-for="activity in recentActivities"
              :key="activity.id"
              class="activity-item"
            >
              <el-avatar :size="40" :style="{ background: activity.color }">
                <el-icon><component :is="activity.icon" /></el-icon>
              </el-avatar>
              <div class="activity-info">
                <div class="activity-title">{{ activity.title }}</div>
                <div class="activity-desc">{{ activity.description }}</div>
              </div>
              <div class="activity-time">{{ formatRelativeTime(activity.time) }}</div>
            </div>
          </div>
        </el-card>
      </el-col>
    </el-row>

    <!-- 快捷入口 -->
    <el-card class="quick-access">
      <template #header>
        <span class="card-title">快捷入口</span>
      </template>
      <div class="quick-grid">
        <div
          v-for="item in quickAccess"
          :key="item.label"
          class="quick-item"
          @click="router.push(item.path)"
        >
          <el-icon :size="28" :style="{ color: item.color }"><component :is="item.icon" /></el-icon>
          <span>{{ item.label }}</span>
        </div>
      </div>
    </el-card>
  </div>
</template>

<script setup lang="ts">
import { ref, onMounted, onUnmounted } from 'vue'
import { useRouter } from 'vue-router'
import { useUserStore } from '@/store/modules/user'
import * as echarts from 'echarts'
import { formatDate, formatRelativeTime } from '@/utils/format'
import {
  UserFilled, Cpu, Share, ChatDotRound, Top, Bottom,
  Avatar, EditPen, Tools, Document, Monitor, DataAnalysis
} from '@element-plus/icons-vue'

const router = useRouter()
const userStore = useUserStore()

const dateRange = ref<[Date, Date] | null>(null)
const trendType = ref<'week' | 'month' | 'year'>('month')
const trendChartRef = ref<HTMLElement>()
const modelChartRef = ref<HTMLElement>()
const workflowChartRef = ref<HTMLElement>()

let trendChart: echarts.ECharts | null = null
let modelChart: echarts.ECharts | null = null
let workflowChart: echarts.ECharts | null = null

const stats = ref([
  { label: '数字人总数', value: 128, change: 12.5, type: 'primary', icon: Avatar },
  { label: '活跃 Agent', value: 56, change: 8.2, type: 'success', icon: Cpu },
  { label: '工作流执行', value: 1024, change: -2.4, type: 'warning', icon: Share },
  { label: '模型调用', value: '8.9K', change: 24.6, type: 'info', icon: ChatDotRound },
])

const recentActivities = ref([
  { id: 1, title: '创建数字人', description: '智能客服数字人「小助手」已创建', time: new Date(Date.now() - 1000 * 60 * 5), color: '#667eea', icon: 'Plus' },
  { id: 2, title: '发布数字人', description: '数字人「数字员工001」已发布', time: new Date(Date.now() - 1000 * 60 * 30), color: '#10b981', icon: 'Upload' },
  { id: 3, title: 'Agent 执行', description: '客服 Agent 完成对话处理', time: new Date(Date.now() - 1000 * 60 * 60), color: '#f59e0b', icon: 'Check' },
  { id: 4, title: '工作流完成', description: '数据处理工作流执行完成', time: new Date(Date.now() - 1000 * 60 * 60 * 2), color: '#3b82f6', icon: 'Finished' },
  { id: 5, title: '技能注册', description: '新增外部 API 技能「天气查询」', time: new Date(Date.now() - 1000 * 60 * 60 * 4), color: '#8b5cf6', icon: 'Tools' },
])

const quickAccess = [
  { label: '创建数字人', path: '/digital-human/create', icon: 'Plus', color: '#667eea' },
  { label: 'Agent 列表', path: '/agent/list', icon: 'Grid', color: '#10b981' },
  { label: '工作流设计', path: '/workflow/list', icon: 'Share', color: '#f59e0b' },
  { label: '知识库管理', path: '/knowledge/list', icon: 'Files', color: '#3b82f6' },
  { label: '技能列表', path: '/skill/list', icon: 'Tools', color: '#8b5cf6' },
  { label: '系统监控', path: '/monitor/dashboard', icon: 'Monitor', color: '#ef4444' },
]

const initCharts = () => {
  // 趋势图
  if (trendChartRef.value) {
    trendChart = echarts.init(trendChartRef.value)
    trendChart.setOption({
      tooltip: { trigger: 'axis' },
      grid: { left: '3%', right: '4%', bottom: '3%', containLabel: true },
      xAxis: {
        type: 'category',
        data: ['周一', '周二', '周三', '周四', '周五', '周六', '周日'],
        axisLine: { lineStyle: { color: '#e2e8f0' } },
        axisLabel: { color: '#718096' },
      },
      yAxis: {
        type: 'value',
        splitLine: { lineStyle: { type: 'dashed', color: '#e2e8f0' } },
        axisLabel: { color: '#718096' },
      },
      series: [
        {
          name: '数字人',
          type: 'line',
          smooth: true,
          data: [12, 15, 18, 22, 28, 35, 42],
          itemStyle: { color: '#667eea' },
          areaStyle: {
            color: new echarts.graphic.LinearGradient(0, 0, 0, 1, [
              { offset: 0, color: 'rgba(102, 126, 234, 0.3)' },
              { offset: 1, color: 'rgba(102, 126, 234, 0.05)' },
            ]),
          },
        },
        {
          name: 'Agent',
          type: 'line',
          smooth: true,
          data: [8, 10, 12, 15, 18, 22, 26],
          itemStyle: { color: '#10b981' },
          areaStyle: {
            color: new echarts.graphic.LinearGradient(0, 0, 0, 1, [
              { offset: 0, color: 'rgba(16, 185, 129, 0.3)' },
              { offset: 1, color: 'rgba(16, 185, 129, 0.05)' },
            ]),
          },
        },
      ],
    })
  }

  // 模型分布饼图
  if (modelChartRef.value) {
    modelChart = echarts.init(modelChartRef.value)
    modelChart.setOption({
      tooltip: { trigger: 'item', formatter: '{b}: {c} ({d}%)' },
      legend: { bottom: '0%', left: 'center' },
      series: [
        {
          type: 'pie',
          radius: ['40%', '70%'],
          avoidLabelOverlap: false,
          itemStyle: { borderRadius: 6, borderColor: '#fff', borderWidth: 2 },
          data: [
            { value: 4500, name: 'OpenAI GPT-4', itemStyle: { color: '#667eea' } },
            { value: 2800, name: '通义千问', itemStyle: { color: '#10b981' } },
            { value: 1200, name: 'Anthropic', itemStyle: { color: '#f59e0b' } },
            { value: 400, name: '本地模型', itemStyle: { color: '#8b5cf6' } },
          ],
          label: { show: false },
        },
      ],
    })
  }

  // 工作流统计柱状图
  if (workflowChartRef.value) {
    workflowChart = echarts.init(workflowChartRef.value)
    workflowChart.setOption({
      tooltip: { trigger: 'axis', axisPointer: { type: 'shadow' } },
      grid: { left: '3%', right: '4%', bottom: '3%', containLabel: true },
      xAxis: {
        type: 'category',
        data: ['数据处理', '内容生成', '审核流程', '通知推送', 'API 调用'],
        axisLine: { lineStyle: { color: '#e2e8f0' } },
        axisLabel: { color: '#718096', rotate: 30 },
      },
      yAxis: {
        type: 'value',
        splitLine: { lineStyle: { type: 'dashed', color: '#e2e8f0' } },
        axisLabel: { color: '#718096' },
      },
      series: [
        {
          name: '执行次数',
          type: 'bar',
          barWidth: '40%',
          data: [320, 280, 150, 200, 180],
          itemStyle: {
            color: new echarts.graphic.LinearGradient(0, 0, 0, 1, [
              { offset: 0, color: '#667eea' },
              { offset: 1, color: '#764ba2' },
            ]),
            borderRadius: [4, 4, 0, 0],
          },
        },
      ],
    })
  }
}

onMounted(() => {
  initCharts()
  window.addEventListener('resize', () => {
    trendChart?.resize()
    modelChart?.resize()
    workflowChart?.resize()
  })
})

onUnmounted(() => {
  trendChart?.dispose()
  modelChart?.dispose()
  workflowChart?.dispose()
})
</script>

<style scoped lang="scss">
.dashboard-container {
  .welcome-banner {
    display: flex;
    justify-content: space-between;
    align-items: center;
    background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
    padding: 32px;
    border-radius: 12px;
    color: #fff;
    margin-bottom: 24px;

    .welcome-title {
      font-size: 24px;
      font-weight: 600;
      margin: 0 0 8px;
    }

    .welcome-subtitle {
      font-size: 14px;
      opacity: 0.8;
      margin: 0;
    }

    .date-picker {
      :deep(.el-input__wrapper) {
        background: rgba(255, 255, 255, 0.2);
        border: none;
        box-shadow: none;

        .el-input__inner {
          color: #fff;
        }

        &::placeholder, .el-input__placeholder {
          color: rgba(255, 255, 255, 0.7);
        }
      }
    }
  }

  .stat-row {
    margin-bottom: 20px;
  }

  .chart-row {
    margin-bottom: 20px;
  }

  .stat-card {
    display: flex;
    align-items: center;
    gap: 16px;
    padding: 24px;

    .stat-icon {
      width: 64px;
      height: 64px;
      border-radius: 12px;
      display: flex;
      align-items: center;
      justify-content: center;
      color: #fff;
    }

    &.stat-primary .stat-icon { background: linear-gradient(135deg, #667eea, #764ba2); }
    &.stat-success .stat-icon { background: linear-gradient(135deg, #10b981, #059669); }
    &.stat-warning .stat-icon { background: linear-gradient(135deg, #f59e0b, #d97706); }
    &.stat-info .stat-icon { background: linear-gradient(135deg, #3b82f6, #2563eb); }

    .stat-info {
      flex: 1;

      .stat-value {
        font-size: 28px;
        font-weight: 700;
        color: var(--text-primary);
      }

      .stat-label {
        font-size: 14px;
        color: var(--text-secondary);
        margin-top: 4px;
      }

      .stat-change {
        font-size: 12px;
        margin-top: 4px;
        display: flex;
        align-items: center;
        gap: 4px;

        &.up { color: #10b981; }
        &.down { color: #ef4444; }
      }
    }
  }

  .chart-card {
    .card-header {
      display: flex;
      justify-content: space-between;
      align-items: center;
    }

    .card-title {
      font-size: 16px;
      font-weight: 600;
    }

    .chart-container {
      height: 320px;
    }

    .pie-chart {
      height: 320px;
    }
  }

  .activity-list {
    .activity-item {
      display: flex;
      align-items: center;
      gap: 12px;
      padding: 12px 0;
      border-bottom: 1px solid var(--border-color);

      &:last-child {
        border-bottom: none;
      }

      .activity-info {
        flex: 1;

        .activity-title {
          font-size: 14px;
          font-weight: 500;
          color: var(--text-primary);
        }

        .activity-desc {
          font-size: 12px;
          color: var(--text-secondary);
          margin-top: 2px;
        }
      }

      .activity-time {
        font-size: 12px;
        color: var(--text-muted);
        white-space: nowrap;
      }
    }
  }

  .quick-access {
    .quick-grid {
      display: grid;
      grid-template-columns: repeat(auto-fill, minmax(160px, 1fr));
      gap: 16px;
    }

    .quick-item {
      display: flex;
      flex-direction: column;
      align-items: center;
      gap: 12px;
      padding: 24px 16px;
      border-radius: 12px;
      background: var(--bg-color);
      cursor: pointer;
      transition: all 0.2s;

      &:hover {
        transform: translateY(-4px);
        box-shadow: 0 4px 12px rgba(0, 0, 0, 0.1);
      }

      span {
        font-size: 14px;
        color: var(--text-primary);
      }
    }
  }
}
</style>
