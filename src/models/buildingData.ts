import { Resources } from "./resources.js";
import { TerrainType } from "./terrainTypeEnum.js";
import { ProductionType } from "./productionTypeEnum.js";

export interface BuildingStats {
  name: string;
  baseHealth: number;
  buildableTerrains: TerrainType[];
  populationCost: number;
  resourcesCost: Resources;
  armyCapacityUpgrade: number;
  populationCapacityUpgrade: number;
  production: Resources;
  productionRate: number | null;
}

export const BUILDING_STATS: Record<string, BuildingStats> = {
  CAPITAL: {
    name: "Capital",
    baseHealth: 200,
    buildableTerrains: [TerrainType.PLAIN, TerrainType.DESERT, TerrainType.MOUNTAIN, TerrainType.FOREST],
    populationCost: 1,
    resourcesCost: new Resources(0, 0, 0, 0, 0),
    armyCapacityUpgrade: 10,
    populationCapacityUpgrade: 5,
    production: new Resources(1, 1, 1, 1, 1),
    productionRate: 1,
  },
  FARM: {
    name: "Farm",
    baseHealth: 40,
    buildableTerrains: [TerrainType.PLAIN],
    populationCost: 1,
    resourcesCost: new Resources(0, 0, 0, 0, 0),
    armyCapacityUpgrade: 0,
    populationCapacityUpgrade: 0,
    production: new Resources(1, 0, 0, 0, 0),
    productionRate: 0.4
  },
  HOUSE: {
    name: "House",
    baseHealth: 60,
    buildableTerrains: [TerrainType.PLAIN, TerrainType.DESERT],
    populationCost: 0,
    resourcesCost: new Resources(10, 0, 5, 0, 0),
    armyCapacityUpgrade: 0,
    populationCapacityUpgrade: 5,
    production: new Resources(0, 0, 0, 0, 0),
    productionRate: 0
  },
  BARRACKS: {
    name: "Barracks",
    baseHealth: 100,
    buildableTerrains: [TerrainType.PLAIN, TerrainType.DESERT],
    populationCost: 1,
    resourcesCost: new Resources(5, 10, 0, 0, 0),
    armyCapacityUpgrade: 0,
    populationCapacityUpgrade: 0,
    production: new Resources(0, 0, 0, 0, 1),
    productionRate: 0.8
  },
  LIBRARY: {
    name: "Library",
    baseHealth: 60,
    buildableTerrains: [TerrainType.PLAIN, TerrainType.DESERT],
    populationCost: 1,
    resourcesCost: new Resources(0, 10, 0, 0, 0),
    armyCapacityUpgrade: 0,
    populationCapacityUpgrade: 0,
    production: new Resources(0, 0, 0, 1, 0),
    productionRate: 0.5
  },
  MARKET: {
    name: "Market",
    baseHealth: 60,
    buildableTerrains: [TerrainType.PLAIN, TerrainType.DESERT],
    populationCost: 1,
    resourcesCost: new Resources(10, 0, 5, 0, 0),
    armyCapacityUpgrade: 0,
    populationCapacityUpgrade: 0,
    production: new Resources(0, 1, 0, 0, 0),
    productionRate: 0.5
  },
  MINE: {
    name: "Mine",
    baseHealth: 60,
    buildableTerrains: [TerrainType.MOUNTAIN],
    populationCost: 1,
    resourcesCost: new Resources(5, 10, 0, 0, 0),
    armyCapacityUpgrade: 0,
    populationCapacityUpgrade: 0,
    production: new Resources(0, 0, 1, 0, 0),
    productionRate: 0.5
  },
  FORTIFICATIONS: {
    name: "Fortifications",
    baseHealth: 150,
    buildableTerrains: [TerrainType.MOUNTAIN, TerrainType.PLAIN, TerrainType.FOREST],
    populationCost: 1,
    resourcesCost: new Resources(0, 0, 20, 0, 0),
    armyCapacityUpgrade: 0,
    populationCapacityUpgrade: 0,
    production: new Resources(0, 0, 0, 0, 0),
    productionRate: 0
  },
};