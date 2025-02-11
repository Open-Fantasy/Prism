import * as THREE from "three";
import { prism } from "./ui_test";
import { BaseUIElement, ClickableUIElement } from "../../src/renderer/uiElements";
import { PrismTick } from "../../src/events/prismTicks";

class UiWithAnim extends ClickableUIElement {
    animDur: number = 2000;
    curDur: number = this.animDur;

    animation(delta: PrismTick): Boolean {
        this.curDur -= delta.data;
        if (this.curDur <= 0) {
            console.log("Animation Done!");
            this.material.color.setHex(0x0000ff)
            this.curDur = this.animDur;
            return true;
        }
        let color: THREE.HSL = {
            h: 0,
            s: 0,
            l: 0
        };
        this.material.color.getHSL(color)
        this.material.color.setHSL(color.h + 0.02, color.s, color.l);
        return false;
    }

}

export function setupUI() {

    const testSpriteMatA = new THREE.SpriteMaterial({color: 0x0000ff});
    const spriteA = new UiWithAnim(testSpriteMatA);
    spriteA.setAspectRatio(1);
    spriteA.setScaleWidth(0.1);
    spriteA.setPosition(-1, 1);
    spriteA.onClick = () => {
        console.log("Running Animation");
        spriteA.material.color.setHex(0x0000ff);
        spriteA.animate(spriteA.animation.bind(spriteA))
    };
    spriteA.onHover = () => {spriteA.material.color.setHex(0); console.log("Hovered Sprite A!")};
    spriteA.offHover = () => {spriteA.forceStopAnimation(); console.log("Off Sprite A!")};
    prism.renderer.addUiObject(spriteA);

    const testSpriteMatB = new THREE.SpriteMaterial({color: 0x00ff00});
    const spriteB = new BaseUIElement(testSpriteMatB);
    spriteB.setAspectRatio(1);
    spriteB.setScaleWidth(0.1);
    spriteB.setPosition(-1, -1 + spriteB.ndcScale.y);
    prism.renderer.addUiObject(spriteB);

    const testSpriteMatC = new THREE.SpriteMaterial({color: 0xff0000});
    const spriteC = new BaseUIElement(testSpriteMatC);
    spriteC.setAspectRatio(1);
    spriteC.setScaleWidth(0.1);
    spriteC.setPosition(1 - spriteC.ndcScale.x, 1);
    prism.renderer.addUiObject(spriteC);

    const testSpriteMatD = new THREE.SpriteMaterial({color: 0x00ffff});
    const spriteD = new BaseUIElement(testSpriteMatD);
    spriteD.setAspectRatio(1);
    spriteD.setScaleWidth(0.1);
    spriteD.setPosition(1 - spriteD.ndcScale.x, -1 + spriteD.ndcScale.y);
    prism.renderer.addUiObject(spriteD);

    const testSpriteMatE = new THREE.SpriteMaterial({color: 0xff00ff});
    const spriteE = new ClickableUIElement(testSpriteMatE);
    spriteE.setAspectRatio(1);
    spriteE.setScaleWidth(0.1);
    spriteE.setPosition(-0.95, 0.95);
    spriteE.onClick = () => {console.log("Clicked Sprite E!")};
    spriteE.setClickLayer(1);
    prism.renderer.addUiObject(spriteE);
}