# Verification — 2026-10-15

## Confirmed locally

- `npm test`: 4 tests passed. Screen-plane corners remain fixed for translated viewpoints; parallax sign and approach behavior agree with the off-axis projection; face coordinate mapping is bounded.
- `npm run build`: successful. All runtime assets are served locally; the large Three.js bundle is approximately 143 kB gzip. No remote CDN runtime is needed.
- Browser: actual WebGL room rendered in the Codex browser at desktop width and 390 × 844 mobile layout. Mobile document width equals the viewport width (390 px), with controls visible and no horizontal overflow.
- Gallery-to-experiment navigation, keyboard view movement, resident call interaction, and cancellation while camera permission is pending were exercised.
- Browser test harness: real MediaPipe WASM and model loaded, processed a synthetic Canvas video frame and reported no face. Every MediaStream track ended on stop.
- Permission rejection: synthetic `NotAllowedError` produced the manual-mode message and left no stream or worker.
- Late permission result: when cancelled before the stream resolved, all tracks on the late stream were stopped without creating a worker.
- Removed the obsolete Three.js PCFSoftShadowMap setting after a runtime warning; PCFShadowMap is used.

## Privacy boundary

The browser test harness uses generated blank frames and does not open a physical camera. Camera frames are transferred to a same-origin worker via ImageBitmap; only normalized eye midpoint and span are returned. There is no upload endpoint or analytics SDK. Production CSP limits network connections to the same origin.

## Remaining physical-device verification

A real person's face, physical webcam, Safari/iOS/Android devices, and long-running mobile thermal behavior have not been tested. Mobile-width browser rendering is not physical smartphone verification. Face geometry is relative to the first detected face, not a metric calibration of the monitor/camera. Turning the head can affect the depth estimate.

## Deployment

Initial production deployment `dpl_FXkhfGfhKdvoo5WvKmNbsoHZ4bTN` reached READY. Gallery, worker, WASM and model returned HTTP 200. Deployed model SHA-256 matches the checked-in model. CSP and camera-only Permissions-Policy were present.

A direct-link 404 with a trailing slash was found during production verification. The canonical experiment path now has no trailing slash, and Vercel explicitly redirects trailing slashes. The corrected deployment is checked below.

### Corrected production result

- Deployment `wow-threejs-7aetfapnj-shotakobayashis-projects.vercel.app`: READY / Production, built automatically from GitHub commit `532c710`.
- `https://wow-threejs-lab.vercel.app/experiments/01-window`: HTTP 200.
- The trailing-slash variant redirects to the canonical path and finishes at HTTP 200.
- Live browser: gallery and experiment render correctly; gallery navigation and resident-call interaction succeed; no production console errors or warnings observed.
- Built MediaPipe worker and model also passed the synthetic-frame inference/stop test with the exact production CSP headers applied by a temporary localhost server. This verifies compatibility with the restrictive policy without accessing a real camera.
- Vercel project is connected to `25im0047-commits/wow-threejs-lab`; subsequent main-branch pushes deploy automatically.

## Immersion update — 2026-10-15

- Added a viewport-filling experiment view, a hide/show-controls mode with Escape recovery, and inert hidden controls so keyboard focus cannot enter them.
- Added a real opening in the back wall with a three-layer outdoor landscape, foreground foliage, light shafts and glowing particles. Resident behavior includes blinking, small head tilts, automatic greetings and proximity-triggered approaches, respecting reduced-motion preferences for automatic motion.
- Added opt-in browser-generated ambience and spatial knock sounds; mute on page hide and dispose on navigation. Audio is off by default.
- Browser checks: desktop scene rendered, cinematic mode hid controls and Escape restored them. At 390 px viewport, document width was 390 px and the 366 px control panel occupied x=12..378. Audio toggled on and off with no console warnings or errors observed. Audible quality and physical-device performance remain unverified.
- Added a fifth projection test to verify that the lowered immersive aperture stays fixed as the observer moves.
