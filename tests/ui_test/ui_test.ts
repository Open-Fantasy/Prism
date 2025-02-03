import * as PRISM from "../../src/prism";
import * as THREE from "three";

let prismSettings = new PRISM.PrismSettings;
prismSettings.gatherStats = true;
prismSettings.windowDim = {width: window.innerWidth, height: window.innerHeight};
let prism = new PRISM.Prism(prismSettings);

(globalThis as any).prism = prism;

prism.start();

let testCubeGeo = new THREE.BoxGeometry();
let testCubeMat = new THREE.MeshStandardMaterial({color: 0x00ff00});
let testCube = new THREE.Mesh(testCubeGeo, testCubeMat);
testCube.position.set(0, 0, -30);
testCube.castShadow = true;
testCube.receiveShadow = true;
prism.renderer.addWorldObject(testCube);

let lightDir = new THREE.DirectionalLight(0xFFFFFF, 0.5);
lightDir.position.set(0, 0, 10);
lightDir.target.position.copy(testCube.position);
lightDir.castShadow = true;
let helper = new THREE.DirectionalLightHelper(lightDir, 10, new THREE.Color(0x0000FF));
prism.renderer.addWorldObject(lightDir);
prism.renderer.addWorldObject(lightDir.target);
prism.renderer.addWorldObject(helper);


let lightAmbi = new THREE.AmbientLight(0x404040, 1);
prism.renderer.addWorldObject(lightAmbi);


let groundGeometry = new THREE.PlaneGeometry(10, 10);
let groundMaterial = new THREE.MeshStandardMaterial({color: 0xFF0000});
let ground = new THREE.Mesh(groundGeometry, groundMaterial);
ground.position.set (0, 0, -30.5);
ground.receiveShadow = true;
prism.renderer.addWorldObject(ground);


prism.prismEvents.subscribe('renderTick', rotateCube);
function rotateCube(delta: number) {
    testCube.rotateX(0.01);
    testCube.rotateY(0.01);
    helper.update();
}