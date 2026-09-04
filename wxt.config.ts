import { defineConfig } from 'wxt'

export default defineConfig({
  modules: ['@wxt-dev/module-vue'],
  manifest: {
    name: 'ContextLion',
    description: 'Turn any webpage into clean, structured, AI-ready context.',
    permissions: ['activeTab', 'scripting', 'storage', 'tabs', 'unlimitedStorage'],
    browser_specific_settings: {
      gecko: {
        id: 'contextlion@malilion.dev',
      },
    },
    action: {
      default_title: 'ContextLion',
      default_icon: {
        16: 'icon-16.png',
        32: 'icon-32.png',
        48: 'icon-48.png',
        128: 'icon-128.png',
      },
    },
    icons: {
      16: 'icon-16.png',
      32: 'icon-32.png',
      48: 'icon-48.png',
      128: 'icon-128.png',
    },
  },
  zip: {
    excludeSources: ['DevTrace Lion/**'],
  },
})
