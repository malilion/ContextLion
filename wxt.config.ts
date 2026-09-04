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
    },
  },
})
