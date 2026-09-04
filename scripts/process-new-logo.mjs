import { chromium } from '@playwright/test'
import fs from 'fs'
import path from 'path'
import { fileURLToPath } from 'url'

const __dirname = path.dirname(fileURLToPath(import.meta.url))
const rootDir = path.resolve(__dirname, '..')

const uploadedImgPath =
  '/Users/changtingyu/.gemini/antigravity/brain/8eaee29b-57f5-4ed0-ae78-6af163f482e9/.user_uploaded/media_1788534844260.jpg'
const imgBase64 = fs.readFileSync(uploadedImgPath).toString('base64')

async function processLogo() {
  const browser = await chromium.launch()
  const page = await browser.newPage()

  await page.setContent('<canvas id="c"></canvas>')

  // Process and generate images inside browser canvas
  const results = await page.evaluate(async (base64) => {
    // Helper to load image
    const loadImg = (src) =>
      new Promise((resolve) => {
        const img = new Image()
        img.onload = () => resolve(img)
        img.src = src
      })

    const rawImg = await loadImg('data:image/jpeg;base64,' + base64)

    // Step 1: Draw on 1024x1024 canvas and remove pure black background
    const masterCanvas = document.createElement('canvas')
    masterCanvas.width = 1024
    masterCanvas.height = 1024
    const mctx = masterCanvas.getContext('2d')
    mctx.drawImage(rawImg, 0, 0)

    const imgData = mctx.getImageData(0, 0, 1024, 1024)
    const d = imgData.data

    // BFS Flood fill from edges
    const visited = new Uint8Array(1024 * 1024)
    const queue = []

    // Seed all 4 edges
    for (let x = 0; x < 1024; x++) {
      queue.push(x) // top
      queue.push(1023 * 1024 + x) // bottom
      visited[x] = 1
      visited[1023 * 1024 + x] = 1
    }
    for (let y = 1; y < 1023; y++) {
      queue.push(y * 1024) // left
      queue.push(y * 1024 + 1023) // right
      visited[y * 1024] = 1
      visited[y * 1024 + 1023] = 1
    }

    let head = 0
    while (head < queue.length) {
      const idx = queue[head++]
      const x = idx % 1024
      const y = Math.floor(idx / 1024)

      const neighbors = []
      if (x > 0) neighbors.push(idx - 1)
      if (x < 1023) neighbors.push(idx + 1)
      if (y > 0) neighbors.push(idx - 1024)
      if (y < 1023) neighbors.push(idx + 1024)

      for (const n of neighbors) {
        if (!visited[n]) {
          const p = n * 4
          const maxVal = Math.max(d[p], d[p + 1], d[p + 2])
          if (maxVal < 36) {
            visited[n] = 1
            queue.push(n)
          }
        }
      }
    }

    // Apply transparency with edge smoothing
    for (let i = 0; i < 1024 * 1024; i++) {
      if (visited[i]) {
        d[i * 4 + 3] = 0
      }
    }
    mctx.putImageData(imgData, 0, 0)

    // Full transparent logo
    const fullTransparentDataUrl = masterCanvas.toDataURL('image/png')

    // Step 2: Extract Emblem (Lion + Document)
    // Strictly clear anything at or below Y=650 so NO text pixels bleed into emblem
    const cleanMaster = document.createElement('canvas')
    cleanMaster.width = 1024
    cleanMaster.height = 1024
    const cmctx = cleanMaster.getContext('2d')
    cmctx.drawImage(masterCanvas, 0, 0)
    cmctx.clearRect(0, 650, 1024, 1024 - 650)

    // Accurate bounding box scan of the lion mascot
    const mData = cmctx.getImageData(0, 0, 1024, 1024).data
    let minX = 1024, minY = 1024, maxX = 0, maxY = 0
    for (let y = 0; y < 650; y++) {
      for (let x = 0; x < 1024; x++) {
        const a = mData[(y * 1024 + x) * 4 + 3]
        if (a > 20) {
          if (x < minX) minX = x
          if (x > maxX) maxX = x
          if (y < minY) minY = y
          if (y > maxY) maxY = y
        }
      }
    }

    const emblemCanvas = document.createElement('canvas')
    emblemCanvas.width = 512
    emblemCanvas.height = 512
    const ectx = emblemCanvas.getContext('2d')
    ectx.imageSmoothingEnabled = true
    ectx.imageSmoothingQuality = 'high'

    // Add safe padding to mascot bounding box (capped at bounds and strictly <= 650)
    const pad = 8
    const cropX = Math.max(0, minX - pad)
    const cropY = Math.max(0, minY - pad)
    const cropW = Math.min(1024 - cropX, (maxX - minX + 1) + pad * 2)
    const cropH = Math.min(650 - cropY, (maxY - minY + 1) + pad * 2)

    // Center in 512x512 with balanced padding
    const maxDimension = 464
    const scale = Math.min(maxDimension / cropW, maxDimension / cropH)
    const dw = Math.round(cropW * scale)
    const dh = Math.round(cropH * scale)
    const dx = Math.round((512 - dw) / 2)
    const dy = Math.round((512 - dh) / 2)

    ectx.drawImage(cleanMaster, cropX, cropY, cropW, cropH, dx, dy, dw, dh)
    const emblemDataUrl = emblemCanvas.toDataURL('image/png')

    // Step 3: Function to generate resized icons from clean emblem
    const makeIcon = (size) => {
      const c = document.createElement('canvas')
      c.width = size
      c.height = size
      const ctx = c.getContext('2d')
      ctx.imageSmoothingEnabled = true
      ctx.imageSmoothingQuality = 'high'
      ctx.drawImage(emblemCanvas, 0, 0, size, size)
      return c.toDataURL('image/png')
    }

    // 128 icon from full logo preserving brand text
    const makeFullIcon = (size) => {
      const c = document.createElement('canvas')
      c.width = size
      c.height = size
      const ctx = c.getContext('2d')
      ctx.imageSmoothingEnabled = true
      ctx.imageSmoothingQuality = 'high'
      ctx.drawImage(masterCanvas, 0, 0, size, size)
      return c.toDataURL('image/png')
    }

    return {
      fullLogo: fullTransparentDataUrl,
      emblem: emblemDataUrl,
      icon16: makeIcon(16),
      icon32: makeIcon(32),
      icon48: makeIcon(48),
      icon128: makeFullIcon(128),
    }
  }, imgBase64)

  const saveBase64 = (filePath, dataUrl) => {
    const base64Data = dataUrl.replace(/^data:image\/png;base64,/, '')
    fs.writeFileSync(filePath, Buffer.from(base64Data, 'base64'))
    console.log(`Saved: ${filePath}`)
  }

  // Save icons
  saveBase64(path.join(rootDir, 'public/logo.png'), results.emblem)
  saveBase64(path.join(rootDir, 'public/logo-full.png'), results.fullLogo)
  saveBase64(path.join(rootDir, 'public/icon-16.png'), results.icon16)
  saveBase64(path.join(rootDir, 'public/icon-32.png'), results.icon32)
  saveBase64(path.join(rootDir, 'public/icon-48.png'), results.icon48)
  saveBase64(path.join(rootDir, 'public/icon-128.png'), results.icon128)
  saveBase64(path.join(rootDir, 'assets/store/icon-128.png'), results.icon128)

  // 4. Update Store Graphics
  // Small Tile (440x280)
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
            background: linear-gradient(135deg, #090d16 0%, #17152d 100%);
            display: flex;
            flex-direction: column;
            align-items: center;
            justify-content: center;
            font-family: -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif;
            color: #ffffff;
            overflow: hidden;
          }
          .icon-wrapper {
            display: flex;
            align-items: center;
            justify-content: center;
            margin-bottom: 12px;
          }
          .icon-wrapper img {
            width: 104px;
            height: 104px;
            filter: drop-shadow(0 10px 25px rgba(245, 158, 11, 0.45));
          }
          h1 {
            font-size: 26px;
            font-weight: 800;
            letter-spacing: -0.5px;
            margin-bottom: 6px;
            background: linear-gradient(90deg, #ffffff 40%, #fbbf24 100%);
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
          <img src="${results.emblem}" alt="ContextLion" />
        </div>
        <h1>ContextLion</h1>
        <p>Turn any webpage into AI-ready Markdown</p>
      </body>
    </html>
  `)
  await page.screenshot({ path: path.join(rootDir, 'assets/store/small-tile-440x280.png') })
  console.log('Saved: assets/store/small-tile-440x280.png')

  // Marquee Banner (1400x560)
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
            background: radial-gradient(circle at 75% 35%, #231f45 0%, #090d16 80%);
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
            display: inline-flex;
            align-items: center;
            gap: 6px;
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
            font-size: 52px;
            font-weight: 900;
            line-height: 1.15;
            margin-bottom: 16px;
            letter-spacing: -1.5px;
            color: #ffffff;
          }
          h1 .highlight {
            background: linear-gradient(90deg, #ffffff 10%, #fbbf24 100%);
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
            display: flex;
            flex-direction: column;
            align-items: center;
            justify-content: center;
          }
          .right img {
            width: 330px;
            height: 330px;
            filter: drop-shadow(0 20px 50px rgba(245, 158, 11, 0.45));
          }
          .brand-lockup {
            display: flex;
            align-items: center;
            margin-top: 14px;
            font-size: 38px;
            font-weight: 800;
            letter-spacing: -0.5px;
          }
          .brand-ctx {
            color: #ffffff;
          }
          .brand-lion {
            background: linear-gradient(135deg, #fbbf24 0%, #f59e0b 100%);
            -webkit-background-clip: text;
            -webkit-text-fill-color: transparent;
          }
        </style>
      </head>
      <body>
        <div class="left">
          <div class="badge">🦁 ContextLion • Manifest V3</div>
          <h1>Turn any webpage into<br/><span class="highlight">AI-ready Context.</span></h1>
          <p>Extract articles cleanly, remove noise & ads, convert to GFM Markdown with CJK-aware token estimation.</p>
          <div class="pills">
            <div class="pill">⚡ One-Click Copy</div>
            <div class="pill">🎯 Element Picker</div>
            <div class="pill">✨ Prompt Presets</div>
            <div class="pill">🔒 Zero Telemetry</div>
          </div>
        </div>
        <div class="right">
          <img src="${results.emblem}" alt="ContextLion" />
          <div class="brand-lockup">
            <span class="brand-ctx">Context</span><span class="brand-lion">Lion</span>
          </div>
        </div>
      </body>
    </html>
  `)
  await page.screenshot({ path: path.join(rootDir, 'assets/store/marquee-promo-1400x560.png') })
  console.log('Saved: assets/store/marquee-promo-1400x560.png')

  await browser.close()
}

processLogo().catch((err) => {
  console.error(err)
  process.exit(1)
})
