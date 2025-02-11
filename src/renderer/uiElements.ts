import * as THREE from 'three';
import { prism } from '../../tests/ui_test/ui_test';
import { PrismTick } from '../core/events/prismTicks';
import { Subscriber } from '../core/events/eventHub';

export class BaseUIElement extends THREE.Sprite {
    ndcPosition: THREE.Vector3 = new THREE.Vector3();
    ndcScale: THREE.Vector3 = new THREE.Vector3();
    aspectRatio: number = 1;
    animSub: Subscriber<PrismTick> | undefined;

    onHover:  (() => void) | undefined;
    offHover: (() => void) | undefined;

    constructor(spriteMaterial?: THREE.SpriteMaterial) {
        super(spriteMaterial);
        this.layers.set(0);
    }

    setPosition (ndcX: number, ndcY: number) {
        this.ndcPosition.set(ndcX, ndcY, 0);
        let pos = prism.renderer.ndcToThreeCoords(ndcX, ndcY);
        pos.x += (this.scale.x / 2);
        pos.y -= (this.scale.y / 2);
        this.position.copy(pos);
    }

    setScaleFixed (ndcWidth:number, ndcHeight: number) {
        this.ndcScale.set(ndcWidth, ndcHeight, 1);
        let scale = prism.renderer.ndcToThreeCoords(ndcWidth, ndcHeight);
        this.scale.copy(scale);
    }

    setScaleWidth (ndcWidth: number) {
        let ndcHeight = ndcWidth / this.aspectRatio;
        this.setScaleFixed(ndcWidth, ndcHeight);
    }

    setScaleHeight (ndcHeight: number) {
        let ndcWidth = ndcHeight / this.aspectRatio;
        this.setScaleFixed(ndcWidth, ndcHeight);
    }

    setAspectRatio (ratio: number) {
        this.aspectRatio = (ratio * prism.renderer.height) / prism.renderer.width;
    }

    animate (animation: (delta: PrismTick) => Boolean) {
        /* only one animation can play at a time? */
        if (this.animSub !== undefined)
            return;
        this.animSub = prism.prismEvents.subscribe<PrismTick>("renderTick", (delta) => {
            if(animation(delta)) {
                this.animSub!.unsubscribe();
                this.animSub = undefined;
            }
        });
    }

    forceStopAnimation() {
        if (this.animSub === undefined)
            return
        this.animSub!.unsubscribe();
        this.animSub = undefined;
    }
}

export class ClickableUIElement extends BaseUIElement {

    clickLayer: number = 0;
    onClick: (() => void) | undefined;

    constructor(spriteMaterial?: THREE.SpriteMaterial) {
        super(spriteMaterial);
        this.layers.set(1);
    }

    setClickLayer (clickLayer: number) {
        this.clickLayer = clickLayer;
        this.position.setZ(clickLayer);
    }

    override setPosition (ndcX: number, ndcY: number) {
        this.ndcPosition.set(ndcX, ndcY, this.clickLayer);
        let pos = prism.renderer.ndcToThreeCoords(ndcX, ndcY);
        pos.x += (this.scale.x / 2);
        pos.y -= (this.scale.y / 2);
        this.position.copy(pos);
    }

}