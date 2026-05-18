<template>
  <el-container class="layout-container">
    <el-aside :width="appStore.sidebarCollapse ? '64px' : '240px'" class="layout-aside">
      <div class="logo-container">
        <div class="logo-placeholder" v-if="!appStore.sidebarCollapse">
          <el-icon :size="24" color="#667eea"><Cpu /></el-icon>
        </div>
        <h1 v-if="!appStore.sidebarCollapse" class="logo-text">Nova AI</h1>
        <div class="logo-placeholder-small" v-show="appStore.sidebarCollapse">
          <el-icon :size="20" color="#667eea"><Cpu /></el-icon>
        </div>
      </div>
      <SidebarMenu />
    </el-aside>

    <el-container class="main-container">
      <el-header class="layout-header">
        <div class="header-left">
          <el-icon
            class="collapse-btn"
            @click="appStore.toggleSidebar()"
          >
            <Fold v-if="!appStore.sidebarCollapse" />
            <Expand v-else />
          </el-icon>
          <el-breadcrumb separator="/">
            <el-breadcrumb-item
              v-for="item in breadcrumbs"
              :key="item.path"
              :to="{ path: item.path }"
            >
              {{ item.title }}
            </el-breadcrumb-item>
          </el-breadcrumb>
        </div>

        <div class="header-right">
          <el-switch
            v-model="isDark"
            active-text="深色"
            inactive-text="浅色"
            class="theme-switch"
          />
          <el-dropdown @command="handleCommand">
            <div class="user-info">
              <el-avatar :size="32" src="">
                <el-icon><UserFilled /></el-icon>
              </el-avatar>
              <span class="username">{{ userStore.username }}</span>
            </div>
            <template #dropdown>
              <el-dropdown-menu>
                <el-dropdown-item command="profile">个人中心</el-dropdown-item>
                <el-dropdown-item command="settings">系统设置</el-dropdown-item>
                <el-dropdown-item divided command="logout">退出登录</el-dropdown-item>
              </el-dropdown-menu>
            </template>
          </el-dropdown>
        </div>
      </el-header>

      <el-main class="layout-main">
        <router-view v-slot="{ Component }">
          <transition name="fade" mode="out-in">
            <keep-alive :include="cachedViews">
              <component :is="Component" />
            </keep-alive>
          </transition>
        </router-view>
      </el-main>
    </el-container>
  </el-container>
</template>

<script setup lang="ts">
import { ref, watch } from 'vue'
import { useRouter, useRoute } from 'vue-router'
import { useAppStore } from '@/store/modules/app'
import { useUserStore } from '@/store/modules/user'
import { Fold, Expand, UserFilled, Cpu } from '@element-plus/icons-vue'
import SidebarMenu from './SidebarMenu.vue'
import { logoutUser } from '@/api/user'

const router = useRouter()
const route = useRoute()
const appStore = useAppStore()
const userStore = useUserStore()

const isDark = ref(false)
const cachedViews = ['DigitalHumanList', 'AgentList']

const breadcrumbs = ref<{ title: string; path: string }[]>([])

const updateBreadcrumbs = () => {
  const matched = route.matched.filter((item) => item.meta?.title)
  breadcrumbs.value = matched.map((item) => ({
    title: item.meta.title as string,
    path: item.path,
  }))
}

watch(() => route.path, updateBreadcrumbs, { immediate: true })

const handleCommand = async (command: string) => {
  switch (command) {
    case 'profile':
      router.push('/user/list')
      break
    case 'settings':
      ElMessage.info('系统设置开发中')
      break
    case 'logout':
      try {
        await logoutUser()
      } catch {
        /* 令牌失效或网络异常时仍清理本地态 */
      }
      userStore.logout()
      router.push('/login')
      ElMessage.success('已退出登录')
      break
  }
}
</script>

<style scoped lang="scss">
.layout-container {
  height: 100vh;
  background: #f5f7fa;
}

.layout-aside {
  background: linear-gradient(180deg, #1a1a2e 0%, #16213e 100%);
  box-shadow: 2px 0 8px rgba(0, 0, 0, 0.1);
  transition: width 0.3s ease;
  overflow: hidden;
}

.logo-container {
  height: 64px;
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 12px;
  padding: 0 16px;
  border-bottom: 1px solid rgba(255, 255, 255, 0.1);

  .logo-placeholder {
    width: 36px;
    height: 36px;
    background: rgba(255, 255, 255, 0.1);
    border-radius: 8px;
    display: flex;
    align-items: center;
    justify-content: center;
  }

  .logo-placeholder-small {
    width: 32px;
    height: 32px;
    background: rgba(255, 255, 255, 0.1);
    border-radius: 8px;
    display: flex;
    align-items: center;
    justify-content: center;
  }

  .logo-text {
    font-size: 20px;
    font-weight: 600;
    color: #fff;
    margin: 0;
    background: linear-gradient(90deg, #667eea, #764ba2);
    -webkit-background-clip: text;
    -webkit-text-fill-color: transparent;
    white-space: nowrap;
  }
}

.main-container {
  display: flex;
  flex-direction: column;
}

.layout-header {
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 0 24px;
  background: #fff;
  box-shadow: 0 1px 4px rgba(0, 0, 0, 0.08);
  height: 56px;
}

.header-left {
  display: flex;
  align-items: center;
  gap: 16px;

  .collapse-btn {
    font-size: 20px;
    cursor: pointer;
    color: #606266;
    transition: color 0.2s;

    &:hover {
      color: #409eff;
    }
  }
}

.header-right {
  display: flex;
  align-items: center;
  gap: 16px;
}

.theme-switch {
  margin-right: 8px;
}

.user-info {
  display: flex;
  align-items: center;
  gap: 8px;
  cursor: pointer;
  padding: 4px 8px;
  border-radius: 8px;
  transition: background 0.2s;

  &:hover {
    background: #f5f7fa;
  }

  .username {
    font-size: 14px;
    color: #303133;
  }
}

.layout-main {
  padding: 20px;
  background: #f5f7fa;
  overflow-y: auto;
}

.fade-enter-active,
.fade-leave-active {
  transition: opacity 0.3s ease;
}

.fade-enter-from,
.fade-leave-to {
  opacity: 0;
}
</style>
