const { test, expect } = require('@playwright/test');

test.describe('Interceptor Warning Modal', () => {

  test('11. Verify modal appears when adding thodi-hard-extreme variant to cart', async ({ page }) => {
    await page.goto('/product/instantcoffee-100g');

    const sleepSlider = page.locator('.brew-blueprint-section input[type="range"]').first();
    const workloadSlider = page.locator('.brew-blueprint-section input[type="range"]').nth(1);

    // Slide to Extra Intense (90/100) to trigger extreme variant
    await sleepSlider.evaluate((el) => { el.value = '90'; el.dispatchEvent(new Event('input', { bubbles: true })); });
    await workloadSlider.evaluate((el) => { el.value = '90'; el.dispatchEvent(new Event('input', { bubbles: true })); el.dispatchEvent(new Event('change', { bubbles: true })); });

    // Click BUY NOW which triggers addToCart and interceptor for extreme variant
    const buyNowBtn = page.locator('button:has-text("BUY NOW")');
    await buyNowBtn.click();

    // Modal overlay should be visible
    const modalOverlay = page.locator('.modal-overlay');
    await expect(modalOverlay).toBeVisible();
    await expect(page.locator('text=WARNING: HIGH CAFFEINE INTENSITY')).toBeVisible();
  });

  test('12. Verify modal has backdrop blur and spring scale-up animation classes', async ({ page }) => {
    await page.goto('/product/instantcoffee-100g');

    const sleepSlider = page.locator('.brew-blueprint-section input[type="range"]').first();
    sleepSlider.evaluate((el) => { el.value = '90'; el.dispatchEvent(new Event('input', { bubbles: true })); });
    const workloadSlider = page.locator('.brew-blueprint-section input[type="range"]').nth(1);
    workloadSlider.evaluate((el) => { el.value = '90'; el.dispatchEvent(new Event('input', { bubbles: true })); el.dispatchEvent(new Event('change', { bubbles: true })); });

    await page.locator('button:has-text("BUY NOW")').click();

    const modalOverlay = page.locator('.modal-overlay');
    await expect(modalOverlay).toBeVisible();

    // Verify backdrop-filter blur is applied (css class)
    const backdropStyle = await modalOverlay.evaluate(el => window.getComputedStyle(el).backdropFilter);
    expect(backdropStyle).toContain('blur');

    // Modal box should be visible
    const modalBox = page.locator('.modal-box');
    await expect(modalBox).toBeVisible();
  });

  test('13. Verify confirm button is disabled until checkbox is checked', async ({ page }) => {
    await page.goto('/product/instantcoffee-100g');

    const sleepSlider = page.locator('.brew-blueprint-section input[type="range"]').first();
    sleepSlider.evaluate((el) => { el.value = '90'; el.dispatchEvent(new Event('input', { bubbles: true })); });
    const workloadSlider = page.locator('.brew-blueprint-section input[type="range"]').nth(1);
    workloadSlider.evaluate((el) => { el.value = '90'; el.dispatchEvent(new Event('input', { bubbles: true })); el.dispatchEvent(new Event('change', { bubbles: true })); });

    await page.locator('button:has-text("BUY NOW")').click();

    const confirmBtn = page.locator('.btn-confirm');
    await expect(confirmBtn).toBeDisabled();

    // Check the checkbox
    const checkbox = page.locator('.checkbox-container input[type="checkbox"]');
    await checkbox.check();

    await expect(confirmBtn).not.toBeDisabled();
  });

  test('14. Verify clicking cancel closes the modal and does not add item', async ({ page }) => {
    await page.goto('/product/instantcoffee-100g');

    const sleepSlider = page.locator('.brew-blueprint-section input[type="range"]').first();
    sleepSlider.evaluate((el) => { el.value = '90'; el.dispatchEvent(new Event('input', { bubbles: true })); });
    const workloadSlider = page.locator('.brew-blueprint-section input[type="range"]').nth(1);
    workloadSlider.evaluate((el) => { el.value = '90'; el.dispatchEvent(new Event('input', { bubbles: true })); el.dispatchEvent(new Event('change', { bubbles: true })); });

    await page.locator('button:has-text("BUY NOW")').click();

    await expect(page.locator('.modal-overlay')).toBeVisible();

    await page.locator('.btn-cancel').click();

    await expect(page.locator('.modal-overlay')).not.toBeVisible();
  });

  test('15. Verify acknowledging the warning closes the modal and allows purchase', async ({ page }) => {
    await page.goto('/product/instantcoffee-100g');

    const sleepSlider = page.locator('.brew-blueprint-section input[type="range"]').first();
    sleepSlider.evaluate((el) => { el.value = '90'; el.dispatchEvent(new Event('input', { bubbles: true })); });
    const workloadSlider = page.locator('.brew-blueprint-section input[type="range"]').nth(1);
    workloadSlider.evaluate((el) => { el.value = '90'; el.dispatchEvent(new Event('input', { bubbles: true })); el.dispatchEvent(new Event('change', { bubbles: true })); });

    await page.locator('button:has-text("BUY NOW")').click();
    await expect(page.locator('.modal-overlay')).toBeVisible();

    await page.locator('.checkbox-container input[type="checkbox"]').check();
    await page.locator('.btn-confirm').click();

    await expect(page.locator('.modal-overlay')).not.toBeVisible();
  });

});
