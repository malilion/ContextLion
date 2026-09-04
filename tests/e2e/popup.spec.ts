import { test, expect } from './fixtures'

test.describe('ContextLion Popup Flow', () => {
  test('popup renders header, version badge, and UI elements', async ({ context, extensionId }) => {
    const page = await context.newPage()
    await page.goto(`chrome-extension://${extensionId}/popup.html`)

    // Verify Title & Version Badge
    await expect(page.locator('h1')).toHaveText('ContextLion')
    await expect(page.getByText('v1.0.0', { exact: true })).toBeVisible()

    // Verify mode tabs including Context Pack
    await expect(page.getByRole('button', { name: 'Page' })).toBeVisible()
    await expect(page.getByRole('button', { name: 'Select' })).toBeVisible()
    await expect(page.getByRole('button', { name: 'Pick' })).toBeVisible()
    await expect(page.getByRole('button', { name: 'Pack' })).toBeVisible()

    // Click Pack mode tab
    await page.getByRole('button', { name: 'Pack' }).click()
    await expect(page.getByPlaceholder('Filter tabs by title or domain...')).toBeVisible()

    // Verify footer branding
    await expect(page.getByText('Local-first • No remote tracking')).toBeVisible()
  })

  test('options page renders settings, prompt presets, and history section', async ({
    context,
    extensionId,
  }) => {
    const page = await context.newPage()
    await page.goto(`chrome-extension://${extensionId}/options.html`)

    await expect(page.locator('h1')).toHaveText('ContextLion Settings')
    await expect(page.getByText('v1.0.0', { exact: true })).toBeVisible()
    await expect(page.getByText('General Preferences')).toBeVisible()
    await expect(page.getByText('Prompt Presets', { exact: true })).toBeVisible()
    await expect(page.getByText('Context History & Collections')).toBeVisible()
  })
})
