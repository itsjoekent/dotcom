import * as THREE from 'three';
import setupThreeJS from './setup-threejs';

const { camera, scene } = setupThreeJS();

const geometry = new THREE.BoxGeometry( 1, 1, 1 );
const material = new THREE.MeshBasicMaterial( { color: 0x00ff00 } );
const cube = new THREE.Mesh( geometry, material );
scene.add( cube );

camera.position.z = 5;
