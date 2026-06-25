const { test, expect } = require('@playwright/test');

test.describe('Product Customizer Sliders', () => {
  
  test('1. Verify customizer container is rendered on /product/instantcoffee-100g', async ({ page }) => {
    await page.goto('/product/instantcoffee-100g');
    const container = page.locator('.brew-blueprint-section');
    await expect(container).toBeVisible();
    await expect(page.locator('text=BREW BLUEPRINT SELECTOR')).toBeVisible();
  });

  test('2. Verify Sleep Deprivation slider adjusts the scale value in the UI', async ({ page }) => {
    await page.goto('/product/instantcoffee-100g');
    
    // First range input is Sleep Deprivation Scale
    const sleepSlider = page.locator('.brew-blueprint-section input[type="range"]').first();
    await expect(sleepSlider).toBeVisible();
    
    // Change value to 80
    await sleepSlider.evaluate((el) => {
      el.value = '80';
      el.dispatchEvent(new Event('input', { bubbles: true }));
      el.dispatchEvent(new Event('change', { bubbles: true }));
    });
    
    // Check if the label/value text updates to "80 / 100"
    await expect(page.locator('.brew-blueprint-section', { hasText: 'Sleep Deprivation Scale' })).toContainText('80 / 100');
  });

  test('3. Verify Workload Intensity slider adjusts the scale value in the UI', async ({ page }) => {
    await page.goto('/product/instantcoffee-100g');
    
    // Second range input is Workload Intensity
    const workloadSlider = page.locator('.brew-blueprint-section input[type="range"]').nth(1);
    await expect(workloadSlider).toBeVisible();
    
    // Change value to 70
    await workloadSlider.evaluate((el) => {
      el.value = '70';
      el.dispatchEvent(new Event('input', { bubbles: true }));
      el.dispatchEvent(new Event('change', { bubbles: true }));
    });
    
    await expect(page.locator('.brew-blueprint-section', { hasText: 'Workload Intensity' })).toContainText('70 / 100');
  });

  test('4. Verify caffeine intensity output updates dynamically based on both slider positions', async ({ page }) => {
    await page.goto('/product/instantcoffee-100g');
    
    const sleepSlider = page.locator('.brew-blueprint-section input[type="range"]').first();
    const workloadSlider = page.locator('.brew-blueprint-section input[type="range"]').nth(1);
    
    // Change values: sleepDebt = 80, workload = 70
    // Calculated: 80 * 0.6 + 70 * 0.4 = 48 + 28 = 76%
    await sleepSlider.evaluate((el) => {
      el.value = '80';
      el.dispatchEvent(new Event('input', { bubbles: true }));
    });
    await workloadSlider.evaluate((el) => {
      el.value = '70';
      el.dispatchEvent(new Event('input', { bubbles: true }));
      el.dispatchEvent(new Event('change', { bubbles: true }));
    });
    
    // Target Caffeine Intensity shows "76%"
    const targetIntensity = page.locator('text=Target Caffeine Intensity:');
    await expect(targetIntensity).toContainText('76%');
  });

  test('5. Verify matched variant card updates to display selected roast variant name', async ({ page }) => {
    await page.goto('/product/instantcoffee-100g');
    
    const sleepSlider = page.locator('.brew-blueprint-section input[type="range"]').first();
    const workloadSlider = page.locator('.brew-blueprint-section input[type="range"]').nth(1);
    
    // Target: 25% (Mild Blend)
    await sleepSlider.evaluate((el) => { el.value = '25'; el.dispatchEvent(new Event('input', { bubbles: true })); });
    await workloadSlider.evaluate((el) => { el.value = '25'; el.dispatchEvent(new Event('input', { bubbles: true })); el.dispatchEvent(new Event('change', { bubbles: true })); });
    
    // Matched card should contain Mild Blend
    await expect(page.locator('text=Matched: Thodi Hard - Mild Blend')).toBeVisible();
    
    // Target: 90% (Extra Intense)
    await sleepSlider.evaluate((el) => { el.value = '90'; el.dispatchEvent(new Event('input', { bubbles: true })); });
    await workloadSlider.evaluate((el) => { el.value = '90'; el.dispatchEvent(new Event('input', { bubbles: true })); el.dispatchEvent(new Event('change', { bubbles: true })); });
    
    await expect(page.locator('text=Matched: Thodi Hard - Extra Intense')).toBeVisible();
  });

  test('26. Verify slider values default to 50 when no URL parameters are present', async ({ page }) => {
    await page.goto('/product/instantcoffee-100g');
    
    const sleepSlider = page.locator('.brew-blueprint-section input[type="range"]').first();
    const workloadSlider = page.locator('.brew-blueprint-section input[type="range"]').nth(1);
    
    await expect(sleepSlider).toHaveValue('50');
    await expect(workloadSlider).toHaveValue('50');
    await expect(page.locator('text=Target Caffeine Intensity:')).toContainText('50%');
  });

  test('27. Verify sliders hydrate values from URL search parameters on direct navigation', async ({ page }) => {
    await page.goto('/product/instantcoffee-100g?sleep_debt=75&workload=45');
    
    const sleepSlider = page.locator('.brew-blueprint-section input[type="range"]').first();
    const workloadSlider = page.locator('.brew-blueprint-section input[type="range"]').nth(1);
    
    await expect(sleepSlider).toHaveValue('75');
    await expect(workloadSlider).toHaveValue('45');
    
    // Calculated: 75 * 0.6 + 45 * 0.4 = 45 + 18 = 63%
    await expect(page.locator('text=Target Caffeine Intensity:')).toContainText('63%');
  });

  test('28. Verify setting both sliders to minimum (1) yields 1% caffeine intensity and matches Mild blend', async ({ page }) => {
    await page.goto('/product/instantcoffee-100g');
    
    const sleepSlider = page.locator('.brew-blueprint-section input[type="range"]').first();
    const workloadSlider = page.locator('.brew-blueprint-section input[type="range"]').nth(1);
    
    await sleepSlider.evaluate((el) => { el.value = '1'; el.dispatchEvent(new Event('input', { bubbles: true })); });
    await workloadSlider.evaluate((el) => { el.value = '1'; el.dispatchEvent(new Event('input', { bubbles: true })); el.dispatchEvent(new Event('change', { bubbles: true })); });
    
    await expect(page.locator('text=Target Caffeine Intensity:')).toContainText('1%');
    await expect(page.locator('text=Matched: Thodi Hard - Mild Blend')).toBeVisible();
  });

  test('29. Verify setting both sliders to maximum (100) yields 100% caffeine intensity and matches Extra Intense blend', async ({ page }) => {
    await page.goto('/product/instantcoffee-100g');
    
    const sleepSlider = page.locator('.brew-blueprint-section input[type="range"]').first();
    const workloadSlider = page.locator('.brew-blueprint-section input[type="range"]').nth(1);
    
    await sleepSlider.evaluate((el) => { el.value = '100'; el.dispatchEvent(new Event('input', { bubbles: true })); });
    await workloadSlider.evaluate((el) => { el.value = '100'; el.dispatchEvent(new Event('input', { bubbles: true })); el.dispatchEvent(new Event('change', { bubbles: true })); });
    
    await expect(page.locator('text=Target Caffeine Intensity:')).toContainText('100%');
    await expect(page.locator('text=Matched: Thodi Hard - Extra Intense')).toBeVisible();
  });

  test('30. Verify sliders can be rapidly dragged back and forth without locking state', async ({ page }) => {
    await page.goto('/product/instantcoffee-100g');
    
    const sleepSlider = page.locator('.brew-blueprint-section input[type="range"]').first();
    const workloadSlider = page.locator('.brew-blueprint-section input[type="range"]').nth(1);
    
    // Rapidly change values multiple times
    for (let val of ['10', '90', '20', '80', '30', '70', '40', '60']) {
      await sleepSlider.evaluate((el, v) => {
        el.value = v;
        el.dispatchEvent(new Event('input', { bubbles: true }));
      }, val);
      await workloadSlider.evaluate((el, v) => {
        el.value = v;
        el.dispatchEvent(new Event('input', { bubbles: true }));
        el.dispatchEvent(new Event('change', { bubbles: true }));
      }, val);
    }
    
    // Check final state (should be 60%)
    await expect(sleepSlider).toHaveValue('60');
    await expect(workloadSlider).toHaveValue('60');
    await expect(page.locator('text=Target Caffeine Intensity:')).toContainText('60%');
  });

});
