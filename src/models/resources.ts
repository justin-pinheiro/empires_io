export class Resources {
    private food: number;
    private gold: number;
    private stone: number;
    private science: number;
    private army: number;

    constructor ( food: number, gold: number, stone: number, science: number, army: number) {
        this.food = food;
        this.gold = gold;
        this.stone = stone;
        this.science = science;
        this.army = army;
    }
    
    serialize() {
        return {
            food: Math.floor(this.food),
            gold: Math.floor(this.gold),
            stone: Math.floor(this.stone),
            science: Math.floor(this.science),
            army: Math.floor(this.army),
        }
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
    getArmy() {
        return this.army;
    }
    
    add(resources: Resources) {
        this.food += resources.getFood();
        this.gold += resources.getGold();
        this.stone += resources.getStone();
        this.science += resources.getScience();
        this.army += resources.getArmy();
    }

    substract(resources: Resources) {
        this.food -= resources.getFood();
        this.gold -= resources.getGold();
        this.stone -= resources.getStone();
        this.science -= resources.getScience();
        this.army -= resources.getArmy();
    }
    
    superiorOrEqualTo(resources: Resources) : boolean {
        return (
            this.food >= resources.getFood() &&
            this.gold >= resources.getGold() &&
            this.stone >= resources.getStone() &&
            this.science >= resources.getScience() &&
            this.army >= resources.getArmy()
        )
    }
}