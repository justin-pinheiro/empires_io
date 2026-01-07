import { BUILDING_STATS, BuildingType, hasNextLevel, type BuildingBlueprint, type BuildingDynamicStats } from "./buildingData.js";
import { Resources } from "./resources.js";

/**
 * Represents a live building instance on the game map.
 * Dynamically linked to BUILDING_STATS for its base properties.
 */
export class Building {
  private currentHealth: number;
  private maxHealth: number;
  private level: number;

  constructor(
    public readonly type: BuildingType,
    private readonly ownerId: string
  ) {
    this.level = 1;
    this.currentHealth = this.stats.baseHealth;
    this.maxHealth = this.stats.baseHealth;
  }

  /**
   * Getter for static stats. 
   * Provides easy access to the 'blueprint' data for this instance.
   */
  public get stats(): BuildingBlueprint & BuildingDynamicStats {
    const stats = BUILDING_STATS[this.type]?.[this.level];
    
    if (!stats) {
        throw new Error(
            `Configuration Missing: No stats found for ${this.type} at level ${this.level}`
        );
    }
    return stats;
}

  public getCapacity() : Resources {
    return this.stats.resourcesCapacityUpgrade;
  }

  public getHealth() {
    return { current: this.currentHealth, max: this.maxHealth };
  }

  public addToMaxHealth(amount: number) {
    this.maxHealth += amount;
  }

  public subtractToMaxHealth(amount: number) {
    this.maxHealth -= amount;
  }

  public isDestroyed(): boolean {
    return this.currentHealth <= 0;
  }

  public takeDamage(amount: number): void {
    this.currentHealth = Math.max(0, this.currentHealth - amount);
  }

  public repair(amount: number): void {
    if (this.isDestroyed()) return;
    this.currentHealth = Math.min(this.currentHealth + amount, this.maxHealth);
  }

  public getOwnerId(): string {
    return this.ownerId;
  }

  public getLevel(): number {
    return this.level;
  }

  public upgrade(): void {
    if (hasNextLevel(this.type, this.level)) {
      this.level += 1;
    }
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
      this.stats.production.getFood() * multiplier,
      this.stats.production.getGold() * multiplier,
      this.stats.production.getScience() * multiplier,
      this.stats.production.getSoldiers() * multiplier,
      this.stats.production.getWorkers() * multiplier,
    );
  }

  // --- Serialization ---

  public serialize() {
    return {
      ownerId: this.ownerId,
      type: this.type,
      level: this.level,
      name: this.stats.name,
      description: this.stats.description,
      health: this.getHealth(),
      production: this.stats.production.serialize(),
      productionRate: this.stats.productionRate,
      isDestroyed: this.isDestroyed(),
      imagePath: this.stats.imagePath,
    };
  }
}