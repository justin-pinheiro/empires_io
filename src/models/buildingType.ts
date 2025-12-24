import { Resources } from "./resources.js";
import { TerrainType } from "./terrainTypeEnum.js";
import { ProductionType } from "./productionTypeEnum.js";

class BuildingType {
  private name: string;
  private baseHealthPoints: number;
  private buildableTerrains: TerrainType[];
  private cost: Resources;
  private production: Resources;
  private productionType: ProductionType;

  constructor (
    name: string,
    baseHealthPoints: number,
    buildableTerrains: TerrainType[],
    cost: Resources,
    production: Resources,
    productionType: ProductionType
  ) {
    this.name = name;
    this.baseHealthPoints = baseHealthPoints;
    this.buildableTerrains = buildableTerrains;
    this.cost = cost;
    this.production = production;
    this.productionType = productionType;
  }
}

export const BUILDING_TYPES = {
  CAPITAL: 
    new BuildingType(
      "Capital", 
      200, 
      [TerrainType.PLAIN, TerrainType.DESERT, TerrainType.MOUNTAIN, TerrainType.FOREST], 
      new Resources(1,0,0,0,0), 
      new Resources(5,0,0,0,0),
      ProductionType.INSTANTANEOUS
    ),
  FARM: 
    new BuildingType(
      "Farm", 
      40, 
      [TerrainType.PLAIN], 
      new Resources(1,0,0,0,0), 
      new Resources(0,3,0,0,0),
      ProductionType.STEADY
    ),
};