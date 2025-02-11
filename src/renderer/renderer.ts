import * as THREE from "three";
import { type WebGLRendererParameters } from "three";
import { BaseUIElement, ClickableUIElement } from "./uiElements";

export class Renderer {
    private worldScene!: THREE.Scene;
    private uiScene!: THREE.Scene;
    private worldCamera!: THREE.PerspectiveCamera;
    private uiCamera!: THREE.OrthographicCamera;
    private renderer!: THREE.WebGLRenderer;
    private raycaster = new THREE.Raycaster();
    private mouse = new THREE.Vector2();

    private hoveredUiObj: BaseUIElement | undefined;

    width: number = 0;
    height: number = 0;

    init(windowDim: { width: number, height: number }, fov: number, canvas?: HTMLCanvasElement) {
        let params: WebGLRendererParameters = {};
        //params.precision = "highp";
        //params.powerPreference ="high-performance";
        //params.antialias = true;
        if (canvas)
            params.canvas = canvas;
        this.renderer = new THREE.WebGLRenderer(params);
        this.setCanvasSize(windowDim.width, windowDim.height);
        this.renderer.autoClear = false;
        this.renderer.shadowMap.enabled = true;
        this.renderer.shadowMap.type = THREE.PCFShadowMap;
        if (!canvas)
            document.body.appendChild(this.renderer.domElement);


        this.worldScene = new THREE.Scene();
        this.worldCamera = new THREE.PerspectiveCamera(fov, windowDim.width / windowDim.height, 0.1, 1000);

        this.uiScene = new THREE.Scene();
        this.uiCamera = new THREE.OrthographicCamera(-(this.width / 2), this.width / 2, this.height / 2, -(this.height / 2));
        this.uiCamera.layers.enableAll();
        this.uiCamera.position.set(0, 0, 10);

        window.addEventListener("click", this.clickEvent.bind(this));
        window.addEventListener("mousemove", this.hoverEvent.bind(this));
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

    setCanvasSize(width: number, height: number) {
        this.renderer.setSize(width, height);
        this.width = width;
        this.height = height;
    }

    ndcToThreeCoords(ndcX: number, ndcY: number): THREE.Vector3 {
        return new THREE.Vector3(
            ndcX * (this.uiCamera.right - this.uiCamera.left) / 2,
            ndcY * (this.uiCamera.top - this.uiCamera.bottom) / 2,
            0
        );
    }

    private clickEvent(hover: MouseEvent) {
        const canvasBox = this.renderer.domElement.getBoundingClientRect();
        this.mouse.x = ((hover.clientX - canvasBox.left) / canvasBox.width) * 2 - 1;
        this.mouse.y = -((hover.clientY - canvasBox.top) / canvasBox.height) * 2 + 1;
        this.raycaster.setFromCamera(this.mouse, this.uiCamera);
        this.raycaster.layers.set(1);
        let intersects = this.raycaster.intersectObjects(this.uiScene.children, true);
        if (intersects.length != 0) {
            console.log(intersects[0]);
            let clicked = intersects[0].object as ClickableUIElement;
            if (clicked.onClick)
                clicked.onClick();
            return; // we clicked something in the ui so don't check the worldScene
        }
        

        this.raycaster.layers.set(0);
        this.raycaster.setFromCamera(this.mouse, this.worldCamera);
        intersects = this.raycaster.intersectObjects(this.worldScene.children, true);
        console.log(intersects);
    }

    private hoverEvent(click: MouseEvent) {
        const canvasBox = this.renderer.domElement.getBoundingClientRect();
        this.mouse.x = ((click.clientX - canvasBox.left) / canvasBox.width) * 2 - 1;
        this.mouse.y = -((click.clientY - canvasBox.top) / canvasBox.height) * 2 + 1;
        this.raycaster.setFromCamera(this.mouse, this.uiCamera);
        this.raycaster.layers.set(1);
        let intersects = this.raycaster.intersectObjects(this.uiScene.children, true);
        // moved off the current object
        if (intersects.length == 0) {
            if (this.hoveredUiObj?.offHover)
                this.hoveredUiObj.offHover();
            this.hoveredUiObj = undefined;
            return;
        }
        if (intersects.length != 0) {
            let hovered = intersects[0].object as BaseUIElement;
            if (this.hoveredUiObj  === hovered)
                return; // nothing happens, same object as before
            // new hover
            if (this.hoveredUiObj?.offHover)
                this.hoveredUiObj.offHover();
            if (hovered.onHover)
                hovered.onHover();
            this.hoveredUiObj = hovered;
        }
    }
}
