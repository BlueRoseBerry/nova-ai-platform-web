<template>
  <div class="monitor-dashboard page-container">
    <div class="page-header">
      <div>
        <h2 class="page-title">系统监控面板</h2>
        <p class="page-subtitle">实时监控平台运行状态和性能指标</p>
      </div>
      <el-radio-group v-model="timeRange" size="small">
        <el-radio-button label="1h">1小时</el-radio-button>
        <el-radio-button label="6h">6小时</el-radio-button>
        <el-radio-button label="24h">24小时</el-radio-button>
        <el-radio-button label="7d">7天</el-radio-button>
      </el-radio-group>
    </div>

    <!-- 系统状态卡片 -->
    <el-row :gutter="16" class="status-row">
      <el-col :span="6" v-for="status in systemStatus" :key="status.label">
        <div class="status-card">
          <div class="status-header">
            <span class="status-label">{{ status.label }}</span>
            <el-tag :type="status.type" size="small">{{ status.statusText }}</el-tag>
          </div>
          <div class="status-value">{{ status.value }}</div>
          <el-progress
            :percentage="status.percentage"
            :color="status.color"
            :stroke-width="6"
            :show-text="false"
          />
        </div>
      </el-col>
    </el-row>

    <!-- 图表行 -->
    <el-row :gutter="20">
      <el-col :span="12">
        <el-card>
          <template #header>
            <span class="chart-title">CPU / 内存使用率趋势</span>
          </template>
          <div ref="resourceChartRef" class="chart-container"></div>
        </el-card>
      </el-col>
      <el-col :span="12">
        <el-card>
          <template #header>
            <span class="chart-title">请求量 / 延迟趋势</span>
          </template>
          <div ref="requestChartRef" class="chart-container"></div>
        </el-card>
      </el-col>
    </el-row>

    <el-row :gutter="20" style="margin-top: 20px;">
      <el-col :span="12">
        <el-card>
          <template #header>
            <span class="chart-title">各服务请求分布</span>
          </template>
          <div ref="serviceChartRef" class="chart-container"></div>
        </el-card>
      </el-col>
      <el-col :span="12">
        <el-card>
          <template #header>
            <span class="chart-title">错误率统计</span>
          </template>
          <div ref="errorChartRef" class="chart-container"></div>
        </el-card>
      </el-col>
    </el-row>
  </div>
</template>

<script setup lang="ts">
import { ref, onMounted, onUnmounted } from 'vue'
import * as echarts from 'echarts'

const timeRange = ref('24h')

const resourceChartRef = ref<HTMLElement>()
const requestChartRef = ref<HTMLElement>()
const serviceChartRef = ref<HTMLElement>()
const errorChartRef = ref<HTMLElement>()

let resourceChart: echarts.ECharts | null = null
let requestChart: echarts.ECharts | null = null
let serviceChart: echarts.ECharts | null = null
let errorChart: echarts.ECharts | null = null

const systemStatus = [
  { label: 'CPU 使用率', value: '67.3%', statusText: '正常', type: 'success', percentage: 67.3, color: '#10b981' },
  { label: '内存使用率', value: '78.5%', statusText: '偏高', type: 'warning', percentage: 78.5, color: '#f59e0b' },
  { label: '磁盘使用率', value: '45.2%', statusText: '正常', type: 'success', percentage: 45.2, color: '#10b981' },
  { label: '网络带宽', value: '234 Mbps', statusText: '正常', type: 'success', percentage: 35, color: '#10b981' },
]

const initCharts = () => {
  const hours = Array.from({ length: 24 }, (_, i) => `${i}:00`)

  // 资源图表
  if (resourceChartRef.value) {
    resourceChart = echarts.init(resourceChartRef.value)
    resourceChart.setOption({
      tooltip: { trigger: 'axis' },
      legend: { data: ['CPU', '内存'], bottom: 0 },
      grid: { top: 10, right: 20, bottom: 40, left: 40 },
      xAxis: { type: 'category', data: hours, axisLabel: { color: '#718096' } },
      yAxis: { type: 'value', max: 100, axisLabel: { formatter: '{value}%', color: '#718096' }, splitLine: { lineStyle: { type: 'dashed' } } },
      series: [
        { name: 'CPU', type: 'line', smooth: true, data: [45, 52, 48, 55, 62, 70, 65, 58, 52, 60, 67, 72, 78, 75, 68, 62, 55, 50, 48, 52, 58, 65, 70, 67], itemStyle: { color: '#667eea' }, areaStyle: { opacity: 0.1 } },
        { name: '内存', type: 'line', smooth: true, data: [65, 68, 70, 72, 75, 78, 80, 82, 80, 78, 76, 74, 72, 75, 78, 80, 82, 80, 78, 76, 74, 72, 76, 78], itemStyle: { color: '#10b981' }, areaStyle: { opacity: 0.1 } },
      ],
    })
  }

  // 请求图表
  if (requestChartRef.value) {
    requestChart = echarts.init(requestChartRef.value)
    requestChart.setOption({
      tooltip: { trigger: 'axis' },
      legend: { data: ['请求量 (QPS)', '平均延迟 (ms)'], bottom: 0 },
      grid: { top: 10, right: 50, bottom: 40, left: 50 },
      xAxis: { type: 'category', data: hours, axisLabel: { color: '#718096' } },
      yAxis: [
        { type: 'value', name: 'QPS', axisLabel: { color: '#718096' }, splitLine: { lineStyle: { type: 'dashed' } } },
        { type: 'value', name: '延迟', axisLabel: { color: '#718096' } },
      ],
      series: [
        { name: '请求量 (QPS)', type: 'bar', data: [120, 150, 180, 220, 280, 350, 320, 280, 250, 300, 380, 420, 450, 400, 350, 300, 250, 200, 180, 200, 250, 320, 350, 320], itemStyle: { color: '#667eea', borderRadius: [2, 2, 0, 0] } },
        { name: '平均延迟 (ms)', type: 'line', yAxisIndex: 1, smooth: true, data: [45, 52, 48, 55, 62, 85, 78, 65, 58, 70, 92, 110, 125, 105, 85, 70, 55, 48, 42, 50, 60, 75, 82, 78], itemStyle: { color: '#ef4444' } },
      ],
    })
  }

  // 服务分布饼图
  if (serviceChartRef.value) {
    serviceChart = echarts.init(serviceChartRef.value)
    serviceChart.setOption({
      tooltip: { trigger: 'item' },
      legend: { bottom: 0 },
      series: [{
        type: 'pie',
        radius: ['35%', '65%'],
        data: [
          { value: 335, name: '数字人服务', itemStyle: { color: '#667eea' } },
          { value: 310, name: 'Agent 引擎', itemStyle: { color: '#10b981' } },
          { value: 234, name: '工作流引擎', itemStyle: { color: '#f59e0b' } },
          { value: 135, name: '模型网关', itemStyle: { color: '#3b82f6' } },
          { value: 148, name: 'RAG 引擎', itemStyle: { color: '#8b5cf6' } },
        ],
        label: { show: false },
      }],
    })
  }

  // 错误率图表
  if (errorChartRef.value) {
    errorChart = echarts.init(errorChartRef.value)
    errorChart.setOption({
      tooltip: { trigger: 'axis' },
      grid: { top: 10, right: 20, bottom: 40, left: 40 },
      xAxis: { type: 'category', data: hours, axisLabel: { color: '#718096' } },
      yAxis: { type: 'value', axisLabel: { formatter: '{value}%', color: '#718096' }, splitLine: { lineStyle: { type: 'dashed' } } },
      series: [{
        type: 'line',
        smooth: true,
        data: [0.5, 0.3, 0.8, 1.2, 0.6, 1.5, 2.1, 1.8, 0.9, 0.4, 0.7, 1.1, 0.8, 0.3, 0.5, 0.6, 0.4, 0.3, 0.2, 0.4, 0.7, 0.9, 0.5, 0.3],
        itemStyle: { color: '#ef4444' },
        areaStyle: {
          color: new echarts.graphic.LinearGradient(0, 0, 0, 1, [
            { offset: 0, color: 'rgba(239, 68, 68, 0.3)' },
            { offset: 1, color: 'rgba(239, 68, 68, 0.02)' },
          ]),
        },
        markLine: {
          data: [{ yAxis: 2 }],
          lineStyle: { color: '#ef4444', type: 'dashed' },
          label: { formatter: '告警线 2%', color: '#ef4444' },
        },
      }],
    })
  }
}

onMounted(() => {
  initCharts()
  window.addEventListener('resize', () => {
    resourceChart?.resize()
    requestChart?.resize()
    serviceChart?.resize()
    errorChart?.resize()
  })
})

onUnmounted(() => {
  resourceChart?.dispose()
  requestChart?.dispose()
  serviceChart?.dispose()
  errorChart?.dispose()
})
</script>

<style scoped lang="scss">
.monitor-dashboard {
  .status-row {
    margin-bottom: 20px;
  }

  .status-card {
    background: var(--card-bg);
    padding: 20px;
    border-radius: 12px;
    box-shadow: 0 2px 8px rgba(0, 0, 0, 0.04);

    .status-header {
      display: flex;
      justify-content: space-between;
      align-items: center;
      margin-bottom: 12px;

      .status-label {
        font-size: 14px;
        color: var(--text-secondary);
      }
    }

    .status-value {
      font-size: 28px;
      font-weight: 700;
      color: var(--text-primary);
      margin-bottom: 12px;
    }
  }

  .chart-container {
    height: 300px;
  }

  .chart-title {
    font-size: 15px;
    font-weight: 600;
  }
}
</style>
