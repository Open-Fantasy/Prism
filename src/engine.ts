import { EventHub } from './core/events/eventHub';
import { Network } from './core/network';
import {Renderer} from "./renderer/renderer";
import { RuntimeStats } from "./utils/runtimeStats"
import { PrismTick } from "./core/events/prismTicks";

/* tick rate in ticks per second */
const LOGIC_FREQ = 30;
const RENDER_FREQ = 60;
/* tps converted to number of milliseconds */
const LOGIC_TICK_TIME = Math.floor((1 / LOGIC_FREQ) * 1000);
const RENDER_TICK_TIME = Math.floor((1 / RENDER_FREQ) * 1000);
/* gets the faster of the two tick rates, this is used in the main loop */
const FASTER_TICK_TIME = LOGIC_TICK_TIME > RENDER_TICK_TIME ? RENDER_TICK_TIME : LOGIC_TICK_TIME;

const TICK_GRACE_THRESHOLD = 1.25;  // the amount of grace a tick should get for triggering i.e trigger the tick within 5% of the target rate
const TICK_WARNING_THRESHOLD = 5; // the amount a tick is allowed go over its target rate before printing a warning

/**
 * settings for the prism engine on init
 * @field enableNetwork - if false then network will not be started, true to start network
 * @field networkServer - server for network to connect to
 * @field gatherStats - collect runtime stats such as average tick rate
 * @field cliMode - deprecated 
 * @field windowDim - size of the canvas for render, really probably doesn't go here
 */
export class PrismSettings {
    enableNetwork: boolean = false;
    networkServer: string = "";
    gatherStats: boolean = false;
    cliMode: boolean = false;
    windowDim: {width: number, height: number} = {width: 0, height: 0};
}

/**
 * holds the info for a tick
 */
class TickInfo {
    timeTillTick: number = 0;
    timeSinceTick: number = 0;
    tickTime: number = 0;
    tickGrace: number = 0;
    tickCallback: (prism: Prism, delta: number) => void;

    /**
     * @param tickTime target tick rate in ms
     * @param tickCallback callback when tick is triggered
     */
    constructor(tickTime: number, tickCallback: (prism: Prism, delta: number) => void) {
        this.tickTime = tickTime;
        this.tickGrace = Math.ceil(tickTime * TICK_GRACE_THRESHOLD) - tickTime; // this rounded up to compensate for the fact that often, the grace will be less than 1
        this.tickCallback = tickCallback;
    }
}


/**
 * Main object for the engine. This is what you create in the client
 * initializes everything according to its settings and starts the gameLoop
 */
export class Prism {
    settings: PrismSettings;
    enabled: boolean = false;
    runtimeStats: RuntimeStats = new RuntimeStats();
    readonly network: Network = new Network();
    readonly prismEvents: EventHub = new EventHub();
    readonly renderer: Renderer = new Renderer();

    constructor(settings: PrismSettings) {
        this.settings = settings;
        this.runtimeStats.runtimeStatsCliInit(this.settings);
    }

    /**
     * Call this to start the engine. Done here in case one wants to delay engine startup
     */
    start() {
        this.enabled = true;
        if (this.settings.enableNetwork) {
            this.network.start(this.settings.networkServer);
        }
        this.renderer.init(this.settings.windowDim, 45);
        let logicTickInfo = new TickInfo(LOGIC_TICK_TIME, this.logicTick);
        let renderTickInfo = new TickInfo(RENDER_TICK_TIME, this.renderTick);
        this.gameLoop(logicTickInfo, renderTickInfo);
    }

    stop() {
        this.enabled = false;
    }

    /**
     * Starts the game loop.
     * 
     * Functionality:
     * - Base tick rate is whatever the shorter of logicTick or renderTick is
     * - Gets the current time in ms
     * - Then checks if its time to trigger ticks (see checkForTick for more details)
     * - Checks if there is time left before triggering the next update (this should be true) and sleeps that amount of time
     * - Loop
     */
    private async gameLoop(logicTickInfo: TickInfo, renderTickInfo: TickInfo) {
        let delta = 0;
        while (this.enabled) {
            let curTime: number = Date.now();
            this.checkForTick(delta, logicTickInfo, this);
            this.checkForTick(delta, renderTickInfo, this);

            let loopDiff = Date.now() - curTime;
            let sleepTime = FASTER_TICK_TIME - loopDiff;
            if (sleepTime <= 0) {
                delta = loopDiff;
                continue;
            }
            let sleep = this.sleep(sleepTime);
            await sleep;
            delta = Date.now() - curTime;
        }
    }

    private sleep(ms: number): Promise<void> {
        return new Promise((resolve) => {
            setTimeout(resolve, ms);
        });
    }

    /**
     * Checks for and triggers a tick if its ready. If not update its counter and return
     * @param lastTickTime time the last game loop took
     * @param tickInfo the tickInfo object for the current tick
     */
    private checkForTick(lastTickTime: number, tickInfo: TickInfo, prism: Prism) {
        tickInfo.timeTillTick -= lastTickTime;
        tickInfo.timeSinceTick += lastTickTime;
        if (tickInfo.timeTillTick <= tickInfo.tickGrace) {
            tickInfo.timeTillTick = tickInfo.tickTime;
            tickInfo.tickCallback(prism, tickInfo.timeSinceTick);
            tickInfo.timeSinceTick = 0;
        }
    }

    /**
     * Logic Ticks are where gamestate updates and network should go. Generally this ticks slower than rendering and has more critical timing.
     * @param prism The engine because the callback gets rid of context TODO? Should this be fixed somehow?
     * @param delta Time the last tick took
     */
    private logicTick(prism: Prism, delta: number) {
        if (delta > LOGIC_TICK_TIME * TICK_WARNING_THRESHOLD)
            console.log(`Logic Loop running slow\t\tShould be: ${LOGIC_TICK_TIME}\tLast tick took: ${delta}`);
        if (prism.settings.gatherStats)
            prism.runtimeStats.updateLogic(delta);
        if (prism.settings.enableNetwork)
            prism.network.update(delta);
        prism.prismEvents.advertise<PrismTick>("logicTick").publish(new PrismTick(delta));
    }

    /**
     * Render Ticks are mostly for the rendering engine, and anything else that is less critical on timing
     * @param prism The engine because the callback gets rid of context TODO? Should this be fixed somehow?
     * @param delta Time the last tick took
     */
    private renderTick(prism: Prism, delta: number) {
        if (delta > RENDER_TICK_TIME * TICK_WARNING_THRESHOLD)
            console.log(`Render loop running slow\tShould be: ${RENDER_TICK_TIME}\tLast tick took: ${delta}`);
        if (prism.settings.gatherStats)
            prism.runtimeStats.updateRender(delta);
        prism.renderer.renderFrame();
        prism.prismEvents.advertise<PrismTick>("renderTick").publish(new PrismTick(delta));
    }
}