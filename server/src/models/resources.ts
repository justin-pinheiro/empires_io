/**
 * Handles economy logic and resource arithmetic.
 */
export class Resources {
  constructor(
    private food: number = 0,
    private gold: number = 0,
    private stone: number = 0,
    private science: number = 0,
    private soldiers: number = 0,
    private workers: number = 0
  ) {}
    
 /**
   * Static factory to create a "zeroed" resource object.
   */
  static zero(): Resources {
    return new Resources(0, 0, 0, 0, 0);
  }

  // --- Getters ---

  public getFood() { return this.food; }
  public getGold() { return this.gold; }
  public getStone() { return this.stone; }
  public getScience() { return this.science; }
  public getArmy() { return this.army; }

// --- Arithmetic ---

  /**
   * Adds another resource set to this one (in-place).
   */
  public add(other: Resources): void {
    this.food += other.food;
    this.gold += other.gold;
    this.stone += other.stone;
    this.science += other.science;
    this.army += other.army;
  }

  /**
   * Subtracts another resource set (in-place).
   * Note: This allows negative values unless you add Math.max(0, ...) logic.
   */
  public subtract(other: Resources): void {
    this.food -= other.food;
    this.gold -= other.gold;
    this.stone -= other.stone;
    this.science -= other.science;
    this.army -= other.army;
  }

  /**
   * Checks if the current resources meet or exceed the required cost.
   */
  public hasEnough(cost: Resources): boolean {
    return (
      this.food >= cost.food &&
      this.gold >= cost.gold &&
      this.stone >= cost.stone &&
      this.science >= cost.science &&
      this.army >= cost.army
    );
  }

  /**
   * Returns a clean, floored object for UI or persistence.
   */
  public serialize() {
    return {
      food: Math.floor(this.food),
      gold: Math.floor(this.gold),
      stone: Math.floor(this.stone),
      science: Math.floor(this.science),
      army: Math.floor(this.army),
    };
  }

  public toJSON() {
    return this.serialize();
  }
}