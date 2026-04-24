<template>
  <el-menu
    :default-active="activeMenu"
    :collapse="appStore.sidebarCollapse"
    background-color="transparent"
    text-color="#bfc8d9"
    active-text-color="#fff"
    class="sidebar-menu"
    router
  >
    <template v-for="menu in menuList" :key="menu.path">
      <!-- 有子菜单 -->
      <el-sub-menu v-if="menu.children && menu.children.length" :index="menu.path">
        <template #title>
          <el-icon><component :is="menu.meta.icon" /></el-icon>
          <span>{{ menu.meta.title }}</span>
        </template>
        <el-menu-item
          v-for="child in menu.children"
          :key="child.path"
          :index="menu.path + '/' + child.path"
          v-show="!child.meta?.hidden"
        >
          <el-icon><component :is="child.meta.icon" /></el-icon>
          <template #title>{{ child.meta.title }}</template>
        </el-menu-item>
      </el-sub-menu>

      <!-- 无子菜单 -->
      <el-menu-item
        v-else
        :index="menu.path"
        v-show="!menu.meta?.hidden"
      >
        <el-icon><component :is="menu.meta.icon" /></el-icon>
        <template #title>{{ menu.meta.title }}</template>
      </el-menu-item>
    </template>
  </el-menu>
</template>

<script setup lang="ts">
import { computed } from 'vue'
import { useRoute } from 'vue-router'
import { useAppStore } from '@/store/modules/app'
import router from '@/router'

const route = useRoute()
const appStore = useAppStore()

const activeMenu = computed(() => route.path)

interface MenuRoute {
  path: string
  meta: { title: string; icon: string; hidden?: boolean }
  children?: MenuRoute[]
}

const menuList = computed<MenuRoute[]>(() => {
  const routes = router.getRoutes()
  const mainRoute = routes.find((r) => r.path === '/')
  if (!mainRoute?.children) return []

  return mainRoute.children
    .filter((r) => r.path && !r.meta?.hidden)
    .map((r) => ({
      path: r.path,
      meta: {
        title: (r.meta?.title as string) || '',
        icon: (r.meta?.icon as string) || '',
        hidden: r.meta?.hidden as boolean,
      },
      children: r.children
        ?.filter((c) => c.path && !c.meta?.hidden)
        .map((c) => ({
          path: c.path,
          meta: {
            title: (c.meta?.title as string) || '',
            icon: (c.meta?.icon as string) || '',
            hidden: c.meta?.hidden as boolean,
          },
        })) || [],
    }))
    .sort((a, b) => {
      const order = ['/dashboard', '/digital-human', '/agent', '/workflow', '/model', '/knowledge', '/skill', '/monitor']
      return order.indexOf(a.path) - order.indexOf(b.path)
    })
})
</script>

<style scoped lang="scss">
.sidebar-menu {
  border-right: none;
  background: transparent;

  &:not(.el-menu--collapse) {
    width: 240px;
  }

  :deep(.el-sub-menu__title) {
    color: #bfc8d9;

    &:hover {
      background: rgba(255, 255, 255, 0.05) !important;
      color: #fff;
    }
  }

  :deep(.el-menu-item) {
    color: #bfc8d9;
    margin: 4px 8px;
    border-radius: 8px;

    &:hover {
      background: rgba(255, 255, 255, 0.08) !important;
      color: #fff;
    }

    &.is-active {
      background: rgba(102, 126, 234, 0.2) !important;
      color: #fff;
    }
  }

  :deep(.el-icon) {
    margin-right: 4px;
  }
}
</style>
