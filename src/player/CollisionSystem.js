import * as THREE from 'three';

export class CollisionSystem {
  constructor(colliders, groundHeight) {
    this.colliders = colliders;
    this.groundHeight = groundHeight;
    this.playerRadius = 0.42;
    this.bounds = { minX: -58, maxX: 245, minZ: -120, maxZ: 42 };
  }

  resolve(position, movement) {
    const next = position.clone();
    const candidateX = next.x + movement.x;
    if (this.#isClear(candidateX, next.z, position.y)) next.x = candidateX;
    const candidateZ = next.z + movement.z;
    if (this.#isClear(next.x, candidateZ, position.y)) next.z = candidateZ;
    next.x = THREE.MathUtils.clamp(next.x, this.bounds.minX, this.bounds.maxX);
    next.z = THREE.MathUtils.clamp(next.z, this.bounds.minZ, this.bounds.maxZ);
    return next;
  }

  heightAt(x, z) {
    return this.groundHeight(x, z);
  }

  #isClear(x, z, eyeY) {
    const { minX, maxX, minZ, maxZ } = this.bounds;
    if (x < minX || x > maxX || z < minZ || z > maxZ) return false;
    for (const collider of this.colliders) {
      const feetY = eyeY - 1.72;
      if (collider.minY !== undefined && (feetY + 1.72 <= collider.minY || feetY >= collider.maxY)) continue;
      if (collider.type === 'circle') {
        if (Math.hypot(x - collider.x, z - collider.z) < collider.radius + this.playerRadius) return false;
      } else {
        const closestX = THREE.MathUtils.clamp(x, collider.minX, collider.maxX);
        const closestZ = THREE.MathUtils.clamp(z, collider.minZ, collider.maxZ);
        if (Math.hypot(x - closestX, z - closestZ) < this.playerRadius) return false;
      }
    }
    return true;
  }
}
