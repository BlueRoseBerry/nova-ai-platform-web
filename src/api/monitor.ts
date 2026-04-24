import { request } from '@/utils/request'
import type { MonitorMetrics, ServiceHealth } from '@/types'

// 获取服务健康状态
export const getServiceHealth = () => {
  return request.get<ServiceHealth[]>('/api/v1/monitor/health')
}

// 获取监控指标
export const getMonitorMetrics = (startTime: number, endTime: number) => {
  return request.get<MonitorMetrics[]>('/api/v1/monitor/metrics', { startTime, endTime })
}

// 获取 Prometheus 指标（通过 Spring Boot Actuator）
export const getPrometheusMetrics = () => {
  return request.get<string>('/actuator/prometheus')
}

// 获取系统状态
export const getSystemStatus = () => {
  return request.get<any>('/api/v1/monitor/status')
}
