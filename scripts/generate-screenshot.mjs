import { chromium } from '@playwright/test'
import path from 'path'
import { fileURLToPath } from 'url'

const __dirname = path.dirname(fileURLToPath(import.meta.url))
const rootDir = path.resolve(__dirname, '..')
const pathToExtension = path.join(rootDir, '.output/chrome-mv3')

async function captureScreenshot() {
  const context = await chromium.launchPersistentContext('', {
    channel: 'chromium',
    args: [`--disable-extensions-except=${pathToExtension}`, `--load-extension=${pathToExtension}`],
  })

  const sw = context.serviceWorkers()[0] ?? (await context.waitForEvent('serviceworker'))
  const extensionId = sw.url().split('/')[2]

  const page = await context.newPage()
  await page.setViewportSize({ width: 600, height: 650 })
  await page.goto(`chrome-extension://${extensionId}/popup.html`)

  // Wait for rendering
  await page.waitForTimeout(1000)

  const screenshotPath = path.join(rootDir, 'assets/screenshots/popup-demo.png')
  await page.screenshot({ path: screenshotPath })
  console.log(`Generated screenshot: ${screenshotPath}`)

  await context.close()
}

captureScreenshot().catch((err) => {
  console.error(err)
  process.exit(1)
})
