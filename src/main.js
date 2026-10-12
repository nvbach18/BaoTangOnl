import * as THREE from 'three';
import { createScene } from './scene/createScene.js';
import { FirstPersonController } from './player/FirstPersonController.js';
import { CollisionSystem } from './player/CollisionSystem.js';
import { createInterface } from './ui/createInterface.js';
import './style.css';

const canvas = document.querySelector('#world');
const ui = createInterface();

try {
  const { scene, camera, renderer, colliders, groundHeight, entrance, interior, setTimeOfDay } = createScene(canvas);
  const collisions = new CollisionSystem(colliders, groundHeight);
  const player = new FirstPersonController(camera, renderer.domElement, collisions);
  let insideMuseum = false;
  interior.setLanguage('en');
  ui.bind({
    onStart: () => player.requestLock(),
    onResume: () => player.requestLock(),
    onTimeOfDayChange: setTimeOfDay,
    onLanguageChange: interior.setLanguage,
    onSelectFloor: (floor) => {
      const destination = interior.goToFloor(floor);
      player.teleport({ ...destination, rotationY: camera.rotation.y });
      ui.setMuseumFloor(floor);
      player.requestLock();
    },
    onCloseElevator: () => player.requestLock(),
  });

  player.onLockChange = (locked) => ui.setPlaying(locked);
  const distanceTo = (point) => Math.hypot(camera.position.x - point.x, camera.position.z - point.z);
  player.canInteract = () => insideMuseum
    ? distanceTo(interior.elevator) < 4.5
      || (interior.currentFloor() === 0 && distanceTo(interior.exit) < 4.5)
    : distanceTo(entrance) < 5;
  player.onInteract = () => {
    if (!insideMuseum) {
      insideMuseum = true;
      player.teleport(interior.entry);
      ui.setMuseumFloor(interior.currentFloor());
      return;
    }
    if (distanceTo(interior.elevator) < 4.5) {
      player.releaseLock();
      ui.showElevator(interior.currentFloor());
      return;
    }
    if (interior.currentFloor() === 0 && distanceTo(interior.exit) < 4.5) {
      insideMuseum = false;
      ui.setMuseumFloor(null);
      player.teleport({
        x: 0,
        y: groundHeight(0, -52) + player.eyeHeight,
        z: -52,
        rotationY: 0,
      });
    }
  };

  const clock = new THREE.Clock();
  let lastProgress = -1;
  function animate() {
    const delta = Math.min(clock.getDelta(), 0.05);
    player.update(delta);
    scene.userData.update?.(delta, clock.elapsedTime);
    if (insideMuseum) {
      ui.setEntranceNear(false, false);
      const atElevator = distanceTo(interior.elevator) < 4.5;
      const atExit = interior.currentFloor() === 0 && distanceTo(interior.exit) < 4.5;
      ui.setInteraction(atElevator ? 'elevatorPrompt' : 'exitMuseumPrompt', player.locked && (atElevator || atExit));
    } else {
      const distance = distanceTo(entrance);
      ui.setEntranceNear(player.locked && distance < 13, player.locked && distance < 5);
      ui.setInteraction('enter', player.locked && distance < 5);
      const journeyLength = Math.hypot(entrance.x, 28 - entrance.z);
      const progress = Math.max(0, Math.min(100, Math.round((1 - distance / journeyLength) * 100)));
      if (progress !== lastProgress) {
        ui.setProgress(progress);
        lastProgress = progress;
      }
    }
    renderer.render(scene, camera);
    requestAnimationFrame(animate);
  }
  animate();

  window.addEventListener('resize', () => {
    camera.aspect = window.innerWidth / window.innerHeight;
    camera.updateProjectionMatrix();
    renderer.setSize(window.innerWidth, window.innerHeight);
    renderer.setPixelRatio(Math.min(window.devicePixelRatio, 1.75));
  });
} catch (error) {
  console.error('Unable to initialize the virtual museum scene:', error);
  ui.showFatalError(error);
}
