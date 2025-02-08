import type { PrismSettings } from '../engine';

/** collects RuntimeStats for the Prism game loop can be extended in the future
    requries setting `gatherStats` in the PrismSettings should probably be disabled in prod
    @field ticksToAverage: configurable, set to the number of ticks to use in its average tick time
*/
export class RuntimeStats {
  private lastLogicTick: number = 0;
  private avgLogicTick: number = 0;
  private logicTickCount: number = 0;
  private lastRenderTick: number = 0;
  private avgRenderTick: number = 0;
  private renderTickCount: number = 0;
  private startTime: number = Date.now();
  ticksToAverage: number = 1000;

  /**
   * pretty prints the runtime stats
   */
  printStats() {
    /* weird indentaion because format strings include whitespace */
    console.log(
      `Runtime Stats\n\
\tLast Logic Tick: ${this.lastLogicTick}ms\n\
\tAverage Of Last ${this.ticksToAverage} Logic Ticks: ${Math.round(this.avgLogicTick * 10) / 10}ms\n\
\tTotal Logic Ticks: ${this.logicTickCount}\n\
\tLast Render Tick: ${this.lastRenderTick}ms\n\
\tAverage Of Last ${this.ticksToAverage} Render Ticks: ${Math.round(this.avgRenderTick * 10) / 10}ms\n\
\tTotal Render Ticks: ${this.renderTickCount}\n\
\tUptime: ${this.humanReadableInterval(Date.now() - this.startTime)}\n\
`
    );
  }

  /**
   * update the stats for logic ticks based on the time the last logic tick took.
   * Uses an aproximation for averages to have an constant time average function
   * @param lastLogicTick time the last logic tick took
   */
  updateLogic(lastLogicTick: number) {
    this.lastLogicTick = lastLogicTick;
    let tempAvg = 0;
    if (this.logicTickCount < this.ticksToAverage) {
      tempAvg = this.avgLogicTick * this.logicTickCount;
      tempAvg += lastLogicTick;
      tempAvg /= this.logicTickCount + 1;
    } else {
      tempAvg = this.avgLogicTick;
      tempAvg += (lastLogicTick - this.avgLogicTick) / this.ticksToAverage;
    }
    this.avgLogicTick = tempAvg;
    this.logicTickCount++;
  }

  /**
   * update the stats for render ticks based on the time the last render tick took.
   * Uses an aproximation for averages to have an constant time average function
   * @param lastRenderTick time the last render tick took
   */
  updateRender(lastRenderTick: number) {
    this.lastRenderTick = lastRenderTick;
    let tempAvg = 0;
    if (this.renderTickCount < this.ticksToAverage) {
      tempAvg = this.avgRenderTick * this.renderTickCount;
      tempAvg += lastRenderTick;
      tempAvg /= this.renderTickCount + 1;
    } else {
      tempAvg = this.avgRenderTick;
      tempAvg += (lastRenderTick - this.avgRenderTick) / this.ticksToAverage;
    }
    this.avgRenderTick = tempAvg;
    this.renderTickCount++;
  }

  /**
   * converts an interval in ms to a more human readable h:m:s format
   * @param interval interval to convert
   * @returns string with converted interval formated
   */
  humanReadableInterval(interval: number) {
    const seconds = Math.floor(interval / 1000);
    const minutes = Math.floor(seconds / 60);
    const hours = Math.floor(minutes / 60);

    const leftoverSeconds = seconds % 60;
    const leftoverMinutes = minutes % 60;
    return `${hours}h:${leftoverMinutes}m:${leftoverSeconds}s`;
  }

  /**
   * inits the cli interupts for runtime printing of stats
   * @param settings the PrismSettings to check if this should be enabled or not
   */
  runtimeStatsCliInit(settings: PrismSettings) {
    if (!settings.cliMode) return;
    process.stdin.setEncoding('utf8');
    process.stdin.on('data', (chunk: string) => {
      switch (chunk) {
        case '\x10':
          if (settings.gatherStats) {
            this.printStats();
          } else {
            console.log('Runtime stats collection is disabled.\n');
          }
          return;
        case '\x03':
          console.log('Exiting');
          process.exit(0);
      }
    });
    process.stdin.setRawMode(true);
  }
}
