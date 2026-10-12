import * as THREE from 'three';

function textTexture() {
  const canvas = document.createElement('canvas');
  canvas.width = 1024;
  canvas.height = 220;
  const context = canvas.getContext('2d');
  context.clearRect(0, 0, canvas.width, canvas.height);
  context.fillStyle = '#f2dcb2';
  context.font = '600 94px Georgia';
  context.textAlign = 'center';
  context.textBaseline = 'middle';
  context.fillText('VIRTUAL MUSEUM', 512, 111);
  const texture = new THREE.CanvasTexture(canvas);
  texture.colorSpace = THREE.SRGBColorSpace;
  return texture;
}

function box(group, geometry, material, position, castShadow = true) {
  const mesh = new THREE.Mesh(geometry, material);
  mesh.position.set(...position);
  mesh.castShadow = castShadow;
  mesh.receiveShadow = true;
  group.add(mesh);
  return mesh;
}

export function createMuseumExterior(scene, colliders, groundHeight) {
  const structure = new THREE.Group();
  const baseY = groundHeight(0, -77);
  structure.position.set(0, baseY, -77);
  structure.scale.set(2, 1.75, 1.35);
  const museum = new THREE.Group();
  museum.position.z = 77;
  structure.add(museum);
  const limestone = new THREE.MeshStandardMaterial({ color: '#c8b798', roughness: 0.82 });
  const trim = new THREE.MeshStandardMaterial({ color: '#e1d1b2', roughness: 0.7 });
  const roofMaterial = new THREE.MeshStandardMaterial({ color: '#75614d', roughness: 0.76 });
  const dark = new THREE.MeshStandardMaterial({ color: '#263532', roughness: 0.44, metalness: 0.16 });
  const glass = new THREE.MeshStandardMaterial({ color: '#718e8c', roughness: 0.24, metalness: 0.38, emissive: '#273b38', emissiveIntensity: 0.25 });
  const bronze = new THREE.MeshStandardMaterial({ color: '#796747', roughness: 0.38, metalness: 0.65 });

  box(museum, new THREE.BoxGeometry(34, 13, 15), limestone, [0, 6.5, -77]);
  box(museum, new THREE.BoxGeometry(39, 0.95, 18), trim, [0, 13.08, -77]);
  box(museum, new THREE.BoxGeometry(38, 1.6, 17), roofMaterial, [0, 14.22, -77]);
  box(museum, new THREE.BoxGeometry(40, 0.55, 18.5), trim, [0, 15.12, -77]);

  const pediment = new THREE.Shape();
  pediment.moveTo(-18, 0);
  pediment.lineTo(18, 0);
  pediment.lineTo(0, 8);
  pediment.closePath();
  const pedimentGeometry = new THREE.ExtrudeGeometry(pediment, { depth: 1.2, bevelEnabled: true, bevelSegments: 1, bevelSize: 0.28, bevelThickness: 0.24 });
  const pedimentMesh = new THREE.Mesh(pedimentGeometry, limestone);
  pedimentMesh.position.set(0, 15.25, -67.2);
  pedimentMesh.castShadow = true;
  pedimentMesh.receiveShadow = true;
  museum.add(pedimentMesh);
  box(museum, new THREE.BoxGeometry(38, 0.38, 1.5), trim, [0, 15.42, -66.8]);

  const columnGeometry = new THREE.CylinderGeometry(0.55, 0.76, 10.4, 12, 1);
  const fluting = new THREE.CylinderGeometry(0.62, 0.8, 10.4, 12, 1, true);
  for (const x of [-14.4, -8.65, -2.9, 2.9, 8.65, 14.4]) {
    box(museum, new THREE.BoxGeometry(1.9, 0.55, 1.9), trim, [x, 0.37, -66.3]);
    const column = new THREE.Mesh(columnGeometry, trim);
    column.position.set(x, 5.65, -66.3);
    column.castShadow = true;
    column.receiveShadow = true;
    museum.add(column);
    const groove = new THREE.Mesh(fluting, bronze);
    groove.position.copy(column.position);
    groove.material = new THREE.MeshStandardMaterial({ color: '#a99676', roughness: 0.82, wireframe: true, transparent: true, opacity: 0.12 });
    museum.add(groove);
    box(museum, new THREE.BoxGeometry(1.7, 0.62, 1.7), trim, [x, 11.12, -66.3]);
  }

  box(museum, new THREE.BoxGeometry(8.3, 8.4, 1.0), trim, [0, 4.65, -68.3]);
  box(museum, new THREE.BoxGeometry(5.7, 6.8, 0.32), dark, [0, 4.05, -67.7], false);
  box(museum, new THREE.BoxGeometry(2.65, 6.8, 0.32), glass, [-1.48, 4.05, -67.48], false);
  box(museum, new THREE.BoxGeometry(2.65, 6.8, 0.32), glass, [1.48, 4.05, -67.48], false);
  box(museum, new THREE.BoxGeometry(0.12, 6.8, 0.24), bronze, [0, 4.05, -67.22]);
  box(museum, new THREE.BoxGeometry(6.4, 0.2, 0.18), bronze, [0, 4.45, -67.18]);

  const sideWindow = new THREE.BoxGeometry(3.9, 5.2, 0.16);
  for (const x of [-11.2, -5.6, 5.6, 11.2]) {
    box(museum, sideWindow, glass, [x, 6.7, -69.36], false);
    box(museum, new THREE.BoxGeometry(4.15, 0.22, 0.24), trim, [x, 9.35, -69.22]);
    box(museum, new THREE.BoxGeometry(0.2, 5.45, 0.24), trim, [x, 6.7, -69.22]);
  }

  for (let step = 0; step < 7; step += 1) {
    const depth = 1.28;
    const topY = 0.23 + step * 0.29;
    const centerZ = -61.1 - step * depth;
    const tread = new THREE.Mesh(new THREE.BoxGeometry(24, 0.42, depth + 0.08), step % 2 ? limestone : trim);
    tread.position.set(0, topY - 0.21, centerZ);
    tread.receiveShadow = true;
    tread.castShadow = true;
    museum.add(tread);
  }

  for (const x of [-19.4, 19.4]) {
    box(museum, new THREE.BoxGeometry(1.7, 2.2, 1.7), trim, [x, 1.1, -61.5]);
    box(museum, new THREE.BoxGeometry(1.1, 0.44, 1.1), bronze, [x, 2.42, -61.5]);
    const finial = new THREE.Mesh(new THREE.SphereGeometry(0.48, 12, 8), bronze);
    finial.position.set(x, 2.92, -61.5);
    museum.add(finial);
    colliders.push({ type: 'circle', x, z: -61.5, radius: 1 });
  }

  const title = new THREE.Mesh(new THREE.PlaneGeometry(13.2, 2.6), new THREE.MeshBasicMaterial({
    map: textTexture(), transparent: true, depthWrite: false, toneMapped: false,
  }));
  title.position.set(0, 17.4, -65.95);
  museum.add(title);

  const lamps = new THREE.Group();
  for (const x of [-4.5, 4.5]) {
    const fixture = new THREE.Mesh(new THREE.SphereGeometry(0.22, 12, 8), new THREE.MeshStandardMaterial({
      color: '#ffe0a3', emissive: '#ffb548', emissiveIntensity: 1.3,
    }));
    fixture.position.set(x, 8.2, -66.9);
    lamps.add(fixture);
  }
  museum.add(lamps);
  scene.add(structure);

  const worldX = (x) => x * 2;
  const worldZ = (z) => -77 + (z + 77) * 1.35;
  colliders.push({ type: 'box', minX: worldX(-17), maxX: worldX(-7.2), minZ: worldZ(-85), maxZ: worldZ(-68.3) });
  colliders.push({ type: 'box', minX: worldX(7.2), maxX: worldX(17), minZ: worldZ(-85), maxZ: worldZ(-68.3) });
  colliders.push({ type: 'box', minX: worldX(-7.2), maxX: worldX(7.2), minZ: worldZ(-85), maxZ: worldZ(-69.5) });
  for (const x of [-14.4, -8.65, -2.9, 2.9, 8.65, 14.4]) {
    colliders.push({ type: 'circle', x: worldX(x), z: worldZ(-66.3), radius: 0.97 });
  }

  return { entrance: { x: 0, z: worldZ(-64.8) } };
}
