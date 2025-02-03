import * as THREE from "three";
import { WebGLRendererParameters } from "three";

export class Renderer {
    private worldScene!: THREE.Scene;
    private uiScene!: THREE.Scene;
    private worldCamera!: THREE.PerspectiveCamera;
    private uiCamera!: THREE.OrthographicCamera;
    private renderer!: THREE.WebGLRenderer;

    width: number = 0;
    height: number = 0;

    init(windowDim: {width: number, height: number}, fov: number, canvas?: HTMLCanvasElement) {
        let params: WebGLRendererParameters = {};
        //params.precision = "highp";
        //params.powerPreference ="high-performance";
        //params.antialias = true;
        if (canvas)
            params.canvas = canvas;
        this.renderer = new THREE.WebGLRenderer(params);
        this.renderer.setSize(windowDim.width, windowDim.height);
        this.renderer.autoClear = false;
        this.renderer.shadowMap.enabled = true;
        this.renderer.shadowMap.type = THREE.PCFShadowMap;
        if (!canvas)
            document.body.appendChild(this.renderer.domElement);

        this.width = windowDim.width;
        this.height = windowDim.height;

        this.worldScene = new THREE.Scene();
        this.worldCamera = new THREE.PerspectiveCamera(fov, windowDim.width / windowDim.height, 0.1, 1000);

        this.uiScene = new THREE.Scene();
        this.uiCamera = new THREE.OrthographicCamera(0, windowDim.width, 0, windowDim.height, 0, 1);
    }

    renderFrame() {
        this.renderer.render(this.worldScene, this.worldCamera);
        this.renderer.render(this.uiScene, this.uiCamera);
    }
    
    addWorldObject(obj: THREE.Object3D) {
        this.worldScene.add(obj);
    }

    removeWorldObject(obj: THREE.Object3D) {
        this.worldScene.remove(obj);
    }

    addUiObject(obj: THREE.Object3D) {
        this.uiScene.add(obj);
    }

    removeUiObject(obj: THREE.Object3D) {
        this.uiScene.remove(obj);
    }
}
