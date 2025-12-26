import { Building } from "./building.js";
import { TERRAIN_DATA, TerrainType } from "./terrainTypeEnum.js";

export class Tile {
  private id: string;
  private x: number;
  private y: number;
  private neighborsIds: string[];
  private terrainType: TerrainType;

  constructor(
    id: string, 
    x: number, 
    y: number, 
    neighborsIds: string[], 
    terrainType: TerrainType) {
      this.id = id;
      this.x = x;
      this.y = y;
      this.neighborsIds = neighborsIds;
      this.terrainType = terrainType;
    }

    setNeighbors(neighborsIds : string[]) {
      this.neighborsIds = neighborsIds;
    }

    serialize() {
      return {
        id: this.id,
        x: this.x,
        y: this.y,
        neighbors: this.neighborsIds,
        terrain: TERRAIN_DATA[this.terrainType]
      };
    }
}