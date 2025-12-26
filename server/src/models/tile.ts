import { TERRAIN_DATA, TerrainType } from "./terrainTypeEnum.js";

/**
 * Represents a single hexagonal or square unit on the game map.
 */
export class Tile {
  constructor(
    private readonly id: string,
    private readonly x: number,
    private readonly y: number,
    private terrainType: TerrainType,
    private neighborsIds: string[] = []
  ) {}

  // --- Getters ---

  public getId(): string { return this.id; }
  public getCoords() { return { x: this.x, y: this.y }; }
  public getTerrainType(): TerrainType { return this.terrainType; }
  public getNeighbors(): string[] { return [...this.neighborsIds]; }

  // --- Methods ---

  /**
   * Updates the terrain of the tile.
   */
  public setTerrainType(type: TerrainType): void {
    this.terrainType = type;
  }

  /**
   * Safely adds a neighbor ID if it's not already present.
   */
  public addNeighbor(neighborId: string): void {
    if (!this.neighborsIds.includes(neighborId)) {
      this.neighborsIds.push(neighborId);
    }
  }

  /**
   * Prepares the tile for network transmission or database storage.
   */
  public serialize() {
    return {
      id: this.id,
      x: this.x,
      y: this.y,
      neighbors: this.neighborsIds,
      terrain: TERRAIN_DATA[this.terrainType]
    };
  }

  public toJSON() {
    return this.serialize();
  }
}