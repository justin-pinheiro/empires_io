import { Resources } from "./resources.js";
import { TerrainType } from "./terrainTypeEnum.js";

/**
 * Valid building identifiers to prevent typo-based bugs.
 */
export enum BuildingType {
	CAPITAL = "CAPITAL",
	FARM = "FARM",
	HOUSE = "HOUSE",
	BARRACKS = "BARRACKS",
	LIBRARY = "LIBRARY",
	MARKET = "MARKET",
	MINE = "MINE",
	FORTIFICATIONS = "FORTIFICATIONS",
	BARBARIAN_CAMP = "BARBARIAN_CAMP",
}

export interface BuildingStats {
	readonly name: string;
	readonly baseHealth: number;
	readonly buildableTerrains: readonly TerrainType[];
	readonly populationCost: number;
	readonly resourcesCost: Resources;
	readonly armyCapacityUpgrade: number;
	readonly populationCapacityUpgrade: number;
	readonly production: Resources;
	readonly productionRate: number; // Removed null, use 0 for "no production"
}

/**
 * Global registry for building statistics.
 * Wrapped in Object.freeze to ensure runtime immutability.
 */
export const BUILDING_STATS: Readonly<Record<BuildingType, BuildingStats>> = Object.freeze({
	[BuildingType.CAPITAL]: {
	name: "Capital",
	baseHealth: 200,
	buildableTerrains: [TerrainType.PLAIN, TerrainType.DESERT, TerrainType.MOUNTAIN, TerrainType.FOREST],
	populationCost: 1,
	resourcesCost: Resources.zero(),
	armyCapacityUpgrade: 10,
	populationCapacityUpgrade: 5,
	production: new Resources(1, 1, 1, 1, 1),
	productionRate: 1,
	},
	[BuildingType.FARM]: {
	name: "Farm",
	baseHealth: 40,
	buildableTerrains: [TerrainType.PLAIN],
	populationCost: 1,
	resourcesCost: Resources.zero(),
	armyCapacityUpgrade: 0,
	populationCapacityUpgrade: 0,
	production: new Resources(1, 0, 0, 0, 0),
	productionRate: 0.4,
	},
	[BuildingType.HOUSE]: {
	name: "House",
	baseHealth: 60,
	buildableTerrains: [TerrainType.PLAIN, TerrainType.DESERT],
	populationCost: 0,
	resourcesCost: new Resources(10, 0, 5, 0, 0),
	armyCapacityUpgrade: 0,
	populationCapacityUpgrade: 5,
	production: Resources.zero(),
	productionRate: 0,
	},
	[BuildingType.BARRACKS]: {
	name: "Barracks",
	baseHealth: 100,
	buildableTerrains: [TerrainType.PLAIN, TerrainType.DESERT],
	populationCost: 1,
	resourcesCost: new Resources(5, 10, 0, 0, 0),
	armyCapacityUpgrade: 0,
	populationCapacityUpgrade: 0,
	production: new Resources(0, 0, 0, 0, 1),
	productionRate: 0.8,
	},
	[BuildingType.LIBRARY]: {
	name: "Library",
	baseHealth: 60,
	buildableTerrains: [TerrainType.PLAIN, TerrainType.DESERT],
	populationCost: 1,
	resourcesCost: new Resources(0, 10, 0, 0, 0),
	armyCapacityUpgrade: 0,
	populationCapacityUpgrade: 0,
	production: new Resources(0, 0, 0, 1, 0),
	productionRate: 0.5,
	},
	[BuildingType.MARKET]: {
	name: "Market",
	baseHealth: 60,
	buildableTerrains: [TerrainType.PLAIN, TerrainType.DESERT],
	populationCost: 1,
	resourcesCost: new Resources(10, 0, 5, 0, 0),
	armyCapacityUpgrade: 0,
	populationCapacityUpgrade: 0,
	production: new Resources(0, 1, 0, 0, 0),
	productionRate: 0.5,
	},
	[BuildingType.MINE]: {
	name: "Mine",
	baseHealth: 60,
	buildableTerrains: [TerrainType.MOUNTAIN],
	populationCost: 1,
	resourcesCost: new Resources(5, 10, 0, 0, 0),
	armyCapacityUpgrade: 0,
	populationCapacityUpgrade: 0,
	production: new Resources(0, 0, 1, 0, 0),
	productionRate: 0.5,
	},
	[BuildingType.FORTIFICATIONS]: {
	name: "Fortifications",
	baseHealth: 150,
	buildableTerrains: [TerrainType.MOUNTAIN, TerrainType.PLAIN, TerrainType.FOREST],
	populationCost: 1,
	resourcesCost: new Resources(0, 0, 20, 0, 0),
	armyCapacityUpgrade: 0,
	populationCapacityUpgrade: 0,
	production: Resources.zero(),
	productionRate: 0,
	},
	[BuildingType.BARBARIAN_CAMP]: {
	name: "Barbarian Camp",
	baseHealth: 30,
	buildableTerrains: [TerrainType.PLAIN, TerrainType.FOREST, TerrainType.DESERT, TerrainType.MOUNTAIN],
	populationCost: 0,
	resourcesCost: Resources.zero(),
	armyCapacityUpgrade: 0,
	populationCapacityUpgrade: 0,
	production: Resources.zero(),
	productionRate: 0,
	},
});