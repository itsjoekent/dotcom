import * as THREE from 'three';
import { RoomEnvironment } from 'three/examples/jsm/environments/RoomEnvironment.js';
import { getCssVariableAsThreeColor } from './three-utils';

export default function setupThreeJS(canvasId = 'canvas', playPauseId = 'canvas-controls') {
  const canvasElement = document.getElementById(canvasId);
  if (!canvasElement) throw new Error('No canvas element');

  let isPlaying = !window.matchMedia('(prefers-reduced-motion: reduce)').matches;
  const controlButton = document.getElementById(playPauseId);

  const scene = new THREE.Scene();
  const backgroundColor = getCssVariableAsThreeColor('token-background-color');
  scene.background = backgroundColor;

  scene.fog = new THREE.FogExp2(0xD3D3D3, 0.0025);

  const camera = new THREE.PerspectiveCamera(75, window.innerWidth / window.innerHeight, 0.1, 1000);
  const renderer = new THREE.WebGLRenderer({ canvas: canvasElement, antialias: true });

  renderer.setSize(window.innerWidth, window.innerHeight);
  renderer.setClearColor(backgroundColor.getHex(), 1);

  const pmremGenerator = new THREE.PMREMGenerator(renderer);
  pmremGenerator.compileEquirectangularShader();
  const neutralEnvironment = pmremGenerator.fromScene(new RoomEnvironment()).texture;
  scene.environment = neutralEnvironment;


  let onAnimate = () => {};
  const registerOnAnimate = (callback) => onAnimate = callback;

  function animate() {
    if (!isPlaying) return;
    requestAnimationFrame(animate);

    if (onAnimate) onAnimate();
    renderer.render(scene, camera);
  }
  animate();

  function onWindowResize() {
    camera.aspect = window.innerWidth / window.innerHeight;
    camera.updateProjectionMatrix();

    renderer.setSize(window.innerWidth, window.innerHeight);
  }

  window.addEventListener('resize', onWindowResize);

  if (controlButton) {
    function toggleButton() {
      isPlaying = !isPlaying;
      controlButton.textContent = isPlaying ? 'pause' : 'play';
      animate();
    }

    controlButton.addEventListener('click', toggleButton);
    controlButton.textContent = isPlaying ? 'pause' : 'play';
  }  

  return { scene, camera, renderer, canvasElement, registerOnAnimate };
}
