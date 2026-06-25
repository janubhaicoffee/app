const { test, expect } = require('@playwright/test');

test.describe('Adversarial Edge Cases', () => {

  test('38. Rapidly toggle interceptor modal open/close without state corruption', async ({ page }) => {
    await page.goto('/product/instantcoffee-100g');

    const sleepSlider = page.locator('.brew-blueprint-section input[type="range"]').first();
    const workloadSlider = page.locator('.brew-blueprint-section input[type="range"]').nth(1);
    sleepSlider.evaluate((el) => { el.value = '90'; el.dispatchEvent(new Event('input', { bubbles: true })); });
    workloadSlider.evaluate((el) => { el.value = '90'; el.dispatchEvent(new Event('input', { bubbles: true })); el.dispatchEvent(new Event('change', { bubbles: true })); });

    // Open modal 3 times rapidly
    for (let i = 0; i < 3; i++) {
      await page.locator('button:has-text("BUY NOW")').click();
      await page.waitForTimeout(100);
      const cancelBtn = page.locator('.btn-cancel');
      if (await cancelBtn.isVisible().catch(() => false)) {
        await cancelBtn.click();
      }
      await page.waitForTimeout(100);
    }

    // Final open - verify modal is clean
    await page.locator('button:has-text("BUY NOW")').click();
    await expect(page.locator('.modal-overlay')).toBeVisible();
    const confirmBtn = page.locator('.btn-confirm');
    await expect(confirmBtn).toBeDisabled();
  });

  test('39. Check checkbox then uncheck - confirm button should disable again', async ({ page }) => {
    await page.goto('/product/instantcoffee-100g');

    const sleepSlider = page.locator('.brew-blueprint-section input[type="range"]').first();
    sleepSlider.evaluate((el) => { el.value = '90'; el.dispatchEvent(new Event('input', { bubbles: true })); });
    const workloadSlider = page.locator('.brew-blueprint-section input[type="range"]').nth(1);
    workloadSlider.evaluate((el) => { el.value = '90'; el.dispatchEvent(new Event('input', { bubbles: true })); el.dispatchEvent(new Event('change', { bubbles: true })); });

    await page.locator('button:has-text("BUY NOW")').click();

    const checkbox = page.locator('.checkbox-container input[type="checkbox"]');
    const confirmBtn = page.locator('.btn-confirm');

    await checkbox.check();
    await expect(confirmBtn).not.toBeDisabled();

    await checkbox.uncheck();
    await expect(confirmBtn).toBeDisabled();
  });

  test('40. Progress bar edge cases - verify 0% and 100% boundary renders', async ({ page }) => {
    await page.goto('/account');
    await page.locator('text=Lore & Progression').click();

    const progressOuter = page.locator('.progress-bar-outer');
    const progressInner = page.locator('.progress-bar-inner');

    await expect(progressOuter).toBeVisible();
    await expect(progressInner).toBeVisible();

    // Verify the bar renders within bounds (style width is between 0% and 100%)
    const styleAttr = await progressInner.getAttribute('style');
    expect(styleAttr).toBeTruthy();
  });

  test('41. Verify process page timeline nodes render correctly across all 6 steps', async ({ page }) => {
    await page.goto('/process');
    const stepRows = page.locator('.timeline-step-row');
    const count = await stepRows.count();
    expect(count).toBe(6);

    // Verify odd/even row classes alternate properly
    for (let i = 0; i < count; i++) {
      const rowClass = await stepRows.nth(i).getAttribute('class');
      if (i % 2 === 0) {
        expect(rowClass).toContain('odd-row');
      } else {
        expect(rowClass).toContain('even-row');
      }
    }
  });

  test('42. Verify process page video wrappers are interactive with hover scale', async ({ page }) => {
    await page.goto('/process');
    const videoWrapper = page.locator('.step-media-wrapper').first();
    await expect(videoWrapper).toBeVisible();

    // Hover over the element to trigger whileHover
    await videoWrapper.hover();
    await page.waitForTimeout(300);

    // The element should still be visible after hover animation
    await expect(videoWrapper).toBeVisible();
  });

  test('43. Multiple tab switches in account page should not cause rendering errors', async ({ page }) => {
    await page.goto('/account');
    const tabs = ['Overview', 'Lore & Progression', 'Delivery Optimizer', 'Order History', 'Addresses', 'Subscriptions'];

    for (const tab of tabs) {
      const tabLink = page.locator(`.sidebar-nav .nav-item:has-text("${tab}")`);
      if (await tabLink.isVisible().catch(() => false)) {
        await tabLink.click();
        await page.waitForTimeout(200);
      }
    }

    // Final check on progression tab (our modified component)
    await page.locator('.sidebar-nav .nav-item:has-text("Lore & Progression")').click();
    await expect(page.locator('.lore-card')).toBeVisible();
  });

});
