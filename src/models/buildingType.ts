import { Resources } from "./resources";
import { terrainType } from "./terrainTypeEnum";
import { productionType } from "./productionTypeEnum";

class BuildingType {
  private name: string;
  private baseHealthPoints: number;
  private buildableTerrains: terrainType[];
  private cost: Resources;
  private production: Resources;
  private productionType: productionType;

  constructor (
    name: string,
    baseHealthPoints: number,
    buildableTerrains: terrainType[],
    cost: Resources,
    production: Resources,
    productionType: productionType
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
  FARM: 
    new BuildingType(
      "Farm", 
      40, 
      [terrainType.PLAIN], 
      new Resources(1,0,0,0,0), 
      new Resources(0,3,0,0,0),
      productionType.STEADY
    ),
};