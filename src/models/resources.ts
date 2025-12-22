export class Resources {
    private population: number;
    private food: number;
    private gold: number;
    private stone: number;
    private science: number;

    constructor (population: number, food: number, gold: number, stone: number, science: number) {
        this.population = population;
        this.food = food;
        this.gold = gold;
        this.stone = stone;
        this.science = science;
    }

    getPopulation() {
        return this.population;
    }
    getFood() {
        return this.food;
    }
    getGold() {
        return this.gold;
    }
    getStone() {
        return this.stone;
    }
    getScience() {
        return this.science;
    }
}