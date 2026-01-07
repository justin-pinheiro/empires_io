export type ResourceData = {
  food: number;
  gold: number;
  science: number;
  soldiers: number;
  workers: number;
};

export class Resources {
  constructor(
    private food: number = 0,
    private gold: number = 0,
    private science: number = 0,
    private soldiers: number = 0,
    private workers: number = 0
  ) {}

  static zero(): Resources {
    return new Resources(0, 0, 0, 0, 0);
  }

  /**
   * Creates a Resources instance from a partial object.
   */
  static from(data: Partial<ResourceData>): Resources {
    return new Resources(
      data.food ?? 0,
      data.gold ?? 0,
      data.science ?? 0,
      data.soldiers ?? 0,
      data.workers ?? 0
    );
  }

  // --- Getters ---
  public getFood() { return this.food; }
  public getGold() { return this.gold; }
  public getScience() { return this.science; }
  public getSoldiers() { return this.soldiers; }
  public getWorkers() { return this.workers; }

  // --- Arithmetic ---

  public add(incoming: Resources): void {
    this.food += incoming.food;
    this.gold += incoming.gold;
    this.science += incoming.science;
    this.soldiers += incoming.soldiers;
    this.workers += incoming.workers;
  }

  public subtract(incoming: Resources): void {    
    this.food = Math.max(0, this.food - incoming.food);
    this.gold = Math.max(0, this.gold - incoming.gold);
    this.science = Math.max(0, this.science - incoming.science);
    this.soldiers = Math.max(0, this.soldiers - incoming.soldiers);
    this.workers = Math.max(0, this.workers - incoming.workers);
  }

  public hasEnough(cost: Resources): boolean {
    return (
      this.food >= cost.food &&
      this.gold >= cost.gold &&
      this.science >= cost.science &&
      this.soldiers >= cost.soldiers &&
      this.workers >= cost.workers
    );
  }

  public clone(): Resources {
    return new Resources(this.food, this.gold, this.science, this.soldiers, this.workers);
  }

  public serialize(): ResourceData {
    return {
      food: Math.floor(this.food),
      gold: Math.floor(this.gold),
      science: Math.floor(this.science),
      soldiers: Math.floor(this.soldiers),
      workers: Math.floor(this.workers),
    };
  }
}