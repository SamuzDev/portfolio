import * as THREE from 'three';

export const higanbanaMaterials = {
  // Main petals: Subsurface scattering simulation
  petal: {
    color: 0xe63946,
    roughness: 0.45,
    metalness: 0.02,
    transmission: 0.12,
    thickness: 0.5,
    ior: 1.4,
    side: THREE.DoubleSide,
    flatShading: false,
  } as THREE.MeshPhysicalMaterialParameters,

  // Inner petals: Deeper, more saturated red
  innerPetal: {
    color: 0xb82a3a,
    roughness: 0.4,
    metalness: 0.01,
    transmission: 0.08,
    thickness: 0.4,
    ior: 1.4,
    side: THREE.DoubleSide,
    flatShading: false,
  } as THREE.MeshPhysicalMaterialParameters,

  // Stem: Organic bark texture
  stem: {
    color: 0x1a5c1a,
    roughness: 0.8,
    metalness: 0.03,
    flatShading: false,
  } as THREE.MeshStandardMaterialParameters,

  // Leaves: Matte green with slight variation
  leaf: {
    color: 0x154715,
    roughness: 0.9,
    metalness: 0.0,
    side: THREE.DoubleSide,
    flatShading: false,
  } as THREE.MeshStandardMaterialParameters,

  // Stamens: Emissive gold
  stamen: {
    color: 0xffd700,
    roughness: 0.25,
    metalness: 0.2,
    emissive: 0x332200,
    emissiveIntensity: 0.3,
  } as THREE.MeshStandardMaterialParameters,

  // Anthers: Brighter gold
  anther: {
    color: 0xffcc00,
    roughness: 0.2,
    metalness: 0.25,
    emissive: 0x443300,
    emissiveIntensity: 0.5,
  } as THREE.MeshStandardMaterialParameters,
};

export function createMaterials(): Map<string, THREE.Material> {
  const mats = new Map<string, THREE.Material>();

  mats.set('petal', new THREE.MeshPhysicalMaterial(higanbanaMaterials.petal));
  mats.set('innerPetal', new THREE.MeshPhysicalMaterial(higanbanaMaterials.innerPetal));
  mats.set('stem', new THREE.MeshStandardMaterial(higanbanaMaterials.stem));
  mats.set('leaf', new THREE.MeshStandardMaterial(higanbanaMaterials.leaf));
  mats.set('stamen', new THREE.MeshStandardMaterial(higanbanaMaterials.stamen));
  mats.set('anther', new THREE.MeshStandardMaterial(higanbanaMaterials.anther));

  return mats;
}

export function applyMaterials(
  object: THREE.Object3D,
  materials: Map<string, THREE.Material>
): void {
  object.traverse((child) => {
    if (child instanceof THREE.Mesh) {
      const name = child.name.toLowerCase();
      let material: THREE.Material | undefined;

      if (name.includes('inner_petal') || name.includes('innerpetal')) {
        material = materials.get('innerPetal');
      } else if (name.includes('petal')) {
        material = materials.get('petal');
      } else if (name.includes('stem')) {
        material = materials.get('stem');
      } else if (name.includes('leaf')) {
        material = materials.get('leaf');
      } else if (name.includes('anther')) {
        material = materials.get('anther');
      } else if (name.includes('stamen')) {
        material = materials.get('stamen');
      }

      if (material) {
        child.material = material;
      }
      child.castShadow = true;
      child.receiveShadow = true;
    }
  });
}