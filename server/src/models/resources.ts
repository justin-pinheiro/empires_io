/**
 * Handles economy logic and resource arithmetic.
 */
export class Resources {
  constructor(
    private food: number = 0,
    private gold: number = 0,
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
  public getScience() { return this.science; }
  public getSoldiers() { return this.soldiers; }
  public getWorkers() { return this.workers; }

// --- Arithmetic ---

  /**
   * Adds another resource set to this one (in-place).
   */
  public add(incoming: Resources): void {
    this.food += incoming.food;
    this.gold += incoming.gold;
    this.science += incoming.science;
    this.soldiers += incoming.soldiers;
    this.workers += incoming.workers;
  }

  /**
   * Subtracts another resource set (in-place).
   * Note: This allows negative values unless you add Math.max(0, ...) logic.
   */
  public subtract(incoming: Resources): void {
    this.food -= incoming.food;
    this.gold -= incoming.gold;
    this.science -= incoming.science;
    this.soldiers -= incoming.soldiers;
    this.workers -= incoming.workers;
  }

  /**
   * Checks if the current resources meet or exceed the required cost.
   */
  public hasEnough(cost: Resources): boolean {
    return (
      this.food >= cost.food &&
      this.gold >= cost.gold &&
      this.science >= cost.science &&
      this.soldiers >= cost.soldiers &&
      this.workers >= cost.workers
    );
  }

  /**
   * Returns a clean, floored object for UI or persistence.
   */
  public serialize() {
    return {
      food: Math.floor(this.food),
      gold: Math.floor(this.gold),
      science: Math.floor(this.science),
      soldiers: Math.floor(this.soldiers),
      workers: Math.floor(this.workers),
    };
  }

  public toJSON() {
    return this.serialize();
  }
}