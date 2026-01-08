import { getNextAge, getRequiredScience } from "./age.js";
import { Research } from "./research.js";
import { Resources } from "./resources.js";

/**
 * Manages the state, economy, and population metrics of a player's civilization.
 */
export class Civilisation {
    private age: number = 1;
    private research: Research = new Research();
    private resources: Resources = Resources.zero();
    private production: Resources = Resources.zero();
    private capacity: Resources = Resources.zero();

    constructor(private readonly name: string) {}

    public getName(): string { return this.name; }
    public getAge(): number { return this.age; }
    public getResearch(): Research { return this.research; }
    public getResources(): Resources { return this.resources.clone(); }
    public getCapacity(): Resources { return this.capacity.clone(); }
    public getProduction(multiplier: number): Resources { return this.production.clone(multiplier); }

    public addToResources(incoming: Resources): void {
        const availableSpace = this.capacity.clone()
        availableSpace.subtract(this.resources);
        const actualAddition = incoming.clamp(availableSpace);
        this.resources.add(actualAddition);
    }
    
    public subtractFromResources(resources: Resources) {
        this.resources.subtract(resources);
    }

    public tryAdvanceAge(): boolean {
        const nextAge = getNextAge(this.age);
        if (!nextAge) return false;

        const scienceCost = getRequiredScience(nextAge);
        
        if (this.resources.getScience() >= scienceCost) {
            this.resources.subtract(Resources.from({ science: scienceCost }));
            this.age++;
            this.research.addUpgradePoint();
            return true;
        }
        return false;
    }

    public updateResourcesCapacity(update: Resources, multiplier: number): void {
        this.capacity.add( new Resources (
            Math.max(0, update.getFood() * multiplier),
            Math.max(0, update.getGold() * multiplier),
            Math.max(0, update.getScience() * multiplier),
            Math.max(0, update.getSoldiers() * multiplier),
            Math.max(0, update.getWorkers() * multiplier),
        ));
    }

    public resetProductionToZero() {
        this.production = Resources.zero();
    }

    public resetCapacityToZero() {
        this.capacity = Resources.zero();
    }

    public updateProduction(update: Resources, multiplier: number): void {
        this.production.add(update, multiplier);
    }

    public serialize() {
        return {
            name: this.name,
            age: this.age,
            resources: this.resources.serialize(),
            resourcesCapacity: this.capacity.serialize(),
            production: this.production.serialize(),
        }
    };
}