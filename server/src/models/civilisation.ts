import { Resources } from "./resources.js";

/**
 * Manages the state, economy, and population metrics of a player's civilization.
 */
export class Civilisation {
    private resources: Resources;
    private populationCapacity: number = 0;
    private armyCapacity: number = 0;
    private workingPopulation: number = 0;

    constructor(private readonly name: string) {
        this.resources = Resources.zero();
    }

    // --- Getters ---

    public getName(): string { return this.name; }
    public getPopulationCapacity(): number { return this.populationCapacity; }
    public getWorkingPopulation(): number { return this.workingPopulation; }
    public getArmyCapacity(): number { return this.armyCapacity; }

    /**
     * Returns a copy of the resources to prevent external direct mutation.
     */
    public getResources(): Resources {
        const r = this.resources;
        return new Resources(r.getFood(), r.getGold(), r.getStone(), r.getScience(), r.getArmy());
    }

    public addToResources(resources: Resources) {
        this.resources.add(resources);
    }

    public subtractFromResources(resources: Resources) {
        this.resources.subtract(resources);
    }

    // --- Population Logic ---

    /**
     * Adjusts the working population. 
     * Includes a check to ensure it doesn't drop below zero or exceed capacity.
     */
    public updateWorkingPopulation(amount: number): void {
        const nextPop = this.workingPopulation + amount;
        this.workingPopulation = Math.max(0, Math.min(nextPop, this.populationCapacity));
    }

    public updatePopulationCapacity(amount: number): void {
        this.populationCapacity = Math.max(0, this.populationCapacity + amount);
    }

    public updateArmyCapacity(amount: number): void {
        this.armyCapacity = Math.max(0, this.armyCapacity + amount);
    }

    public serialize() {
        return {
            name: this.name,
            resources: this.resources.serialize(),
            populationCapacity: this.populationCapacity,
            workingPopulation: this.workingPopulation,
            armyCapacity: this.armyCapacity
        }
    };
}