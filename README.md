# SHARIF UL ABEDIN — Senior XR Designer & Technical Artist

**Unreal Engine 5/4 • Broadcast Virtual Production (GrandMA2 DMX) • Medical AR • Spatial WebGL • 3D Photogrammetry**

- **Location:** Dhaka, Bangladesh (Available Worldwide Remote)
- **Email:** [sharifulabedin@live.com](mailto:sharifulabedin@live.com)
- **LinkedIn:** [linkedin.com/in/sharifulabedin](https://linkedin.com/in/sharifulabedin)
- **Sketchfab 3D (11 Verified Scans & Props):** [sketchfab.com/sharifulabedin/models](https://sketchfab.com/sharifulabedin/models)
- **Behance CGI & Photogrammetry:** [behance.net/sharifulabedin](https://www.behance.net/sharifulabedin)

---

## Portfolio Architecture (`Vite + Vanilla CSS + Three.js`)

This repository powers my **Industrial Print & Spec-Sheet Neo-Brutalist** CV and interactive 3D portfolio website:

- **Native Three.js WebGL CAD Viewport (`src/three/heroStage.js`)**: Instant-loading `< 250 KB` `.glb` assets (*XREAL One AR Frame*, *ISHO Spatial Sofa*, *Mixamo Humanoid Rig*, and a procedural *UE5 Virtual Production + DMX Stage*) with hardware shader switches (`PBR`, `CLAY`, `WIRE`, `NORMALS`, `GRID/BOX`, `SPIN`) and live `TRIS / VERTS / FPS` telemetry.
- **11-Model Sketchfab CAD Stage (`src/components/sketchfabLab.js`)**: Interactive 16:9 WebXR inspector, category filters (*Heritage Photogrammetry*, *Game Props*, *WebAR & Spatial*), and on-demand inline card 3D mounting.
- **Printable 2-Page A4 CV (`cv.html` / `/cv`) & Official PDF (`public/Sharif_Ul_Abedin_CV.pdf`)**: Pixel-accurate 2-page `@media print` A4 CV synced to my October 2026 record.
- **Mechanical `Cmd+K` Command Bar (`src/components/commandPalette.js`)**: Keyboard-first index across all 15 interactive 3D rigs/models, flagship works, theme modes (`PAPER` / `INK`), and contact tools.

---

## Local Development

```bash
npm install
npm run dev      # Start Vite dev server
npm run build    # Production multi-page build -> dist/
npm run preview  # Preview production bundle locally
```

---

## Deploy on Vercel (Zero Config)

1. Go to **[vercel.com/new](https://vercel.com/new)** and sign in with GitHub.
2. Import **`sharifulabedin/sharifulabedin`**.
3. Vercel automatically detects **Vite** (`Build Command: npm run build`, `Output Directory: dist`) and reads [`vercel.json`](./vercel.json) for clean URLs (`/cv`) and immutable `.glb` asset caching.
4. Click **Deploy**. Every push to `main` automatically deploys to Vercel's global Edge network.

---

## Adding New 3D Models

- **Local WebGL `.glb` Models**: Place optimized `.glb` files in `public/models/` and append an entry to `LOCAL_CAD_MODELS` in [`src/data/models.js`](./src/data/models.js).
- **Sketchfab Models**: Append a model object (`uid`, `title`, `category`, `faces`, `verts`, `tags`, `thumb`, `sketchfabUrl`) to `SKETCHFAB_MODELS` in [`src/data/models.js`](./src/data/models.js).
