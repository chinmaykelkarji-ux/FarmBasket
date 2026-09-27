/**
 * End-to-end check of the MVP success criteria, in a mobile viewport.
 *   npm run dev            (in one terminal)
 *   npm run e2e            (in another)
 * Env: BASE_URL (default http://localhost:5173), CHROMIUM_PATH (optional),
 *      WIDTH (default 390), SHOTS=dir to save screenshots.
 */
import { chromium } from 'playwright'
import { mkdirSync } from 'node:fs'

const BASE = process.env.BASE_URL ?? 'http://localhost:5173'
const WIDTH = Number(process.env.WIDTH ?? 390)
const SHOTS = process.env.SHOTS
if (SHOTS) mkdirSync(SHOTS, { recursive: true })

const browser = await chromium.launch(process.env.CHROMIUM_PATH ? { executablePath: process.env.CHROMIUM_PATH } : {})
const page = await browser.newPage({ viewport: { width: WIDTH, height: 844 }, ignoreHTTPSErrors: true })
const errors = []
page.on('pageerror', (e) => errors.push(e.message))

let step = 0
async function check(name, fn) {
  step++
  try {
    await fn()
    console.log(`✓ ${String(step).padStart(2)} ${name}`)
    if (SHOTS) await page.screenshot({ path: `${SHOTS}/${String(step).padStart(2, '0')}-${name.replace(/\W+/g, '-').toLowerCase()}.png` })
  } catch (e) {
    console.error(`✗ ${String(step).padStart(2)} ${name}\n   ${e.message.split('\n')[0]}`)
    if (SHOTS) await page.screenshot({ path: `${SHOTS}/FAIL-${step}.png`, fullPage: true })
    await browser.close()
    process.exit(1)
  }
}
const expectVisible = (locator) => locator.first().waitFor({ state: 'visible', timeout: 5000 })

await check('Open app', async () => {
  await page.goto(BASE + '/')
  await page.evaluate(() => localStorage.clear())
  await page.reload()
  await expectVisible(page.getByRole('heading', { name: /Fresh vegetables/ }))
})

await check('Select vegetables', async () => {
  await page.getByRole('link', { name: 'Shop vegetables' }).first().click()
  await expectVisible(page.getByRole('heading', { name: 'Shop vegetables' }))
})

await check('Search tomato', async () => {
  await page.goto(BASE + '/search')
  await page.getByRole('searchbox').fill('tomato')
  await expectVisible(page.getByText(/results? for/))
})

await check('Open tomato', async () => {
  await page.getByRole('link', { name: /^Tomato,/ }).first().click()
  await expectVisible(page.getByRole('heading', { name: 'Tomato', level: 1 }))
})

await check('Choose Red + Medium', async () => {
  await page.getByRole('radio', { name: /Red/ }).click()
  await page.getByRole('radio', { name: /Medium/ }).click()
  await expectVisible(page.getByText('Red • Medium').first())
})

await check('Select 1 kg', async () => {
  await page.getByRole('button', { name: '1 kg', exact: true }).click()
  await expectVisible(page.getByText('Red • Medium • 1 kg'))
})

await check('Add to cart', async () => {
  await page.getByRole('button', { name: 'Add to cart' }).last().click()
  await expectVisible(page.getByRole('status').filter({ hasText: 'added' }))
})

await check('Search red onion shows variants', async () => {
  await page.goto(BASE + '/search?q=red%20onion')
  await expectVisible(page.getByRole('link', { name: 'Onion, Red • Medium' }))
  await expectVisible(page.getByRole('link', { name: 'Onion, Red • Small' }))
})

await check('Customize onion (White, 1 kg) and add', async () => {
  await page.goto(BASE + '/product/onion')
  await page.getByRole('radio', { name: /White/ }).click()
  await page.getByRole('button', { name: '1 kg', exact: true }).click()
  await expectVisible(page.getByText('White • Medium • 1 kg'))
  await page.getByRole('button', { name: 'Add to cart' }).last().click()
})

await check('Open cart', async () => {
  await page.goto(BASE + '/cart')
  await expectVisible(page.getByRole('heading', { name: 'Your basket' }))
  await expectVisible(page.getByRole('button', { name: /Change preference/ }))
  if ((await page.getByRole('listitem').filter({ has: page.getByRole('button', { name: /Change preference/ }) }).count()) !== 2) throw new Error('Expected 2 cart lines')
})

await check('Edit onion preference in cart', async () => {
  await page.getByRole('listitem').filter({ hasText: 'Onion' }).getByRole('button', { name: /Change preference/ }).click()
  const dialog = page.getByRole('dialog')
  await dialog.getByRole('radio', { name: /Red/ }).click()
  await dialog.getByRole('radio', { name: /Small/ }).click()
  await dialog.getByRole('button', { name: 'Update basket' }).click()
  await expectVisible(page.getByRole('listitem').filter({ hasText: 'Onion' }).getByText('Small', { exact: true }))
})

await check('Checkout', async () => {
  await page.getByRole('button', { name: /Proceed to checkout/ }).last().click()
  await expectVisible(page.getByRole('heading', { name: 'Checkout' }))
})

await check('Enter address', async () => {
  await page.getByLabel('Full name').fill('Priya Kulkarni')
  await page.getByLabel('Mobile number').fill('9876543210')
  await page.getByLabel('House / flat no.').fill('12, 2nd floor')
  await page.getByLabel('Street / road').fill('Congress Road')
  await page.getByLabel('Area / locality').fill('Tilakwadi')
  await page.getByLabel('Pincode').fill('590006')
})

await check('Select delivery option', async () => {
  const slots = page.getByRole('radiogroup', { name: 'Delivery time' }).getByRole('radio')
  const n = await slots.count()
  for (let i = 0; i < n; i++) {
    if ((await slots.nth(i).getAttribute('aria-disabled')) !== 'true') {
      await slots.nth(i).click()
      if ((await slots.nth(i).getAttribute('aria-checked')) === 'true') return
    }
  }
  throw new Error('No slot selectable')
})

await check('Place order', async () => {
  await page.getByRole('button', { name: /Place order/ }).last().click()
  await page.waitForURL(/\/confirmed$/, { timeout: 8000 })
})

await check('See confirmation', async () => {
  await expectVisible(page.getByRole('heading', { name: 'Your vegetables are being prepared.' }))
  await expectVisible(page.getByText(/Order #FB\d+/))
})

await check('Open tracking', async () => {
  await page.getByRole('link', { name: /Track order/ }).click()
  await expectVisible(page.getByText('Live status').or(page.getByText('Scheduled', { exact: true })))
})

await check('See "Quality checked"', async () => {
  const qc = page.locator('[aria-current="step"]').filter({ hasText: 'Quality checked' })
  for (let i = 0; i < 3 && !(await qc.isVisible()); i++) {
    const before = await page.locator('[aria-current="step"]').textContent()
    if (before?.includes('Packed') || before?.includes('Out for')) throw new Error('Passed Quality checked already')
    await page.getByRole('button', { name: 'Next step' }).click()
    await page.waitForFunction((b) => document.querySelector('[aria-current="step"]')?.textContent !== b, before)
  }
  await expectVisible(page.locator('[aria-current="step"]').filter({ hasText: 'Quality checked' }))
  await expectVisible(page.getByText('Your produce has passed our quality check.'))
})

await check('Complete delivery simulation', async () => {
  await page.getByRole('button', { name: 'Complete delivery' }).click()
  await expectVisible(page.getByRole('heading', { name: 'How was your produce?' }))
})

await check('Submit quality feedback', async () => {
  await page.getByRole('radio', { name: /^2 stars/ }).click()
  await page.getByRole('button', { name: 'Wrong size' }).click()
  await page.getByLabel('Tell us what happened').fill('Onions were a bit smaller than I expected.')
  await page.getByRole('button', { name: 'Submit' }).click()
  await expectVisible(page.getByText('We’re on it'))
})

await check('Reopen orders', async () => {
  await page.goto(BASE + '/orders')
  await expectVisible(page.getByText(/Order #FB\d+/))
  await expectVisible(page.getByText('Delivered').first())
})

await check('Buy again', async () => {
  await page.getByRole('button', { name: /Buy again/ }).first().click()
  await page.waitForURL(/\/cart$/)
  await expectVisible(page.getByRole('listitem').filter({ hasText: 'Tomato' }))
})

await check('See saved preferences', async () => {
  await page.goto(BASE + '/profile/preferences')
  await expectVisible(page.getByText('Red • Medium • 1 kg'))
  await page.goto(BASE + '/product/tomato')
  await expectVisible(page.getByText('Your usual').first())
})

await browser.close()
if (errors.length) {
  console.error('Page errors:', errors)
  process.exit(1)
}
console.log(`\nAll ${step} steps passed at ${WIDTH}px.`)
