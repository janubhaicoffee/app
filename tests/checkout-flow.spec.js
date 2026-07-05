const { test, expect } = require('@playwright/test');

test.describe('Checkout Flow - Cart to Confirmation', () => {

  test('1. Product page loads and shows Add to Cart', async ({ page }) => {
    await page.goto('/product/instantcoffee');
    await expect(page.locator('.product-name')).toBeVisible();
    await expect(page.getByRole('button', { name: /ADD TO CART/i })).toBeVisible();
    await expect(page.getByRole('button', { name: /BUY NOW/i })).toBeVisible();
  });

  test('2. Hero link navigates to correct product page', async ({ page }) => {
    await page.goto('/');
    await page.getByRole('link', { name: /Shop Coffee/i }).click();
    await expect(page).toHaveURL(/\/product\/instantcoffee/);
    await expect(page.locator('.product-name')).toBeVisible();
  });

  test('3. Add to Cart shows confirmation hint', async ({ page }) => {
    await page.goto('/product/instantcoffee');
    await page.getByRole('button', { name: /ADD TO CART/i }).click();
    await expect(page.locator('.add-more-hint')).toBeVisible({ timeout: 5000 });
  });

  test('4. Cart page shows items after adding', async ({ page }) => {
    await page.goto('/product/instantcoffee');
    await page.getByRole('button', { name: /ADD TO CART/i }).click();
    await page.goto('/cart');
    await expect(page.locator('.cart-item')).toBeVisible({ timeout: 5000 });
  });

  test('5. Empty cart shows START SHOPPING link', async ({ page }) => {
    await page.goto('/cart');
    // Clear cart via localStorage
    await page.evaluate(() => localStorage.removeItem('janu_bhai_cart'));
    await page.reload();
    await expect(page.getByRole('link', { name: /START SHOPPING/i })).toBeVisible();
  });

  test('6. Cart quantity +/- works', async ({ page }) => {
    await page.goto('/product/instantcoffee');
    await page.getByRole('button', { name: /ADD TO CART/i }).click();
    await page.goto('/cart');
    
    // Click + button
    const qtyBefore = await page.locator('.quantity-selector span').textContent();
    await page.locator('.quantity-selector button').last().click();
    const qtyAfter = await page.locator('.quantity-selector span').textContent();
    expect(Number(qtyAfter)).toBeGreaterThan(Number(qtyBefore));
  });

  test('7. Checkout form requires all fields', async ({ page }) => {
    await page.goto('/product/instantcoffee');
    await page.getByRole('button', { name: /BUY NOW/i }).click();
    await expect(page).toHaveURL(/\/checkout/);
    await expect(page.getByRole('button', { name: /PAY/i })).toBeDisabled();
  });

  test('8. Pincode auto-fills city and state', async ({ page }) => {
    await page.goto('/product/instantcoffee');
    await page.getByRole('button', { name: /BUY NOW/i }).click();
    
    await page.getByLabel(/PIN Code/i).fill('110025');
    await page.waitForTimeout(2000);
    
    // City and state should auto-fill
    const cityValue = await page.getByLabel(/City/i).inputValue();
    expect(cityValue.length).toBeGreaterThan(0);
  });

  test('9. Checkout assistant shows on invalid pincode', async ({ page }) => {
    await page.goto('/product/instantcoffee');
    await page.getByRole('button', { name: /BUY NOW/i }).click();
    
    await page.getByLabel(/PIN Code/i).fill('999999');
    await page.waitForTimeout(2000);
    
    // Assistant message should appear
    const message = await page.locator('.assistant-message').textContent();
    expect(message.length).toBeGreaterThan(0);
  });

  test('10. Thank-you page loads when navigated directly', async ({ page }) => {
    await page.goto('/order-confirmation?order=TEST-123');
    await expect(page.locator('.confirmation-title')).toHaveText('Order Confirmed!');
    await expect(page.locator('.confirmation-order-id')).toContainText('TEST-123');
  });

  test('11. 404 page shows for invalid routes', async ({ page }) => {
    await page.goto('/this-does-not-exist');
    await expect(page.locator('.not-found-title')).toBeVisible();
    await expect(page.getByRole('link', { name: /Go to Homepage/i })).toBeVisible();
  });

  test('12. Account page redirects to auth when not logged in', async ({ page }) => {
    await page.goto('/account');
    await expect(page).toHaveURL(/\/auth\/(unified|login)/);
  });

  test('13. Breadcrumb shows on product page', async ({ page }) => {
    await page.goto('/product/instantcoffee');
    await expect(page.locator('.breadcrumb')).toBeVisible();
    await expect(page.locator('.breadcrumb a')).toHaveText('Home');
  });

  test('14. Product not found shows Browse Coffee button', async ({ page }) => {
    await page.goto('/product/nonexistent-product');
    await expect(page.locator('.not-found')).toBeVisible();
    await expect(page.getByRole('button', { name: /Browse Coffee/i })).toBeVisible();
  });
});
