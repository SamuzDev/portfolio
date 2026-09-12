import { Document, NodeIO } from '@gltf-transform/core';

const doc = new Document();
const scene = doc.createScene('scene');
doc.getRoot().setDefaultScene(scene);
doc.createBuffer();

const stemMat = doc.createMaterial('stem')
  .setBaseColorFactor([0.18, 0.49, 0.18, 1.0])
  .setRoughnessFactor(0.7)
  .setMetallicFactor(0.1);

const petalMat = doc.createMaterial('petal')
  .setBaseColorFactor([0.90, 0.22, 0.27, 1.0])
  .setRoughnessFactor(0.5)
  .setMetallicFactor(0.05)
  .setDoubleSided(true);

const stamenMat = doc.createMaterial('stamen')
  .setBaseColorFactor([1.0, 0.84, 0.0, 1.0])
  .setRoughnessFactor(0.3)
  .setMetallicFactor(0.2)
  .setEmissiveFactor([0.3, 0.25, 0.0]);

const leafMat = doc.createMaterial('leaf')
  .setBaseColorFactor([0.10, 0.36, 0.10, 1.0])
  .setRoughnessFactor(0.8)
  .setMetallicFactor(0.0)
  .setDoubleSided(true);

function createCylinder(radiusTop, radiusBottom, height, radialSegments, heightSegments, openEnded = false) {
  const positions = [];
  const normals = [];
  const indices = [];

  for (let y = 0; y <= heightSegments; y++) {
    const v = y / heightSegments;
    const radius = radiusBottom + (radiusTop - radiusBottom) * v;
    const yPos = v * height - height / 2;

    for (let x = 0; x <= radialSegments; x++) {
      const u = x / radialSegments;
      const angle = u * Math.PI * 2;
      const nx = Math.cos(angle);
      const nz = Math.sin(angle);

      positions.push(nx * radius, yPos, nz * radius);
      normals.push(nx, 0, nz);
    }
  }

  for (let y = 0; y < heightSegments; y++) {
    for (let x = 0; x < radialSegments; x++) {
      const a = y * (radialSegments + 1) + x;
      const b = y * (radialSegments + 1) + x + 1;
      const c = (y + 1) * (radialSegments + 1) + x;
      const d = (y + 1) * (radialSegments + 1) + x + 1;
      indices.push(a, c, b, b, c, d);
    }
  }

  if (!openEnded) {
    const centerBottom = positions.length / 3;
    positions.push(0, -height / 2, 0);
    normals.push(0, -1, 0);
    for (let x = 0; x < radialSegments; x++) {
      const a = x;
      const b = (x + 1) % (radialSegments + 1);
      indices.push(centerBottom, b, a);
    }

    const centerTop = positions.length / 3;
    positions.push(0, height / 2, 0);
    normals.push(0, 1, 0);
    for (let x = 0; x < radialSegments; x++) {
      const a = heightSegments * (radialSegments + 1) + x;
      const b = heightSegments * (radialSegments + 1) + (x + 1) % (radialSegments + 1);
      indices.push(centerTop, a, b);
    }
  }

  return { positions: new Float32Array(positions), normals: new Float32Array(normals), indices: new Uint32Array(indices) };
}

function createCone(radius, height, radialSegments, heightSegments, openEnded = false) {
  const positions = [];
  const normals = [];
  const indices = [];

  for (let y = 0; y <= heightSegments; y++) {
    const v = y / heightSegments;
    const r = radius * (1 - v);
    const yPos = v * height - height / 2;

    for (let x = 0; x <= radialSegments; x++) {
      const u = x / radialSegments;
      const angle = u * Math.PI * 2;
      const nx = Math.cos(angle);
      const nz = Math.sin(angle);

      positions.push(nx * r, yPos, nz * r);
      const slant = Math.sqrt(radius * radius + height * height);
      normals.push(nx * height / slant, radius / slant, nz * height / slant);
    }
  }

  for (let y = 0; y < heightSegments; y++) {
    for (let x = 0; x < radialSegments; x++) {
      const a = y * (radialSegments + 1) + x;
      const b = y * (radialSegments + 1) + x + 1;
      const c = (y + 1) * (radialSegments + 1) + x;
      const d = (y + 1) * (radialSegments + 1) + x + 1;
      indices.push(a, c, b, b, c, d);
    }
  }

  if (!openEnded) {
    const centerBottom = positions.length / 3;
    positions.push(0, -height / 2, 0);
    normals.push(0, -1, 0);
    for (let x = 0; x < radialSegments; x++) {
      const a = x;
      const b = (x + 1) % (radialSegments + 1);
      indices.push(centerBottom, b, a);
    }
  }

  return { positions: new Float32Array(positions), normals: new Float32Array(normals), indices: new Uint32Array(indices) };
}

function createSphere(radius, widthSegments, heightSegments) {
  const positions = [];
  const normals = [];
  const indices = [];

  for (let y = 0; y <= heightSegments; y++) {
    const v = y / heightSegments;
    const phi = v * Math.PI;
    const sinPhi = Math.sin(phi);
    const cosPhi = Math.cos(phi);

    for (let x = 0; x <= widthSegments; x++) {
      const u = x / widthSegments;
      const theta = u * Math.PI * 2;
      const sinTheta = Math.sin(theta);
      const cosTheta = Math.cos(theta);

      const nx = sinPhi * cosTheta;
      const ny = cosPhi;
      const nz = sinPhi * sinTheta;

      positions.push(nx * radius, ny * radius, nz * radius);
      normals.push(nx, ny, nz);
    }
  }

  for (let y = 0; y < heightSegments; y++) {
    for (let x = 0; x < widthSegments; x++) {
      const a = y * (widthSegments + 1) + x;
      const b = y * (widthSegments + 1) + x + 1;
      const c = (y + 1) * (widthSegments + 1) + x;
      const d = (y + 1) * (widthSegments + 1) + x + 1;
      indices.push(a, c, b, b, c, d);
    }
  }

  return { positions: new Float32Array(positions), normals: new Float32Array(normals), indices: new Uint32Array(indices) };
}

function createPlane(width, height, widthSegments = 1, heightSegments = 1) {
  const positions = [];
  const normals = [];
  const indices = [];

  for (let y = 0; y <= heightSegments; y++) {
    const v = y / heightSegments;
    for (let x = 0; x <= widthSegments; x++) {
      const u = x / widthSegments;
      positions.push((u - 0.5) * width, 0, (v - 0.5) * height);
      normals.push(0, 1, 0);
    }
  }

  for (let y = 0; y < heightSegments; y++) {
    for (let x = 0; x < widthSegments; x++) {
      const a = y * (widthSegments + 1) + x;
      const b = y * (widthSegments + 1) + x + 1;
      const c = (y + 1) * (widthSegments + 1) + x;
      const d = (y + 1) * (widthSegments + 1) + x + 1;
      indices.push(a, c, b, b, c, d);
    }
  }

  return { positions: new Float32Array(positions), normals: new Float32Array(normals), indices: new Uint32Array(indices) };
}

function applyTransform(positions, matrix) {
  const out = new Float32Array(positions.length);
  for (let i = 0; i < positions.length; i += 3) {
    const x = positions[i];
    const y = positions[i + 1];
    const z = positions[i + 2];
    out[i] = matrix[0] * x + matrix[4] * y + matrix[8] * z + matrix[12];
    out[i + 1] = matrix[1] * x + matrix[5] * y + matrix[9] * z + matrix[13];
    out[i + 2] = matrix[2] * x + matrix[6] * y + matrix[10] * z + matrix[14];
  }
  return out;
}

function applyNormalTransform(normals, matrix) {
  const out = new Float32Array(normals.length);
  for (let i = 0; i < normals.length; i += 3) {
    const x = normals[i];
    const y = normals[i + 1];
    const z = normals[i + 2];
    out[i] = matrix[0] * x + matrix[4] * y + matrix[8] * z;
    out[i + 1] = matrix[1] * x + matrix[5] * y + matrix[9] * z;
    out[i + 2] = matrix[2] * x + matrix[6] * y + matrix[10] * z;
    const len = Math.sqrt(out[i] * out[i] + out[i + 1] * out[i + 1] + out[i + 2] * out[i + 2]);
    if (len > 0) {
      out[i] /= len; out[i + 1] /= len; out[i + 2] /= len;
    }
  }
  return out;
}

function multMat4(a, b) {
  const out = new Array(16);
  for (let i = 0; i < 4; i++) {
    for (let j = 0; j < 4; j++) {
      let sum = 0;
      for (let k = 0; k < 4; k++) {
        sum += a[i * 4 + k] * b[k * 4 + j];
      }
      out[i * 4 + j] = sum;
    }
  }
  return out;
}

function translate(tx, ty, tz) {
  return [1, 0, 0, 0, 0, 1, 0, 0, 0, 0, 1, 0, tx, ty, tz, 1];
}

function rotateX(angle) {
  const c = Math.cos(angle);
  const s = Math.sin(angle);
  return [1, 0, 0, 0, 0, c, -s, 0, 0, s, c, 0, 0, 0, 0, 1];
}

function rotateY(angle) {
  const c = Math.cos(angle);
  const s = Math.sin(angle);
  return [c, 0, s, 0, 0, 1, 0, 0, -s, 0, c, 0, 0, 0, 0, 1];
}

function rotateZ(angle) {
  const c = Math.cos(angle);
  const s = Math.sin(angle);
  return [c, -s, 0, 0, s, c, 0, 0, 0, 0, 1, 0, 0, 0, 0, 1];
}

function addPart(name, positions, normals, indices, material, matrix) {
  const tPositions = applyTransform(positions, matrix);
  const tNormals = applyNormalTransform(normals, matrix);
  const mesh = doc.createMesh(name);
  const prim = doc.createPrimitive()
    .setMaterial(material)
    .setAttribute('POSITION', doc.createAccessor().setArray(tPositions))
    .setAttribute('NORMAL', doc.createAccessor().setArray(tNormals))
    .setIndices(doc.createAccessor().setArray(indices));
  mesh.addPrimitive(prim);
  const node = doc.createNode(name).setMesh(mesh);
  scene.addChild(node);
}

const stemHeight = 2.5;
const stemRadius = 0.04;
const { positions: stemPos, normals: stemNor, indices: stemIdx } = createCylinder(stemRadius, stemRadius * 1.2, stemHeight, 8, 4);
addPart('stem', stemPos, stemNor, stemIdx, stemMat, translate(0, stemHeight / 2, 0));

const petalCount = 6;
const petalLength = 0.8;
const petalWidth = 0.35;
const { positions: petalPos, normals: petalNor, indices: petalIdx } = createCone(petalWidth, petalLength, 4, 2, true);

for (let i = 0; i < petalCount; i++) {
  const angle = (i / petalCount) * Math.PI * 2;
  let m = translate(Math.cos(angle) * 0.15, stemHeight + 0.1, Math.sin(angle) * 0.15);
  m = multMat4(m, rotateX(-Math.PI / 2));
  m = multMat4(m, rotateZ(angle));
  m = multMat4(m, rotateY(Math.PI / 6));
  addPart(`petal_${i}`, petalPos, petalNor, petalIdx, petalMat, m);
}

const innerPetalCount = 6;
const innerPetalLength = 0.55;
const innerPetalWidth = 0.25;
const { positions: ipPos, normals: ipNor, indices: ipIdx } = createCone(innerPetalWidth, innerPetalLength, 4, 2, true);

for (let i = 0; i < innerPetalCount; i++) {
  const angle = (i / innerPetalCount) * Math.PI * 2 + Math.PI / innerPetalCount;
  let m = translate(Math.cos(angle) * 0.08, stemHeight + 0.15, Math.sin(angle) * 0.08);
  m = multMat4(m, rotateX(-Math.PI / 2));
  m = multMat4(m, rotateZ(angle));
  m = multMat4(m, rotateY(Math.PI / 4));
  addPart(`inner_petal_${i}`, ipPos, ipNor, ipIdx, petalMat, m);
}

const stamenCount = 12;
const { positions: stamPos, normals: stamNor, indices: stamIdx } = createCylinder(0.01, 0.015, 0.35, 6, 1);
const { positions: anthPos, normals: anthNor, indices: anthIdx } = createSphere(0.025, 8, 6);

for (let i = 0; i < stamenCount; i++) {
  const angle = (i / stamenCount) * Math.PI * 2;
  const radius = 0.06;
  let m = translate(Math.cos(angle) * radius, stemHeight + 0.25, Math.sin(angle) * radius);
  const rx = (Math.random() - 0.5) * 0.3;
  const rz = (Math.random() - 0.5) * 0.3;
  m = multMat4(m, rotateX(rx));
  m = multMat4(m, rotateZ(rz));
  addPart(`stamen_${i}`, stamPos, stamNor, stamIdx, stamenMat, m);

  let m2 = translate(Math.cos(angle) * radius, stemHeight + 0.43, Math.sin(angle) * radius);
  addPart(`anther_${i}`, anthPos, anthNor, anthIdx, stamenMat, m2);
}

const leafCount = 3;
const { positions: leafPos, normals: leafNor, indices: leafIdx } = createPlane(0.4, 0.8, 2, 2);

for (let i = 0; i < leafCount; i++) {
  const angle = (i / leafCount) * Math.PI * 2;
  const height = 0.4 + i * 0.5;
  let m = translate(Math.cos(angle) * 0.25, height, Math.sin(angle) * 0.25);
  m = multMat4(m, rotateY(angle));
  m = multMat4(m, rotateX(-Math.PI / 3));
  m = multMat4(m, rotateZ(Math.PI / 6));
  addPart(`leaf_${i}`, leafPos, leafNor, leafIdx, leafMat, m);
}

const io = new NodeIO();
await io.write('/home/samuz/portfolio/public/models/white_mesh.glb', doc);
console.log('GLB saved to public/models/white_mesh.glb');