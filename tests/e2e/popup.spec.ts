import { test, expect } from './fixtures'

test.describe('ContextLion Popup Flow', () => {
  test('popup renders header, version badge, and UI elements', async ({ context, extensionId }) => {
    const page = await context.newPage()
    await page.goto(`chrome-extension://${extensionId}/popup.html`)

    // Verify Title & Version Badge
    await expect(page.locator('h1')).toHaveText('ContextLion')
    await expect(page.getByText('v0.1')).toBeVisible()

    // Verify footer branding
    await expect(page.getByText('Local-first • No remote tracking')).toBeVisible()
  })
})
