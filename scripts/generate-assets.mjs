import { chromium } from '@playwright/test'
import fs from 'fs'
import path from 'path'
import { fileURLToPath } from 'url'

const __dirname = path.dirname(fileURLToPath(import.meta.url))
const rootDir = path.resolve(__dirname, '..')

const svgPath = path.join(rootDir, 'public/icon.svg')
const svgContent = fs.readFileSync(svgPath, 'utf-8')

fs.mkdirSync(path.join(rootDir, 'public'), { recursive: true })
fs.mkdirSync(path.join(rootDir, 'assets/store'), { recursive: true })
fs.mkdirSync(path.join(rootDir, 'assets/screenshots'), { recursive: true })

async function generate() {
  const browser = await chromium.launch()
  const page = await browser.newPage()

  // 1. Generate Extension Icons (16, 32, 48, 128)
  const sizes = [16, 32, 48, 128]
  for (const size of sizes) {
    await page.setViewportSize({ width: size, height: size })
    await page.setContent(`
      <!DOCTYPE html>
      <html>
        <head>
          <style>
            * { margin: 0; padding: 0; box-sizing: border-box; }
            body { width: ${size}px; height: ${size}px; overflow: hidden; background: transparent; }
            svg { width: 100%; height: 100%; display: block; }
          </style>
        </head>
        <body>
          ${svgContent}
        </body>
      </html>
    `)

    const outPath = path.join(rootDir, `public/icon-${size}.png`)
    await page.screenshot({ path: outPath, omitBackground: true })
    console.log(`Generated: ${outPath}`)
  }

  // Copy 128 to assets/store/icon-128.png
  fs.copyFileSync(
    path.join(rootDir, 'public/icon-128.png'),
    path.join(rootDir, 'assets/store/icon-128.png')
  )

  // 2. Generate Store Small Tile (440x280)
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
          .icon-wrapper {
            width: 96px;
            height: 96px;
            margin-bottom: 16px;
            filter: drop-shadow(0 8px 24px rgba(245, 158, 11, 0.4));
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
          ${svgContent}
        </div>
        <h1>ContextLion</h1>
        <p>Turn any webpage into AI-ready Markdown</p>
      </body>
    </html>
  `)
  const smallTilePath = path.join(rootDir, 'assets/store/small-tile-440x280.png')
  await page.screenshot({ path: smallTilePath })
  console.log(`Generated: ${smallTilePath}`)

  // 3. Generate Store Marquee Banner (1400x560)
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
            background: radial-gradient(circle at 70% 30%, #1e1b4b 0%, #090d16 80%);
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
            font-size: 56px;
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
          .right {
            width: 260px;
            height: 260px;
            filter: drop-shadow(0 20px 50px rgba(245, 158, 11, 0.35));
          }
        </style>
      </head>
      <body>
        <div class="left">
          <div class="badge">Local-First • Manifest V3</div>
          <h1>Turn any webpage into AI-ready Context.</h1>
          <p>Extracts articles cleanly, removes noise & ads, converts to GFM Markdown with CJK-aware token estimation.</p>
          <div class="pills">
            <div class="pill">⚡ One-Click Copy</div>
            <div class="pill">🧹 Noise Cleaner</div>
            <div class="pill">📊 Token Estimator</div>
            <div class="pill">🔒 Zero Telemetry</div>
          </div>
        </div>
        <div class="right">
          ${svgContent}
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
