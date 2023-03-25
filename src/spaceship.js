import * as THREE from 'three';
import { GLTFLoader } from 'three/examples/jsm/loaders/GLTFLoader';
import setupThreeJS from './setup-threejs';

let isPlaying = !window.matchMedia('(prefers-reduced-motion: reduce)').matches;

function linear(time, start, end, duration) {
  const to = end - start;
  return to * time / duration + start;
}

function spaceship() {
  const { camera, registerOnAnimate, renderer, scene } = setupThreeJS();
  const loader = new GLTFLoader();

  // camera.position.z = 10;
  camera.position.z = 75;
  scene.fog = new THREE.FogExp2(0xD3D3D3, 0.0025);

  let spaceship = null;
  const particles = [];

  const spaceshipEmitters = [
    new THREE.Vector3(1.7, 0.2, 2.2),
    new THREE.Vector3(2.3, 0.2, 2.2),
  ];

  function makeStars(color) {
    const starGeometry = new THREE.BufferGeometry();
    const starPoints = [];

    for (let i = 0; i < 1000; i++) {
      starPoints.push(THREE.MathUtils.randFloatSpread(600));
      starPoints.push(THREE.MathUtils.randFloatSpread(600));
      starPoints.push(THREE.MathUtils.randFloatSpread(600));
    }

    starGeometry.setAttribute('position', new THREE.BufferAttribute(new Float32Array([ ...starPoints ]), 3));
    const stars = new THREE.Points(starGeometry, new THREE.PointsMaterial({ color }));
    scene.add(stars);
  }

  makeStars(0x7e09ee);
  makeStars(0x0979ee);

  function Particle(x, y, z, velocity) {
    const color = y > 0 ? 0xEE0979 : 0xFF6A00;

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

  loader.load('/models/craft_racer.glb', (gltfData) => {
    spaceship = gltfData.scene;
    spaceship.position.set(0.01, 0, 0);

    scene.add(spaceship);
  });

  const a = 10;
  const b = 28;
  const c = 8.0 / 3.0;

  let tick = 0;
  registerOnAnimate(() => {
    if (!spaceship) return;
    if (!isPlaying) return;

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

    const cameraOffsetReference = spaceship.position.clone().add(new THREE.Vector3(0, -2, 0));
    const cameraOffset = new THREE.Vector3(
      linear(1, x, cameraOffsetReference.x, 0.15),
      linear(1, y, cameraOffsetReference.y, 0.15),
      linear(1, z, cameraOffsetReference.z, 0.15),
    );

    spaceship.lookAt(lookAt);
    spaceship.position.set(updatedPosition.x, updatedPosition.y, updatedPosition.z);

    camera.lookAt(cameraOffset);

    particles.forEach((particle) => particle.update());

    if (tick % 2 === 0) {
      const leftEmissionPoint = spaceship.position.clone().add(spaceshipEmitters[0].clone().applyQuaternion(spaceship.quaternion));
      const rightEmissionPoint = spaceship.position.clone().add(spaceshipEmitters[1].clone().applyQuaternion(spaceship.quaternion));

      // const velocity = new THREE.Vector3(0, 0, 0);
      const velocity = new THREE.Vector3(heading.x, heading.y, heading.z);
      velocity.addScalar(-1).normalize().addScalar(0.01);

      particles.push(Particle(leftEmissionPoint.x, leftEmissionPoint.y, leftEmissionPoint.z, velocity));
      particles.push(Particle(rightEmissionPoint.x, rightEmissionPoint.y, rightEmissionPoint.z, velocity));
    }

    tick++;
  });
}


const controlButton = document.getElementById('canvas-controls');

function toggleButton() {
  isPlaying = !isPlaying;
  controlButton.textContent = isPlaying ? 'pause' : 'play';
}

controlButton.addEventListener('click', toggleButton);

if (isPlaying) {
  spaceship();
} else {
  controlButton.textContent = 'play';
}
