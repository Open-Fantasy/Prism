import { bundlerModuleNameResolver } from "typescript";
import { EventHub } from "./events/event_hub";
import { Network } from "./network";
import { RuntimeStats } from "./runtimeStats"
import { sleep } from "bun";

/* tick rate in ticks per second */
const LOGIC_FREQ = 30;
const RENDER_FREQ = 60;
/* tps converted to number of milliseconds */
const LOGIC_TICK_TIME = Math.floor((1 / LOGIC_FREQ) * 1000);
const RENDER_TICK_TIME = Math.floor((1 / RENDER_FREQ) * 1000);
/* gets the faster of the two tick rates, this is used in the main loop */
const FASTER_TICK_TIME = LOGIC_TICK_TIME > RENDER_TICK_TIME ? RENDER_TICK_TIME : LOGIC_TICK_TIME;

const TICK_GRACE_THRESHOLD = 1.05;  // the amount of grace a tick should get for triggering i.e trigger the tick within 5% of the target rate
const TICK_WARNING_THRESHOLD = 1.25; // the amount a tick is allowed go over its target rate before printing a warning

/**
 * settings for the prism engine on init
 * @field enableNetwork - if false then network will not be started, true to start network
 * @field networkServer - server for network to connect to
 */
export class PrismSettings {
    enableNetwork: boolean = false;
    networkServer: string = "";
    gatherStats: boolean = false;
    cliMode: boolean = false;
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
class Prism {
    settings: PrismSettings;
    enabled: boolean = false;
    runtimeStats: RuntimeStats = new RuntimeStats();
    readonly network: Network = new Network();
    readonly prismEvents: EventHub = new EventHub();

    constructor(settings: PrismSettings) {
        this.settings = settings;
        this.runtimeStats.runtimeStatsCliInit(this.settings);
    }

    /**
     * Call this to start the engine. Done here in case one wants to delay engine startup
     */
    start() {
        this.enabled = true;
        if(this.settings.enableNetwork) {
            this.network.start(this.settings.networkServer);
        }
        this.gameLoop();
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
    async gameLoop() {
        let logicTickInfo = new TickInfo(LOGIC_TICK_TIME, this.logicTick);
        let renderTickInfo = new TickInfo(RENDER_TICK_TIME, this.renderTick);
        let lastTickTime = 0;
        while (this.enabled) {
            let curTime: number = Date.now();
            await sleep(10); // TEST LOAD REMOVE IN PROD
            this.checkForTick(lastTickTime, logicTickInfo, this);
            this.checkForTick(lastTickTime, renderTickInfo, this);


            let loopDiff = Date.now() - curTime;
            let sleepTime = FASTER_TICK_TIME - loopDiff;
            if (sleepTime > 0)
                await sleep(sleepTime);
            let afterSleepDiff = Date.now() - curTime;
            lastTickTime = afterSleepDiff;
        }
    }

    /**
     * Checks for and triggers a tick if its ready. If not update its counter and return
     * @param lastTickTime time the last game loop took
     * @param tickInfo the tickInfo object for the current tick
     */
    checkForTick(lastTickTime: number, tickInfo: TickInfo, prism: Prism) {
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
    logicTick(prism: Prism, delta: number) {
        if (delta > LOGIC_TICK_TIME * TICK_WARNING_THRESHOLD)
            console.log(`Logic Loop running slow\t\tShould be: ${LOGIC_TICK_TIME}\tLast tick took: ${delta}`);
        if (prism.settings.gatherStats)
            prism.runtimeStats.updateLogic(delta);
        if (prism.settings.enableNetwork)
            prism.network.update(delta);
        prism.prismEvents.advertise("logicTick").publish(delta);
    }

    /**
     * Render Ticks are mostly for the rendering engine, and anything else that is less critical on timing
     * @param prism The engine because the callback gets rid of context TODO? Should this be fixed somehow?
     * @param delta Time the last tick took
     */
    renderTick(prism: Prism, delta: number) {
        if (delta > RENDER_TICK_TIME * TICK_WARNING_THRESHOLD)
            console.log(`Render loop running slow\tShould be: ${RENDER_TICK_TIME}\tLast tick took: ${delta}`);
        if (prism.settings.gatherStats)
            prism.runtimeStats.updateRender(delta);
        prism.prismEvents.advertise("renderTick").publish(delta);
    }
}

/* random test setup */
let settings = new PrismSettings();
settings.enableNetwork = false;
settings.gatherStats = true;
settings.cliMode = Bun.argv.some(arg => arg.includes("cliMode"));
let prism = new Prism(settings);
//prism.prismEvents.subscribe("logicTick", (delta: number) => {console.log(`logicTick: ${delta}`)});
//prism.prismEvents.subscribe("renderTick", (delta: number) => {console.log(`renderTick: ${delta}`)});
prism.start();