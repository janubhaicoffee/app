# Project: Framer Motion Micro-interactions and High-end Animations

## Architecture
- Framer Motion used for React component animations.
- Next.js Page Router or App Router (we need to inspect which one is active, the paths are `src/app/` which points to Next.js App Router).
- Key animations:
  - Product customizer: Spring-based sliders (`stiffness`, `damping`), 3D rotateY / holographic cards.
  - Checkout flow: scale-up spring entry interceptor warning modal, backdrop blur, glowing statement check box.
  - Process timeline: `useScroll`, `useTransform` scroll-linked transitions.
  - Progression dashboard: Dual-gradient sweep progress bar loading animation from 0% to computed percentage, card hover-expand effects.

## Code Layout
- Product Customizer: `src/app/product/[id]/page.js`
- Interceptor Warning Modal: `src/components/InterceptorModal.jsx` and checkout integration `src/app/checkout/page.js`
- Process Timeline: `src/app/process/page.js`
- Progression Dashboard: `src/app/account/page.js`

## Milestones
| # | Name | Scope | Dependencies | Status |
|---|---|---|---|---|
| M1 | E2E Testing Track | Design and build test suite covering Tiers 1-4, publish `TEST_READY.md` | None | PLANNED |
| M2 | Product Customizer Refinement | Product page sliders, mystery drop 3D flip card/glow reveal animation | None | PLANNED |
| M3 | Checkout warning & modal | Backdrop blur, scale-up entrance spring modal, checkbox glow validation | None | PLANNED |
| M4 | Scroll timeline page | Scroll-linked translation nodes, hover-zoom video cards | None | PLANNED |
| M5 | Lore progression bar | 0% to calculated target animated loading progress bar, expand points hover | None | PLANNED |
| M6 | E2E Integration and Adversarial | Run all tests (Tier 1-4), then generate Tier 5 adversarial tests and harden code | M1, M2, M3, M4, M5 | PLANNED |

## Interface Contracts
### Product Customizer
- Sliders for selection: using Framer Motion `<motion.div>` or `<motion.input>` with spring transitions.
- Mystery drop container: `<motion.div>` with `animate={{ rotateY: ... }}` or similar.

### Interceptor Modal
- `<AnimatePresence>` wrap for exit animations.
- Entrance animation: `initial={{ scale: 0.85, opacity: 0 }}` `animate={{ scale: 1, opacity: 1 }}` with `type: "spring"`.
- Backdrop transition: custom overlay backdrop blur with Framer Motion.

### Timeline
- Use `useScroll` target element ref, and `useTransform` map to style variables.

### Progression Dashboard
- Loading sweep: progress bar container and dynamic width element with Framer motion `animate` configuration on mount.
