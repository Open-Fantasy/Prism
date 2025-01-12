import PrismStateManager from "./core/StateManager.ts";
import PrismEventManager from "./core/EventManager.ts";
import PrismNetwork from "./core/Network.ts";
import PrismAPI from "./PrismAPI.ts";

import {TICK_RATE} from "./Constants.ts";

class Prism {
    private readonly _EventManager;
    private readonly _Network;
    private readonly _StateManager;
    private _TickClock : Timer | undefined;

    constructor() {
        this._EventManager = PrismEventManager;
        this._Network = PrismNetwork;
        this._StateManager = PrismStateManager;
    }

    start() : boolean {
        // TODO: This is a stub function
        console.log("Prism Started.")
        this._TickClock = setInterval(this.tick, TICK_RATE);
        return true;
    }

    tick() : void {
        // TODO: This is a stub function
        console.log("Prism Tick.")
        return;
    }

    stop() : boolean {
        // TODO: This is a stub function
        console.log("Prism Stopped.")
        clearInterval(this._TickClock);
        return true;
    }
}

export { Prism, PrismAPI };