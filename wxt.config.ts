import { defineConfig } from 'wxt'

export default defineConfig({
  modules: ['@wxt-dev/module-vue'],
  manifest: {
    name: 'ContextLion',
    description: 'Turn any webpage into clean, structured, AI-ready context.',
    version: '0.1.0',
    permissions: ['activeTab', 'scripting', 'storage'],
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
})
