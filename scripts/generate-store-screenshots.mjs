import { chromium } from '@playwright/test'
import fs from 'fs'
import path from 'path'
import { fileURLToPath } from 'url'

const __dirname = path.dirname(fileURLToPath(import.meta.url))
const rootDir = path.resolve(__dirname, '..')

const logoBase64 = fs.readFileSync(path.join(rootDir, 'public/logo.png')).toString('base64')
const logoDataUrl = `data:image/png;base64,${logoBase64}`

const screenshotsDir = path.join(rootDir, 'assets/store/screenshots')
fs.mkdirSync(screenshotsDir, { recursive: true })

const commonStyles = `
  * { margin: 0; padding: 0; box-sizing: border-box; }
  body {
    width: 1280px;
    height: 800px;
    background: radial-gradient(ellipse at 50% 0%, #1e1938 0%, #0c0f18 65%, #07090f 100%);
    font-family: -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, "Helvetica Neue", Arial, sans-serif;
    color: #f8fafc;
    overflow: hidden;
    position: relative;
    display: flex;
    flex-direction: column;
    align-items: center;
    padding: 32px 48px 0;
  }

  .header {
    text-align: center;
    margin-bottom: 22px;
  }
  .badge {
    display: inline-flex;
    align-items: center;
    gap: 6px;
    background: rgba(245, 158, 11, 0.15);
    border: 1px solid rgba(245, 158, 11, 0.4);
    color: #fbbf24;
    font-size: 12px;
    font-weight: 700;
    letter-spacing: 1px;
    text-transform: uppercase;
    padding: 5px 14px;
    border-radius: 9999px;
    margin-bottom: 8px;
  }
  .title {
    font-size: 32px;
    font-weight: 800;
    letter-spacing: -0.8px;
    margin-bottom: 6px;
    background: linear-gradient(135deg, #ffffff 45%, #fbbf24 100%);
    -webkit-background-clip: text;
    -webkit-text-fill-color: transparent;
  }
  .subtitle {
    font-size: 15px;
    color: #94a3b8;
    font-weight: 400;
  }

  .browser-window {
    width: 1184px;
    height: 640px;
    background: #0f131f;
    border-radius: 12px 12px 0 0;
    border: 1px solid rgba(255, 255, 255, 0.12);
    border-bottom: none;
    box-shadow: 0 25px 60px -15px rgba(0, 0, 0, 0.8), 0 0 40px rgba(245, 158, 11, 0.08);
    display: flex;
    flex-direction: column;
    overflow: hidden;
  }
  .window-bar {
    height: 44px;
    background: #141a29;
    border-bottom: 1px solid rgba(255, 255, 255, 0.08);
    display: flex;
    align-items: center;
    padding: 0 16px;
    gap: 16px;
  }
  .window-dots {
    display: flex;
    gap: 8px;
  }
  .dot {
    width: 12px;
    height: 12px;
    border-radius: 50%;
  }
  .dot.red { background: #ef4444; }
  .dot.yellow { background: #f59e0b; }
  .dot.green { background: #10b981; }

  .url-bar {
    flex: 1;
    max-width: 600px;
    height: 28px;
    background: #0b0e17;
    border-radius: 6px;
    border: 1px solid rgba(255, 255, 255, 0.08);
    display: flex;
    align-items: center;
    padding: 0 12px;
    gap: 8px;
    font-size: 12px;
    color: #94a3b8;
  }
  .url-bar span.domain { color: #f8fafc; font-weight: 600; }
  .url-bar span.path { color: #64748b; }

  .ext-icon-bar {
    display: flex;
    align-items: center;
    gap: 8px;
    margin-left: auto;
  }
  .ext-btn {
    display: flex;
    align-items: center;
    justify-content: center;
    width: 30px;
    height: 30px;
    border-radius: 6px;
    background: rgba(245, 158, 11, 0.2);
    border: 1px solid rgba(245, 158, 11, 0.4);
  }
  .ext-btn img {
    width: 20px;
    height: 20px;
  }

  .window-content {
    flex: 1;
    display: flex;
    position: relative;
    background: #090d16;
    overflow: hidden;
  }
`

// Screenshot 1: One-Click Web-to-Markdown Context & Instant Token Estimate
const screenshot1HTML = `
<!DOCTYPE html>
<html>
  <head><style>${commonStyles}
    .webpage {
      flex: 1;
      padding: 36px 44px;
      overflow: hidden;
      color: #cbd5e1;
      background: #0b0f19;
      border-right: 1px solid rgba(255, 255, 255, 0.08);
    }
    .article-tag {
      color: #38bdf8;
      font-size: 12px;
      font-weight: 700;
      text-transform: uppercase;
      letter-spacing: 0.5px;
      margin-bottom: 8px;
    }
    .article-title {
      font-size: 26px;
      font-weight: 800;
      color: #ffffff;
      line-height: 1.3;
      margin-bottom: 12px;
    }
    .article-meta {
      display: flex;
      gap: 16px;
      font-size: 13px;
      color: #64748b;
      margin-bottom: 24px;
    }
    .article-body p {
      font-size: 14px;
      line-height: 1.65;
      margin-bottom: 16px;
      color: #94a3b8;
    }
    .code-box {
      background: #05070c;
      border: 1px solid #1e293b;
      border-radius: 8px;
      padding: 14px 16px;
      font-family: ui-monospace, SFMono-Regular, Menlo, Monaco, Consolas, monospace;
      font-size: 12px;
      color: #38bdf8;
      line-height: 1.6;
      margin-bottom: 16px;
    }

    /* Extension Popup Mockup */
    .popup-wrapper {
      width: 440px;
      background: #111625;
      display: flex;
      flex-direction: column;
      box-shadow: -10px 0 30px rgba(0,0,0,0.5);
    }
    .popup-header {
      padding: 14px 18px;
      display: flex;
      align-items: center;
      justify-content: space-between;
      border-bottom: 1px solid #1e293b;
      background: #141a2a;
    }
    .popup-brand {
      display: flex;
      align-items: center;
      gap: 10px;
    }
    .popup-brand img { width: 26px; height: 26px; }
    .popup-brand span.name { font-size: 16px; font-weight: 800; color: #ffffff; }
    .popup-brand span.version {
      font-size: 11px;
      font-weight: 700;
      color: #fbbf24;
      background: rgba(245, 158, 11, 0.15);
      padding: 2px 6px;
      border-radius: 4px;
    }

    .mode-bar {
      display: flex;
      background: #0d121f;
      padding: 6px 12px;
      gap: 6px;
      border-bottom: 1px solid #1e293b;
    }
    .mode-btn {
      flex: 1;
      padding: 6px 0;
      text-align: center;
      font-size: 12px;
      font-weight: 600;
      color: #64748b;
      border-radius: 6px;
    }
    .mode-btn.active {
      background: #1e293b;
      color: #ffffff;
      border: 1px solid #334155;
    }

    .popup-body {
      padding: 18px;
      flex: 1;
      display: flex;
      flex-direction: column;
      gap: 14px;
      overflow: hidden;
    }

    .stat-card {
      background: #171f33;
      border: 1px solid #23304d;
      border-radius: 8px;
      padding: 12px;
    }
    .stat-title {
      font-size: 13px;
      font-weight: 700;
      color: #f8fafc;
      margin-bottom: 8px;
      white-space: nowrap;
      overflow: hidden;
      text-overflow: ellipsis;
    }
    .stat-chips {
      display: flex;
      gap: 8px;
    }
    .stat-chip {
      display: flex;
      align-items: center;
      gap: 4px;
      font-size: 11px;
      font-weight: 700;
      padding: 4px 8px;
      border-radius: 4px;
      background: #0f1524;
      color: #94a3b8;
      border: 1px solid #1e293b;
    }
    .stat-chip.token {
      background: rgba(245, 158, 11, 0.15);
      color: #fbbf24;
      border-color: rgba(245, 158, 11, 0.35);
    }
    .stat-chip.cjk {
      background: rgba(56, 189, 248, 0.15);
      color: #38bdf8;
      border-color: rgba(56, 189, 248, 0.35);
    }

    .btn-primary {
      background: linear-gradient(135deg, #f59e0b 0%, #d97706 100%);
      color: #ffffff;
      font-size: 14px;
      font-weight: 700;
      padding: 12px;
      border-radius: 8px;
      border: none;
      display: flex;
      align-items: center;
      justify-content: center;
      gap: 8px;
      box-shadow: 0 4px 14px rgba(245, 158, 11, 0.35);
    }
    .btn-row {
      display: flex;
      gap: 8px;
    }
    .btn-secondary {
      flex: 1;
      background: #1e293b;
      color: #e2e8f0;
      font-size: 12px;
      font-weight: 600;
      padding: 8px 12px;
      border-radius: 6px;
      border: 1px solid #334155;
      text-align: center;
    }

    .preview-box {
      flex: 1;
      background: #0b0f19;
      border: 1px solid #1e293b;
      border-radius: 8px;
      padding: 12px;
      font-family: ui-monospace, SFMono-Regular, Menlo, Monaco, Consolas, monospace;
      font-size: 11px;
      color: #94a3b8;
      line-height: 1.5;
      overflow: hidden;
    }
    .preview-box .h1 { color: #f59e0b; font-weight: 700; margin-bottom: 4px; }
    .preview-box .quote { color: #38bdf8; margin-bottom: 6px; }

    .popup-footer {
      padding: 10px 18px;
      background: #0d121f;
      border-top: 1px solid #1e293b;
      display: flex;
      justify-content: space-between;
      font-size: 11px;
      color: #64748b;
    }
  </style></head>
  <body>
    <div class="header">
      <div class="badge">⚡ ONE-CLICK AI CONTEXT</div>
      <h1 class="title">Turn Any Webpage into Clean, AI-Ready Markdown</h1>
      <p class="subtitle">Strip ads, navigation & noise • CJK-aware LLM token estimation • Formatted for Claude, ChatGPT & Gemini</p>
    </div>
    <div class="browser-window">
      <div class="window-bar">
        <div class="window-dots"><span class="dot red"></span><span class="dot yellow"></span><span class="dot green"></span></div>
        <div class="url-bar">
          <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="#10b981" stroke-width="2"><rect x="3" y="11" width="18" height="11" rx="2" ry="2"/><path d="M7 11V7a5 5 0 0 1 10 0v4"/></svg>
          <span class="domain">blog.langchain.dev</span><span class="path">/optimizing-llm-context-windows/</span>
        </div>
        <div class="ext-icon-bar">
          <div class="ext-btn"><img src="${logoDataUrl}" alt="ContextLion" /></div>
        </div>
      </div>
      <div class="window-content">
        <div class="webpage">
          <div class="article-tag">AI Engineering • RAG Architecture</div>
          <h2 class="article-title">Optimizing LLM Context Windows: Techniques for RAG & Multi-Agent Systems</h2>
          <div class="article-meta"><span>By Harrison Chase</span><span>•</span><span>Published Nov 2025</span><span>•</span><span>8 min read</span></div>
          <div class="article-body">
            <p>Modern Large Language Models boast massive context windows exceeding 1M tokens. However, the phenomenon of "Lost in the Middle" remains a critical architectural bottleneck when packing raw web content.</p>
            <div class="code-box">
              // Efficient Markdown context compression<br/>
              const compressedContext = await contextLion.extractCleanMarkdown(dom);<br/>
              const tokens = contextLion.estimateTokens(compressedContext, { cjk: true });
            </div>
            <p>By extracting semantic DOM nodes and discarding navigation menus, footer links, and cookie banners, developers can reduce prompt token consumption by up to 68% while boosting retrieval accuracy.</p>
          </div>
        </div>
        <div class="popup-wrapper">
          <div class="popup-header">
            <div class="popup-brand">
              <img src="${logoDataUrl}" alt="ContextLion" />
              <span class="name">ContextLion</span>
              <span class="version">v1.0.0</span>
            </div>
            <span style="color:#64748b; font-size:16px;">⚙️</span>
          </div>
          <div class="mode-bar">
            <div class="mode-btn active">📑 Page</div>
            <div class="mode-btn">✂️ Selection</div>
            <div class="mode-btn">🎯 Picker</div>
            <div class="mode-btn">📦 Pack</div>
          </div>
          <div class="popup-body">
            <div class="stat-card">
              <div class="stat-title">Optimizing LLM Context Windows: Techniques for RAG...</div>
              <div class="stat-chips">
                <div class="stat-chip token">⚡ 1,420 Tokens</div>
                <div class="stat-chip cjk">🌐 CJK / Latin</div>
                <div class="stat-chip">💾 ~4.8 KB</div>
                <div class="stat-chip">⏱️ 4 min</div>
              </div>
            </div>
            <button class="btn-primary">✨ Copy AI Context (Ready for Prompting)</button>
            <div class="btn-row">
              <div class="btn-secondary">📋 Copy Raw MD</div>
              <div class="btn-secondary">💾 Download .md</div>
            </div>
            <div class="preview-box">
              <div class="h1"># Optimizing LLM Context Windows</div>
              <div class="quote">> Source: https://blog.langchain.dev/optimizing-llm-context-windows/</div>
              <p>Modern Large Language Models boast massive context windows. However, extracting semantic Markdown is critical...</p>
            </div>
          </div>
          <div class="popup-footer">
            <span>🔒 Local-first • Zero telemetry</span>
            <span>Manifest V3</span>
          </div>
        </div>
      </div>
    </div>
  </body>
</html>
`

// Screenshot 2: AI Prompt Presets (TL;DR, Key Takeaways, Code & Translations)
const screenshot2HTML = `
<!DOCTYPE html>
<html>
  <head><style>${commonStyles}
    .container {
      display: flex;
      flex: 1;
      padding: 30px 48px;
      gap: 32px;
      align-items: center;
      justify-content: center;
    }
    .preset-panel {
      width: 480px;
      background: #111625;
      border: 1px solid #1e293b;
      border-radius: 12px;
      box-shadow: 0 20px 40px rgba(0,0,0,0.6);
      overflow: hidden;
    }
    .panel-header {
      padding: 16px 20px;
      background: #141a2a;
      border-bottom: 1px solid #1e293b;
      display: flex;
      align-items: center;
      justify-content: space-between;
    }
    .panel-header h3 {
      font-size: 16px;
      font-weight: 700;
      color: #ffffff;
      display: flex;
      align-items: center;
      gap: 8px;
    }
    .preset-list {
      padding: 12px;
      display: flex;
      flex-direction: column;
      gap: 8px;
    }
    .preset-item {
      display: flex;
      align-items: center;
      justify-content: space-between;
      padding: 12px 14px;
      border-radius: 8px;
      background: #161e31;
      border: 1px solid #23304d;
    }
    .preset-item.active {
      background: rgba(245, 158, 11, 0.12);
      border-color: #f59e0b;
    }
    .preset-info {
      display: flex;
      align-items: center;
      gap: 10px;
    }
    .preset-icon {
      font-size: 18px;
    }
    .preset-name {
      font-size: 13px;
      font-weight: 700;
      color: #ffffff;
    }
    .preset-desc {
      font-size: 11px;
      color: #94a3b8;
    }
    .preset-badge {
      font-size: 11px;
      font-weight: 700;
      color: #10b981;
      background: rgba(16, 185, 129, 0.15);
      padding: 3px 8px;
      border-radius: 4px;
    }

    .output-panel {
      flex: 1;
      background: #0d111c;
      border: 1px solid #1e293b;
      border-radius: 12px;
      padding: 24px;
      display: flex;
      flex-direction: column;
      height: 480px;
    }
    .output-header {
      display: flex;
      justify-content: space-between;
      align-items: center;
      margin-bottom: 16px;
      padding-bottom: 12px;
      border-bottom: 1px solid #1e293b;
    }
    .output-badge {
      color: #fbbf24;
      font-size: 12px;
      font-weight: 700;
      display: flex;
      align-items: center;
      gap: 6px;
    }
    .output-code {
      flex: 1;
      font-family: ui-monospace, SFMono-Regular, Menlo, Monaco, Consolas, monospace;
      font-size: 12px;
      line-height: 1.6;
      color: #e2e8f0;
      overflow: hidden;
      background: #060910;
      padding: 16px;
      border-radius: 8px;
      border: 1px solid #1e293b;
    }
    .prompt-text { color: #f59e0b; font-weight: 600; }
    .context-tag { color: #64748b; font-weight: 700; }
    .toast-pill {
      background: #059669;
      color: #ffffff;
      font-size: 12px;
      font-weight: 700;
      padding: 6px 14px;
      border-radius: 9999px;
      display: inline-flex;
      align-items: center;
      gap: 6px;
      box-shadow: 0 4px 12px rgba(5, 150, 105, 0.4);
    }
  </style></head>
  <body>
    <div class="header">
      <div class="badge">✨ AI PROMPT PRESETS</div>
      <h1 class="title">Pre-Configured Prompts for Instant LLM Workflows</h1>
      <p class="subtitle">One-click TL;DR summaries, key takeaways, code extraction & translations ready for ChatGPT, Claude & Gemini</p>
    </div>
    <div class="browser-window">
      <div class="window-bar">
        <div class="window-dots"><span class="dot red"></span><span class="dot yellow"></span><span class="dot green"></span></div>
        <div class="url-bar">
          <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="#10b981" stroke-width="2"><rect x="3" y="11" width="18" height="11" rx="2" ry="2"/><path d="M7 11V7a5 5 0 0 1 10 0v4"/></svg>
          <span class="domain">contextlion.ai</span><span class="path">/prompt-engine</span>
        </div>
        <div class="ext-icon-bar">
          <div class="ext-btn"><img src="${logoDataUrl}" alt="ContextLion" /></div>
        </div>
      </div>
      <div class="window-content">
        <div class="container">
          <div class="preset-panel">
            <div class="panel-header">
              <h3><span>✨</span> Select AI Prompt Preset</h3>
              <span class="toast-pill">✓ Copied!</span>
            </div>
            <div class="preset-list">
              <div class="preset-item active">
                <div class="preset-info">
                  <span class="preset-icon">⚡</span>
                  <div>
                    <div class="preset-name">Executive Summary (TL;DR)</div>
                    <div class="preset-desc">Concise overview with 3 critical bullet points</div>
                  </div>
                </div>
                <span class="preset-badge">Active</span>
              </div>
              <div class="preset-item">
                <div class="preset-info">
                  <span class="preset-icon">🎯</span>
                  <div>
                    <div class="preset-name">Key Action Items & Takeaways</div>
                    <div class="preset-desc">Extract actionable findings and conclusions</div>
                  </div>
                </div>
              </div>
              <div class="preset-item">
                <div class="preset-info">
                  <span class="preset-icon">👶</span>
                  <div>
                    <div class="preset-name">Explain Like I'm 5 (ELIF)</div>
                    <div class="preset-desc">Simplify technical jargon into intuitive concepts</div>
                  </div>
                </div>
              </div>
              <div class="preset-item">
                <div class="preset-info">
                  <span class="preset-icon">🌐</span>
                  <div>
                    <div class="preset-name">Translate to Traditional Chinese</div>
                    <div class="preset-desc">Polished Taiwanese Mandarin technical translation</div>
                  </div>
                </div>
              </div>
              <div class="preset-item">
                <div class="preset-info">
                  <span class="preset-icon">💻</span>
                  <div>
                    <div class="preset-name">Extract Code & API Schema</div>
                    <div class="preset-desc">Isolate code snippets, endpoints, and interfaces</div>
                  </div>
                </div>
              </div>
            </div>
          </div>
          <div class="output-panel">
            <div class="output-header">
              <div class="output-badge">⚡ Generated LLM Prompt Output</div>
              <div style="font-size:12px; color:#94a3b8;">1,495 Tokens • Ready to paste</div>
            </div>
            <div class="output-code">
              <span class="prompt-text">You are an expert executive researcher. Please provide a high-level TL;DR summary of the provided context, followed by 3 core strategic insights and implementation details.</span><br/><br/>
              <span class="context-tag">&lt;context&gt;</span><br/>
              # Optimizing LLM Context Windows: Techniques for RAG & Agents<br/>
              Source: https://blog.langchain.dev/optimizing-llm-context-windows/<br/>
              Date: 2025-11-14 | Estimated Tokens: 1,420<br/><br/>
              ## 1. Architectural Overview<br/>
              Modern Large Language Models boast context windows exceeding 1M tokens. However, the phenomenon of "Lost in the Middle" remains an active research challenge...<br/>
              <span class="context-tag">&lt;/context&gt;</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  </body>
</html>
`

// Screenshot 3: Interactive Visual Element Picker (Surgical Extraction)
const screenshot3HTML = `
<!DOCTYPE html>
<html>
  <head><style>${commonStyles}
    .picker-page {
      flex: 1;
      padding: 36px 48px;
      display: flex;
      flex-direction: column;
      position: relative;
      background: #090d16;
    }
    .page-title {
      font-size: 24px;
      font-weight: 800;
      color: #ffffff;
      margin-bottom: 20px;
    }
    
    /* Target Element with Highlight Box */
    .table-card {
      background: #0f1523;
      border: 2px solid #f59e0b;
      border-radius: 10px;
      padding: 20px;
      position: relative;
      box-shadow: 0 0 35px rgba(245, 158, 11, 0.25);
    }
    .picker-tag {
      position: absolute;
      top: -14px;
      left: 20px;
      background: #f59e0b;
      color: #000000;
      font-size: 11px;
      font-weight: 800;
      padding: 4px 10px;
      border-radius: 6px;
      text-transform: uppercase;
      letter-spacing: 0.5px;
      box-shadow: 0 2px 8px rgba(245, 158, 11, 0.5);
    }

    table {
      width: 100%;
      border-collapse: collapse;
      font-size: 13px;
    }
    th {
      text-align: left;
      padding: 10px 14px;
      color: #94a3b8;
      border-bottom: 1px solid #1e293b;
      font-weight: 600;
    }
    td {
      padding: 12px 14px;
      color: #e2e8f0;
      border-bottom: 1px solid rgba(255, 255, 255, 0.05);
    }
    tr:hover td { background: rgba(245, 158, 11, 0.05); }

    /* Floating Toast Indicator */
    .floating-toast {
      position: absolute;
      bottom: 30px;
      left: 50%;
      transform: translateX(-50%);
      background: #141a29;
      border: 1px solid #f59e0b;
      padding: 12px 24px;
      border-radius: 9999px;
      display: flex;
      align-items: center;
      gap: 12px;
      box-shadow: 0 10px 30px rgba(0,0,0,0.8), 0 0 20px rgba(245, 158, 11, 0.3);
    }
    .toast-icon { font-size: 18px; }
    .toast-text { font-size: 13px; font-weight: 700; color: #ffffff; }
    .toast-sub { font-size: 12px; color: #94a3b8; }
    .toast-key {
      background: #1e293b;
      padding: 2px 6px;
      border-radius: 4px;
      font-family: monospace;
      color: #cbd5e1;
      font-size: 11px;
    }
  </style></head>
  <body>
    <div class="header">
      <div class="badge">🎯 SURGICAL ELEMENT PICKER</div>
      <h1 class="title">Extract Specific Tables, Code Blocks, or Articles</h1>
      <p class="subtitle">Hover and click any section on the page • Bypass ads, comments, navigation bars & footers</p>
    </div>
    <div class="browser-window">
      <div class="window-bar">
        <div class="window-dots"><span class="dot red"></span><span class="dot yellow"></span><span class="dot green"></span></div>
        <div class="url-bar">
          <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="#10b981" stroke-width="2"><rect x="3" y="11" width="18" height="11" rx="2" ry="2"/><path d="M7 11V7a5 5 0 0 1 10 0v4"/></svg>
          <span class="domain">huggingface.co</span><span class="path">/spaces/leaderboard/llm-benchmark</span>
        </div>
        <div class="ext-icon-bar">
          <div class="ext-btn"><img src="${logoDataUrl}" alt="ContextLion" /></div>
        </div>
      </div>
      <div class="window-content">
        <div class="picker-page">
          <div class="page-title">Frontier LLM Technical Benchmark & Context Window Capabilities</div>
          <div class="table-card">
            <div class="picker-tag">🎯 Selected: &lt;table.benchmark-matrix&gt; (Click to Capture)</div>
            <table>
              <thead>
                <tr>
                  <th>Model Architecture</th>
                  <th>Context Window</th>
                  <th>Needle in Haystack</th>
                  <th>Cost per 1M Input</th>
                  <th>Output Speed</th>
                </tr>
              </thead>
              <tbody>
                <tr>
                  <td><strong>Claude 3.5 Sonnet</strong></td>
                  <td><span style="color:#fbbf24; font-weight:700;">200,000 tokens</span></td>
                  <td><span style="color:#10b981; font-weight:700;">99.8%</span></td>
                  <td>$3.00</td>
                  <td>82 tok/s</td>
                </tr>
                <tr>
                  <td><strong>GPT-4o (Omni)</strong></td>
                  <td><span style="color:#fbbf24; font-weight:700;">128,000 tokens</span></td>
                  <td><span style="color:#10b981; font-weight:700;">99.4%</span></td>
                  <td>$2.50</td>
                  <td>94 tok/s</td>
                </tr>
                <tr>
                  <td><strong>Gemini 1.5 Pro</strong></td>
                  <td><span style="color:#fbbf24; font-weight:700;">1,000,000 tokens</span></td>
                  <td><span style="color:#10b981; font-weight:700;">99.7%</span></td>
                  <td>$3.50</td>
                  <td>68 tok/s</td>
                </tr>
                <tr>
                  <td><strong>DeepSeek V3</strong></td>
                  <td><span style="color:#fbbf24; font-weight:700;">64,000 tokens</span></td>
                  <td><span style="color:#10b981; font-weight:700;">98.9%</span></td>
                  <td>$0.14</td>
                  <td>60 tok/s</td>
                </tr>
              </tbody>
            </table>
          </div>
          <div class="floating-toast">
            <span class="toast-icon">🎯</span>
            <div>
              <span class="toast-text">Element Selected: </span>
              <span class="toast-sub">Click to instantly convert to GFM Markdown • Press <span class="toast-key">ESC</span> to cancel</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  </body>
</html>
`

// Screenshot 4: Multi-Tab Context Pack & Batch ZIP Export
const screenshot4HTML = `
<!DOCTYPE html>
<html>
  <head><style>${commonStyles}
    .pack-view {
      flex: 1;
      padding: 30px 48px;
      display: flex;
      gap: 32px;
      align-items: center;
    }
    .tab-list-card {
      width: 580px;
      background: #111625;
      border: 1px solid #1e293b;
      border-radius: 12px;
      padding: 20px;
      display: flex;
      flex-direction: column;
      gap: 14px;
      box-shadow: 0 20px 40px rgba(0,0,0,0.5);
    }
    .list-header {
      display: flex;
      justify-content: space-between;
      align-items: center;
      padding-bottom: 12px;
      border-bottom: 1px solid #1e293b;
    }
    .list-header h3 {
      font-size: 16px;
      font-weight: 700;
      color: #ffffff;
      display: flex;
      align-items: center;
      gap: 8px;
    }
    .tab-item {
      display: flex;
      align-items: center;
      gap: 12px;
      padding: 12px 14px;
      background: #161e31;
      border: 1px solid #23304d;
      border-radius: 8px;
    }
    .checkbox {
      width: 18px;
      height: 18px;
      background: #f59e0b;
      border-radius: 4px;
      display: flex;
      align-items: center;
      justify-content: center;
      color: #000000;
      font-weight: 900;
      font-size: 12px;
    }
    .tab-details {
      flex: 1;
      overflow: hidden;
    }
    .tab-name {
      font-size: 13px;
      font-weight: 700;
      color: #ffffff;
      white-space: nowrap;
      overflow: hidden;
      text-overflow: ellipsis;
    }
    .tab-domain {
      font-size: 11px;
      color: #64748b;
    }
    .tab-tokens {
      font-size: 11px;
      font-weight: 700;
      color: #fbbf24;
      background: rgba(245, 158, 11, 0.15);
      padding: 3px 8px;
      border-radius: 4px;
    }

    .summary-card {
      flex: 1;
      background: #131929;
      border: 1px solid #1e293b;
      border-radius: 12px;
      padding: 24px;
      display: flex;
      flex-direction: column;
      gap: 18px;
    }
    .summary-title {
      font-size: 18px;
      font-weight: 800;
      color: #ffffff;
      display: flex;
      align-items: center;
      gap: 8px;
    }
    .metric-grid {
      display: grid;
      grid-template-columns: 1fr 1fr;
      gap: 12px;
    }
    .metric-box {
      background: #0c101a;
      border: 1px solid #1e293b;
      padding: 14px;
      border-radius: 8px;
    }
    .metric-num { font-size: 22px; font-weight: 800; color: #fbbf24; }
    .metric-label { font-size: 12px; color: #94a3b8; margin-top: 4px; }

    .btn-pack {
      background: linear-gradient(135deg, #f59e0b 0%, #d97706 100%);
      color: #ffffff;
      font-size: 14px;
      font-weight: 700;
      padding: 14px;
      border-radius: 8px;
      border: none;
      display: flex;
      align-items: center;
      justify-content: center;
      gap: 8px;
      box-shadow: 0 4px 16px rgba(245, 158, 11, 0.4);
    }
    .btn-zip {
      background: #1e293b;
      color: #f8fafc;
      font-size: 13px;
      font-weight: 600;
      padding: 12px;
      border-radius: 8px;
      border: 1px solid #334155;
      text-align: center;
    }
  </style></head>
  <body>
    <div class="header">
      <div class="badge">📦 CONTEXT PACK & BATCH EXPORT</div>
      <h1 class="title">Bundle Multiple Tabs into One LLM Context or ZIP</h1>
      <p class="subtitle">Aggregate research across multiple open tabs • Unified token estimation • Structured ZIP archive export</p>
    </div>
    <div class="browser-window">
      <div class="window-bar">
        <div class="window-dots"><span class="dot red"></span><span class="dot yellow"></span><span class="dot green"></span></div>
        <div class="url-bar">
          <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="#10b981" stroke-width="2"><rect x="3" y="11" width="18" height="11" rx="2" ry="2"/><path d="M7 11V7a5 5 0 0 1 10 0v4"/></svg>
          <span class="domain">contextlion.ai</span><span class="path">/multi-tab-context-pack</span>
        </div>
        <div class="ext-icon-bar">
          <div class="ext-btn"><img src="${logoDataUrl}" alt="ContextLion" /></div>
        </div>
      </div>
      <div class="window-content">
        <div class="pack-view">
          <div class="tab-list-card">
            <div class="list-header">
              <h3><span>📑</span> Open Research Tabs (4 Selected)</h3>
              <span style="font-size:12px; color:#fbbf24; font-weight:600;">Select All</span>
            </div>
            <div class="tab-item">
              <div class="checkbox">✓</div>
              <div class="tab-details">
                <div class="tab-name">DeepSeek V3 Technical Architecture & Inference Scaling</div>
                <div class="tab-domain">github.com/deepseek-ai</div>
              </div>
              <div class="tab-tokens">⚡ 3,420 Tok</div>
            </div>
            <div class="tab-item">
              <div class="checkbox">✓</div>
              <div class="tab-details">
                <div class="tab-name">Anthropic: Prompt Engineering Interactive Guide</div>
                <div class="tab-domain">docs.anthropic.com</div>
              </div>
              <div class="tab-tokens">⚡ 2,180 Tok</div>
            </div>
            <div class="tab-item">
              <div class="checkbox">✓</div>
              <div class="tab-details">
                <div class="tab-name">OpenAI: Structured Outputs & JSON Schema Mode</div>
                <div class="tab-domain">platform.openai.com</div>
              </div>
              <div class="tab-tokens">⚡ 1,860 Tok</div>
            </div>
            <div class="tab-item">
              <div class="checkbox">✓</div>
              <div class="tab-details">
                <div class="tab-name">vLLM: High-Throughput PagedAttention Architecture</div>
                <div class="tab-domain">vllm.ai/docs</div>
              </div>
              <div class="tab-tokens">⚡ 2,640 Tok</div>
            </div>
          </div>
          <div class="summary-card">
            <div class="summary-title"><span>📦</span> Context Pack Summary</div>
            <div class="metric-grid">
              <div class="metric-box">
                <div class="metric-num">10,100</div>
                <div class="metric-label">Aggregated Tokens</div>
              </div>
              <div class="metric-box">
                <div class="metric-num">4 / 4</div>
                <div class="metric-label">Tabs Processed</div>
              </div>
              <div class="metric-box">
                <div class="metric-num">34.8 KB</div>
                <div class="metric-label">Clean Markdown Size</div>
              </div>
              <div class="metric-box">
                <div class="metric-num">100%</div>
                <div class="metric-label">Local Processing</div>
              </div>
            </div>
            <button class="btn-pack">✨ Copy Combined AI Context Pack</button>
            <div class="btn-zip">📥 Export Structured ZIP Archive (.zip)</div>
          </div>
        </div>
      </div>
    </div>
  </body>
</html>
`

// Screenshot 5: Local-First Privacy & Rich Customization Options
const screenshot5HTML = `
<!DOCTYPE html>
<html>
  <head><style>${commonStyles}
    .options-view {
      flex: 1;
      padding: 32px 56px;
      display: flex;
      flex-direction: column;
      gap: 20px;
      overflow: hidden;
    }
    .opt-header {
      display: flex;
      align-items: center;
      justify-content: space-between;
      padding-bottom: 16px;
      border-bottom: 1px solid #1e293b;
    }
    .opt-brand {
      display: flex;
      align-items: center;
      gap: 12px;
    }
    .opt-brand img { width: 36px; height: 36px; }
    .opt-brand h2 { font-size: 20px; font-weight: 800; color: #ffffff; }
    .opt-badge {
      display: inline-flex;
      align-items: center;
      gap: 6px;
      background: rgba(16, 185, 129, 0.15);
      border: 1px solid rgba(16, 185, 129, 0.4);
      color: #10b981;
      font-size: 12px;
      font-weight: 700;
      padding: 4px 12px;
      border-radius: 9999px;
    }

    .cards-grid {
      display: grid;
      grid-template-columns: 1fr 1fr;
      gap: 20px;
    }
    .opt-card {
      background: #111625;
      border: 1px solid #1e293b;
      border-radius: 10px;
      padding: 20px;
      display: flex;
      flex-direction: column;
      gap: 14px;
    }
    .card-head {
      font-size: 15px;
      font-weight: 700;
      color: #ffffff;
      display: flex;
      align-items: center;
      gap: 8px;
    }
    .opt-row {
      display: flex;
      align-items: center;
      justify-content: space-between;
      font-size: 13px;
      color: #cbd5e1;
      padding: 6px 0;
    }
    .opt-desc { font-size: 11px; color: #64748b; margin-top: 2px; }
    .toggle {
      width: 42px;
      height: 24px;
      background: #f59e0b;
      border-radius: 12px;
      position: relative;
    }
    .toggle-dot {
      width: 18px;
      height: 18px;
      background: #ffffff;
      border-radius: 50%;
      position: absolute;
      top: 3px;
      right: 3px;
    }
    .select-box {
      background: #0c101a;
      border: 1px solid #334155;
      color: #fbbf24;
      font-size: 12px;
      font-weight: 700;
      padding: 6px 12px;
      border-radius: 6px;
    }
  </style></head>
  <body>
    <div class="header">
      <div class="badge">🔒 ZERO TELEMETRY • LOCAL-FIRST</div>
      <h1 class="title">Complete Privacy with Rich Customization Options</h1>
      <p class="subtitle">100% client-side DOM processing • Zero external server dependencies • Manifest V3 verified</p>
    </div>
    <div class="browser-window">
      <div class="window-bar">
        <div class="window-dots"><span class="dot red"></span><span class="dot yellow"></span><span class="dot green"></span></div>
        <div class="url-bar">
          <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="#10b981" stroke-width="2"><rect x="3" y="11" width="18" height="11" rx="2" ry="2"/><path d="M7 11V7a5 5 0 0 1 10 0v4"/></svg>
          <span class="domain">chrome-extension://context-lion</span><span class="path">/options.html</span>
        </div>
        <div class="ext-icon-bar">
          <div class="ext-btn"><img src="${logoDataUrl}" alt="ContextLion" /></div>
        </div>
      </div>
      <div class="window-content">
        <div class="options-view">
          <div class="opt-header">
            <div class="opt-brand">
              <img src="${logoDataUrl}" alt="ContextLion" />
              <h2>ContextLion Preferences & Privacy</h2>
            </div>
            <span class="opt-badge">🔒 100% Local-First Verified</span>
          </div>
          <div class="cards-grid">
            <div class="opt-card">
              <div class="card-head"><span>📝</span> Markdown & Content Extraction</div>
              <div class="opt-row">
                <div>
                  <div>Normalize Heading Hierarchy</div>
                  <div class="opt-desc">Auto-adjust relative levels starting from H1</div>
                </div>
                <div class="toggle"><div class="toggle-dot"></div></div>
              </div>
              <div class="opt-row">
                <div>
                  <div>Strip Base64 Data URL Images</div>
                  <div class="opt-desc">Prevents bloated token counts from embedded images</div>
                </div>
                <div class="toggle"><div class="toggle-dot"></div></div>
              </div>
              <div class="opt-row">
                <div>
                  <div>GFM Enhanced Tables</div>
                  <div class="opt-desc">Render alignment-aware GitHub Flavored Markdown</div>
                </div>
                <div class="toggle"><div class="toggle-dot"></div></div>
              </div>
            </div>
            <div class="opt-card">
              <div class="card-head"><span>⚡</span> Token Estimator & Sanitization</div>
              <div class="opt-row">
                <div>
                  <div>LLM Token Estimation Model</div>
                  <div class="opt-desc">CJK-optimized character & byte ratio</div>
                </div>
                <div class="select-box">Claude 3.5 / GPT-4o ▾</div>
              </div>
              <div class="opt-row">
                <div>
                  <div>Auto-Sanitize URL Tracking Params</div>
                  <div class="opt-desc">Strip utm_*, fbclid, gclid before packaging</div>
                </div>
                <div class="toggle"><div class="toggle-dot"></div></div>
              </div>
              <div class="opt-row">
                <div>
                  <div>Default Copy Action</div>
                  <div class="opt-desc">Format applied when clicking primary action</div>
                </div>
                <div class="select-box">AI Context (Wrapped) ▾</div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  </body>
</html>
`

const screenshots = [
  { name: 'screenshot-1-overview', html: screenshot1HTML },
  { name: 'screenshot-2-presets', html: screenshot2HTML },
  { name: 'screenshot-3-picker', html: screenshot3HTML },
  { name: 'screenshot-4-pack', html: screenshot4HTML },
  { name: 'screenshot-5-options', html: screenshot5HTML },
]

async function generateScreenshots() {
  const browser = await chromium.launch()
  const page = await browser.newPage()
  await page.setViewportSize({ width: 1280, height: 800 })

  for (let i = 0; i < screenshots.length; i++) {
    const { name, html } = screenshots[i]
    await page.setContent(html)
    await page.waitForTimeout(500)

    const pngStorePath = path.join(screenshotsDir, `${name}.png`)
    const jpgStorePath = path.join(screenshotsDir, `${name}.jpg`)
    const pngScreenshotsPath = path.join(rootDir, 'assets/screenshots', `${name}.png`)
    const jpgScreenshotsPath = path.join(rootDir, 'assets/screenshots', `${name}.jpg`)

    await page.screenshot({ path: pngStorePath, omitBackground: false })
    await page.screenshot({ path: pngScreenshotsPath, omitBackground: false })

    await page.screenshot({ path: jpgStorePath, type: 'jpeg', quality: 95 })
    await page.screenshot({ path: jpgScreenshotsPath, type: 'jpeg', quality: 95 })

    console.log(`Generated (${i + 1}/${screenshots.length}): ${name} (PNG + JPG)`)
  }

  await browser.close()
  console.log('All 5 screenshots generated successfully at 1280x800!')
}

generateScreenshots().catch((err) => {
  console.error(err)
  process.exit(1)
})
