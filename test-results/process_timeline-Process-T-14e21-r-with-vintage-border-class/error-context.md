# Instructions

- Following Playwright test failed.
- Explain why, be concise, respect Playwright best practices.
- Provide a snippet of code with the fix, if possible.

# Test info

- Name: process_timeline.spec.js >> Process Timeline & Hover Effects >> 18. Verify each timeline step has a video wrapper with vintage-border class
- Location: tests\process_timeline.spec.js:21:3

# Error details

```
Error: expect(received).toBe(expected) // Object.is equality

Expected: 6
Received: 0
```

# Page snapshot

```yaml
- generic [active] [ref=e1]:
  - link "Skip to main content" [ref=e2] [cursor=pointer]:
    - /url: "#main-content"
  - banner [ref=e3]:
    - generic [ref=e4]:
      - link "Janu Bhai Coffee - Home" [ref=e6] [cursor=pointer]:
        - /url: /
        - img "Janu Bhai Logo" [ref=e7]
      - navigation "Desktop navigation" [ref=e8]:
        - link "Coffee Powder" [ref=e9] [cursor=pointer]:
          - /url: /product/instantcoffee
        - link "Recipes" [ref=e10] [cursor=pointer]:
          - /url: /
        - link "Our Sourcing" [ref=e11] [cursor=pointer]:
          - /url: /process
        - link "Contact" [ref=e12] [cursor=pointer]:
          - /url: /contact
        - link "Outlet Management" [ref=e13] [cursor=pointer]:
          - /url: /outlet
      - generic [ref=e14]:
        - link "Login" [ref=e15] [cursor=pointer]:
          - /url: /auth/login
        - link "Shopping Cart" [ref=e17] [cursor=pointer]:
          - /url: /cart
          - img [ref=e18]
  - main [ref=e21]:
    - main [ref=e22]:
      - generic [ref=e23]:
        - img "Chikmagalur Coffee Estate" [ref=e24]
        - generic [ref=e26]:
          - paragraph [ref=e27]: From the hills of
          - heading "Chikmagaluru" [level=1] [ref=e28]
          - paragraph [ref=e29]: "\"Every cup starts 3,400 feet above sea level.\""
        - generic [ref=e30] [cursor=pointer]:
          - generic [ref=e31]: Scroll to follow the bean's journey
          - img [ref=e32]
      - generic [ref=e35]:
        - generic [ref=e36]:
          - heading "Every cup begins 3,400 feet above sea level." [level=2] [ref=e37]
          - paragraph [ref=e38]: Nestled in the Western Ghats of India, Chikmagaluru is the birthplace of Indian coffee. The combination of rich volcanic soil, heavy canopy shade, and perfect microclimates results in beans that mature slowly, developing incredibly complex, deep profiles.
          - link "Follow the Journey" [ref=e39] [cursor=pointer]:
            - /url: "#phase-01"
            - text: Follow the Journey
            - img [ref=e40]
        - generic [ref=e42]:
          - generic [ref=e43]:
            - generic [ref=e44]: 0m
            - generic [ref=e45]: Peak Elevation
          - generic [ref=e46]:
            - generic [ref=e47]: 0%
            - generic [ref=e48]: Arabica Sourcing
          - generic [ref=e49]:
            - generic [ref=e50]: AAA
            - generic [ref=e51]: Quality Grade
          - generic [ref=e52]:
            - generic [ref=e53]: Single
            - generic [ref=e54]: Estate Origin
          - generic [ref=e55]:
            - generic [ref=e56]: Small Batch
            - generic [ref=e57]: Fresh Roasting Style
      - generic [ref=e58]:
        - generic [ref=e60]:
          - generic [ref=e63]: "01"
          - img "Handpicked" [ref=e66]
          - generic [ref=e67]:
            - generic [ref=e68]:
              - generic [ref=e69]: Harvesting
              - heading "Handpicked" [level=2] [ref=e70]
              - img [ref=e72]
            - paragraph [ref=e76]: Only the ripest, deep red coffee cherries are selected by hand. Sourcing only at peak maturity ensures a naturally sweet, clean cup with none of the sourness of underripe fruit.
        - generic [ref=e78]:
          - generic [ref=e81]: "02"
          - img "Sorted by Hand" [ref=e84]
          - generic [ref=e85]:
            - generic [ref=e86]:
              - generic [ref=e87]: Quality Control
              - heading "Sorted by Hand" [level=2] [ref=e88]
              - img [ref=e90]
            - generic [ref=e92]:
              - paragraph [ref=e93]: Sorting is where quality is won or lost. Every single batch is manually sorted to remove broken, insect-damaged, or discolored beans. This meticulous process ensures a pure, premium taste in every brew.
              - generic [ref=e94]:
                - generic [ref=e95]:
                  - heading "Rejected Beans" [level=4] [ref=e96]:
                    - img [ref=e97]
                    - text: Rejected Beans
                  - list [ref=e100]:
                    - listitem [ref=e101]:
                      - img [ref=e102]
                      - generic [ref=e105]:
                        - strong [ref=e106]: "Broken & Chipped:"
                        - text: Causes uneven roasting, leading to bitter and astringent flavors.
                    - listitem [ref=e107]:
                      - img [ref=e108]
                      - generic [ref=e111]:
                        - strong [ref=e112]: "Insect Damaged:"
                        - text: Contaminates the brew, creating flat, moldy off-notes.
                    - listitem [ref=e113]:
                      - img [ref=e114]
                      - generic [ref=e117]:
                        - strong [ref=e118]: "Black/Deformed:"
                        - text: Results in harsh chemical tastes and stale aromas.
                - generic [ref=e119]:
                  - heading "Janu Bhai AAA Beans" [level=4] [ref=e120]:
                    - img [ref=e121]
                    - text: Janu Bhai AAA Beans
                  - list [ref=e123]:
                    - listitem [ref=e124]:
                      - img [ref=e125]
                      - generic [ref=e127]:
                        - strong [ref=e128]: "Uniform Density:"
                        - text: Yields a perfectly balanced roast and consistent cup profiles.
                    - listitem [ref=e129]:
                      - img [ref=e130]
                      - generic [ref=e132]:
                        - strong [ref=e133]: "Symmetrical Sizing:"
                        - text: Bold, high-density beans that capture complex aromatic oils.
                    - listitem [ref=e134]:
                      - img [ref=e135]
                      - generic [ref=e137]:
                        - strong [ref=e138]: "Perfect Moisture (11%):"
                        - text: Locks in the natural berry and chocolate undertones.
        - generic [ref=e140]:
          - generic [ref=e143]: "03"
          - img "Sun Dried" [ref=e146]
          - generic [ref=e147]:
            - generic [ref=e148]:
              - generic [ref=e149]: Dehydration
              - heading "Sun Dried" [level=2] [ref=e150]
              - img [ref=e152]
            - paragraph [ref=e163]: Our beans are spread evenly across elevated drying beds, basking under the natural heat of the sun. Hand-raked hourly for slow, uniform dehydration, this locks in the complex sugars and full-bodied fruitiness.
        - generic [ref=e165]:
          - generic [ref=e168]: "04"
          - img "Expertly Roasted" [ref=e171]
          - generic [ref=e172]:
            - generic [ref=e173]:
              - generic [ref=e174]: Flavor Development
              - heading "Expertly Roasted" [level=2] [ref=e175]
              - img [ref=e177]
            - generic [ref=e180]:
              - paragraph [ref=e181]: Roasted in state-of-the-art small-batch roasters. Our master roasters monitor temperature curves to caramelize coffee sugars perfectly, bringing out intense notes of cocoa, nuts, and sweet spices.
              - generic [ref=e182]: Thermal Caramelization Active
        - generic [ref=e185]:
          - generic [ref=e188]: "05"
          - img "Freeze Dried" [ref=e191]
          - generic [ref=e192]:
            - generic [ref=e193]:
              - generic [ref=e194]: Preservation
              - heading "Freeze Dried" [level=2] [ref=e195]
              - img [ref=e197]
            - generic [ref=e211]:
              - generic [ref=e212]: ❄ Sub-Zero Vacuum
              - paragraph [ref=e213]: Freshly brewed coffee is concentrated and instantly frozen to -40°C. In an absolute vacuum, water is sublimated, locking the aromatic coffee oils and delicate flavor compounds into rigid crystals.
        - generic [ref=e215]:
          - generic [ref=e218]: "06"
          - img "Served Fresh" [ref=e221]
          - generic [ref=e222]:
            - generic [ref=e223]:
              - generic [ref=e224]: Delivery
              - heading "Served Fresh" [level=2] [ref=e225]
              - img [ref=e227]
            - paragraph [ref=e230]: Airtight packaging ensures zero oxidation. From our estate roasting facility in Chikmagalur to your doorstep, we preserve every nuance of flavor so you experience coffee at its peak.
      - generic [ref=e231]:
        - heading "The journey ends here. The experience begins with you." [level=2] [ref=e232]:
          - text: The journey ends here.
          - generic [ref=e233]: The experience begins with you.
        - img [ref=e239]
        - link "Brew Yours" [ref=e241] [cursor=pointer]:
          - /url: /product/instantcoffee
          - text: Brew Yours
          - img [ref=e242]
  - contentinfo [ref=e244]:
    - generic [ref=e246]:
      - generic [ref=e247]:
        - link "Janu Bhai Coffee - Home" [ref=e248] [cursor=pointer]:
          - /url: /
          - img "Janu Bhai Logo" [ref=e249]
        - paragraph [ref=e250]: Born in Chikmagaluru. Small-batch roasted. Delivered fresh nationwide.
        - paragraph [ref=e251]: © 2026 Janu Bhai Coffee.
      - generic [ref=e252]:
        - generic [ref=e253]: Shop
        - list [ref=e254]:
          - listitem [ref=e255]:
            - link "Coffee Powder" [ref=e256] [cursor=pointer]:
              - /url: /product/instantcoffee
          - listitem [ref=e257]:
            - link "Our Sourcing" [ref=e258] [cursor=pointer]:
              - /url: /process
          - listitem [ref=e259]:
            - link "Recipes" [ref=e260] [cursor=pointer]:
              - /url: /
          - listitem [ref=e261]:
            - link "Bulk Orders" [ref=e262] [cursor=pointer]:
              - /url: /contact
      - generic [ref=e263]:
        - generic [ref=e264]: Legal
        - list [ref=e265]:
          - listitem [ref=e266]:
            - link "Terms & Conditions" [ref=e267] [cursor=pointer]:
              - /url: /terms
          - listitem [ref=e268]:
            - link "Privacy Policy" [ref=e269] [cursor=pointer]:
              - /url: /privacy
          - listitem [ref=e270]:
            - link "Refund Policy" [ref=e271] [cursor=pointer]:
              - /url: /refunds
          - listitem [ref=e272]:
            - link "Shipping Policy" [ref=e273] [cursor=pointer]:
              - /url: /shipping
      - generic [ref=e274]:
        - generic [ref=e275]: Support
        - list [ref=e276]:
          - listitem [ref=e277]:
            - link "Track Order" [ref=e278] [cursor=pointer]:
              - /url: /track
          - listitem [ref=e279]:
            - link "Contact Support" [ref=e280] [cursor=pointer]:
              - /url: /contact
          - listitem [ref=e281]: hello@janubhai.com
          - listitem [ref=e282]: +91 8527976791
      - generic [ref=e283]:
        - generic [ref=e284]: Social
        - generic [ref=e285]:
          - link "Instagram" [ref=e286] [cursor=pointer]:
            - /url: https://instagram.com/janubhaicoffee
            - img [ref=e287]
          - link "Twitter" [ref=e290] [cursor=pointer]:
            - /url: https://twitter.com/janubhaicoffee
            - img [ref=e291]
          - link "YouTube" [ref=e293] [cursor=pointer]:
            - /url: https://youtube.com
            - img [ref=e294]
  - alert [ref=e297]
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
  14 |     await expect(timelineNode).toBeVisible();
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
> 25 |     expect(count).toBe(6);
     |                   ^ Error: expect(received).toBe(expected) // Object.is equality
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