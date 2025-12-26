import { BUILDING_STATS } from "./buildingData.js";
import { ProductionType } from "./productionTypeEnum.js";
import { Resources } from "./resources.js";

export class Building {
  public currentHealth: number;
  public ownerId: string;
  
  constructor(
    public readonly typeKey: keyof typeof BUILDING_STATS,
    ownerId: string
  ) {
    this.currentHealth = this.stats.baseHealth;
    this.ownerId = ownerId;
  }
  
  get stats() {
    const stats =  BUILDING_STATS[this.typeKey];
    if (!stats) {
      throw new Error(`Building stats for key "${this.typeKey}" not found.`);
    }
    return stats;
  }
  
  takeDamage(amount: number) {
    this.currentHealth = Math.max(0, this.currentHealth - amount);
  }
  
  getCost() {
    return this.stats.cost;
  }
  
  getOwnerId(): string {
    return this.ownerId;
  }
  
  hasSteadyProduction(): boolean {
    return this.stats.productionType === ProductionType.STEADY;
  }
  
  getProduction(dt: number): Resources {
    if (!this.stats.productionRate) {
      return this.stats.production;
    }
    else {
      return new Resources(
        this.stats.production.getPopulation() * this.stats.productionRate * dt,
        this.stats.production.getFood() * this.stats.productionRate * dt,
        this.stats.production.getGold() * this.stats.productionRate * dt,
        this.stats.production.getStone() * this.stats.productionRate * dt,
        this.stats.production.getScience() * this.stats.productionRate * dt,
      )
    }
  }
  
  serialize() {
    return {
      name: this.stats.name,
      type: this.typeKey,
      health: {
        current: this.currentHealth,
        max: this.stats.baseHealth,
      },
      owner: this.ownerId,
    };
  }
}