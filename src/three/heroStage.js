/* ==========================================================================
   NATIVE THREE.JS INTERACTIVE CAD VIEWPORT (Instant Local GLB + VP Stage Rig)
   ========================================================================== */

import * as THREE from 'three';
import { OrbitControls } from 'three/addons/controls/OrbitControls.js';
import { GLTFLoader } from 'three/addons/loaders/GLTFLoader.js';
import { RoomEnvironment } from 'three/addons/environments/RoomEnvironment.js';
import { LOCAL_CAD_MODELS } from '../data/models.js';

export function initHeroCadStage() {
  const viewportEl = document.getElementById('cad-viewport');
  const canvas = document.getElementById('hero-webgl-canvas');
  const loaderOverlay = document.getElementById('cad-loader');
  const hudTitleEl = document.getElementById('cad-hud-title');
  const hudStatsEl = document.getElementById('cad-hud-stats');
  const modelTabsEl = document.getElementById('cad-model-tabs');

  if (!viewportEl || !canvas) return null;

  if (modelTabsEl) {
    modelTabsEl.innerHTML = LOCAL_CAD_MODELS.map(
      (m, i) => `
        <button
          type="button"
          class="cad-model-btn ${i === 0 ? 'is-active' : ''}"
          data-cad-model="${m.id}"
          title="${m.title} — ${m.subtitle}"
        >${m.code}</button>
      `
    ).join('');
  }

  let renderer;
  try {
    renderer = new THREE.WebGLRenderer({
      canvas,
      antialias: true,
      alpha: false,
      powerPreference: 'high-performance',
    });
  } catch {
    if (loaderOverlay) {
      loaderOverlay.hidden = false;
      loaderOverlay.textContent = 'WEBGL CONTEXT UNAVAILABLE — USE SKETCHFAB STAGE BELOW';
    }
    return null;
  }

  renderer.setPixelRatio(Math.min(window.devicePixelRatio || 1, 2));
  renderer.toneMapping = THREE.ACESFilmicToneMapping;
  renderer.toneMappingExposure = 1.25;
  renderer.outputColorSpace = THREE.SRGBColorSpace;

  const scene = new THREE.Scene();
  scene.background = new THREE.Color(0x141414);

  // Neutral studio IBL environment
  const pmrem = new THREE.PMREMGenerator(renderer);
  const envTex = pmrem.fromScene(new RoomEnvironment(), 0.04).texture;
  scene.environment = envTex;

  // High-contrast 3-Point Studio CAD Lighting
  const keyLight = new THREE.DirectionalLight(0xfff9f0, 2.8);
  keyLight.position.set(4, 6, 5);
  scene.add(keyLight);

  const rimLight = new THREE.DirectionalLight(0xff5e1a, 1.6);
  rimLight.position.set(-4, 3, -4);
  scene.add(rimLight);

  const fillLight = new THREE.HemisphereLight(0xf4f0ea, 0x222226, 0.95);
  scene.add(fillLight);

  // Camera & OrbitControls
  const camera = new THREE.PerspectiveCamera(38, 1, 0.05, 100);
  camera.position.set(1.85, 1.15, 2.15);

  const controls = new OrbitControls(camera, canvas);
  controls.enableDamping = true;
  controls.dampingFactor = 0.07;
  controls.minDistance = 0.65;
  controls.maxDistance = 7.5;
  controls.target.set(0, 0.5, 0);

  // CAD Floor Grid
  const cadGuideGroup = new THREE.Group();
  const gridHelper = new THREE.GridHelper(4.4, 22, 0xff4d00, 0x383532);
  gridHelper.position.y = 0;
  cadGuideGroup.add(gridHelper);
  scene.add(cadGuideGroup);

  // Shared override materials (DoubleSide for CAD surface shells)
  const clayMaterial = new THREE.MeshStandardMaterial({
    color: 0xe8e1d7,
    roughness: 0.62,
    metalness: 0.05,
    side: THREE.DoubleSide,
  });

  const wireCoreMaterial = new THREE.MeshBasicMaterial({
    color: 0x161618,
    side: THREE.DoubleSide,
    polygonOffset: true,
    polygonOffsetFactor: 1,
    polygonOffsetUnits: 1,
  });

  const wireLineMaterial = new THREE.MeshBasicMaterial({
    color: 0xff4d00,
    wireframe: true,
  });

  const normalMaterial = new THREE.MeshNormalMaterial({
    flatShading: false,
    side: THREE.DoubleSide,
  });

  const gltfLoader = new GLTFLoader();
  const modelCache = new Map();

  let activeRoot = null;
  let activeBoundsHelper = null;
  let vpAnimRefs = null;
  let activeModelMeta = LOCAL_CAD_MODELS[0];
  let currentShader = 'pbr';
  let showGrid = true;
  let turntable = true;
  let isVisible = true;
  let activeTris = 0;
  let activeVerts = 0;
  let loadReqToken = 0;

  let userDragging = false;
  controls.addEventListener('start', () => {
    userDragging = true;
  });
  controls.addEventListener('end', () => {
    userDragging = false;
  });

  function buildProceduralVpRig() {
    const group = new THREE.Group();

    const darkSteel = new THREE.MeshStandardMaterial({
      color: 0x8e95a2,
      metalness: 0.72,
      roughness: 0.26,
      side: THREE.DoubleSide,
    });
    const stageDeckMat = new THREE.MeshStandardMaterial({
      color: 0x26262a,
      metalness: 0.25,
      roughness: 0.72,
    });
    const ledWallMat = new THREE.MeshStandardMaterial({
      color: 0x1c354d,
      emissive: 0x0e3458,
      emissiveIntensity: 0.95,
      metalness: 0.15,
      roughness: 0.35,
      side: THREE.DoubleSide,
    });
    const orangeAccent = new THREE.MeshStandardMaterial({
      color: 0xff4d00,
      emissive: 0xff4d00,
      emissiveIntensity: 0.32,
      metalness: 0.25,
      roughness: 0.38,
    });
    const dmxSpotMat = new THREE.MeshStandardMaterial({
      color: 0xe5ff00,
      emissive: 0xe5ff00,
      emissiveIntensity: 0.85,
      roughness: 0.2,
    });

    const deck = new THREE.Mesh(new THREE.CylinderGeometry(1.15, 1.18, 0.07, 40), stageDeckMat);
    deck.position.y = 0.035;
    group.add(deck);

    const ledWall = new THREE.Mesh(
      new THREE.CylinderGeometry(1.08, 1.08, 1.05, 40, 6, true, -Math.PI * 0.6, Math.PI * 1.2),
      ledWallMat
    );
    ledWall.position.y = 0.58;
    group.add(ledWall);

    const truss = new THREE.Mesh(new THREE.TorusGeometry(0.96, 0.028, 10, 40), darkSteel);
    truss.rotation.x = Math.PI / 2;
    truss.position.y = 1.15;
    group.add(truss);

    for (let i = 0; i < 5; i++) {
      const angle = -Math.PI * 0.45 + (i / 4) * Math.PI * 0.9;
      const housing = new THREE.Mesh(new THREE.BoxGeometry(0.085, 0.11, 0.085), darkSteel);
      housing.position.set(Math.sin(angle) * 0.92, 1.08, -Math.cos(angle) * 0.92);
      housing.lookAt(0, 0.35, 0);

      const lens = new THREE.Mesh(new THREE.CylinderGeometry(0.032, 0.042, 0.03, 12), dmxSpotMat);
      lens.rotation.x = Math.PI / 2;
      lens.position.z = 0.05;
      housing.add(lens);
      group.add(housing);
    }

    const stageSubject = new THREE.Mesh(new THREE.IcosahedronGeometry(0.24, 1), orangeAccent);
    stageSubject.position.set(0, 0.42, -0.15);
    group.add(stageSubject);

    const dollyPivot = new THREE.Group();
    const camBody = new THREE.Mesh(new THREE.BoxGeometry(0.17, 0.13, 0.24), darkSteel);
    camBody.position.set(0, 0.44, 0.78);

    const lensBarrel = new THREE.Mesh(new THREE.CylinderGeometry(0.048, 0.052, 0.11, 16), orangeAccent);
    lensBarrel.rotation.x = Math.PI / 2;
    lensBarrel.position.z = -0.16;
    camBody.add(lensBarrel);

    const tripod = new THREE.Mesh(new THREE.CylinderGeometry(0.025, 0.15, 0.38, 6), darkSteel);
    tripod.position.set(0, 0.19, 0.78);

    const frustumGeo = new THREE.ConeGeometry(0.4, 0.78, 4, 1, true);
    const frustumMat = new THREE.MeshBasicMaterial({
      color: 0xe5ff00,
      wireframe: true,
    });
    const frustum = new THREE.Mesh(frustumGeo, frustumMat);
    frustum.rotation.x = Math.PI / 2;
    frustum.rotation.y = Math.PI / 4;
    frustum.position.z = -0.54;
    camBody.add(frustum);

    dollyPivot.add(camBody);
    dollyPivot.add(tripod);
    group.add(dollyPivot);

    return {
      root: group,
      anim: { dollyPivot, stageSubject },
    };
  }

  function prepareLoadedGltf(gltfScene, meta) {
    // Ensure vertex normals & DoubleSide high-contrast studio PBR materials
    gltfScene.traverse((obj) => {
      if (!obj.isMesh || !obj.geometry) return;
      if (!obj.geometry.attributes.normal) {
        obj.geometry.computeVertexNormals();
      }
      if (meta.id === 'xreal-frame') {
        obj.material = new THREE.MeshStandardMaterial({
          color: 0xdce3ee,
          metalness: 0.62,
          roughness: 0.24,
          side: THREE.DoubleSide,
        });
      } else if (meta.id === 'isho-sofa') {
        obj.material = new THREE.MeshStandardMaterial({
          color: 0xe5a93c,
          metalness: 0.06,
          roughness: 0.68,
          side: THREE.DoubleSide,
        });
      } else if (obj.material) {
        obj.material.side = THREE.DoubleSide;
      }
    });

    // Orient XREAL glasses front frame to face +Z toward camera
    if (meta.id === 'xreal-frame') {
      gltfScene.rotation.y = Math.PI / 2;
    }

    const wrapper = new THREE.Group();
    wrapper.add(gltfScene);
    wrapper.updateMatrixWorld(true);

    const box = new THREE.Box3().setFromObject(gltfScene);
    const size = new THREE.Vector3();
    box.getSize(size);

    const maxDim = Math.max(size.x, size.y, size.z) || 1;
    const targetSpan = meta.id === 'xreal-frame' ? 1.85 : 1.65;
    const scale = targetSpan / maxDim;
    gltfScene.scale.multiplyScalar(scale);
    wrapper.updateMatrixWorld(true);

    const scaledBox = new THREE.Box3().setFromObject(gltfScene);
    const scaledCenter = new THREE.Vector3();
    scaledBox.getCenter(scaledCenter);

    gltfScene.position.x -= scaledCenter.x;
    gltfScene.position.z -= scaledCenter.z;
    gltfScene.position.y -= scaledBox.min.y - (meta.id === 'xreal-frame' ? 0.22 : 0.0);
    wrapper.updateMatrixWorld(true);

    return wrapper;
  }

  function countGeometry(root) {
    let tris = 0;
    let verts = 0;
    root.traverse((obj) => {
      if (obj.isMesh && !obj.userData.isWireOverlay && obj.geometry) {
        const pos = obj.geometry.attributes.position;
        if (pos) verts += pos.count;
        if (obj.geometry.index) {
          tris += Math.floor(obj.geometry.index.count / 3);
        } else if (pos) {
          tris += Math.floor(pos.count / 3);
        }
      }
    });
    return { tris, verts };
  }

  function applyShaderMode(mode) {
    currentShader = mode;
    if (!activeRoot) return;

    activeRoot.traverse((obj) => {
      if (!obj.isMesh || obj.userData.isWireOverlay) return;

      if (!obj.userData.origMaterial) {
        obj.userData.origMaterial = obj.material;
      }

      if (obj.userData.wireChild) {
        obj.remove(obj.userData.wireChild);
        obj.userData.wireChild = null;
      }

      if (mode === 'pbr') {
        obj.material = obj.userData.origMaterial;
      } else if (mode === 'clay') {
        obj.material = clayMaterial;
      } else if (mode === 'normals') {
        obj.material = normalMaterial;
      } else if (mode === 'wire') {
        obj.material = wireCoreMaterial;
        const wireChild = new THREE.Mesh(obj.geometry, wireLineMaterial);
        wireChild.userData.isWireOverlay = true;
        obj.add(wireChild);
        obj.userData.wireChild = wireChild;
      }
    });

    document.querySelectorAll('[data-cad-shader]').forEach((btn) => {
      btn.classList.toggle('is-active', btn.dataset.cadShader === mode);
    });
    updateHudText(lastFps);
  }

  let activeBoundsBox = null;

  function refreshHelpers() {
    if (activeBoundsHelper) {
      scene.remove(activeBoundsHelper);
      activeBoundsHelper = null;
      activeBoundsBox = null;
    }
    if (activeRoot && showGrid) {
      activeBoundsBox = new THREE.Box3().setFromObject(activeRoot);
      activeBoundsHelper = new THREE.Box3Helper(activeBoundsBox, 0xe5ff00);
      scene.add(activeBoundsHelper);
    }
    cadGuideGroup.visible = showGrid;
  }

  function frameActiveModel(meta) {
    if (!activeRoot) return;
    const box = new THREE.Box3().setFromObject(activeRoot);
    const center = new THREE.Vector3();
    box.getCenter(center);
    controls.target.set(0, Math.max(0.32, center.y), 0);
    const [cx, cy, cz] = meta.cameraPos || [1.85, 1.15, 2.15];
    camera.position.set(cx, cy, cz);
    controls.update();
  }

  function updateHudText(fpsValue) {
    if (hudTitleEl && activeModelMeta) {
      hudTitleEl.innerHTML = `<span class="cad-hud__accent">${activeModelMeta.code}</span> // ${activeModelMeta.title}`;
    }
    if (hudStatsEl) {
      const fpsPart = fpsValue ? ` • <span class="cad-hud__accent">${fpsValue} FPS</span>` : '';
      hudStatsEl.innerHTML = `TRIS: ${activeTris.toLocaleString()} • VERTS: ${activeVerts.toLocaleString()} • MODE: ${currentShader.toUpperCase()}${fpsPart}`;
    }
  }

  async function loadCadModel(modelId) {
    const meta = LOCAL_CAD_MODELS.find((m) => m.id === modelId) || LOCAL_CAD_MODELS[0];
    activeModelMeta = meta;
    const token = ++loadReqToken;

    document.querySelectorAll('[data-cad-model]').forEach((btn) => {
      btn.classList.toggle('is-active', btn.dataset.cadModel === meta.id);
    });

    if (loaderOverlay) {
      loaderOverlay.hidden = false;
      loaderOverlay.textContent = `MOUNTING ${meta.code}...`;
    }

    if (activeRoot) {
      scene.remove(activeRoot);
      activeRoot = null;
    }
    vpAnimRefs = null;

    try {
      let entry = modelCache.get(meta.id);
      if (!entry) {
        if (!meta.url) {
          entry = buildProceduralVpRig();
        } else {
          const gltf = await gltfLoader.loadAsync(meta.url);
          if (token !== loadReqToken) return;
          entry = {
            root: prepareLoadedGltf(gltf.scene, meta),
            anim: null,
          };
        }
        modelCache.set(meta.id, entry);
      }

      if (token !== loadReqToken) return;

      activeRoot = entry.root;
      activeRoot.rotation.set(0, 0, 0);
      vpAnimRefs = entry.anim;
      scene.add(activeRoot);

      const stats = countGeometry(activeRoot);
      activeTris = stats.tris;
      activeVerts = stats.verts;

      applyShaderMode(currentShader);
      refreshHelpers();
      frameActiveModel(meta);
      updateHudText(lastFps);
    } catch (err) {
      console.error('CAD stage load error:', err);
      if (hudStatsEl) hudStatsEl.textContent = 'MODEL LOAD ERROR — CHECK NETWORK';
    } finally {
      if (token === loadReqToken && loaderOverlay) {
        loaderOverlay.hidden = true;
      }
    }
  }

  function syncSize() {
    const rect = viewportEl.getBoundingClientRect();
    const w = Math.max(1, Math.floor(rect.width));
    const h = Math.max(1, Math.floor(rect.height));
    camera.aspect = w / h;
    camera.updateProjectionMatrix();
    renderer.setSize(w, h, false);
  }

  const resizeObs = new ResizeObserver(syncSize);
  resizeObs.observe(viewportEl);
  syncSize();

  const visObs = new IntersectionObserver(
    (entries) => {
      entries.forEach((e) => {
        isVisible = e.isIntersecting;
      });
    },
    { threshold: 0.02 }
  );
  visObs.observe(viewportEl);

  viewportEl.closest('.cad-rig')?.addEventListener('click', (e) => {
    const modelBtn = e.target.closest('[data-cad-model]');
    if (modelBtn) {
      loadCadModel(modelBtn.dataset.cadModel);
      return;
    }

    const shaderBtn = e.target.closest('[data-cad-shader]');
    if (shaderBtn) {
      applyShaderMode(shaderBtn.dataset.cadShader);
      return;
    }

    const actionBtn = e.target.closest('[data-cad-action]');
    if (!actionBtn) return;
    const action = actionBtn.dataset.cadAction;

    if (action === 'grid') {
      showGrid = !showGrid;
      actionBtn.classList.toggle('is-active', showGrid);
      refreshHelpers();
    } else if (action === 'turntable') {
      turntable = !turntable;
      actionBtn.classList.toggle('is-active', turntable);
    } else if (action === 'reset') {
      frameActiveModel(activeModelMeta);
    }
  });

  const clock = new THREE.Clock();
  let frameAccumulator = 0;
  let elapsedAccumulator = 0;
  let lastFps = 60;

  function animate() {
    requestAnimationFrame(animate);
    if (!isVisible) return;

    const dt = Math.min(clock.getDelta(), 0.1);
    const t = clock.elapsedTime;

    if (activeRoot && turntable && !userDragging) {
      activeRoot.rotation.y += dt * 0.45;
      if (activeBoundsBox) activeBoundsBox.setFromObject(activeRoot);
    }

    if (vpAnimRefs) {
      vpAnimRefs.dollyPivot.rotation.y = Math.sin(t * 0.9) * 0.35;
      vpAnimRefs.stageSubject.rotation.x = t * 0.6;
      vpAnimRefs.stageSubject.rotation.y = t * 0.8;
    }

    controls.update();
    renderer.render(scene, camera);

    frameAccumulator += 1;
    elapsedAccumulator += dt;
    if (elapsedAccumulator >= 0.75) {
      lastFps = Math.min(120, Math.round(frameAccumulator / elapsedAccumulator));
      frameAccumulator = 0;
      elapsedAccumulator = 0;
      updateHudText(lastFps);
    }
  }

  loadCadModel(LOCAL_CAD_MODELS[0].id);
  animate();

  return {
    loadCadModel,
    applyShaderMode,
    toggleWireframe() {
      applyShaderMode(currentShader === 'wire' ? 'pbr' : 'wire');
    },
    resetCamera() {
      frameActiveModel(activeModelMeta);
    },
  };
}
