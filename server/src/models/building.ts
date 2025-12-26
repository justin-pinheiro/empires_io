import { BUILDING_STATS } from "./buildingData.js";
import { ProductionType } from "./productionTypeEnum.js";
import { Resources } from "./resources.js";

export class Building {
  private currentHealth: number;
  private ownerId: string;
  
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
  
  isDestroyed() {
    return this.currentHealth <= 0;
  }

  takeDamage(amount: number) {
    this.currentHealth = Math.max(0, this.currentHealth - amount);
  }
  
  repair(amount: number) {
    this.currentHealth = Math.min(this.currentHealth + amount, this.stats.baseHealth);
  }

  getResourcesCost() {
    return this.stats.resourcesCost;
  }
  
  getPopulationCost() {
    return this.stats.populationCost;
  }
  
  getArmyCapacityUpgrade() {
    return this.stats.armyCapacityUpgrade;
  }
  
  getPopulationCapacityUpgrade() {
    return this.stats.populationCapacityUpgrade;
  }
  
  getOwnerId(): string {
    return this.ownerId;
  }
  
  getProduction(dt: number): Resources {
    if (!this.stats.productionRate) {
      return this.stats.production;
    }
    else {
      return new Resources(
        this.stats.production.getFood() * this.stats.productionRate * dt,
        this.stats.production.getGold() * this.stats.productionRate * dt,
        this.stats.production.getStone() * this.stats.productionRate * dt,
        this.stats.production.getScience() * this.stats.productionRate * dt,
        this.stats.production.getArmy() * this.stats.productionRate * dt,
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