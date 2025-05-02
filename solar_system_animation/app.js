// Sistema Solar Animado com órbitas verticais (em XZ)
import * as THREE from 'three';
import { OrbitControls } from 'three/examples/jsm/controls/OrbitControls';
import GUI from 'lil-gui';

const scene = new THREE.Scene();
scene.background = new THREE.Color('black');

const camera = new THREE.PerspectiveCamera(45, window.innerWidth / window.innerHeight, 0.1, 1000);
camera.position.set(0, 20, 50);

const renderer = new THREE.WebGLRenderer({ antialias: true });
renderer.setSize(window.innerWidth, window.innerHeight);
document.body.appendChild(renderer.domElement);

const controls = new OrbitControls(camera, renderer.domElement);

const light = new THREE.PointLight(0xffffff, 2);
light.position.set(0, 0, 0);
scene.add(light);

const sunGeometry = new THREE.SphereGeometry(2, 32, 32);
const sunMaterial = new THREE.MeshBasicMaterial({ color: 0xffff00 });
const sun = new THREE.Mesh(sunGeometry, sunMaterial);
scene.add(sun);

const planets = [];
const orbitGroups = [];
const planetData = [
  { name: 'Mercúrio', color: 0x888888, size: 0.3, distance: 4, orbitSpeed: 0.04, rotationSpeed: 0.05 },
  { name: 'Vênus', color: 0xd4af37, size: 0.6, distance: 6, orbitSpeed: 0.03, rotationSpeed: 0.03 },
  { name: 'Terra', color: 0x0000ff, size: 0.7, distance: 8, orbitSpeed: 0.02, rotationSpeed: 0.05 },
  { name: 'Marte', color: 0xff0000, size: 0.5, distance: 10, orbitSpeed: 0.018, rotationSpeed: 0.04 },
  { name: 'Júpiter', color: 0xffa500, size: 1.2, distance: 13, orbitSpeed: 0.008, rotationSpeed: 0.08 },
  { name: 'Saturno', color: 0xffe4b5, size: 1, distance: 16, orbitSpeed: 0.006, rotationSpeed: 0.07 },
  { name: 'Urano', color: 0x00ffff, size: 0.9, distance: 19, orbitSpeed: 0.005, rotationSpeed: 0.06 },
  { name: 'Netuno', color: 0x00008b, size: 0.9, distance: 22, orbitSpeed: 0.004, rotationSpeed: 0.05 },
];

const gui = new GUI();
const settings = { animar: true };
gui.add(settings, 'animar').name('Ativar Animação');

planetData.forEach(data => {
  const group = new THREE.Object3D();
  group.rotation.x = Math.PI / 2; // ROTAÇÃO PARA ÓRBITA VERTICAL
  scene.add(group);

  const planetGeometry = new THREE.SphereGeometry(data.size, 32, 32);
  const planetMaterial = new THREE.MeshStandardMaterial({ color: data.color });
  const planet = new THREE.Mesh(planetGeometry, planetMaterial);
  planet.position.x = data.distance;
  group.add(planet);

  // Orbit circle
  const orbitGeometry = new THREE.RingGeometry(data.distance - 0.02, data.distance + 0.02, 64);
  const orbitMaterial = new THREE.MeshBasicMaterial({ color: 0xffffff, side: THREE.DoubleSide });
  const orbit = new THREE.Mesh(orbitGeometry, orbitMaterial);
  orbit.rotation.x = Math.PI / 2;
  scene.add(orbit);

  planets.push({ mesh: planet, data, angle: Math.random() * Math.PI * 2 });
  orbitGroups.push(group);

  const folder = gui.addFolder(data.name);
  folder.add(data, 'orbitSpeed', 0.001, 0.1).name('Vel. Órbita');
  folder.add(data, 'rotationSpeed', 0.001, 0.1).name('Vel. Rotação');
});

function animate() {
  requestAnimationFrame(animate);

  if (settings.animar) {
    planets.forEach((planetObj, index) => {
      const { mesh, data } = planetObj;
      planetObj.angle += data.orbitSpeed;
      const x = Math.cos(planetObj.angle) * data.distance;
      const y = Math.sin(planetObj.angle) * data.distance;
      mesh.position.set(x, 0, y); // plano XZ
      mesh.rotation.y += data.rotationSpeed;
    });
  }

  controls.update();
  renderer.render(scene, camera);
}

animate();

window.addEventListener('resize', () => {
  camera.aspect = window.innerWidth / window.innerHeight;
  camera.updateProjectionMatrix();
  renderer.setSize(window.innerWidth, window.innerHeight);
});
