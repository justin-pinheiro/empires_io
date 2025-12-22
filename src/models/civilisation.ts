import { Resources } from "./resources.js";

export class Civilisation {
    private name: string;
    private resources: Resources;
    private armySize: number;
    private populationSize: number;

    constructor(name: string) {
        this.name = name;
        this.resources = new Resources(0,0,0,0,0)
        this.populationSize = 0;
        this.armySize = 0;
    }

    getName() {
        return this.name;
    }

    getPopulationSize() {
        return this.populationSize;
    }

    getArmySize() {
        return this.armySize;
    }
}