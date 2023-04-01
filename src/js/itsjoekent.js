import * as THREE from 'three';
import { getCssVariableAsThreeColor, loadSpaceship, makeStars } from './three-utils';
import setupThreeJS from './setup-threejs';

const { camera, registerOnAnimate, scene } = setupThreeJS();

function setupCamera() {
  const percentInRange = (100 * (window.innerWidth - 300) / (4000 - 300)) / 100

  camera.position.z = 75 - (100 * percentInRange);
}

setupCamera();
window.addEventListener('resize', setupCamera);

makeStars(scene, getCssVariableAsThreeColor('color-violet').getHex());
makeStars(scene, getCssVariableAsThreeColor('color-blue').getHex());

let planet = null;

const textureLoader = new THREE.TextureLoader();
textureLoader.load('/textures/2k_mars.jpeg', (texture) => {
  planet = new THREE.Mesh(new THREE.SphereGeometry(12, 64, 64), new THREE.MeshBasicMaterial({ map: texture }));
  planet.position.set(10, 0, 0);
  scene.add(planet);
});

let shipAngle = 0;

loadSpaceship((spaceship) => {
  spaceship.position.set(10, 0, 12);
  scene.add(spaceship);

  registerOnAnimate(() => {
    if (planet) {
      planet.rotateOnAxis(new THREE.Vector3(0.5, 1, 0), THREE.MathUtils.degToRad(0.05));
    }

    shipAngle += 0.01;
    const updatedPosition = new THREE.Vector3(
      (Math.sin(shipAngle) * 14) + 7, 
      Math.cos(shipAngle) * 4,
      Math.cos(shipAngle) * 14,
    );

    const heading = new THREE.Vector3();
    heading.subVectors(spaceship.position, updatedPosition)
      .normalize()
      .multiply(new THREE.Vector3(2, 2, 2));

    const lookAt = new THREE.Vector3(updatedPosition.x, updatedPosition.y, updatedPosition.z);
    lookAt.add(heading);

    spaceship.lookAt(lookAt);
    spaceship.position.set(updatedPosition.x, updatedPosition.y, updatedPosition.z);
  });
});
