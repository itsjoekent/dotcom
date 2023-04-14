import * as THREE from 'three';
import { Particle, getCssVariableAsThreeColor, getSpaceshipEmissionVectors, loadSpaceship, makeStars } from './three-utils';
import setupThreeJS from './setup-threejs';

function linear(time, start, end, duration) {
  const to = end - start;
  return to * time / duration + start;
}

const { camera, registerOnAnimate, scene } = setupThreeJS();

function setupCamera() {
  const percentInRange = (100 * (window.innerWidth - 300) / (4000 - 300)) / 100

  camera.position.z = 100 - (100 * percentInRange);
}

setupCamera();
window.addEventListener('resize', setupCamera);

const particles = [];

makeStars(scene, getCssVariableAsThreeColor('color-violet').getHex());
makeStars(scene, getCssVariableAsThreeColor('color-blue').getHex());

const a = 10;
const b = 28;
const c = 8.0 / 3.0;

let tick = 0;

loadSpaceship((spaceship) => {
  spaceship.position.set(0.01, 0, 0);
  scene.add(spaceship);

  registerOnAnimate(() => {
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
      const [leftEmissionPoint, rightEmissionPoint] = getSpaceshipEmissionVectors(spaceship);

      const velocity = new THREE.Vector3(heading.x, heading.y, heading.z);
      velocity.addScalar(-1).normalize().addScalar(0.01);

      const particleColor = getCssVariableAsThreeColor(updatedPosition.y > 0 ? 'color-pink' : 'color-orange').getHex();
      particles.push(Particle(scene, leftEmissionPoint.x, leftEmissionPoint.y, leftEmissionPoint.z, velocity, particleColor));
      particles.push(Particle(scene, rightEmissionPoint.x, rightEmissionPoint.y, rightEmissionPoint.z, velocity, particleColor));
    }

    tick++;
  });
});
