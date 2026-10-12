import * as THREE from 'three';

function createStoneTexture() {
  const canvas = document.createElement('canvas');
  canvas.width = 512;
  canvas.height = 512;
  const context = canvas.getContext('2d');
  context.fillStyle = '#97836a';
  context.fillRect(0, 0, 512, 512);
  for (let row = 0; row < 16; row += 1) {
    const offset = row % 2 ? -24 : 0;
    for (let column = -1; column < 9; column += 1) {
      const x = column * 64 + offset;
      const y = row * 32;
      const shade = 105 + Math.floor(Math.random() * 40);
      context.fillStyle = `rgb(${shade}, ${shade - 15}, ${shade - 33})`;
      context.fillRect(x + 2, y + 2, 60, 28);
      context.strokeStyle = 'rgba(48, 39, 31, 0.55)';
      context.lineWidth = 2;
      context.strokeRect(x + 1, y + 1, 62, 30);
      context.fillStyle = `rgba(255, 226, 178, ${Math.random() * 0.08})`;
      context.fillRect(x + 5, y + 4, 52, 2);
    }
  }
  const texture = new THREE.CanvasTexture(canvas);
  texture.colorSpace = THREE.SRGBColorSpace;
  texture.wrapS = THREE.RepeatWrapping;
  texture.wrapT = THREE.RepeatWrapping;
  texture.repeat.set(1, 8);
  texture.anisotropy = 8;
  return texture;
}

export function createRoad(scene, groundHeight) {
  const points = [
    new THREE.Vector3(0, 0, 30),
    new THREE.Vector3(-3.5, 0, 9),
    new THREE.Vector3(2.8, 0, -13),
    new THREE.Vector3(-2.3, 0, -36),
    new THREE.Vector3(1.5, 0, -53),
    new THREE.Vector3(0, 0, -62),
  ];
  const path = new THREE.CatmullRomCurve3(points);
  const segments = 240;
  const halfWidth = 5.1;
  const vertices = [];
  const uvs = [];
  const indices = [];

  for (let index = 0; index <= segments; index += 1) {
    const t = index / segments;
    const point = path.getPoint(t);
    const tangent = path.getTangent(t).normalize();
    const side = new THREE.Vector3(-tangent.z, 0, tangent.x).normalize();
    const left = point.clone().addScaledVector(side, -halfWidth);
    const right = point.clone().addScaledVector(side, halfWidth);
    left.y = groundHeight(left.x, left.z) + 0.045;
    right.y = groundHeight(right.x, right.z) + 0.045;
    vertices.push(left.x, left.y, left.z, right.x, right.y, right.z);
    uvs.push(0, t * 13, 1, t * 13);
    if (index < segments) {
      const start = index * 2;
      indices.push(start, start + 2, start + 1, start + 1, start + 2, start + 3);
    }
  }

  const geometry = new THREE.BufferGeometry();
  geometry.setAttribute('position', new THREE.Float32BufferAttribute(vertices, 3));
  geometry.setAttribute('uv', new THREE.Float32BufferAttribute(uvs, 2));
  geometry.setIndex(indices);
  geometry.computeVertexNormals();
  const road = new THREE.Mesh(geometry, new THREE.MeshStandardMaterial({
    map: createStoneTexture(), roughness: 0.92, metalness: 0.02,
  }));
  road.receiveShadow = true;
  scene.add(road);

  const edgeMaterial = new THREE.MeshStandardMaterial({ color: '#c3a982', roughness: 0.86 });
  for (const sideSign of [-1, 1]) {
    const edgeVertices = [];
    const edgeIndices = [];
    for (let index = 0; index <= segments; index += 1) {
      const point = path.getPoint(index / segments);
      const tangent = path.getTangent(index / segments).normalize();
      const side = new THREE.Vector3(-tangent.z, 0, tangent.x).normalize();
      const inner = point.clone().addScaledVector(side, sideSign * (halfWidth - 0.06));
      const outer = point.clone().addScaledVector(side, sideSign * (halfWidth + 0.38));
      inner.y = groundHeight(inner.x, inner.z) + 0.08;
      outer.y = groundHeight(outer.x, outer.z) + 0.08;
      edgeVertices.push(inner.x, inner.y, inner.z, outer.x, outer.y, outer.z);
      if (index < segments) {
        const start = index * 2;
        edgeIndices.push(start, start + 2, start + 1, start + 1, start + 2, start + 3);
      }
    }
    const edgeGeometry = new THREE.BufferGeometry();
    edgeGeometry.setAttribute('position', new THREE.Float32BufferAttribute(edgeVertices, 3));
    edgeGeometry.setIndex(edgeIndices);
    edgeGeometry.computeVertexNormals();
    const edge = new THREE.Mesh(edgeGeometry, edgeMaterial);
    edge.receiveShadow = true;
    scene.add(edge);
  }
}
