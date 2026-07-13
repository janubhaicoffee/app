# Instructions

- Following Playwright test failed.
- Explain why, be concise, respect Playwright best practices.
- Provide a snippet of code with the fix, if possible.

# Test info

- Name: process_timeline.spec.js >> Process Timeline & Hover Effects >> 17. Verify timeline nodes have scroll-linked Framer Motion transforms
- Location: tests\process_timeline.spec.js:11:3

# Error details

```
Error: expect(locator).toBeVisible() failed

Locator: locator('.timeline-step-row').first()
Expected: visible
Timeout: 5000ms
Error: element(s) not found

Call log:
  - Expect "toBeVisible" with timeout 5000ms
  - waiting for locator('.timeline-step-row').first()

```

```yaml
- link "Skip to main content":
  - /url: "#main-content"
- banner:
  - link "Janu Bhai Coffee - Home":
    - /url: /
    - img "Janu Bhai Logo"
  - navigation "Desktop navigation":
    - link "Coffee Powder":
      - /url: /product/instantcoffee
    - link "Recipes":
      - /url: /
    - link "Our Sourcing":
      - /url: /process
    - link "Contact":
      - /url: /contact
    - link "Outlet Management":
      - /url: /outlet
  - link "Login":
    - /url: /auth/login
  - link "Shopping Cart":
    - /url: /cart
- main:
  - main:
    - img "Chikmagalur Coffee Estate"
    - paragraph: From the hills of
    - heading "Chikmagaluru" [level=1]
    - paragraph: "\"Every cup starts 3,400 feet above sea level.\""
    - text: Scroll to follow the bean's journey
    - heading "Every cup begins 3,400 feet above sea level." [level=2]
    - paragraph: Nestled in the Western Ghats of India, Chikmagaluru is the birthplace of Indian coffee. The combination of rich volcanic soil, heavy canopy shade, and perfect microclimates results in beans that mature slowly, developing incredibly complex, deep profiles.
    - link "Follow the Journey":
      - /url: "#phase-01"
    - text: 1,200m Peak Elevation 100% Arabica Sourcing AAA Quality Grade Single Estate Origin Small Batch Fresh Roasting Style 01
    - img "Handpicked"
    - text: Harvesting
    - heading "Handpicked" [level=2]
    - paragraph: Only the ripest, deep red coffee cherries are selected by hand. Sourcing only at peak maturity ensures a naturally sweet, clean cup with none of the sourness of underripe fruit.
    - text: "02"
    - img "Sorted by Hand"
    - text: Quality Control
    - heading "Sorted by Hand" [level=2]
    - paragraph: Sorting is where quality is won or lost. Every single batch is manually sorted to remove broken, insect-damaged, or discolored beans. This meticulous process ensures a pure, premium taste in every brew.
    - heading "Rejected Beans" [level=4]
    - list:
      - listitem:
        - strong: "Broken & Chipped:"
        - text: Causes uneven roasting, leading to bitter and astringent flavors.
      - listitem:
        - strong: "Insect Damaged:"
        - text: Contaminates the brew, creating flat, moldy off-notes.
      - listitem:
        - strong: "Black/Deformed:"
        - text: Results in harsh chemical tastes and stale aromas.
    - heading "Janu Bhai AAA Beans" [level=4]
    - list:
      - listitem:
        - strong: "Uniform Density:"
        - text: Yields a perfectly balanced roast and consistent cup profiles.
      - listitem:
        - strong: "Symmetrical Sizing:"
        - text: Bold, high-density beans that capture complex aromatic oils.
      - listitem:
        - strong: "Perfect Moisture (11%):"
        - text: Locks in the natural berry and chocolate undertones.
    - text: "03"
    - img "Sun Dried"
    - text: Dehydration
    - heading "Sun Dried" [level=2]
    - paragraph: Our beans are spread evenly across elevated drying beds, basking under the natural heat of the sun. Hand-raked hourly for slow, uniform dehydration, this locks in the complex sugars and full-bodied fruitiness.
    - text: "04"
    - img "Expertly Roasted"
    - text: Flavor Development
    - heading "Expertly Roasted" [level=2]
    - paragraph: Roasted in state-of-the-art small-batch roasters. Our master roasters monitor temperature curves to caramelize coffee sugars perfectly, bringing out intense notes of cocoa, nuts, and sweet spices.
    - text: Thermal Caramelization Active 05
    - img "Freeze Dried"
    - text: Preservation
    - heading "Freeze Dried" [level=2]
    - text: ❄ Sub-Zero Vacuum
    - paragraph: Freshly brewed coffee is concentrated and instantly frozen to -40°C. In an absolute vacuum, water is sublimated, locking the aromatic coffee oils and delicate flavor compounds into rigid crystals.
    - text: "06"
    - img "Served Fresh"
    - text: Delivery
    - heading "Served Fresh" [level=2]
    - paragraph: Airtight packaging ensures zero oxidation. From our estate roasting facility in Chikmagalur to your doorstep, we preserve every nuance of flavor so you experience coffee at its peak.
    - heading "The journey ends here. The experience begins with you." [level=2]
    - link "Brew Yours":
      - /url: /product/instantcoffee
- contentinfo:
  - link "Janu Bhai Coffee - Home":
    - /url: /
    - img "Janu Bhai Logo"
  - paragraph: Born in Chikmagaluru. Small-batch roasted. Delivered fresh nationwide.
  - paragraph: © 2026 Janu Bhai Coffee.
  - text: Shop
  - list:
    - listitem:
      - link "Coffee Powder":
        - /url: /product/instantcoffee
    - listitem:
      - link "Our Sourcing":
        - /url: /process
    - listitem:
      - link "Recipes":
        - /url: /
    - listitem:
      - link "Bulk Orders":
        - /url: /contact
  - text: Legal
  - list:
    - listitem:
      - link "Terms & Conditions":
        - /url: /terms
    - listitem:
      - link "Privacy Policy":
        - /url: /privacy
    - listitem:
      - link "Refund Policy":
        - /url: /refunds
    - listitem:
      - link "Shipping Policy":
        - /url: /shipping
  - text: Support
  - list:
    - listitem:
      - link "Track Order":
        - /url: /track
    - listitem:
      - link "Contact Support":
        - /url: /contact
    - listitem: hello@janubhai.com
    - listitem: +91 8527976791
  - text: Social
  - link "Instagram":
    - /url: https://instagram.com/janubhaicoffee
    - img
  - link "Twitter":
    - /url: https://twitter.com/janubhaicoffee
    - img
  - link "YouTube":
    - /url: https://youtube.com
    - img
- alert
```

# Test source

```ts
  1  | const { test, expect } = require('@playwright/test');
  2  | 
  3  | test.describe('Process Timeline & Hover Effects', () => {
  4  | 
  5  |   test('16. Verify process page timeline section is rendered', async ({ page }) => {
  6  |     await page.goto('/process');
  7  |     await expect(page.locator('text=From Farm to Cup')).toBeVisible();
  8  |     await expect(page.locator('.spatial-timeline-container')).toBeVisible();
  9  |   });
  10 | 
  11 |   test('17. Verify timeline nodes have scroll-linked Framer Motion transforms', async ({ page }) => {
  12 |     await page.goto('/process');
  13 |     const timelineNode = page.locator('.timeline-step-row').first();
> 14 |     await expect(timelineNode).toBeVisible();
     |                                ^ Error: expect(locator).toBeVisible() failed
  15 | 
  16 |     const styleAttr = await timelineNode.getAttribute('style');
  17 |     // Framer Motion sets inline style for opacity/transform
  18 |     expect(styleAttr).toBeTruthy();
  19 |   });
  20 | 
  21 |   test('18. Verify each timeline step has a video wrapper with vintage-border class', async ({ page }) => {
  22 |     await page.goto('/process');
  23 |     const videoWrappers = page.locator('.step-media-wrapper');
  24 |     const count = await videoWrappers.count();
  25 |     expect(count).toBe(6);
  26 | 
  27 |     for (let i = 0; i < count; i++) {
  28 |       await expect(videoWrappers.nth(i).locator('video')).toBeVisible();
  29 |     }
  30 |   });
  31 | 
  32 |   test('19. Verify each timeline step has content card with step title and description', async ({ page }) => {
  33 |     await page.goto('/process');
  34 |     const cardContents = page.locator('.step-card-content');
  35 |     const count = await cardContents.count();
  36 |     expect(count).toBe(6);
  37 | 
  38 |     const titles = ['Handpicked', 'Carefully Sorted', 'Sun Dried', 'Expertly Roasted', 'Freeze Dried', 'Served Fresh'];
  39 |     for (let i = 0; i < count; i++) {
  40 |       await expect(cardContents.nth(i)).toContainText(titles[i]);
  41 |     }
  42 |   });
  43 | 
  44 |   test('20. Verify hero section renders with title "Chikmagaluru"', async ({ page }) => {
  45 |     await page.goto('/process');
  46 |     await expect(page.locator('.hero-title')).toContainText('Chikmagaluru');
  47 |     await expect(page.locator('.hero-subtitle')).toBeVisible();
  48 |     await expect(page.locator('.hero-description')).toBeVisible();
  49 |   });
  50 | 
  51 |   test('21. Verify grade badge section is present with AAA grade', async ({ page }) => {
  52 |     await page.goto('/process');
  53 |     await expect(page.locator('.grade-section')).toBeVisible();
  54 |     await expect(page.locator('.grade-badge')).toContainText('AAA');
  55 |   });
  56 | 
  57 | });
  58 | 
```