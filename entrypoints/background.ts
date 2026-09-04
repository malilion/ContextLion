import { defineBackground } from 'wxt/utils/define-background'

export default defineBackground(() => {
  console.log('[ContextLion] Background service worker initialized.')

  // Background message listener registered synchronously at top level
  chrome.runtime.onInstalled.addListener((details: chrome.runtime.InstalledDetails) => {
    if (details.reason === 'install') {
      console.log('[ContextLion] Extension installed successfully.')
    }
  })
})
