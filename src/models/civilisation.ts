import { Resources } from "./resources.js";

export class Civilisation {
    private name: string;
    private resources: Resources;
    private populationCapacity: number;
    private armyCapacity: number;
    private workingPopulation: number;

    constructor(name: string) {
        this.name = name;
        this.resources = new Resources(0, 0, 0, 0, 0);
        this.populationCapacity = 0;
        this.workingPopulation = 0;
        this.armyCapacity = 0;
    }

    getPopulationCapacity() {
        return this.populationCapacity;
    }

    getArmyCapacity() {
        this.armyCapacity;
    }

    getName() {
        return this.name;
    }

    getResources() {
        return this.resources;
    }

    updateArmyCapacity(amount: number) {
        this.armyCapacity += amount;
    }

    updateWorkingPopulation(amount: number) {
        this.workingPopulation += amount;
    }

    updatePopulationCapacity(amount: number) {
        this.populationCapacity += amount;
    }
}