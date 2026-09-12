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

export interface InitResult {
  success: boolean;
  scene?: HiganbanaScene;
  error?: Error;
}

let loaderInstance: GLTFLoader | null = null;

function createLoader(): GLTFLoader {
  if (loaderInstance) return loaderInstance;
  loaderInstance = new GLTFLoader();
  return loaderInstance;
}

function disposeLoader(): void {
  loaderInstance = null;
}

function loadModel(
  url: string,
  onProgress?: (progress: number) => void,
): Promise<THREE.Group> {
  const loader = createLoader();
  return new Promise<THREE.Group>((resolve, reject) => {
    loader.load(
      url,
      (gltf) => {
        onProgress?.(100);
        resolve(gltf.scene);
      },
      (xhr) => {
        if (xhr.lengthComputable && onProgress) {
          const percent = Math.round((xhr.loaded / xhr.total) * 70) + 10;
          onProgress(Math.min(percent, 80));
        }
      },
      (error) => {
        reject(error);
      },
    );
  });
}

function createLighting(): THREE.Group {
  const group = new THREE.Group();

  // Key light - warm, from front-right-above
  const keyLight = new THREE.DirectionalLight(0xfff0e0, 2.5);
  keyLight.position.set(2, 5, 4);
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

  // Fill light - cool blue from left
  const fillLight = new THREE.DirectionalLight(0x6688cc, 0.6);
  fillLight.position.set(-3, 3, 2);
  group.add(fillLight);

  // Rim/back light - subtle red accent on edges
  const rimLight = new THREE.DirectionalLight(0xff4455, 0.8);
  rimLight.position.set(-1, 4, -4);
  group.add(rimLight);

  // Top highlight
  const topLight = new THREE.PointLight(0xffffff, 0.6, 15);
  topLight.position.set(0, 6, 0);
  group.add(topLight);

  // Subtle warm bounce from below
  const bounceLight = new THREE.PointLight(0xffaa66, 0.3, 10);
  bounceLight.position.set(0, -2, 2);
  group.add(bounceLight);

  group.add(new THREE.AmbientLight(0xffffff, 0.2));

  return group;
}

export async function initHiganbana(options: HiganbanaSceneOptions): Promise<InitResult> {
  try {
    const {
      canvas,
      modelUrl = '/models/26ugbsku.glb',
      isMobile = false,
      prefersReducedMotion = false,
      onProgress,
    } = options;

    await new Promise<void>((resolve) => {
      let attempts = 0;
      const maxAttempts = 100;
      const checkSize = () => {
        attempts++;
        const w = canvas.clientWidth || canvas.width || 800;
        const h = canvas.clientHeight || canvas.height || 600;
        if (w > 0 && h > 0) {
          resolve();
        } else if (attempts >= maxAttempts) {
          resolve();
        } else {
          requestAnimationFrame(checkSize);
        }
      };
      checkSize();
    });

    const width = canvas.clientWidth || canvas.width || 800;
    const height = canvas.clientHeight || canvas.height || 600;

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
    renderer.toneMappingExposure = 1.0;
    renderer.physicallyCorrectLights = true;

    const scene = new THREE.Scene();
    scene.background = null;

    const camera = new THREE.PerspectiveCamera(45, width / height, 0.1, 100);
    camera.position.set(1.5, 2, 4.5);
    camera.lookAt(0, 1.2, 0);

    onProgress?.(10);

    let model: THREE.Group;
    try {
      model = await loadModel(modelUrl, onProgress);
    } catch (loadErr) {
      return {
        success: false,
        error: loadErr instanceof Error ? loadErr : new Error(String(loadErr)),
      };
    }

    onProgress?.(80);

    model.traverse((child) => {
      if (child instanceof THREE.Mesh) {
        child.castShadow = true;
        child.receiveShadow = true;
        if (child.material) {
          child.material.needsUpdate = true;
          if (child.name.includes('petal')) {
            child.material.side = THREE.DoubleSide;
          }
          if (
            child.material instanceof THREE.MeshStandardMaterial ||
            child.material instanceof THREE.MeshPhysicalMaterial
          ) {
            child.material.roughness = Math.min(child.material.roughness ?? 0.5, 0.6);
            child.material.metalness = Math.min(child.material.metalness ?? 0, 0.1);
          }
        }
      }
    });

    onProgress?.(90);

    const box = new THREE.Box3().setFromObject(model);
    const center = new THREE.Vector3();
    box.getCenter(center);
    model.position.sub(center);

    const size = new THREE.Vector3();
    box.getSize(size);

    const maxDim = Math.max(size.x, size.y, size.z);
    const scale = 3.0 / maxDim;
    model.scale.multiplyScalar(scale);

    model.rotation.x = -0.3;

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
    controls.enableZoom = false;
    controls.minDistance = 2;
    controls.maxDistance = 10;
    controls.maxPolarAngle = Math.PI / 2 - 0.02;
    controls.minPolarAngle = 0.1;
    controls.target.set(0, 1.2, 0);
    controls.autoRotate = true;
    controls.autoRotateSpeed = isMobile ? 0.2 : 0.3;

    if (prefersReducedMotion) {
      controls.autoRotate = false;
    }

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
      const newW = canvas.clientWidth;
      const newH = canvas.clientHeight;
      camera.aspect = newW / newH;
      camera.updateProjectionMatrix();
      renderer.setSize(newW, newH, false);
    };

    const ro = new ResizeObserver(handleResize);
    ro.observe(canvas);
    window.addEventListener('resize', handleResize);

    onProgress?.(100);

    const cleanup = () => {
      mounted = false;
      cancelAnimationFrame(rafId);
      ro.disconnect();
      window.removeEventListener('resize', handleResize);
      controls.dispose();
      renderer.dispose();
      disposeLoader();
    };

    return {
      success: true,
      scene: { renderer, scene, camera, controls, model, cleanup },
    };
  } catch (err) {
    return {
      success: false,
      error: err instanceof Error ? err : new Error(String(err)),
    };
  }
}
