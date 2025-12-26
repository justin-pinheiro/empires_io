import { Resources } from "./resources.js";
import { TerrainType } from "./terrainTypeEnum.js";
import { ProductionType } from "./productionTypeEnum.js";

export interface BuildingStats {
  name: string;
  baseHealth: number;
  buildableTerrains: TerrainType[];
  cost: Resources;
  production: Resources;
  productionType: ProductionType;
  productionRate: number | null;
}

export const BUILDING_STATS: Record<string, BuildingStats> = {
  CAPITAL: {
    name: "Capital",
    baseHealth: 200,
    buildableTerrains: [TerrainType.PLAIN, TerrainType.DESERT, TerrainType.MOUNTAIN, TerrainType.FOREST],
    cost: new Resources(1, 0, 0, 0, 0),
    production: new Resources(5, 0, 0, 0, 0),
    productionType: ProductionType.INSTANTANEOUS,
    productionRate: null
  },
  FARM: {
    name: "Farm",
    baseHealth: 40,
    buildableTerrains: [TerrainType.PLAIN],
    cost: new Resources(1, 0, 0, 0, 0),
    production: new Resources(0, 1, 0, 0, 0),
    productionType: ProductionType.STEADY,
    productionRate: 0.4
  },
};