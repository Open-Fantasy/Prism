import * as PRISM from "../../src/prism";
import * as THREE from "three";
import { setup3d } from "./setup3d";
import { setupUI } from "./setupUI";

let prismSettings = new PRISM.PrismSettings;
prismSettings.gatherStats = true;
prismSettings.windowDim = {width: window.innerWidth - 50, height: window.innerHeight - 100};
export const prism = new PRISM.Prism(prismSettings);

(globalThis as any).prism = prism;

prism.start();

setup3d();
setupUI();