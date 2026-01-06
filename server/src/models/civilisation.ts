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
    private production: Resources;
    private resourcesCapacity: Resources;

    constructor(private readonly name: string) {
        this.resources = Resources.zero();
        this.resourcesCapacity = Resources.zero();
        this.production = Resources.zero();
        this.research = new Research();
    }

    // --- Getters ---

    public getName(): string { return this.name; }
    public getAge(): number { return this.age; }
    public getResearch(): Research { return this.research; }

    /**
     * Returns a copy of the resources to prevent external direct mutation.
     */
    public getResources(): Resources {
        const r = this.resources;
        return new Resources(r.getFood(), r.getGold(), r.getScience(), r.getSoldiers(), r.getWorkers());
    }

    /**
     * Returns a copy of the resources capacity to prevent external direct mutation.
     */
    public getResourcesCapacity(): Resources {
        const r = this.resourcesCapacity;
        return new Resources(r.getFood(), r.getGold(), r.getScience(), r.getSoldiers(), r.getWorkers());
    }

    /**
     * Returns a copy of the production to prevent external direct mutation.
     */
    public getProduction(multiplier: number): Resources {
        const r = this.production;
        return new Resources(
            r.getFood()*multiplier, 
            r.getGold()*multiplier, 
            r.getScience()*multiplier, 
            r.getSoldiers()*multiplier, 
            r.getWorkers()*multiplier
        );
    }

    public addToResources(incoming: Resources) {
        const finalAddition = new Resources(
            Math.min(incoming.getFood(), Math.max(0, this.resourcesCapacity.getFood() - this.resources.getFood())),
            Math.min(incoming.getGold(), Math.max(0, this.resourcesCapacity.getGold() - this.resources.getGold())),
            Math.min(incoming.getScience(), Math.max(0, this.resourcesCapacity.getScience() - this.resources.getScience())),
            Math.min(incoming.getSoldiers(), Math.max(0, this.resourcesCapacity.getSoldiers() - this.resources.getSoldiers())),
            Math.min(incoming.getWorkers(), Math.max(0, this.resourcesCapacity.getWorkers() - this.resources.getWorkers())),
        );

        this.resources.add(finalAddition);
    }

    public hasProgressedToNextAge() {
        const currentScience = this.getResources().getScience();
        const nextAge = getNextAge(this.age);
        if (nextAge) {
            const nextAgeData = AGES_DATA[nextAge];
            if (currentScience >= nextAgeData.requiredScience) {
                this.subtractFromResources(new Resources(0,0,nextAgeData.requiredScience,0,0));
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

    public updateResourcesCapacity(update: Resources, multiplier: number): void {
        this.resourcesCapacity.add( new Resources (
            Math.max(0, update.getFood() * multiplier),
            Math.max(0, update.getGold() * multiplier),
            Math.max(0, update.getScience() * multiplier),
            Math.max(0, update.getSoldiers() * multiplier),
            Math.max(0, update.getWorkers() * multiplier),
        ));
    }

    public resetProduction() {
        this.production = Resources.zero();
    }

    public resetCapacity() {
        this.resourcesCapacity = Resources.zero();
    }

    public updateProduction(update: Resources, multiplier: number): void {
        this.production.add( new Resources (
            update.getFood() * multiplier,
            update.getGold() * multiplier,
            update.getScience() * multiplier,
            update.getSoldiers() * multiplier,
            update.getWorkers() * multiplier,
        ));
    }

    public serialize() {
        return {
            name: this.name,
            age: this.age,
            resources: this.resources.serialize(),
            resourcesCapacity: this.resourcesCapacity.serialize(),
            production: this.production.serialize(),
        }
    };
}