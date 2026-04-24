import { request } from '@/utils/request'
import type {
  DigitalHumanCreateRequest,
  DigitalHumanUpdateRequest,
  DigitalHumanResponse,
  PageResponse,
} from '@/types'
import { API_PATHS } from '@/utils/constants'

// 创建数字人
export const createDigitalHuman = (data: DigitalHumanCreateRequest) => {
  return request.post<DigitalHumanResponse>(API_PATHS.DIGITAL_HUMAN.CREATE, data)
}

// 获取数字人详情
export const getDigitalHuman = (id: number) => {
  return request.get<DigitalHumanResponse>(API_PATHS.DIGITAL_HUMAN.GET(id))
}

// 更新数字人
export const updateDigitalHuman = (data: DigitalHumanUpdateRequest) => {
  return request.post<DigitalHumanResponse>(API_PATHS.DIGITAL_HUMAN.UPDATE, data)
}

// 删除数字人
export const deleteDigitalHuman = (id: number) => {
  return request.post<void>(API_PATHS.DIGITAL_HUMAN.DELETE(id))
}

// 分页查询数字人
export const pageDigitalHuman = (params: { pageNum: number; pageSize: number }) => {
  return request.get<PageResponse<DigitalHumanResponse>>(API_PATHS.DIGITAL_HUMAN.PAGE, params)
}

// 发布数字人
export const publishDigitalHuman = (id: number) => {
  return request.post<DigitalHumanResponse>(API_PATHS.DIGITAL_HUMAN.PUBLISH(id))
}
