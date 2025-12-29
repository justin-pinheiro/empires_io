import { AGES_DATA, AgeType, getNextAge } from "./age.js";
import { Research } from "./research.js";
import { Resources } from "./resources.js";

/**
 * Manages the state, economy, and population metrics of a player's civilization.
 */
export class Civilisation {
    private age: number = 1;
    private research: Research;
    private resources: Resources;
    private resourcesCapacity: Resources;
    private populationCapacity: number = 0;
    private workingPopulation: number = 0;

    constructor(private readonly name: string) {
        this.resources = Resources.zero();
        this.resourcesCapacity = Resources.zero();
        this.research = new Research();
    }

    // --- Getters ---

    public getName(): string { return this.name; }
    public getAge(): number { return this.age; }
    public getResearch(): Research { return this.research; }
    public getPopulationCapacity(): number { return this.populationCapacity; }
    public getWorkingPopulation(): number { return this.workingPopulation; }

    /**
     * Returns a copy of the resources to prevent external direct mutation.
     */
    public getResources(): Resources {
        const r = this.resources;
        return new Resources(r.getFood(), r.getGold(), r.getStone(), r.getScience(), r.getArmy());
    }

    /**
     * Returns a copy of the resources capacity to prevent external direct mutation.
     */
    public getResourcesCapacity(): Resources {
        const r = this.resourcesCapacity;
        return new Resources(r.getFood(), r.getGold(), r.getStone(), r.getScience(), r.getArmy());
    }

    public addToResources(incoming: Resources) {
        const finalAddition = new Resources(
            Math.min(incoming.getFood(), Math.max(0, this.resourcesCapacity.getFood() - this.resources.getFood())),
            Math.min(incoming.getGold(), Math.max(0, this.resourcesCapacity.getGold() - this.resources.getGold())),
            Math.min(incoming.getStone(), Math.max(0, this.resourcesCapacity.getStone() - this.resources.getStone())),
            Math.min(incoming.getScience(), Math.max(0, this.resourcesCapacity.getScience() - this.resources.getScience())),
            Math.min(incoming.getArmy(), Math.max(0, this.resourcesCapacity.getArmy() - this.resources.getArmy())),
        );

        this.resources.add(finalAddition);
    }

    public hasProgressedToNextAge() {
        const currentScience = this.getResources().getScience();
        const nextAge = getNextAge(this.age);
        if (nextAge) {
            const nextAgeData = AGES_DATA[nextAge];
            if (currentScience >= nextAgeData.requiredScience) {
                this.subtractFromResources(new Resources(0,0,0,nextAgeData.requiredScience,0));
                this.age++;
                this.research.addUpgradePoint();
                return true;
            }
        }
        return false
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

    public updateResourcesCapacity(update: Resources): void {
        this.resourcesCapacity.add( new Resources (
            Math.max(0, update.getFood()),
            Math.max(0, update.getGold()),
            Math.max(0, update.getStone()),
            Math.max(0, update.getScience()),
            Math.max(0, update.getArmy()),
        ));
    }

    public serialize() {
        return {
            name: this.name,
            age: this.age,
            resources: this.resources.serialize(),
            resourcesCapacity: this.resourcesCapacity.serialize(),
            populationCapacity: this.populationCapacity,
            workingPopulation: this.workingPopulation,
        }
    };
}