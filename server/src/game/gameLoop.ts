import { privateDecrypt } from "node:crypto";
import { ONE_SECOND_IN_MILLISECONDS } from "../utils/constants.js";

export class GameLoop {
    private lastTime: number;
    private running: boolean;
    private tickRateMs: number;

    constructor(
        private updateCallback: (dt: number) => void,
        private tickRateSeconds: number 
    ) {
        this.lastTime = Date.now();
        this.running = false;
        this.tickRateMs = tickRateSeconds * ONE_SECOND_IN_MILLISECONDS;
    }

    public start(): void {
        this.running = true;
        this.run();
    }

    private run(): void {
        if (!this.running) return;

        const now = Date.now();
        const deltaTime = (now - this.lastTime) / ONE_SECOND_IN_MILLISECONDS;
        this.lastTime = now;

        this.updateCallback(deltaTime);

        setTimeout(() => this.run(), this.tickRateMs);
    }

    public stop(): void {
        this.running = false;
    }
}