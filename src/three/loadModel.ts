import * as THREE from 'three';
import { GLTFLoader } from 'three/examples/jsm/loaders/GLTFLoader.js';
import { DRACOLoader } from 'three/examples/jsm/loaders/DRACOLoader.js';

let loaderInstance: GLTFLoader | null = null;

function createLoader(): GLTFLoader {
  if (loaderInstance) return loaderInstance;

  const loader = new GLTFLoader();
  const dracoLoader = new DRACOLoader();
  dracoLoader.setDecoderPath('https://www.gstatic.com/draco/v1/decoders/');
  dracoLoader.setDecoderConfig({ type: 'js' });
  loader.setDRACOLoader(dracoLoader);

  loaderInstance = loader;
  return loader;
}

export async function loadModel(
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
          const percent = Math.round((xhr.loaded / xhr.total) * 60) + 10;
          onProgress(Math.min(percent, 70));
        }
      },
      (error) => {
        console.error('Failed to load model:', error);
        reject(error);
      }
    );
  });
}

export function disposeLoader(): void {
  if (loaderInstance) {
    loaderInstance = null;
  }
}