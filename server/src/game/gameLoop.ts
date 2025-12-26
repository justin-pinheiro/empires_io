import { ONE_SECOND_IN_MILLISECONDS } from "../utils/constants.js";

/**
 * A high-precision game loop for Node.js.
 * Uses a recursive timeout to prevent execution drift.
 */
export class GameLoop {
  private lastTime: number = 0;
  private running: boolean = false;
  private timer: NodeJS.Timeout | null = null;
  private readonly tickRateMs: number;

  constructor(
    private updateCallback: (dt: number) => void,
    tickRateSeconds: number 
  ) {
    this.tickRateMs = tickRateSeconds * ONE_SECOND_IN_MILLISECONDS;
  }

  public start(): void {
    if (this.running) return;
    
    this.running = true;
    this.lastTime = Date.now();
    this.tick();
  }

  /**
   * Recursive tick logic. 
   * Calculates the time taken by updateCallback and subtracts it from the next delay.
   */
  private tick(): void {
    if (!this.running) return;

    const now = Date.now();
    const deltaTimeSeconds = (now - this.lastTime) / ONE_SECOND_IN_MILLISECONDS;
    this.lastTime = now;

    // Execute game logic
    this.updateCallback(deltaTimeSeconds);

    // Calculate how long the next delay should be to maintain the target rate
    const executionTime = Date.now() - now;
    const nextDelay = Math.max(0, this.tickRateMs - executionTime);

    this.timer = setTimeout(() => this.tick(), nextDelay);
  }

  public stop(): void {
    this.running = false;
    if (this.timer) {
      clearTimeout(this.timer);
      this.timer = null;
    }
  }
}