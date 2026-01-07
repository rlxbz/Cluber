import { defineStore } from 'pinia'
import { useUserStore } from './userStore'
import { Storage, StorageConfig } from '@/utils/storage'

// 确定设置的存储方式
const settingsStorage = Storage[StorageConfig.settings];

// 默认设置
const DEFAULT_SETTINGS = {
  theme: 'default',
  fontSize: 14,
  fontFamily: 'system-ui, Avenir, Helvetica, Arial, sans-serif'
}

export const useSettingStore = defineStore('setting', {
  state: () => ({
    settings: { ...DEFAULT_SETTINGS }
  }),
  actions: {
    // 初始化设置（根据当前用户加载）
    initSettings() {
      const userStore = useUserStore()
      // 生成与用户绑定的存储键（未登录用户使用默认键）
      const storageKey = userStore.token 
        ? `user_settings_${userStore.userInfo?.id}` 
        : 'default_settings'
      
      const saved = settingsStorage.get(storageKey)
      if (saved) {
        // Storage.get() 已经自动解析 JSON，如果返回的是对象直接使用，如果是字符串才需要解析
        if (typeof saved === 'string') {
          try {
            this.settings = JSON.parse(saved)
          } catch (e) {
            console.error('解析设置失败，使用默认设置', e)
            this.settings = { ...DEFAULT_SETTINGS }
          }
        } else {
          // 已经是对象，直接使用
          this.settings = { ...DEFAULT_SETTINGS, ...saved }
        }
        this.applySettings() // 立即应用
      }
    },

    // 应用设置到页面
    applySettings() {
      const root = document.documentElement
      // 应用主题
      root.setAttribute('data-theme', this.settings.theme)
      // 应用字体大小
      root.style.fontSize = `${this.settings.fontSize}px`
      // 应用字体类型
      root.style.fontFamily = this.settings.fontFamily
    },

    // 更新单条设置
    updateSetting(key, value) {
      if (Object.keys(DEFAULT_SETTINGS).includes(key)) {
        this.settings[key] = value
        this.applySettings()
        this.saveSettings()
      }
    },

    // 保存设置到存储
    saveSettings() {
      const userStore = useUserStore()
      const storageKey = userStore.token 
        ? `user_settings_${userStore.userInfo?.id}` 
        : 'default_settings'
      
      settingsStorage.set(storageKey, JSON.stringify(this.settings))
    },

    // 恢复默认设置
    resetToDefault() {
      this.settings = { ...DEFAULT_SETTINGS }
      this.applySettings()
      this.saveSettings()
    }
  }
})