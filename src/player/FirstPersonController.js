import * as THREE from 'three';

export class FirstPersonController {
  constructor(camera, element, collisionSystem) {
    this.camera = camera;
    this.element = element;
    this.collisionSystem = collisionSystem;
    this.keys = new Set();
    this.locked = false;
    this.pitch = 0;
    this.velocityY = 0;
    this.eyeHeight = 1.72;
    this.walkSpeed = 6.2;
    this.sprintSpeed = 10.2;
    this.jumpSpeed = 5.8;
    this.gravity = 17;
    this.onLockChange = () => {};
    this.onInteract = () => {};
    this.canInteract = () => false;

    this.handleKeyDown = (event) => {
      if (['Space', 'ArrowUp', 'ArrowDown', 'ArrowLeft', 'ArrowRight'].includes(event.code)) event.preventDefault();
      this.keys.add(event.code);
      if (event.code === 'Space' && this.locked && this.#isGrounded()) this.velocityY = this.jumpSpeed;
      if (event.code === 'KeyE' && this.locked && this.canInteract()) this.onInteract();
    };
    this.handleKeyUp = (event) => this.keys.delete(event.code);
    this.handleMouseMove = (event) => {
      if (!this.locked) return;
      this.camera.rotation.y -= event.movementX * 0.0022;
      this.pitch = THREE.MathUtils.clamp(this.pitch - event.movementY * 0.0022, -1.48, 1.48);
      this.camera.rotation.x = this.pitch;
    };
    this.handleLockChange = () => {
      this.locked = document.pointerLockElement === this.element;
      this.keys.clear();
      this.onLockChange(this.locked);
    };
    document.addEventListener('keydown', this.handleKeyDown);
    document.addEventListener('keyup', this.handleKeyUp);
    document.addEventListener('mousemove', this.handleMouseMove);
    document.addEventListener('pointerlockchange', this.handleLockChange);
    document.addEventListener('pointerlockerror', () => this.onLockChange(false));
  }

  requestLock() {
    const result = this.element.requestPointerLock();
    result?.catch?.(() => this.onLockChange(false));
  }

  releaseLock() {
    if (document.pointerLockElement === this.element) document.exitPointerLock();
  }

  teleport({ x, y, z, rotationY = this.camera.rotation.y }) {
    this.camera.position.set(x, y, z);
    this.pitch = 0;
    this.velocityY = 0;
    this.camera.rotation.set(0, rotationY, 0, 'YXZ');
  }

  update(delta) {
    if (!this.locked) return;
    const forwardInput = Number(this.keys.has('KeyW')) - Number(this.keys.has('KeyS'));
    const sideInput = Number(this.keys.has('KeyD')) - Number(this.keys.has('KeyA'));
    const inputLength = Math.hypot(forwardInput, sideInput);
    if (inputLength > 0) {
      const forward = new THREE.Vector3(-Math.sin(this.camera.rotation.y), 0, -Math.cos(this.camera.rotation.y));
      const right = new THREE.Vector3(Math.cos(this.camera.rotation.y), 0, -Math.sin(this.camera.rotation.y));
      const speed = this.keys.has('ShiftLeft') || this.keys.has('ShiftRight') ? this.sprintSpeed : this.walkSpeed;
      const movement = forward.multiplyScalar(forwardInput / inputLength * speed * delta)
        .add(right.multiplyScalar(sideInput / inputLength * speed * delta));
      const position = this.collisionSystem.resolve(this.camera.position, movement);
      this.camera.position.x = position.x;
      this.camera.position.z = position.z;
    }

    const ground = this.collisionSystem.heightAt(this.camera.position.x, this.camera.position.z);
    this.velocityY -= this.gravity * delta;
    this.camera.position.y += this.velocityY * delta;
    if (this.camera.position.y <= ground + this.eyeHeight) {
      this.camera.position.y = ground + this.eyeHeight;
      this.velocityY = 0;
    }
  }

  #isGrounded() {
    return this.camera.position.y <= this.collisionSystem.heightAt(this.camera.position.x, this.camera.position.z) + this.eyeHeight + 0.03;
  }
}
