import { chromium } from '@playwright/test'
import fs from 'fs'
import path from 'path'
import { fileURLToPath } from 'url'

const __dirname = path.dirname(fileURLToPath(import.meta.url))
const rootDir = path.resolve(__dirname, '..')

const logoPath = path.join(rootDir, 'public/logo.png')
const logoBase64 = fs.readFileSync(logoPath).toString('base64')
const logoSrc = `data:image/png;base64,${logoBase64}`

fs.mkdirSync(path.join(rootDir, 'public'), { recursive: true })
fs.mkdirSync(path.join(rootDir, 'assets/store'), { recursive: true })
fs.mkdirSync(path.join(rootDir, 'assets/screenshots'), { recursive: true })

// Copy icon-128 to assets/store/icon-128.png
fs.copyFileSync(
  path.join(rootDir, 'public/icon-128.png'),
  path.join(rootDir, 'assets/store/icon-128.png')
)

async function generate() {
  const browser = await chromium.launch()
  const page = await browser.newPage()

  // 1. Generate Store Small Tile (440x280)
  await page.setViewportSize({ width: 440, height: 280 })
  await page.setContent(`
    <!DOCTYPE html>
    <html>
      <head>
        <style>
          * { margin: 0; padding: 0; box-sizing: border-box; }
          body {
            width: 440px;
            height: 280px;
            background: linear-gradient(135deg, #090d16 0%, #1e1b4b 100%);
            display: flex;
            flex-direction: column;
            align-items: center;
            justify-content: center;
            font-family: -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif;
            color: #ffffff;
            overflow: hidden;
            position: relative;
          }
          .icon-wrapper img {
            width: 110px;
            height: 110px;
            margin-bottom: 12px;
            filter: drop-shadow(0 10px 25px rgba(245, 158, 11, 0.45));
          }
          h1 {
            font-size: 26px;
            font-weight: 800;
            letter-spacing: -0.5px;
            margin-bottom: 6px;
            background: linear-gradient(90deg, #ffffff, #fbbf24);
            -webkit-background-clip: text;
            -webkit-text-fill-color: transparent;
          }
          p {
            font-size: 13px;
            color: #94a3b8;
            font-weight: 500;
          }
        </style>
      </head>
      <body>
        <div class="icon-wrapper">
          <img src="${logoSrc}" alt="ContextLion" />
        </div>
        <h1>ContextLion</h1>
        <p>Turn any webpage into AI-ready Markdown</p>
      </body>
    </html>
  `)
  const smallTilePath = path.join(rootDir, 'assets/store/small-tile-440x280.png')
  await page.screenshot({ path: smallTilePath })
  console.log(`Generated: ${smallTilePath}`)

  // 2. Generate Store Marquee Banner (1400x560)
  await page.setViewportSize({ width: 1400, height: 560 })
  await page.setContent(`
    <!DOCTYPE html>
    <html>
      <head>
        <style>
          * { margin: 0; padding: 0; box-sizing: border-box; }
          body {
            width: 1400px;
            height: 560px;
            background: radial-gradient(circle at 75% 35%, #1e1b4b 0%, #090d16 80%);
            display: flex;
            align-items: center;
            justify-content: space-between;
            padding: 0 120px;
            font-family: -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif;
            color: #ffffff;
            overflow: hidden;
          }
          .left {
            max-width: 680px;
          }
          .badge {
            display: inline-block;
            background: rgba(245, 158, 11, 0.15);
            border: 1px solid rgba(245, 158, 11, 0.4);
            color: #fbbf24;
            font-size: 14px;
            font-weight: 700;
            padding: 6px 14px;
            border-radius: 9999px;
            margin-bottom: 20px;
            text-transform: uppercase;
            letter-spacing: 1px;
          }
          h1 {
            font-size: 54px;
            font-weight: 900;
            line-height: 1.1;
            margin-bottom: 16px;
            letter-spacing: -1.5px;
            background: linear-gradient(90deg, #ffffff 30%, #fbbf24 100%);
            -webkit-background-clip: text;
            -webkit-text-fill-color: transparent;
          }
          p {
            font-size: 20px;
            color: #94a3b8;
            line-height: 1.5;
            margin-bottom: 28px;
          }
          .pills {
            display: flex;
            gap: 12px;
          }
          .pill {
            background: #1e293b;
            border: 1px solid #334155;
            padding: 8px 16px;
            border-radius: 8px;
            font-size: 14px;
            color: #cbd5e1;
            font-weight: 600;
          }
          .right img {
            width: 320px;
            height: 320px;
            filter: drop-shadow(0 25px 60px rgba(245, 158, 11, 0.4));
          }
        </style>
      </head>
      <body>
        <div class="left">
          <div class="badge">Local-First • Manifest V3</div>
          <h1>Turn any webpage into AI-ready Context.</h1>
          <p>Extract articles cleanly, remove noise & ads, convert to GFM Markdown with CJK-aware token estimation.</p>
          <div class="pills">
            <div class="pill">⚡ One-Click Copy</div>
            <div class="pill">🎯 Element Picker</div>
            <div class="pill">✨ Prompt Presets</div>
            <div class="pill">🔒 Zero Telemetry</div>
          </div>
        </div>
        <div class="right">
          <img src="${logoSrc}" alt="ContextLion" />
        </div>
      </body>
    </html>
  `)
  const marqueePath = path.join(rootDir, 'assets/store/marquee-promo-1400x560.png')
  await page.screenshot({ path: marqueePath })
  console.log(`Generated: ${marqueePath}`)

  await browser.close()
}

generate().catch((err) => {
  console.error(err)
  process.exit(1)
})
