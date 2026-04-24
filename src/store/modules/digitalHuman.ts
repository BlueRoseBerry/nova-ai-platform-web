import { defineStore } from 'pinia'
import type { DigitalHumanResponse } from '@/types'

export const useDigitalHumanStore = defineStore('digitalHuman', {
  state: () => ({
    list: [] as DigitalHumanResponse[],
    current: null as DigitalHumanResponse | null,
    loading: false,
    total: 0,
    currentPage: 1,
    pageSize: 10,
  }),

  getters: {
    publishedCount: (state) => state.list.filter((item) => item.publishStatus === 'published').length,
    draftCount: (state) => state.list.filter((item) => item.publishStatus === 'draft').length,
  },

  actions: {
    setList(list: DigitalHumanResponse[], total: number) {
      this.list = list
      this.total = total
    },

    setCurrent(item: DigitalHumanResponse | null) {
      this.current = item
    },

    updateItem(item: DigitalHumanResponse) {
      const index = this.list.findIndex((i) => i.id === item.id)
      if (index !== -1) {
        this.list[index] = item
      }
    },

    removeItem(id: number) {
      this.list = this.list.filter((item) => item.id !== id)
      this.total--
    },
  },
})
