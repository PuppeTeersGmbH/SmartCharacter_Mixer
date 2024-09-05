import * as THREE from 'three';
import { OrbitControls } from 'three/addons/controls/OrbitControls.js';
import { mixer } from './animation-handler.js';
import * as UTILITY from './utils.js';

export let scene, renderer, camera, clock, controls;

export function drawScene() {
    const container = document.getElementById('container');

    // Set up the scene
    scene = new THREE.Scene();
    scene.background = new THREE.Color(0xa0a0a0);
    scene.fog = new THREE.Fog(0xa0a0a0, 10, 50);

    // Set up the camera
    camera = new THREE.PerspectiveCamera(45, window.innerWidth / window.innerHeight, 0.1, 1000);
    camera.position.set(0, 2, 5);
    camera.lookAt(0, 1, 0);

    // Set up lighting
    const hemiLight = new THREE.HemisphereLight(0xffffff, 0x8d8d8d, 3);
    hemiLight.position.set(0, 20, 0);
    scene.add(hemiLight);

    const dirLight = new THREE.DirectionalLight(0xffffff, 2);
    dirLight.position.set(-3, 10, -10);
    dirLight.castShadow = true;
    dirLight.shadow.camera.top = 2;
    dirLight.shadow.camera.bottom = -2;
    dirLight.shadow.camera.left = -2;
    dirLight.shadow.camera.right = 2;
    dirLight.shadow.camera.near = 0.1;
    dirLight.shadow.camera.far = 40;
    scene.add(dirLight);

    const ambientLight = new THREE.AmbientLight(0xffffff, 0.3); // Lower intensity to avoid washing out the scene
    scene.add(ambientLight);

    // Ground
    const groundMesh = new THREE.Mesh(
        new THREE.PlaneGeometry(100, 100),
        new THREE.MeshPhongMaterial({ color: 0xcbcbcb, depthWrite: false })
    );
    groundMesh.rotation.x = -Math.PI / 2;
    groundMesh.receiveShadow = true;
    scene.add(groundMesh);

    // Set up renderer
    renderer = new THREE.WebGLRenderer({ antialias: true });
    renderer.setPixelRatio(window.devicePixelRatio);
    renderer.setSize(window.innerWidth, window.innerHeight);
    container.appendChild(renderer.domElement);

    // Set up OrbitControls
    controls = new OrbitControls(camera, renderer.domElement);
    controls.enableDamping = true;
    controls.dampingFactor = 0.25;
    controls.enableZoom = true;

    // Grid Helper
    const gridHelper = new THREE.GridHelper(10, 10);
    scene.add(gridHelper);

    // Initialize clock
    clock = new THREE.Clock();

    //Start Rendering Loop 
    renderer.setAnimationLoop(customAnimate);

}

export function onWindowResize() {
    camera.aspect = window.innerWidth / window.innerHeight;
    camera.updateProjectionMatrix();
    renderer.setSize(window.innerWidth, window.innerHeight);
}

function customAnimate() {
    const delta = clock.getDelta();
    const mixer = UTILITY.getMixer();

    if (mixer) mixer.update(delta);

    controls.update();

    renderer.render(scene, camera);
}