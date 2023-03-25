import * as THREE from 'three';
import { GLTFLoader } from 'three/examples/jsm/loaders/GLTFLoader';
import setupThreeJS from './setup-threejs';

const { camera, scene, registerOnAnimate } = setupThreeJS();
const loader = new GLTFLoader();

camera.position.z = 75;
scene.fog = new THREE.FogExp2(0xefd1b5, 0.0025);

let spaceshipObjectId: number | null = null;
loader.load('/public/models/craft_racer.glb', (gltfData) => {
  gltfData.scene.position.set(0.01, 0, 0);
  scene.add(gltfData.scene);
  spaceshipObjectId = gltfData.scene.id;
});

const a = 10;
const b = 28;
const c = 8.0 / 3.0;

registerOnAnimate(() => {
  if (!spaceshipObjectId) return;
  
  const spaceship = scene.getObjectById(spaceshipObjectId);
  if (!spaceship) return;

  const { x, y, z } = spaceship.position;

  const dt = 0.005;
  const dx = (a * (y - x)) * dt;
  const dy = (x * (b - z) - y) * dt;
  const dz = (x * y - c * z) * dt;

  const updatedPosition = new THREE.Vector3(x + dx, y + dy, z + dz);
  
  const heading = new THREE.Vector3();
  heading.subVectors(spaceship.position, updatedPosition)
    .normalize()
    .multiply(new THREE.Vector3(2, 2, 2));
  
  const lookAt = new THREE.Vector3(updatedPosition.x, updatedPosition.y, updatedPosition.z);
  lookAt.add(heading);

  spaceship.lookAt(lookAt);
  spaceship.position.set(updatedPosition.x, updatedPosition.y, updatedPosition.z);

});
