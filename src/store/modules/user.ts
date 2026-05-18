import { defineStore } from 'pinia'
import type { UserInfo, UserLoginResponse } from '@/types'
import { STORAGE_KEYS, DEFAULT_USER_ID } from '@/utils/constants'

function mapLoginResponseToUserInfo(res: UserLoginResponse): UserInfo {
  return {
    userId: String(res.userId),
    account: res.account,
    username: res.name?.trim() ? res.name : res.account,
    role: res.role || '',
    tenant: res.tenant,
  }
}

export const useUserStore = defineStore('user', {
  state: () => ({
    userId: localStorage.getItem(STORAGE_KEYS.USER_ID) || DEFAULT_USER_ID,
    userInfo: null as UserInfo | null,
    isLoggedIn: !!localStorage.getItem(STORAGE_KEYS.TOKEN),
  }),

  getters: {
    username: (state) => state.userInfo?.username || '未登录',
    avatar: (state) => state.userInfo?.avatar || '',
    role: (state) => state.userInfo?.role || 'user',
  },

  actions: {
    setUserId(userId: string) {
      this.userId = userId
      localStorage.setItem(STORAGE_KEYS.USER_ID, userId)
    },

    loginWithToken(token: string, userInfo: UserInfo) {
      this.userInfo = userInfo
      this.isLoggedIn = true
      localStorage.setItem(STORAGE_KEYS.TOKEN, token)
      localStorage.setItem(STORAGE_KEYS.USER_INFO, JSON.stringify(userInfo))
      this.setUserId(userInfo.userId)
    },

    loginFromAuthResponse(res: UserLoginResponse) {
      this.loginWithToken(res.token, mapLoginResponseToUserInfo(res))
    },

    /** @deprecated 仅兼容旧 mock；请使用 loginFromAuthResponse */
    login(userInfo: UserInfo) {
      this.userInfo = userInfo
      this.isLoggedIn = true
      localStorage.setItem(STORAGE_KEYS.TOKEN, 'mock-token')
      localStorage.setItem(STORAGE_KEYS.USER_INFO, JSON.stringify(userInfo))
      this.setUserId(userInfo.userId)
    },

    logout() {
      this.userInfo = null
      this.isLoggedIn = false
      this.userId = DEFAULT_USER_ID
      localStorage.removeItem(STORAGE_KEYS.TOKEN)
      localStorage.removeItem(STORAGE_KEYS.USER_INFO)
    },

    loadUserInfo() {
      const token = localStorage.getItem(STORAGE_KEYS.TOKEN)
      this.isLoggedIn = !!token
      const info = localStorage.getItem(STORAGE_KEYS.USER_INFO)
      if (info) {
        try {
          this.userInfo = JSON.parse(info)
        } catch {
          this.userInfo = null
        }
      }
    },
  },
})
