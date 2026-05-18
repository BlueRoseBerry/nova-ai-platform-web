import { request } from '@/utils/request'
import type {
  SysUser,
  UserCreatePayload,
  UserLoginPayload,
  UserLoginResponse,
  UserPageResult,
  UserUpdatePayload,
} from '@/types'
import { API_PATHS } from '@/utils/constants'

export const loginUser = (data: UserLoginPayload) => {
  return request.post<UserLoginResponse>(API_PATHS.USER.LOGIN, data)
}

export const logoutUser = () => {
  return request.post<void>(API_PATHS.USER.LOGOUT)
}

export const createUser = (data: UserCreatePayload) => {
  return request.post<SysUser>(API_PATHS.USER.CREATE, data)
}

/** 公开注册（与 createUser 共用后端接口） */
export const registerUser = (data: UserCreatePayload) => {
  return request.post<SysUser>(API_PATHS.USER.CREATE, data)
}

export const getUserById = (id: number) => {
  return request.get<SysUser>(API_PATHS.USER.GET(id))
}

export const updateUser = (data: UserUpdatePayload) => {
  return request.post<SysUser>(API_PATHS.USER.UPDATE, data)
}

export const deleteUser = (id: number) => {
  return request.post<void>(API_PATHS.USER.DELETE(id))
}

export const pageUsers = (params: { current: number; pageSize: number }) => {
  return request.get<UserPageResult>(API_PATHS.USER.PAGE, params)
}
