import { TERRAIN_DATA, TerrainType } from "./terrainTypeEnum.js";

/**
 * Represents a single hexagonal or square unit on the game map.
 */
export class Tile {
  constructor(
    private readonly id: string,
    private readonly x: number,
    private readonly y: number,
    private ownerId: string | null,
    private terrainType: TerrainType,
    private neighborsIds: (string | null)[] = []
  ) {}

  // --- Getters ---

  public getId(): string { return this.id; }
  public getOwnerId(): string | null { return this.ownerId; }
  public getCoords() { return { x: this.x, y: this.y }; }
  public getTerrainType(): TerrainType { return this.terrainType; }
  public getNeighbors(): (string | null)[] { return [...this.neighborsIds]; }

  // --- Methods ---

  /**
   * Updates the terrain of the tile.
   */
  public setTerrainType(type: TerrainType): void {
    this.terrainType = type;
  }

  /**
   * Updates the owner of the tile.
   */
  public setOwnerId(id: string): void {
    this.ownerId = id;
  }

  /**
   * Removes the owner of the tile.
   */
  public removeOwnerId(): void {
    this.ownerId = null;
  }

  /**
   * Safely adds a neighbor ID if it's not already present.
   */
  public addNeighbor(neighborId: string | null): void {
    if (neighborId === null || !this.neighborsIds.includes(neighborId)) {
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
      ownerId: this.ownerId,
      neighbors: this.neighborsIds,
      terrain: TERRAIN_DATA[this.terrainType]
    };
  }

  public toJSON() {
    return this.serialize();
  }
}