# Original User Request

## Initial Request — 2026-06-26T01:28:25Z

Refine the UI/UX of the Janu Bhai Coffee application with cinematic Framer Motion micro-interactions and high-end animations across the product customizer, checkout flow, process timeline, and progression screens.

Working directory: c:\Users\hudav\Documents\GitHub\app
Integrity mode: demo

## Requirements

### R1. Cinematic Product Customizer & Decrypter UI
Refine the Brew Blueprint selector and Mystery Drop decrypter on the product page. Sliders must react with elastic spring physics, and the mystery drop reveal must perform a cinematic 3D card flip or holographic glow card animation.
- *Verification*: An independent auditor agent must navigate to a product page, verify that the blueprint selector and mystery drop decrypter elements are present, and assert that Framer Motion components are utilized for these interactive sections.

### R2. Interceptor Warning & Checkout Flow Animations
Improve the high-intensity caffeine warning modal with an immersive backdrop blur, scale-up entrance animation, and glowing validation indicators on the statement checkbox.
- *Verification*: An independent auditor agent must trigger the warning modal, inspect the modal container, and assert that it utilizes Framer Motion transitions (AnimatePresence and entrance spring motion).

### R3. Spatial Timeline Transitions on Process Page
Enhance the timeline steps on the Process page with smooth scroll-linked translations, hover-zoom effects on video cards, and custom blending overlays.
- *Verification*: An independent auditor agent must verify that the process page timeline nodes animate scale/opacity on scroll and that hover-tilt or scale effects exist on the video wrappers.

### R4. Progression Lore Dashboard Visuals
Create a glowing lore progression completion bar in the user portal that animates from 0% to the target percentage with a dual-gradient sweep on load, and card hover-expand effects for points ledger items.
- *Verification*: An independent auditor agent must verify that the progress bar exists in the portal and that its width matches the calculated lore progression percentage with smooth transitions.

## Acceptance Criteria

### UI Animation Standards
- [ ] Product customizer sliders utilize Framer Motion spring physics with `stiffness` and `damping` parameters.
- [ ] The Mystery Drop reveal utilizes a 3D rotation (`rotateY`) card flip transition or a glowing holographic backdrop transition.
- [ ] The caffeine warning modal opens with a smooth scale-up spring entry, and backdrop blur filter transitions.
- [ ] Process timeline steps use `useScroll` and `useTransform` to bind scroll progress to `opacity`, `scale`, and `y` position.
- [ ] Progression progress bar uses Framer Motion `animate` to sweep from 0% to the computed percentage on component mount.
