import { TERRAIN_DATA, TerrainType } from "./terrainTypeEnum.js";

/**
 * Represents a single hexagonal unit on the game map.
 */
export class Tile {
  constructor(
    private readonly id: string,
    private readonly x: number,
    private readonly y: number,
    private terrainType: TerrainType,
    private neighborsIds: (string | null)[] = []
  ) {}

  public getId(): string { return this.id; }
  public getCoords() { return { x: this.x, y: this.y }; }
  public getTerrainType(): TerrainType { return this.terrainType; }
  public getNeighbors(): (string | null)[] { return [...this.neighborsIds]; }

  public setTerrainType(type: TerrainType): void {this.terrainType = type;}

  /**
   * Safely adds a neighbor ID if it's not already present.
   */
  public addNeighbor(neighborId: string | null): void {
    if (neighborId === null || !this.neighborsIds.includes(neighborId)) {
      this.neighborsIds.push(neighborId);
    }
  }

  public serialize() {
    return {
      id: this.id,
      x: this.x,
      y: this.y,
      neighbors: this.neighborsIds,
      terrain: TERRAIN_DATA[this.terrainType]
    };
  }
}