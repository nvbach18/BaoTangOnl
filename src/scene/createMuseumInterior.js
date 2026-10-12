import * as THREE from 'three';

const CENTER_X = 180;
const FLOOR_HEIGHT = 6.5;
const ROOM_RADIUS = 22;
const ROOM_CENTERS = [CENTER_X - 29, CENTER_X + 29];

const FLOOR_THEMES = [
  { vi: 'DI SẢN VĂN HÓA', en: 'CULTURAL HERITAGE', color: '#bc8950' },
  { vi: 'MỸ THUẬT & ĐIÊU KHẮC', en: 'ART & SCULPTURE', color: '#7797a0' },
  { vi: 'KHOA HỌC & THIÊN NHIÊN', en: 'SCIENCE & NATURE', color: '#77906b' },
  { vi: 'LỊCH SỬ TƯƠNG LAI', en: 'HISTORY OF TOMORROW', color: '#977eaa' },
];

function addBox(parent, geometry, material, position, castShadow = true) {
  const mesh = new THREE.Mesh(geometry, material);
  mesh.position.set(...position);
  mesh.castShadow = castShadow;
  mesh.receiveShadow = true;
  parent.add(mesh);
  return mesh;
}

function addWallSegment(scene, colliders, x, z, angle, y, material, floor) {
  const length = 4.5;
  const thickness = 0.7;
  const wall = addBox(
    scene,
    new THREE.BoxGeometry(length, 5.8, thickness),
    material,
    [x, y + 2.9, z],
  );
  wall.rotation.y = angle;
  const halfX = Math.abs(Math.cos(angle)) * length / 2 + Math.abs(Math.sin(angle)) * thickness / 2;
  const halfZ = Math.abs(Math.sin(angle)) * length / 2 + Math.abs(Math.cos(angle)) * thickness / 2;
  colliders.push({
    type: 'box',
    minX: x - halfX,
    maxX: x + halfX,
    minZ: z - halfZ,
    maxZ: z + halfZ,
    minY: y,
    maxY: y + 5.8,
    floor,
  });
}

function createFloorSign(scene, floor, room, theme, language) {
  const canvas = document.createElement('canvas');
  canvas.width = 768;
  canvas.height = 220;
  const texture = new THREE.CanvasTexture(canvas);
  texture.colorSpace = THREE.SRGBColorSpace;
  const context = canvas.getContext('2d');
  const updateSign = (nextLanguage) => {
    context.fillStyle = '#1c2a28';
    context.fillRect(0, 0, canvas.width, canvas.height);
    context.strokeStyle = '#d8bd86';
    context.lineWidth = 5;
    context.strokeRect(12, 12, canvas.width - 24, canvas.height - 24);
    context.textAlign = 'center';
    context.fillStyle = '#d8bd86';
    context.font = '500 38px Arial';
    context.fillText(`${nextLanguage === 'vi' ? 'TẦNG' : 'FLOOR'} ${floor + 1}  ·  ${nextLanguage === 'vi' ? 'KHU' : 'GALLERY'} ${room + 1}`, 384, 78);
    context.fillStyle = '#f4eedf';
    context.font = '600 47px Arial';
    context.fillText(nextLanguage === 'vi' ? theme.vi : theme.en, 384, 155);
    texture.needsUpdate = true;
  };
  updateSign(language);
  const sign = new THREE.Mesh(
    new THREE.PlaneGeometry(9, 2.58),
    new THREE.MeshBasicMaterial({ map: texture, toneMapped: false }),
  );
  sign.position.set(ROOM_CENTERS[room], floor * FLOOR_HEIGHT + 4.5, room === 0 ? -21 : 21);
  sign.rotation.y = room === 0 ? 0 : Math.PI;
  scene.add(sign);
  return updateSign;
}

function createGallery(scene, colliders, floor, room, theme, materials, signUpdaters) {
  const y = floor * FLOOR_HEIGHT;
  const centerX = ROOM_CENTERS[room];
  const disc = new THREE.Mesh(
    new THREE.CylinderGeometry(ROOM_RADIUS, ROOM_RADIUS, 0.5, 64),
    materials.floor,
  );
  disc.position.set(centerX, y - 0.25, 0);
  disc.receiveShadow = true;
  scene.add(disc);

  const ring = new THREE.Mesh(
    new THREE.TorusGeometry(ROOM_RADIUS - 0.9, 0.12, 8, 64),
    materials.trim,
  );
  ring.rotation.x = Math.PI / 2;
  ring.position.set(centerX, y + 0.03, 0);
  scene.add(ring);

  for (let segment = 0; segment < 32; segment += 1) {
    const angle = (segment / 32) * Math.PI * 2;
    const inward = room === 0
      ? Math.abs(Math.atan2(Math.sin(angle), Math.cos(angle))) < 0.28
      : Math.abs(Math.atan2(Math.sin(angle - Math.PI), Math.cos(angle - Math.PI))) < 0.28;
    if (inward) continue;
    const x = centerX + Math.cos(angle) * ROOM_RADIUS;
    const z = Math.sin(angle) * ROOM_RADIUS;
    addWallSegment(scene, colliders, x, z, angle + Math.PI / 2, y, materials.wall, floor);
  }

  for (let index = 0; index < 5; index += 1) {
    const angle = (index / 5) * Math.PI * 2 + Math.PI / 5;
    const x = centerX + Math.cos(angle) * 11.5;
    const z = Math.sin(angle) * 11.5;
    const plinth = new THREE.Mesh(
      new THREE.CylinderGeometry(1.05, 1.25, 1.25, 20),
      materials.stone,
    );
    plinth.position.set(x, y + 0.63, z);
    plinth.castShadow = true;
    plinth.receiveShadow = true;
    scene.add(plinth);

    const glass = new THREE.Mesh(
      new THREE.CylinderGeometry(0.72, 0.8, 1.8, 20, 1, true),
      materials.glass,
    );
    glass.position.set(x, y + 2.12, z);
    scene.add(glass);

    const artifact = new THREE.Mesh(
      index % 2 === 0
        ? new THREE.DodecahedronGeometry(0.57, 1)
        : new THREE.TorusKnotGeometry(0.45, 0.13, 48, 8),
      materials.artifacts[(floor + room) % materials.artifacts.length],
    );
    artifact.position.set(x, y + 1.7, z);
    artifact.castShadow = true;
    scene.add(artifact);

    colliders.push({
      type: 'circle',
      x,
      z,
      radius: 1.15,
      minY: y,
      maxY: y + 2.5,
      floor,
    });
  }

  const lamp = new THREE.PointLight(theme.color, 90, 32, 2);
  lamp.position.set(centerX, y + 5.3, 0);
  scene.add(lamp);
  signUpdaters.push(createFloorSign(scene, floor, room, theme, 'vi'));
}

function createLift(scene, materials) {
  const lift = new THREE.Group();
  const platform = new THREE.Mesh(
    new THREE.CylinderGeometry(2.25, 2.25, 0.18, 32),
    materials.brass,
  );
  platform.position.y = 0.025;
  platform.receiveShadow = true;
  lift.add(platform);

  for (const side of [-1, 1]) {
    const panel = new THREE.Mesh(
      new THREE.BoxGeometry(0.12, 4.8, 4.6),
      materials.glass,
    );
    panel.position.set(side * 2.25, 2.5, -0.1);
    lift.add(panel);
    const frame = new THREE.Mesh(
      new THREE.BoxGeometry(0.2, 5.05, 0.2),
      materials.brass,
    );
    frame.position.set(side * 2.32, 2.5, 2.15);
    lift.add(frame);
  }

  const back = new THREE.Mesh(
    new THREE.BoxGeometry(4.6, 4.8, 0.12),
    materials.glass,
  );
  back.position.set(0, 2.5, -2.25);
  lift.add(back);
  for (const side of [-1, 1]) {
    const door = new THREE.Mesh(
      new THREE.BoxGeometry(1.05, 4.5, 0.12),
      materials.glass,
    );
    door.position.set(side * 1.45, 2.45, 2.2);
    lift.add(door);
  }
  const roof = new THREE.Mesh(
    new THREE.CylinderGeometry(2.25, 2.25, 0.15, 32),
    materials.brass,
  );
  roof.position.y = 4.95;
  lift.add(roof);
  const light = new THREE.PointLight('#ffe2a6', 34, 12, 2);
  light.position.set(0, 4.35, 0);
  lift.add(light);
  lift.position.set(CENTER_X, 0, 0);
  scene.add(lift);
  return lift;
}

export function createMuseumInterior(scene, colliders) {
  const signUpdaters = [];
  const materials = {
    floor: new THREE.MeshStandardMaterial({ color: '#857d70', roughness: 0.84 }),
    wall: new THREE.MeshStandardMaterial({ color: '#d4cbb9', roughness: 0.82 }),
    stone: new THREE.MeshStandardMaterial({ color: '#78634b', roughness: 0.68 }),
    brass: new THREE.MeshStandardMaterial({ color: '#c1a36c', metalness: 0.62, roughness: 0.36 }),
    glass: new THREE.MeshPhysicalMaterial({
      color: '#c3d8d6',
      roughness: 0.14,
      metalness: 0.18,
      transparent: true,
      opacity: 0.32,
      side: THREE.DoubleSide,
    }),
    artifacts: ['#c88952', '#79a6ae', '#a6ad76', '#ad87bd'].map((color) =>
      new THREE.MeshStandardMaterial({ color, metalness: 0.3, roughness: 0.36, emissive: color, emissiveIntensity: 0.08 })),
  };

  for (let floor = 0; floor < 4; floor += 1) {
    const y = floor * FLOOR_HEIGHT;
    const theme = FLOOR_THEMES[floor];
    const trim = new THREE.MeshStandardMaterial({ color: theme.color, metalness: 0.12, roughness: 0.7 });

    const structuralFloor = new THREE.Mesh(
      new THREE.BoxGeometry(100, 0.5, 60),
      new THREE.MeshStandardMaterial({ color: '#686760', roughness: 0.9 }),
    );
    structuralFloor.position.set(CENTER_X, y - 0.3, 0);
    structuralFloor.receiveShadow = true;
    scene.add(structuralFloor);

    for (const x of [130, 230]) {
      addBox(scene, new THREE.BoxGeometry(0.7, 5.8, 60), materials.wall, [x, y + 2.9, 0]);
    }
    addBox(scene, new THREE.BoxGeometry(100, 5.8, 0.7), materials.wall, [CENTER_X, y + 2.9, -30]);
    addBox(scene, new THREE.BoxGeometry(43, 5.8, 0.7), materials.wall, [151.5, y + 2.9, 30]);
    addBox(scene, new THREE.BoxGeometry(43, 5.8, 0.7), materials.wall, [208.5, y + 2.9, 30]);

    for (let room = 0; room < 2; room += 1) {
      createGallery(scene, colliders, floor, room, theme, { ...materials, trim }, signUpdaters);
    }

    const lobby = new THREE.Mesh(
      new THREE.CylinderGeometry(9.5, 9.5, 0.5, 48),
      materials.floor,
    );
    lobby.position.set(CENTER_X, y - 0.25, 0);
    lobby.receiveShadow = true;
    scene.add(lobby);

    addBox(scene, new THREE.BoxGeometry(16, 0.5, 15), materials.floor, [CENTER_X, y - 0.25, 0]);
    addBox(scene, new THREE.BoxGeometry(20, 0.5, 16), materials.floor, [CENTER_X, y - 0.25, 19]);
    addBox(scene, new THREE.BoxGeometry(7, 0.5, 12), materials.floor, [CENTER_X, y - 0.25, 11]);

    const ceilingRing = new THREE.Mesh(
      new THREE.TorusGeometry(8.4, 0.2, 10, 48),
      trim,
    );
    ceilingRing.rotation.x = Math.PI / 2;
    ceilingRing.position.set(CENTER_X, y + 5.65, 0);
    scene.add(ceilingRing);

    const elevatorLabel = new THREE.PointLight('#ffe6b6', 12, 14, 2);
    elevatorLabel.position.set(CENTER_X, y + 4.4, 5.5);
    scene.add(elevatorLabel);

    const border = new THREE.Mesh(
      new THREE.TorusGeometry(ROOM_RADIUS - 0.9, 0.12, 8, 64),
      trim,
    );
    border.rotation.x = Math.PI / 2;
    border.position.set(CENTER_X, y + 0.04, 0);
    scene.add(border);

    const floorColliders = [
      { type: 'box', minX: 129, maxX: 131, minZ: -30, maxZ: 30 },
      { type: 'box', minX: 229, maxX: 231, minZ: -30, maxZ: 30 },
      { type: 'box', minX: 130, maxX: 230, minZ: -31, maxZ: -29 },
      { type: 'box', minX: 130, maxX: 173, minZ: 29, maxZ: 31 },
      { type: 'box', minX: 187, maxX: 230, minZ: 29, maxZ: 31 },
    ];
    floorColliders.forEach((collider) => colliders.push({
      ...collider,
      minY: y,
      maxY: y + 5.8,
      floor,
    }));

    const ceiling = new THREE.Mesh(
      new THREE.CylinderGeometry(ROOM_RADIUS, ROOM_RADIUS, 0.34, 64),
      new THREE.MeshStandardMaterial({ color: '#5b5d58', roughness: 0.92, side: THREE.DoubleSide }),
    );
    ceiling.position.set(ROOM_CENTERS[0], y + FLOOR_HEIGHT - 0.17, 0);
    scene.add(ceiling);
    const secondCeiling = ceiling.clone();
    secondCeiling.position.x = ROOM_CENTERS[1];
    scene.add(secondCeiling);
  }

  const lift = createLift(scene, materials);
  let currentFloor = 0;

  return {
    entry: { x: CENTER_X, y: 1.72, z: 25.5, rotationY: 0 },
    elevator: { x: CENTER_X, z: 0 },
    exit: { x: CENTER_X, z: 25.5 },
    floorHeight: () => currentFloor * FLOOR_HEIGHT,
    currentFloor: () => currentFloor,
    goToFloor(floor) {
      currentFloor = THREE.MathUtils.clamp(floor, 0, 3);
      lift.position.y = currentFloor * FLOOR_HEIGHT;
      return {
        x: CENTER_X,
        y: currentFloor * FLOOR_HEIGHT + 1.72,
        z: 0,
      };
    },
    setLanguage(language) {
      signUpdaters.forEach((updateSign) => updateSign(language));
    },
  };
}
