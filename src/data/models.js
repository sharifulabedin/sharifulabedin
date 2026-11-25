/* ==========================================================================
   3D MODELS DATA: LOCAL WEBGL CAD ASSETS + 11 VERIFIED SKETCHFAB MODELS
   ========================================================================== */

export const LOCAL_CAD_MODELS = [
  {
    id: 'xreal-frame',
    code: '01.XREAL_AR',
    title: 'XREAL One Spatial Frame',
    subtitle: 'CAD Hardware Mesh • Anodized Spatial Rig',
    url: '/models/xreal-one-frame.glb',
    pipeline: 'CAD Re-Mesh • Blender • glTF 2.0',
    cameraPos: [1.85, 1.15, 2.15],
  },
  {
    id: 'isho-sofa',
    code: '02.ISHO_SOFA',
    title: 'ISHO Spatial Round Sofa',
    subtitle: 'WebAR Furniture Configurator Asset',
    url: '/models/isho-round-sofa.glb',
    pipeline: 'Blender • Substance 3D • WebAR <15K Tris',
    cameraPos: [1.95, 1.35, 2.1],
  },
  {
    id: 'base-rig',
    code: '03.HUMANOID_RIG',
    title: 'Mixamo Humanoid Base Mesh',
    subtitle: 'Real-Time Character Topology & Skeleton',
    url: '/models/base-rig.glb',
    pipeline: 'Blender glTF 2.0 • Rigged Skeleton',
    cameraPos: [1.55, 1.45, 2.35],
  },
  {
    id: 'vp-stage-gizmo',
    code: '04.VP_DMX_STAGE',
    title: 'VP Broadcast LED + DMX Rig',
    subtitle: 'Procedural UE5 Virtual Production Schematic',
    url: null, // Procedural interactive virtual studio rig
    pipeline: 'Unreal Engine 5 • GrandMA2 DMX • Frustum',
    cameraPos: [2.25, 1.55, 2.45],
  },
];

export const SKETCHFAB_MODELS = [
  {
    uid: 'c5563af0c0234e69b9c17142ee991266',
    code: 'SKF-01',
    title: 'Old Central Jail Dhaka 3D Scan',
    category: 'heritage',
    categoryLabel: 'Heritage Scan',
    faces: '179,688',
    verts: '87,635',
    tags: ['Drone Scan', 'Agisoft Metashape', 'ZBrush', 'Blender'],
    description:
      'High-resolution aerial and terrestrial photogrammetry scan of Dhaka’s historic Old Central Jail complex.',
    thumb:
      'https://media.sketchfab.com/models/c5563af0c0234e69b9c17142ee991266/thumbnails/7ad9629cab7d4f74864c35f420d6fa43/8ba71cc6b1ad40cb837ff3b87c209731.jpeg',
    sketchfabUrl:
      'https://sketchfab.com/3d-models/old-central-jail-dhaka-3d-scanning-c5563af0c0234e69b9c17142ee991266',
  },
  {
    uid: 'f46c3973d8784b80b0989ad5e0078f7c',
    code: 'SKF-02',
    title: 'Old Central Jail — Padma Cell Block',
    category: 'heritage',
    categoryLabel: 'Heritage Scan',
    faces: '163,498',
    verts: '96,602',
    tags: ['DJI Aerial', 'Photogrammetry', 'Metashape'],
    description:
      'Drone-captured architectural elevation and roof geometry of the historic Padma building for digital preservation.',
    thumb:
      'https://media.sketchfab.com/models/f46c3973d8784b80b0989ad5e0078f7c/thumbnails/64a6f9076f1e48a6b56a4848fd35692a/47ef97ef573a407e8a98f21ace20d70c.jpeg',
    sketchfabUrl:
      'https://sketchfab.com/3d-models/none-f46c3973d8784b80b0989ad5e0078f7c',
  },
  {
    uid: '629a679fae974f1f991c26ed0b850528',
    code: 'SKF-03',
    title: 'Four National Leaders Jail Residence',
    category: 'heritage',
    categoryLabel: 'Heritage Scan',
    faces: '181,719',
    verts: '99,806',
    tags: ['Cultural Heritage', 'Photogrammetry', 'Retopology'],
    description:
      'Cultural conservation digital twin capturing structural masonry and weathered surface albedo.',
    thumb:
      'https://media.sketchfab.com/models/629a679fae974f1f991c26ed0b850528/thumbnails/ad2fd539313440f2abf9146f3623ecc9/41984b84820b476d81632ec5d027caf5.jpeg',
    sketchfabUrl:
      'https://sketchfab.com/3d-models/none-629a679fae974f1f991c26ed0b850528',
  },
  {
    uid: '242185235bd7423cab7da81ea1fee7c3',
    code: 'SKF-04',
    title: 'Horse-Drawn Carriage',
    category: 'props',
    categoryLabel: 'Game Prop',
    faces: '65,308',
    verts: '34,167',
    tags: ['Game Ready', 'Substance 3D Painter', 'PBR'],
    description:
      'Production-ready real-time vehicle prop with metallic/roughness PBR atlases and strict draw-call budgeting.',
    thumb:
      'https://media.sketchfab.com/models/242185235bd7423cab7da81ea1fee7c3/thumbnails/3552cd6fd94849a0844358d892b6c746/8d161e95311d4fc6a8bc977a24843383.jpeg',
    sketchfabUrl:
      'https://sketchfab.com/3d-models/none-242185235bd7423cab7da81ea1fee7c3',
  },
  {
    uid: 'b5fa7161fa744df6ab786309830bd897',
    code: 'SKF-05',
    title: 'ML_804 Industrial Mechanical Prop',
    category: 'props',
    categoryLabel: 'Hard Surface',
    faces: '59,794',
    verts: '30,828',
    tags: ['Hard Surface', 'Maya / Blender', 'Substance PBR'],
    description:
      'Precision hard-surface mechanical assembly modeled with clean bevel normals for Unreal Engine 5.',
    thumb:
      'https://media.sketchfab.com/models/b5fa7161fa744df6ab786309830bd897/thumbnails/74a71e7a0bd34bb796d6a32338f2f939/64a2a2799adb4641b4cb44893b3675ac.jpeg',
    sketchfabUrl:
      'https://sketchfab.com/3d-models/none-b5fa7161fa744df6ab786309830bd897',
  },
  {
    uid: '07755ad5b7b24b438bc8e31eeb667a5c',
    code: 'SKF-06',
    title: 'Antler Sculptural Table',
    category: 'webar',
    categoryLabel: 'WebAR / ArchViz',
    faces: '257,520',
    verts: '130,116',
    tags: ['Dekko ISHO', 'Organic Sculpt', 'PBR'],
    description:
      'Bespoke organic sculptural furniture piece modeled and shaded for Dekko ISHO ArchViz showcases.',
    thumb:
      'https://media.sketchfab.com/models/07755ad5b7b24b438bc8e31eeb667a5c/thumbnails/f0cc7123931245b0aa9bb7764f7b9241/f69856ab8d0c4ab7907b02fa31aaa5b0.jpeg',
    sketchfabUrl:
      'https://sketchfab.com/3d-models/none-07755ad5b7b24b438bc8e31eeb667a5c',
  },
  {
    uid: 'e5892344309c4274a478f260bdb50994',
    code: 'SKF-07',
    title: 'Executive Ergonomic Chair',
    category: 'webar',
    categoryLabel: 'WebAR Ready',
    faces: '18,995',
    verts: '9,596',
    tags: ['WebAR <20K', 'Substance 3D', 'Spatial Commerce'],
    description:
      'True-to-scale commercial WebAR furniture model under 19k polygons for instant smartphone room projection.',
    thumb:
      'https://media.sketchfab.com/models/e5892344309c4274a478f260bdb50994/thumbnails/6d88773ff4a645ddbeaa53205ca0ed88/c6dae261dc364796bb64c230897b7ef3.jpeg',
    sketchfabUrl:
      'https://sketchfab.com/3d-models/none-e5892344309c4274a478f260bdb50994',
  },
  {
    uid: '205249e5c4824da0add19205d70384e0',
    code: 'SKF-08',
    title: 'Culinary 3D Scan for Mobile AR',
    category: 'webar',
    categoryLabel: 'Mobile AR Scan',
    faces: '8,953',
    verts: '4,479',
    tags: ['RealityCapture', '8.9K Low-Poly', 'AR Menu'],
    description:
      'Ultra-lightweight photogrammetry food asset retopologized below 9k faces for sub-second mobile AR menus.',
    thumb:
      'https://media.sketchfab.com/models/205249e5c4824da0add19205d70384e0/thumbnails/cfdd2bc6a0984c52a78e8ad4a71860a5/0a3d171194cf40f89b459e8cc95ae87f.jpeg',
    sketchfabUrl:
      'https://sketchfab.com/3d-models/none-205249e5c4824da0add19205d70384e0',
  },
  {
    uid: '64c062f632864bdb8e6b3465a8486f72',
    code: 'SKF-09',
    title: 'TUIT Campus Architecture Scan',
    category: 'heritage',
    categoryLabel: 'Campus Scan',
    faces: '437,401',
    verts: '220,225',
    tags: ['Architecture', 'Photogrammetry', 'Metashape'],
    description:
      'Full multi-elevation institutional building digital twin reconstructed via dense multi-angle capture.',
    thumb:
      'https://media.sketchfab.com/models/64c062f632864bdb8e6b3465a8486f72/thumbnails/d52ac19b376c455abc368b90c751a63d/2e6c6f5ca6344d91b244efc2433083f5.jpeg',
    sketchfabUrl:
      'https://sketchfab.com/3d-models/none-64c062f632864bdb8e6b3465a8486f72',
  },
  {
    uid: '796b7729a0be44eebbb4d0eff4878a38',
    code: 'SKF-10',
    title: 'CIDP Building Digital Twin',
    category: 'heritage',
    categoryLabel: 'Digital Twin',
    faces: '163,500',
    verts: '103,533',
    tags: ['Digital Twin', '3D Scan', 'ArchViz'],
    description:
      'Structural architectural scan engineered for interactive spatial walkthroughs and urban visualization.',
    thumb:
      'https://media.sketchfab.com/models/796b7729a0be44eebbb4d0eff4878a38/thumbnails/1abe4fe391644750ac268bffc8d85b66/22e8edfbc04a497880c3bef979f39934.jpeg',
    sketchfabUrl:
      'https://sketchfab.com/3d-models/none-796b7729a0be44eebbb4d0eff4878a38',
  },
  {
    uid: '7694a326f576432d82942f81a02c5f84',
    code: 'SKF-11',
    title: 'Airports Council Int. Interactive 3D',
    category: 'webar',
    categoryLabel: 'Interactive 3D',
    faces: '14,676',
    verts: '7,570',
    tags: ['WebGL Campaign', '14.6K Tris', 'PBR'],
    description:
      'Lightweight interactive 3D promotional scene authored for Airports Council International social WebGL.',
    thumb:
      'https://media.sketchfab.com/models/7694a326f576432d82942f81a02c5f84/thumbnails/7318ed2bb8d546f9884d038621922ce2/35db2221ca8f42de869b7002d8ac28b7.jpeg',
    sketchfabUrl:
      'https://sketchfab.com/3d-models/none-7694a326f576432d82942f81a02c5f84',
  },
];
