<template>
  <div class="service-health page-container">
    <div class="page-header">
      <div>
        <h2 class="page-title">服务健康状态</h2>
        <p class="page-subtitle">各微服务的运行健康情况</p>
      </div>
      <el-button @click="refreshHealth">
        <el-icon><Refresh /></el-icon>
        刷新状态
      </el-button>
    </div>

    <!-- 服务卡片 -->
    <div class="service-grid">
      <el-card
        v-for="service in services"
        :key="service.name"
        class="service-card"
      >
        <div class="service-header">
          <div class="service-status">
            <div class="status-dot" :class="service.status"></div>
            <span class="status-text">{{ service.statusText }}</span>
          </div>
          <el-dropdown>
            <el-icon><MoreFilled /></el-icon>
            <template #dropdown>
              <el-dropdown-menu>
                <el-dropdown-item>查看日志</el-dropdown-item>
                <el-dropdown-item>重启服务</el-dropdown-item>
              </el-dropdown-menu>
            </template>
          </el-dropdown>
        </div>

        <div class="service-name">{{ service.name }}</div>
        <div class="service-desc">{{ service.description }}</div>

        <div class="service-metrics">
          <div class="metric-item">
            <span class="metric-label">端口</span>
            <span class="metric-value">{{ service.port }}</span>
          </div>
          <div class="metric-item">
            <span class="metric-label">延迟</span>
            <span class="metric-value">{{ service.latency }}</span>
          </div>
          <div class="metric-item">
            <span class="metric-label">运行时间</span>
            <span class="metric-value">{{ service.uptime }}</span>
          </div>
          <div class="metric-item">
            <span class="metric-label">版本</span>
            <span class="metric-value">{{ service.version }}</span>
          </div>
        </div>

        <el-divider />

        <div class="service-details">
          <el-progress
            :percentage="service.cpuUsage"
            :color="progressColor(service.cpuUsage)"
            :format="() => `CPU ${service.cpuUsage}%`"
          />
          <el-progress
            :percentage="service.memoryUsage"
            :color="progressColor(service.memoryUsage)"
            :format="() => `内存 ${service.memoryUsage}%`"
          />
        </div>
      </el-card>

      <!-- 基础设施卡片 -->
      <el-card class="service-card infra-card">
        <div class="infra-header">
          <h3>🗄️</h3>
          <span>基础设施</span>
        </div>
        <div class="infra-list">
          <div class="infra-item" v-for="infra in infrastructure" :key="infra.name">
            <div class="infra-status">
              <div class="status-dot" :class="infra.status"></div>
              <span>{{ infra.name }}</span>
            </div>
            <span class="infra-detail">{{ infra.detail }}</span>
          </div>
        </div>
      </el-card>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref } from 'vue'
import { Refresh, MoreFilled } from '@element-plus/icons-vue'

const services = ref([
  {
    name: 'API Gateway',
    description: '统一网关，路由转发',
    port: 8080,
    status: 'healthy',
    statusText: '健康',
    latency: '12ms',
    uptime: '15d 6h',
    version: '1.0.0',
    cpuUsage: 23,
    memoryUsage: 45,
  },
  {
    name: 'Digital Human Service',
    description: '数字人 CRUD 和发布',
    port: 8081,
    status: 'healthy',
    statusText: '健康',
    latency: '45ms',
    uptime: '15d 6h',
    version: '1.0.0',
    cpuUsage: 34,
    memoryUsage: 56,
  },
  {
    name: 'Agent Engine',
    description: 'Agent 编排引擎',
    port: 8082,
    status: 'healthy',
    statusText: '健康',
    latency: '32ms',
    uptime: '10d 12h',
    version: '1.0.0',
    cpuUsage: 45,
    memoryUsage: 62,
  },
  {
    name: 'Workflow Engine',
    description: '工作流流程引擎',
    port: 8083,
    status: 'degraded',
    statusText: '降级',
    latency: '120ms',
    uptime: '5d 8h',
    version: '1.0.0',
    cpuUsage: 72,
    memoryUsage: 85,
  },
  {
    name: 'Model Gateway',
    description: '大模型统一网关',
    port: 8084,
    status: 'healthy',
    statusText: '健康',
    latency: '89ms',
    uptime: '15d 6h',
    version: '1.0.0',
    cpuUsage: 56,
    memoryUsage: 48,
  },
  {
    name: 'RAG Engine',
    description: '检索增强引擎',
    port: 8085,
    status: 'healthy',
    statusText: '健康',
    latency: '67ms',
    uptime: '15d 6h',
    version: '1.0.0',
    cpuUsage: 38,
    memoryUsage: 55,
  },
  {
    name: 'Skill Service',
    description: '技能插件系统',
    port: 8086,
    status: 'healthy',
    statusText: '健康',
    latency: '15ms',
    uptime: '15d 6h',
    version: '1.0.0',
    cpuUsage: 12,
    memoryUsage: 34,
  },
])

const infrastructure = ref([
  { name: 'PostgreSQL', status: 'healthy', detail: '12ms - 3 connections' },
  { name: 'Redis', status: 'healthy', detail: '2ms - 15 keys' },
  { name: 'Milvus', status: 'healthy', detail: '8ms - 3,832 vectors' },
  { name: 'Nacos', status: 'healthy', detail: '5ms - 7 services' },
  { name: 'RocketMQ', status: 'healthy', detail: '3ms - 0 pending' },
])

const progressColor = (value: number) => {
  if (value < 60) return '#10b981'
  if (value < 80) return '#f59e0b'
  return '#ef4444'
}

const refreshHealth = () => {
  ElMessage.info('正在刷新服务状态...')
  setTimeout(() => ElMessage.success('状态已更新'), 1000)
}
</script>

<style scoped lang="scss">
.service-health {
  .service-grid {
    display: grid;
    grid-template-columns: repeat(auto-fill, minmax(320px, 1fr));
    gap: 20px;
  }

  .service-card {
    .service-header {
      display: flex;
      justify-content: space-between;
      align-items: center;
      margin-bottom: 12px;

      .service-status {
        display: flex;
        align-items: center;
        gap: 8px;

        .status-dot {
          width: 10px;
          height: 10px;
          border-radius: 50%;

          &.healthy { background: #10b981; box-shadow: 0 0 8px rgba(16, 185, 129, 0.5); }
          &.degraded { background: #f59e0b; box-shadow: 0 0 8px rgba(245, 158, 11, 0.5); }
          &.unhealthy { background: #ef4444; box-shadow: 0 0 8px rgba(239, 68, 68, 0.5); }
        }

        .status-text {
          font-size: 13px;
          font-weight: 500;
        }
      }
    }

    .service-name {
      font-size: 16px;
      font-weight: 600;
      margin-bottom: 4px;
    }

    .service-desc {
      font-size: 12px;
      color: var(--text-secondary);
      margin-bottom: 16px;
    }

    .service-metrics {
      display: grid;
      grid-template-columns: repeat(2, 1fr);
      gap: 8px;

      .metric-item {
        display: flex;
        justify-content: space-between;
        padding: 6px 8px;
        background: var(--bg-color);
        border-radius: 6px;

        .metric-label {
          font-size: 12px;
          color: var(--text-muted);
        }

        .metric-value {
          font-size: 12px;
          font-weight: 600;
          color: var(--text-primary);
        }
      }
    }

    .service-details {
      display: flex;
      flex-direction: column;
      gap: 8px;
    }
  }

  .infra-card {
    .infra-header {
      display: flex;
      align-items: center;
      gap: 8px;
      font-size: 16px;
      font-weight: 600;
      margin-bottom: 16px;

      h3 {
        font-size: 24px;
        margin: 0;
      }
    }

    .infra-list {
      display: flex;
      flex-direction: column;
      gap: 12px;

      .infra-item {
        display: flex;
        justify-content: space-between;
        align-items: center;

        .infra-status {
          display: flex;
          align-items: center;
          gap: 8px;

          .status-dot {
            width: 8px;
            height: 8px;
            border-radius: 50%;

            &.healthy { background: #10b981; }
            &.degraded { background: #f59e0b; }
            &.unhealthy { background: #ef4444; }
          }

          span {
            font-size: 14px;
            font-weight: 500;
          }
        }

        .infra-detail {
          font-size: 12px;
          color: var(--text-muted);
        }
      }
    }
  }
}
</style>
