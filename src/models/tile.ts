import { Building } from "./building";
import { TerrainType } from "./terrainTypeEnum";

export class Tile {
  private id: string;
  private x: number;
  private y: number;
  private neighborsIds: string[];
  private terrainType: TerrainType;
  private building: Building | null;

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
      this.building = null;
    }

    setBuilding(building : Building) {
      this.building = building;
    }
}