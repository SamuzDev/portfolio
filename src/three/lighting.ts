import * as THREE from 'three';

export function createLighting(): THREE.Group {
  const group = new THREE.Group();

  // Key light: Warm sun (primary illumination)
  const keyLight = new THREE.DirectionalLight(0xfff5e6, 1.8);
  keyLight.position.set(3, 5, 2);
  keyLight.castShadow = true;
  keyLight.shadow.mapSize.set(2048, 2048);
  keyLight.shadow.camera.near = 0.5;
  keyLight.shadow.camera.far = 20;
  keyLight.shadow.camera.left = -4;
  keyLight.shadow.camera.right = 4;
  keyLight.shadow.camera.top = 4;
  keyLight.shadow.camera.bottom = -4;
  keyLight.shadow.bias = -0.0005;
  keyLight.shadow.normalBias = 0.02;
  group.add(keyLight);

  // Fill light: Cool sky bounce
  const fillLight = new THREE.DirectionalLight(0x88aaff, 0.4);
  fillLight.position.set(-3, 3, -3);
  group.add(fillLight);

  // Rim light: Red petal glow (higanbana signature)
  const rimLight = new THREE.DirectionalLight(0xe63946, 0.35);
  rimLight.position.set(0, -2, -5);
  group.add(rimLight);

  // Bottom bounce: Subtle warmth from ground
  const bounceLight = new THREE.DirectionalLight(0xffddaa, 0.15);
  bounceLight.position.set(0, -3, 0);
  group.add(bounceLight);

  // Ambient: Very subtle base
  group.add(new THREE.AmbientLight(0xffffff, 0.15));

  return group;
}