import { Document, NodeIO } from '@gltf-transform/core';

const doc = new Document();
const scene = doc.createScene('scene');
doc.getRoot().setDefaultScene(scene);

const node = doc.createNode('test');
scene.addChild(node);

const io = new NodeIO();
await io.writeBinary('/tmp/test.glb', doc);
console.log('ok');