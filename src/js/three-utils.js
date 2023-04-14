import * as THREE from 'three';
import { GLTFLoader } from 'three/examples/jsm/loaders/GLTFLoader';
import { getCssVariable } from './utils';

export function loadSpaceship(onLoad) {
  const loader = new GLTFLoader();
  loader.load('/models/craft_racer.glb', (gltfData) => {
    onLoad(gltfData.scene);
  });
}

export function getRandomArbitrary(min, max) {
  return Math.random() * (max - min) + min;
}

export function getRandomInt(min, max) {
  min = Math.ceil(min);
  max = Math.floor(max);
  return Math.floor(Math.random() * (max - min + 1)) + min;
}

export function makeStars(scene, color) {
  const starGeometry = new THREE.BufferGeometry();
  const starPoints = [];

  const generateZPoint = () => !!Math.round(Math.random()) 
    ? getRandomInt(-600, 0)
    : getRandomInt(200, 600)

  for (let i = 0; i < 1000; i++) {
    starPoints.push(THREE.MathUtils.randFloatSpread(600));
    starPoints.push(THREE.MathUtils.randFloatSpread(600));
    starPoints.push(generateZPoint());
  }

  starGeometry.setAttribute('position', new THREE.BufferAttribute(new Float32Array([ ...starPoints ]), 3));
  const stars = new THREE.Points(starGeometry, new THREE.PointsMaterial({ color }));
  scene.add(stars);
}

export function getCssVariableAsThreeColor(variableName) {
  const value = getCssVariable(variableName);
  return new THREE.Color(value);
}

const spaceshipEmitters = [
  new THREE.Vector3(1.7, 0.2, 2.2),
  new THREE.Vector3(2.3, 0.2, 2.2),
];

export function getSpaceshipEmissionVectors(spaceship) {
  const leftEmissionPoint = spaceship.position.clone().add(spaceshipEmitters[0].clone().applyQuaternion(spaceship.quaternion));
  const rightEmissionPoint = spaceship.position.clone().add(spaceshipEmitters[1].clone().applyQuaternion(spaceship.quaternion));

  return [leftEmissionPoint, rightEmissionPoint];
}

export function Particle(scene, x, y, z, velocity, color) {
  const geometry = new THREE.BoxGeometry(0.25, 0.25, 0.25);

  const material = new THREE.MeshBasicMaterial({ color });
  material.transparent = true;
  material.opacity = 1;

  const cube = new THREE.Mesh(geometry, material);
  cube.position.set(x, y, z);
  
  scene.add(cube);

  const death = 3500;
  let life = 0;
  let lastUpdate = Date.now();

  function update() {
    if (life > death) {
      scene.remove(cube);
      return;
    }

    cube.position.add(velocity);
    material.opacity = (death - life) / death;

    life += Date.now() - lastUpdate;
    lastUpdate = Date.now();
  }

  return {
    cube, velocity, update,
  };
}
