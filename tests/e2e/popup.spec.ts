import { test, expect } from './fixtures'

test.describe('ContextLion Popup Flow', () => {
  test('popup renders header, version badge, and UI elements', async ({ context, extensionId }) => {
    const page = await context.newPage()
    await page.goto(`chrome-extension://${extensionId}/popup.html`)

    // Verify Title & Version Badge
    await expect(page.locator('h1')).toHaveText('ContextLion')
    await expect(page.getByText('v0.2', { exact: true })).toBeVisible()

    // Verify footer branding
    await expect(page.getByText('Local-first • No remote tracking')).toBeVisible()
  })

  test('options page renders settings and prompt presets', async ({ context, extensionId }) => {
    const page = await context.newPage()
    await page.goto(`chrome-extension://${extensionId}/options.html`)

    await expect(page.locator('h1')).toHaveText('ContextLion Settings')
    await expect(page.getByText('v0.2.0', { exact: true })).toBeVisible()
    await expect(page.getByText('General Preferences')).toBeVisible()
    await expect(page.getByText('Prompt Presets', { exact: true })).toBeVisible()
  })
})
