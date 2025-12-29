import { BUILDING_STATS, BuildingType } from "./buildingData.js";
import { Resources } from "./resources.js";

/**
 * Represents a live building instance on the game map.
 * Dynamically linked to BUILDING_STATS for its base properties.
 */
export class Building {
  private currentHealth: number;

  constructor(
    public readonly type: BuildingType,
    private readonly ownerId: string
  ) {
    this.currentHealth = this.stats.baseHealth;
  }

  /**
   * Getter for static stats. 
   * Provides easy access to the 'blueprint' data for this instance.
   */
  public get stats() {
    return BUILDING_STATS[this.type];
  }

  // --- Health Management ---

  public getHealth() {
    return { current: this.currentHealth, max: this.stats.baseHealth };
  }

  public isDestroyed(): boolean {
    return this.currentHealth <= 0;
  }

  public takeDamage(amount: number): void {
    this.currentHealth = Math.max(0, this.currentHealth - amount);
  }

  public repair(amount: number): void {
    if (this.isDestroyed()) return; // Cannot repair a pile of rubble
    this.currentHealth = Math.min(this.currentHealth + amount, this.stats.baseHealth);
  }

  // --- Logic & Production ---

  public getOwnerId(): string {
    return this.ownerId;
  }

  /**
   * Calculates resources produced over one turn.
   * Subtract buildings maintenance cost.
   * Note: This returns a new Resources object representing the "income".
   */
  public calculateProduction(production_multiplier: number): Resources {
    const rate = this.stats.productionRate;
    const multiplier = rate * production_multiplier;

    return new Resources(
      (this.stats.production.getFood() * multiplier) - this.stats.resourcesToMaintain.getFood(),
      (this.stats.production.getGold() * multiplier) - this.stats.resourcesToMaintain.getGold(),
      (this.stats.production.getMaterials() * multiplier) - this.stats.resourcesToMaintain.getMaterials(),
      (this.stats.production.getScience() * multiplier) - this.stats.resourcesToMaintain.getScience(),
      (this.stats.production.getSoldiers() * multiplier) - this.stats.resourcesToMaintain.getSoldiers(),
      (this.stats.production.getWorkers() * multiplier) - this.stats.resourcesToMaintain.getWorkers(),
    );
  }

  // --- Serialization ---

  public serialize() {
    return {
      ownerId: this.ownerId,
      type: this.type,
      name: this.stats.name,
      description: this.stats.description,
      health: this.getHealth(),
      resourcesToMaintain: this.stats.resourcesToMaintain,
      production: this.stats.production.serialize(),
      productionRate: this.stats.productionRate,
      isDestroyed: this.isDestroyed()
    };
  }

  public toJSON() {
    return this.serialize();
  }
}