import * as THREE from 'three';
import { createLighting } from './createLighting.js';
import { createEnvironment } from './createEnvironment.js';

export function createScene(canvas) {
  const renderer = new THREE.WebGLRenderer({ canvas, antialias: true, powerPreference: 'high-performance' });
  renderer.setSize(window.innerWidth, window.innerHeight);
  renderer.setPixelRatio(Math.min(window.devicePixelRatio, 1.75));
  renderer.outputColorSpace = THREE.SRGBColorSpace;
  renderer.toneMapping = THREE.ACESFilmicToneMapping;
  renderer.toneMappingExposure = 1.16;
  renderer.shadowMap.enabled = true;
  renderer.shadowMap.type = THREE.PCFSoftShadowMap;

  const scene = new THREE.Scene();
  scene.background = new THREE.Color('#8bc9ed');
  scene.fog = new THREE.FogExp2('#c5dfd4', 0.0058);
  const setLighting = createLighting(scene);

  function setTimeOfDay(timeOfDay) {
    const isDay = timeOfDay === 'day';
    scene.background.set(isDay ? '#8bc9ed' : '#101a2b');
    scene.fog.color.set(isDay ? '#c5dfd4' : '#182438');
    scene.fog.density = isDay ? 0.0058 : 0.008;
    renderer.toneMappingExposure = isDay ? 1.16 : 0.82;
    setLighting(timeOfDay);
    environment.setTimeOfDay(timeOfDay);
  }

  const camera = new THREE.PerspectiveCamera(72, window.innerWidth / window.innerHeight, 0.1, 260);
  camera.position.set(0, 1.72, 28);
  camera.rotation.order = 'YXZ';
  scene.add(camera);

  const environment = createEnvironment(scene);
  const { colliders, groundHeight, entrance, interior, update } = environment;
  setTimeOfDay('day');
  scene.userData.update = update;
  return { scene, camera, renderer, colliders, groundHeight, entrance, interior, setTimeOfDay };
}
