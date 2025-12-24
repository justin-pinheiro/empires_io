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
    
    serialize() {
        return {
            population: this.population,
            food: this.population,
            gold: this.population,
            stone: this.population,
            science: this.science,
        }
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
    
    add(resources: Resources) {
        this.population += resources.getPopulation();
        this.food += resources.getFood();
        this.gold += resources.getGold();
        this.stone += resources.getStone();
        this.science += resources.getScience();
    }

    substract(resources: Resources) {
        this.population += resources.getPopulation();
        this.food += resources.getFood();
        this.gold += resources.getGold();
        this.stone += resources.getStone();
        this.science += resources.getScience();
    }
    
    superiorOrEqualTo(resources: Resources) : boolean {
        return (
            this.population >= resources.getPopulation() &&
            this.food >= resources.getFood() &&
            this.gold >= resources.getGold() &&
            this.stone >= resources.getStone() &&
            this.science >= resources.getScience()
        )
    }
}