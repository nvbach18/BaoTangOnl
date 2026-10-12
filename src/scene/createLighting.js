import * as THREE from 'three';

export const SUN_POSITION = new THREE.Vector3(-42, 58, -62);

export function createLighting(scene) {
  const hemisphere = new THREE.HemisphereLight('#e7f5ff', '#929a78', 1.45);
  scene.add(hemisphere);

  const sun = new THREE.DirectionalLight('#fff0cf', 3.1);
  sun.position.copy(SUN_POSITION);
  sun.castShadow = true;
  sun.shadow.mapSize.set(2048, 2048);
  sun.shadow.camera.left = -75;
  sun.shadow.camera.right = 75;
  sun.shadow.camera.top = 75;
  sun.shadow.camera.bottom = -75;
  sun.shadow.camera.near = 0.5;
  sun.shadow.camera.far = 180;
  sun.shadow.normalBias = 0.035;
  sun.shadow.bias = -0.00008;
  sun.shadow.radius = 3;
  scene.add(sun);

  const sunDisc = new THREE.Mesh(
    new THREE.SphereGeometry(2.4, 24, 16),
    new THREE.MeshBasicMaterial({ color: '#fff0c2', toneMapped: false, fog: false }),
  );
  sunDisc.position.copy(SUN_POSITION).normalize().multiplyScalar(180);
  scene.add(sunDisc);

  const fill = new THREE.DirectionalLight('#c4e3f0', 0.38);
  fill.position.set(38, 24, -54);
  scene.add(fill);

  const moon = new THREE.Mesh(
    new THREE.SphereGeometry(1.7, 20, 14),
    new THREE.MeshBasicMaterial({ color: '#d7e5ff', toneMapped: false, fog: false }),
  );
  moon.position.copy(SUN_POSITION).negate().normalize().multiplyScalar(180);
  moon.visible = false;
  scene.add(moon);

  return (timeOfDay) => {
    const isDay = timeOfDay === 'day';
    hemisphere.color.set(isDay ? '#e7f5ff' : '#536b96');
    hemisphere.groundColor.set(isDay ? '#929a78' : '#30364a');
    hemisphere.intensity = isDay ? 1.45 : 0.62;
    sun.intensity = isDay ? 3.1 : 0;
    fill.color.set(isDay ? '#c4e3f0' : '#9bb7ed');
    fill.intensity = isDay ? 0.38 : 0.34;
    sunDisc.visible = isDay;
    moon.visible = !isDay;
  };
}
