import * as THREE from 'three';
import { createRoad } from './createRoad.js';
import { createMuseumExterior } from './createMuseumExterior.js';
import { createMuseumInterior } from './createMuseumInterior.js';

const shared = {};

function getMaterials() {
  if (shared.materials) return shared.materials;
  shared.materials = {
    grass: new THREE.MeshStandardMaterial({ color: '#ffffff', roughness: 1, vertexColors: true }),
    trunk: new THREE.MeshStandardMaterial({ color: '#5a4634', roughness: 1 }),
    leaf: ['#536b4d', '#687b51', '#79825a'].map((color) => new THREE.MeshStandardMaterial({ color, roughness: 0.96 })),
    stone: new THREE.MeshStandardMaterial({ color: '#80725f', roughness: 0.95 }),
    brass: new THREE.MeshStandardMaterial({ color: '#776044', metalness: 0.62, roughness: 0.38 }),
    lampGlass: new THREE.MeshStandardMaterial({ color: '#f5cb80', emissive: '#ffb859', emissiveIntensity: 1.25 }),
  };
  return shared.materials;
}

function heightAt(x, z) {
  return 0.18 * Math.sin(x * 0.105 + z * 0.045) + 0.22 * Math.cos(z * 0.082) + 0.1 * Math.sin(x * 0.05);
}

function seeded(seed) {
  let value = seed >>> 0;
  return () => {
    value = (value * 1664525 + 1013904223) >>> 0;
    return value / 4294967296;
  };
}

function createTerrain(scene) {
  const geometry = new THREE.PlaneGeometry(220, 220, 100, 100);
  geometry.rotateX(-Math.PI / 2);
  const positions = geometry.attributes.position;
  const colors = [];
  const color = new THREE.Color();
  for (let index = 0; index < positions.count; index += 1) {
    const x = positions.getX(index);
    const z = positions.getZ(index);
    positions.setY(index, heightAt(x, z) - 0.06);
    const variation = Math.sin(x * 0.31 + z * 0.13) * 0.035 + Math.cos(z * 0.2) * 0.025;
    color.set('#78875a').offsetHSL(variation, 0.015, variation);
    colors.push(color.r, color.g, color.b);
  }
  geometry.setAttribute('color', new THREE.Float32BufferAttribute(colors, 3));
  geometry.computeVertexNormals();
  const terrain = new THREE.Mesh(geometry, getMaterials().grass);
  terrain.receiveShadow = true;
  scene.add(terrain);

}

function makeTree(scene, x, z, scale, swayTargets) {
  const materials = getMaterials();
  const group = new THREE.Group();
  group.position.set(x, heightAt(x, z), z);
  group.scale.setScalar(scale);
  const trunk = new THREE.Mesh(new THREE.CylinderGeometry(0.22, 0.34, 4.2, 7), materials.trunk);
  trunk.position.y = 2.1;
  trunk.castShadow = true;
  group.add(trunk);
  const shapes = [
    [-0.9, 3.9, 0.3, 1.75], [0.85, 4.45, -0.25, 1.65], [0, 5.05, 0.15, 1.9],
    [-0.1, 6.1, 0, 1.22],
  ];
  shapes.forEach(([xOffset, y, zOffset, radius], index) => {
    const canopy = new THREE.Mesh(new THREE.DodecahedronGeometry(radius, 1), materials.leaf[index % materials.leaf.length]);
    canopy.position.set(xOffset, y, zOffset);
    canopy.scale.set(1.14, 0.88, 0.94);
    canopy.castShadow = true;
    canopy.receiveShadow = true;
    group.add(canopy);
  });
  scene.add(group);
  swayTargets.push(group);
}

function createPlants(scene, path) {
  const random = seeded(82417);
  const grassMaterial = new THREE.MeshBasicMaterial({ color: '#567b36' });
  const flowerMaterials = ['#f0d9a4', '#e9a2a6', '#e7e6d1', '#e7c96b']
    .map((color) => new THREE.MeshBasicMaterial({ color }));
  const shrubMaterial = new THREE.MeshBasicMaterial({ color: '#607f3c' });
  const grassGeometry = new THREE.ConeGeometry(0.055, 0.34, 4);
  const flowerGeometry = new THREE.SphereGeometry(0.11, 7, 6);
  const shrubGeometry = new THREE.DodecahedronGeometry(0.55, 1);
  const grassInstances = new THREE.InstancedMesh(grassGeometry, grassMaterial, 2200);
  const flowerInstances = flowerMaterials.map((material) => new THREE.InstancedMesh(flowerGeometry, material, 620));
  const shrubInstances = new THREE.InstancedMesh(shrubGeometry, shrubMaterial, 140);
  grassInstances.castShadow = false;
  flowerInstances.castShadow = false;
  shrubInstances.castShadow = false;
  shrubInstances.receiveShadow = false;
  const dummy = new THREE.Object3D();
  let grassCount = 0;
  let flowerCount = 0;
  const flowerCounts = flowerMaterials.map(() => 0);
  let shrubCount = 0;

  const pathSamples = Array.from({ length: 81 }, (_, index) => path.getPoint(index / 80));
  const pathCenter = (z) => {
    let best = { x: 0, distance: Infinity };
    for (const point of pathSamples) {
      const distance = Math.abs(point.z - z);
      if (distance < best.distance) best = { x: point.x, distance };
    }
    return best.x;
  };

  for (let attempt = 0; attempt < 6000 && (grassCount < 2200 || flowerCount < 620 || shrubCount < 140); attempt += 1) {
    const x = (random() - 0.5) * 62;
    const z = 29 - random() * 83;
    const pathDistance = Math.abs(x - pathCenter(z));
    if (pathDistance < 6.2) continue;
    const y = heightAt(x, z);
    if (grassCount < 2200) {
      const grassScale = 0.7 + random() * 0.65;
      dummy.position.set(x, y + 0.17 * grassScale, z);
      dummy.rotation.set((random() - 0.5) * 0.35, random() * Math.PI, (random() - 0.5) * 0.4);
      dummy.scale.setScalar(grassScale);
      dummy.updateMatrix();
      grassInstances.setMatrixAt(grassCount, dummy.matrix);
      grassCount += 1;
    }
    if (flowerCount < 620 && random() > 0.77) {
      const flowerType = Math.floor(random() * flowerInstances.length);
      dummy.position.set(x, y + 0.16, z);
      dummy.rotation.set(0, random() * Math.PI, 0);
      dummy.scale.setScalar(0.8 + random() * 0.65);
      dummy.updateMatrix();
      flowerInstances[flowerType].setMatrixAt(flowerCounts[flowerType], dummy.matrix);
      flowerCounts[flowerType] += 1;
      flowerCount += 1;
    }
    if (shrubCount < 140 && pathDistance > 8.5 && !(z < -55 && Math.abs(x) < 20) && random() > 0.97) {
      dummy.position.set(x, y + 0.42, z);
      dummy.rotation.set(0, random() * Math.PI, 0);
      dummy.scale.set(0.75 + random() * 0.8, 0.65 + random() * 0.65, 0.75 + random() * 0.8);
      dummy.updateMatrix();
      shrubInstances.setMatrixAt(shrubCount, dummy.matrix);
      shrubCount += 1;
    }
  }
  grassInstances.count = grassCount;
  flowerInstances.forEach((instances, index) => {
    instances.count = flowerCounts[index];
  });
  shrubInstances.count = shrubCount;
  scene.add(grassInstances, ...flowerInstances, shrubInstances);
}

function createDecor(scene, colliders, path) {
  const materials = getMaterials();
  const lampPositions = [-47, -30, -10, 10, 27];
  const streetLights = [];
  for (const z of lampPositions) {
    const point = path.getPointAt(Math.max(0.04, Math.min(0.94, (30 - z) / 92)));
    for (const side of [-1, 1]) {
      if (side === -1 && Math.abs(z) < 15) continue;
      const x = point.x + side * 8.7;
      const baseY = heightAt(x, z);
      const lamp = new THREE.Group();
      lamp.position.set(x, baseY, z);
      const pole = new THREE.Mesh(new THREE.CylinderGeometry(0.1, 0.17, 4.4, 8), materials.brass);
      pole.position.y = 2.2;
      pole.castShadow = true;
      lamp.add(pole);
      const arm = new THREE.Mesh(new THREE.TorusGeometry(0.47, 0.07, 7, 12, Math.PI), materials.brass);
      arm.position.set(0, 4.25, 0);
      arm.rotation.z = Math.PI;
      lamp.add(arm);
      const glass = new THREE.Mesh(new THREE.BoxGeometry(0.56, 0.75, 0.56), materials.lampGlass);
      glass.position.y = 4.45;
      lamp.add(glass);
      const light = new THREE.PointLight('#ffbd70', 0, 17, 2);
      light.position.y = 4.35;
      lamp.add(light);
      streetLights.push(light);
      const cap = new THREE.Mesh(new THREE.ConeGeometry(0.52, 0.36, 4), materials.brass);
      cap.position.y = 5.0;
      cap.rotation.y = Math.PI / 4;
      lamp.add(cap);
      scene.add(lamp);
      colliders.push({ type: 'circle', x, z, radius: 0.48 });
    }
  }

  for (const z of [-40, -17]) {
    const point = path.getPointAt((30 - z) / 92);
    const x = point.x + (z === -40 ? -10.4 : 10.4);
    const bench = new THREE.Group();
    bench.position.set(x, heightAt(x, z), z);
    const wood = new THREE.MeshStandardMaterial({ color: '#725c43', roughness: 0.78 });
    for (let slat = 0; slat < 4; slat += 1) {
      const seat = new THREE.Mesh(new THREE.BoxGeometry(2.4, 0.13, 0.22), wood);
      seat.position.set(0, 0.78, (slat - 1.5) * 0.22);
      bench.add(seat);
    }
    const back = new THREE.Mesh(new THREE.BoxGeometry(2.4, 0.78, 0.12), wood);
    back.position.set(0, 1.23, -0.38);
    bench.add(back);
    for (const legX of [-0.92, 0.92]) {
      const leg = new THREE.Mesh(new THREE.BoxGeometry(0.12, 0.78, 0.82), materials.brass);
      leg.position.set(legX, 0.4, -0.08);
      bench.add(leg);
    }
    bench.traverse((object) => { if (object.isMesh) object.castShadow = true; });
    scene.add(bench);
    colliders.push({ type: 'box', minX: x - 1.3, maxX: x + 1.3, minZ: z - 0.7, maxZ: z + 0.7 });
  }

  const sign = new THREE.Group();
  sign.position.set(-10.8, heightAt(-10.8, -4), -4);
  const post = new THREE.Mesh(new THREE.BoxGeometry(0.18, 2.8, 0.18), materials.trunk);
  post.position.y = 1.4;
  sign.add(post);
  const board = new THREE.Mesh(new THREE.BoxGeometry(2.9, 0.95, 0.15), new THREE.MeshStandardMaterial({ color: '#34473e', roughness: 0.8 }));
  board.position.y = 2.35;
  sign.add(board);
  scene.add(sign);
  colliders.push({ type: 'box', minX: -12.3, maxX: -9.3, minZ: -4.25, maxZ: -3.75 });
  const lettering = createSignText();
  lettering.position.set(-10.8, heightAt(-10.8, -4) + 2.34, -3.905);
  scene.add(lettering);

  return (isDay) => {
    materials.lampGlass.emissiveIntensity = isDay ? 1.25 : 5;
    streetLights.forEach((light) => {
      light.intensity = isDay ? 0 : 32;
    });
  };
}

function createSignText() {
  const canvas = document.createElement('canvas');
  canvas.width = 512;
  canvas.height = 180;
  const context = canvas.getContext('2d');
  context.fillStyle = '#34473e';
  context.fillRect(0, 0, 512, 180);
  context.strokeStyle = '#d2bd8f';
  context.lineWidth = 4;
  context.strokeRect(12, 12, 488, 156);
  context.fillStyle = '#f0dfb9';
  context.textAlign = 'center';
  context.font = 'bold 37px Georgia';
  context.fillText('VIRTUAL MUSEUM', 256, 78);
  context.font = '24px Georgia';
  context.fillText('HERITAGE GARDEN', 256, 125);
  const texture = new THREE.CanvasTexture(canvas);
  texture.colorSpace = THREE.SRGBColorSpace;
  return new THREE.Mesh(new THREE.PlaneGeometry(2.74, 0.84), new THREE.MeshBasicMaterial({ map: texture, transparent: true, toneMapped: false }));
}

function createDust(scene) {
  const random = seeded(427);
  const positions = new Float32Array(240 * 3);
  for (let index = 0; index < 240; index += 1) {
    positions[index * 3] = (random() - 0.5) * 54;
    positions[index * 3 + 1] = 0.8 + random() * 8;
    positions[index * 3 + 2] = 24 - random() * 100;
  }
  const geometry = new THREE.BufferGeometry();
  geometry.setAttribute('position', new THREE.BufferAttribute(positions, 3));
  const material = new THREE.PointsMaterial({ color: '#f6dba9', size: 0.095, transparent: true, opacity: 0.43, depthWrite: false, sizeAttenuation: true });
  const dust = new THREE.Points(geometry, material);
  scene.add(dust);
  return (delta, elapsed) => {
    const values = geometry.attributes.position.array;
    for (let index = 0; index < 240; index += 1) {
      values[index * 3 + 1] += delta * (0.08 + (index % 4) * 0.015);
      values[index * 3] += Math.sin(elapsed * 0.5 + index) * delta * 0.035;
      if (values[index * 3 + 1] > 10) values[index * 3 + 1] = 0.7;
    }
    geometry.attributes.position.needsUpdate = true;
  };
}

export function createEnvironment(scene) {
  const colliders = [];
  const swayTargets = [];
  createTerrain(scene);
  createRoad(scene, heightAt);
  const path = new THREE.CatmullRomCurve3([
    new THREE.Vector3(0, 0, 30), new THREE.Vector3(-3.5, 0, 9), new THREE.Vector3(2.8, 0, -13),
    new THREE.Vector3(-2.3, 0, -36), new THREE.Vector3(1.5, 0, -53), new THREE.Vector3(0, 0, -62),
  ]);

  const random = seeded(29731);
  const treeSamples = [];
  for (let index = 0; index <= 100; index += 1) treeSamples.push(path.getPoint(index / 100));
  let placed = 0;
  for (let attempt = 0; attempt < 520 && placed < 72; attempt += 1) {
    const x = (random() - 0.5) * 68;
    const z = 24 - random() * 92;
    let nearest = Infinity;
    for (const point of treeSamples) nearest = Math.min(nearest, Math.hypot(x - point.x, z - point.z));
    if (nearest < 11.5 || (z < -55 && Math.abs(x) < 22)) continue;
    makeTree(scene, x, z, 0.76 + random() * 0.72, swayTargets);
    colliders.push({ type: 'circle', x, z, radius: 1.15 });
    placed += 1;
  }

  const rockGeometry = new THREE.DodecahedronGeometry(1, 0);
  const rockMaterial = getMaterials().stone;
  for (let index = 0; index < 46; index += 1) {
    const x = (random() - 0.5) * 54;
    const z = 22 - random() * 82;
    let nearest = Infinity;
    for (const point of treeSamples) nearest = Math.min(nearest, Math.hypot(x - point.x, z - point.z));
    if (nearest < 6.8) continue;
    const rock = new THREE.Mesh(rockGeometry, rockMaterial);
    const scale = 0.28 + random() * 0.85;
    rock.position.set(x, heightAt(x, z) + scale * 0.35, z);
    rock.scale.set(scale * 1.3, scale * 0.68, scale);
    rock.rotation.set(random() * 0.45, random() * Math.PI, random() * 0.35);
    rock.castShadow = true;
    rock.receiveShadow = true;
    scene.add(rock);
    colliders.push({ type: 'circle', x, z, radius: scale * 0.9 });
  }

  createPlants(scene, path);
  const setStreetLightMode = createDecor(scene, colliders, path);
  const { entrance } = createMuseumExterior(scene, colliders, heightAt);
  const interior = createMuseumInterior(scene, colliders);
  const animateDust = createDust(scene);
  const museumBaseY = heightAt(0, -77);
  return {
    colliders,
    groundHeight(x, z) {
      if (x > 120 && x < 240 && z > -28 && z < 28) return interior.floorHeight();
      if (Math.abs(x) < 23.6 && z <= -54.13 && z >= -66.47) {
        const originalZ = (z + 77) / 1.35 - 77;
        const step = THREE.MathUtils.clamp(Math.floor((-originalZ - 60.42) / 1.28), 0, 6);
        return museumBaseY + (0.23 + step * 0.29) * 1.75;
      }
      return heightAt(x, z);
    },
    entrance,
    interior,
    setTimeOfDay(timeOfDay) {
      setStreetLightMode(timeOfDay === 'day');
    },
    update(delta, elapsed) {
      for (let index = 0; index < swayTargets.length; index += 1) {
        swayTargets[index].rotation.z = Math.sin(elapsed * 0.55 + index * 1.7) * 0.012;
      }
      animateDust(delta, elapsed);
    },
  };
}
