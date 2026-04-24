import { defineStore } from 'pinia'

export const useAppStore = defineStore('app', {
  state: () => ({
    sidebarCollapse: false,
    theme: localStorage.getItem('theme') || 'light',
    breadcrumbs: [] as { title: string; path: string }[],
  }),

  getters: {
    isDark: (state) => state.theme === 'dark',
  },

  actions: {
    toggleSidebar() {
      this.sidebarCollapse = !this.sidebarCollapse
    },

    setSidebarCollapse(collapse: boolean) {
      this.sidebarCollapse = collapse
    },

    setTheme(theme: string) {
      this.theme = theme
      localStorage.setItem('theme', theme)
      document.documentElement.setAttribute('data-theme', theme)
    },

    setBreadcrumbs(breadcrumbs: { title: string; path: string }[]) {
      this.breadcrumbs = breadcrumbs
    },
  },
})
