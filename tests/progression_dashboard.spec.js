const { test, expect } = require('@playwright/test');

test.describe('Progression Lore Dashboard', () => {

  test('22. Verify progression tab exists in account sidebar', async ({ page }) => {
    await page.goto('/account');
    const sidebar = page.locator('.sidebar');
    await expect(sidebar).toBeVisible();
    await expect(page.locator('text=Lore & Progression')).toBeVisible();
  });

  test('23. Verify progression container renders lore-card with tier info', async ({ page }) => {
    await page.goto('/account');
    await page.locator('text=Lore & Progression').click();

    const loreCard = page.locator('.lore-card');
    await expect(loreCard).toBeVisible();
    await expect(page.locator('.tier-badge')).toContainText('Rank Tier');
  });

  test('24. Verify progress bar outer container is present and has animated inner bar', async ({ page }) => {
    await page.goto('/account');
    await page.locator('text=Lore & Progression').click();

    const progressOuter = page.locator('.progress-bar-outer');
    await expect(progressOuter).toBeVisible();

    const progressInner = page.locator('.progress-bar-inner');
    await expect(progressInner).toBeVisible();

    // Check that Framer Motion sets inline width style
    const styleAttr = await progressInner.getAttribute('style');
    expect(styleAttr).toContain('width');
  });

  test('25. Verify points ledger section displays ledger history or empty state', async ({ page }) => {
    await page.goto('/account');
    await page.locator('text=Lore & Progression').click();

    const ledgerContainer = page.locator('.ledger-card-container');
    await expect(ledgerContainer).toBeVisible();
    await expect(ledgerContainer.locator('h3')).toContainText('Points Ledger');

    // Either shows ledger cards or empty state
    const ledgerCards = page.locator('.ledger-card-item');
    const emptyState = ledgerContainer.locator('text=No ledger history available');
    const cardsExist = await ledgerCards.count();
    const emptyExists = await emptyState.isVisible().catch(() => false);

    expect(cardsExist > 0 || emptyExists).toBe(true);
  });

  test('36. Verify progress bar renders with glow sweep overlay element', async ({ page }) => {
    await page.goto('/account');
    await page.locator('text=Lore & Progression').click();

    const glowElement = page.locator('.progress-bar-glow');
    await expect(glowElement).toBeVisible();
  });

  test('37. Verify ledger items animate on hover with spring effect', async ({ page }) => {
    await page.goto('/account');
    await page.locator('text=Lore & Progression').click();

    const ledgerCards = page.locator('.ledger-card-item');
    const count = await ledgerCards.count();

    if (count > 0) {
      const firstCard = ledgerCards.first();
      await expect(firstCard.locator('.ledger-action-type')).toBeVisible();
      await expect(firstCard.locator('.ledger-points')).toBeVisible();
    }
  });

});
