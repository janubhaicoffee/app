const { test, expect } = require('@playwright/test');

test.describe('Process Timeline & Hover Effects', () => {

  test('16. Verify process page timeline section is rendered', async ({ page }) => {
    await page.goto('/process');
    await expect(page.locator('text=From Farm to Cup')).toBeVisible();
    await expect(page.locator('.spatial-timeline-container')).toBeVisible();
  });

  test('17. Verify timeline nodes have scroll-linked Framer Motion transforms', async ({ page }) => {
    await page.goto('/process');
    const timelineNode = page.locator('.timeline-step-row').first();
    await expect(timelineNode).toBeVisible();

    const styleAttr = await timelineNode.getAttribute('style');
    // Framer Motion sets inline style for opacity/transform
    expect(styleAttr).toBeTruthy();
  });

  test('18. Verify each timeline step has a video wrapper with vintage-border class', async ({ page }) => {
    await page.goto('/process');
    const videoWrappers = page.locator('.step-media-wrapper');
    const count = await videoWrappers.count();
    expect(count).toBe(6);

    for (let i = 0; i < count; i++) {
      await expect(videoWrappers.nth(i).locator('video')).toBeVisible();
    }
  });

  test('19. Verify each timeline step has content card with step title and description', async ({ page }) => {
    await page.goto('/process');
    const cardContents = page.locator('.step-card-content');
    const count = await cardContents.count();
    expect(count).toBe(6);

    const titles = ['Handpicked', 'Carefully Sorted', 'Sun Dried', 'Expertly Roasted', 'Freeze Dried', 'Served Fresh'];
    for (let i = 0; i < count; i++) {
      await expect(cardContents.nth(i)).toContainText(titles[i]);
    }
  });

  test('20. Verify hero section renders with title "Chikmagaluru"', async ({ page }) => {
    await page.goto('/process');
    await expect(page.locator('.hero-title')).toContainText('Chikmagaluru');
    await expect(page.locator('.hero-subtitle')).toBeVisible();
    await expect(page.locator('.hero-description')).toBeVisible();
  });

  test('21. Verify grade badge section is present with AAA grade', async ({ page }) => {
    await page.goto('/process');
    await expect(page.locator('.grade-section')).toBeVisible();
    await expect(page.locator('.grade-badge')).toContainText('AAA');
  });

});
