import * as THREE from 'three';
import { OrbitControls } from 'three/examples/jsm/controls/OrbitControls.js';
import { GLTFLoader } from 'three/examples/jsm/loaders/GLTFLoader.js';

export interface HiganbanaSceneOptions {
  canvas: HTMLCanvasElement;
  modelUrl?: string;
  isMobile?: boolean;
  prefersReducedMotion?: boolean;
  onProgress?: (progress: number) => void;
}

export interface HiganbanaScene {
  renderer: THREE.WebGLRenderer;
  scene: THREE.Scene;
  camera: THREE.PerspectiveCamera;
  controls: OrbitControls;
  model: THREE.Group;
  cleanup: () => void;
}

let loaderInstance: GLTFLoader | null = null;

function createLoader(): GLTFLoader {
  if (loaderInstance) return loaderInstance;
  loaderInstance = new GLTFLoader();
  return loaderInstance;
}

async function loadModel(
  url: string,
  onProgress?: (progress: number) => void
): Promise<THREE.Group> {
  const loader = createLoader();
  return new Promise((resolve, reject) => {
    loader.load(
      url,
      (gltf) => {
        const model = gltf.scene;
        onProgress?.(100);
        resolve(model);
      },
      (xhr) => {
        if (xhr.lengthComputable && onProgress) {
          const percent = Math.round((xhr.loaded / xhr.total) * 70) + 10;
          onProgress(Math.min(percent, 80));
        }
      },
      (error) => {
        console.error('Failed to load model:', error);
        reject(error);
      }
    );
  });
}

function disposeLoader(): void {
  if (loaderInstance) {
    loaderInstance = null;
  }
}

function createLighting(): THREE.Group {
  const group = new THREE.Group();

  const keyLight = new THREE.DirectionalLight(0xfff5e6, 2.0);
  keyLight.position.set(3, 6, 3);
  keyLight.castShadow = true;
  keyLight.shadow.mapSize.set(2048, 2048);
  keyLight.shadow.camera.near = 0.5;
  keyLight.shadow.camera.far = 20;
  keyLight.shadow.camera.left = -5;
  keyLight.shadow.camera.right = 5;
  keyLight.shadow.camera.top = 5;
  keyLight.shadow.camera.bottom = -5;
  keyLight.shadow.bias = -0.0005;
  keyLight.shadow.normalBias = 0.02;
  group.add(keyLight);

  const fillLight = new THREE.DirectionalLight(0x88aaff, 0.5);
  fillLight.position.set(-4, 4, -4);
  group.add(fillLight);

  const rimLight = new THREE.DirectionalLight(0xe63946, 0.4);
  rimLight.position.set(0, -3, -6);
  group.add(rimLight);

  const bounceLight = new THREE.DirectionalLight(0xffddaa, 0.2);
  bounceLight.position.set(0, -4, 0);
  group.add(bounceLight);

  group.add(new THREE.AmbientLight(0xffffff, 0.15));

  return group;
}

export async function initHiganbana(options: {
  canvas: HTMLCanvasElement;
  modelUrl?: string;
  isMobile?: boolean;
  prefersReducedMotion?: boolean;
  onProgress?: (progress: number) => void;
}): Promise<{
  renderer: THREE.WebGLRenderer;
  scene: THREE.Scene;
  camera: THREE.PerspectiveCamera;
  controls: any;
  model: THREE.Group;
  cleanup: () => void;
}> {
  const {
    canvas,
    modelUrl = '/models/higanbana.glb',
    isMobile = false,
    prefersReducedMotion = false,
    onProgress,
  } = options;

  await new Promise<void>((resolve) => {
    let attempts = 0;
    const maxAttempts = 100;
    const checkSize = () => {
      attempts++;
      const width = canvas.clientWidth || canvas.width || 800;
      const height = canvas.clientHeight || canvas.height || 600;
      if (width > 0 && height > 0) {
        console.log('Canvas ready:', width, 'x', height);
        resolve();
      } else if (attempts >= maxAttempts) {
        console.warn('Canvas size timeout, using fallback');
        resolve();
      } else {
        requestAnimationFrame(checkSize);
      }
    };
    checkSize();
  });

  const width = canvas.clientWidth || canvas.width || 800;
  const height = canvas.clientHeight || canvas.height || 600;
  console.log('Canvas size:', width, 'x', height);

  const renderer = new THREE.WebGLRenderer({
    canvas,
    antialias: !isMobile,
    alpha: true,
    powerPreference: isMobile ? 'low-power' : 'high-performance',
    preserveDrawingBuffer: false,
  });

  renderer.setPixelRatio(Math.min(window.devicePixelRatio, isMobile ? 1.5 : 2));
  renderer.setSize(width, height, false);
  renderer.shadowMap.enabled = true;
  renderer.shadowMap.type = THREE.PCFSoftShadowMap;
  renderer.toneMapping = THREE.ACESFilmicToneMapping;
  renderer.toneMappingExposure = 1.2;
  renderer.physicallyCorrectLights = true;

  const scene = new THREE.Scene();
  scene.background = null;

  const aspect = width / height;
  const camera = new THREE.PerspectiveCamera(50, aspect, 0.1, 100);
  camera.position.set(0, 1.5, 4);
  camera.lookAt(0, 1, 0);

  const model = await loadModel(modelUrl);
  
  console.log('Model loaded, traversing...');
  const processChild = (child: THREE.Object3D) => {
    if (child instanceof THREE.Mesh) {
      console.log('Mesh:', child.name, 'material:', child.material?.type);
      child.castShadow = true;
      child.receiveShadow = true;
      if (child.material) {
        child.material.needsUpdate = true;
        if (child.name.includes('petal')) {
          child.material.side = THREE.DoubleSide;
        }
        if (child.material.isMeshStandardMaterial || child.material.isMeshPhysicalMaterial) {
          child.material.roughness = Math.min(child.material.roughness ?? 0.5, 0.6);
          child.material.metalness = Math.min(child.material.metalness ?? 0, 0.1);
        }
      }
    };
  model.traverse(processChild);

  const box = new THREE.Box3().setFromObject(model);
  const center = new THREE.Vector3();
  box.getCenter(center);
  model.position.sub(center);

  const size = new THREE.Vector3();
  box.getSize(size);
  console.log('Model bbox:', { min: box.min, max: box.max, size });
  console.log('Model center:', center);

  const maxDim = Math.max(size.x, size.y, size.z);
  const targetHeight = 3.0;
  const scale = targetHeight / maxDim;
  console.log('Scale:', scale, 'maxDim:', maxDim);
  model.scale.multiplyScalar(scale);

  scene.add(model);

  const groundGeometry = new THREE.PlaneGeometry(20, 20);
  const groundMaterial = new THREE.ShadowMaterial({ opacity: 0.15 });
  const ground = new THREE.Mesh(groundGeometry, groundMaterial);
  ground.rotation.x = -Math.PI / 2;
  ground.position.y = box.min.y * scale - 0.02;
  ground.receiveShadow = true;
  scene.add(ground);

  scene.add(createLighting());

  const controls = new OrbitControls(camera, canvas);
  controls.enableDamping = true;
  controls.dampingFactor = 0.04;
  controls.enablePan = false;
  controls.enableZoom = true;
  controls.minDistance = 2;
  controls.maxDistance = 10;
  controls.maxPolarAngle = Math.PI / 2 - 0.02;
  controls.minPolarAngle = 0.1;
  controls.target.set(0, 1.2, 0);
  controls.autoRotate = true;
  controls.autoRotateSpeed = isMobile ? 0.25 : 0.35;

  let rafId: number;
  let mounted = true;

  const animate = () => {
    if (!mounted) return;
    rafId = requestAnimationFrame(animate);
    controls.update();
    renderer.render(scene, camera);
  };
  animate();

  const handleResize = () => {
    if (!mounted) return;
    const newWidth = canvas.clientWidth;
    const newHeight = canvas.clientHeight;
    camera.aspect = newWidth / newHeight;
    camera.updateProjectionMatrix();
    renderer.setSize(newWidth, newHeight, false);
  };

  const ro = new ResizeObserver(handleResize);
  ro.observe(canvas);
  window.addEventListener('resize', handleResize);

  const cleanup = () => {
    mounted = false;
    cancelAnimationFrame(rafId);
    ro.disconnect();
    window.removeEventListener('resize', handleResize);
    controls.dispose();
    renderer.dispose();
  };

  return {
    renderer,
    scene,
    camera,
    controls,
    model,
    cleanup,
  };
}
