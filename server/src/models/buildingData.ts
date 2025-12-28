import { tr } from "zod/locales";
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
	WATCH_TOWER = "WATCH_TOWER",
	FISHING_ZONE = "FISHING_ZONE",
	BARBARIAN_CAMP = "BARBARIAN_CAMP",
}

export interface BuildingStats {
	readonly name: string;
	readonly description: string;
	readonly baseHealth: number;
	readonly buildableTerrains: readonly TerrainType[];
	readonly populationCost: number;
	readonly resourcesCost: Resources;
	readonly armyCapacityUpgrade: number;
	readonly populationCapacityUpgrade: number;
	readonly production: Resources;
	readonly productionRate: number;
	readonly vision: number;
	readonly buildable: boolean;
}

/**
 * Global registry for building statistics.
 * Wrapped in Object.freeze to ensure runtime immutability.
 */
export const BUILDING_STATS: Readonly<Record<BuildingType, BuildingStats>> = Object.freeze({
	[BuildingType.CAPITAL]: {
	name: "Capital",
	description: "The capital of your civilisation.",
	baseHealth: 200,
	buildableTerrains: [TerrainType.PLAIN, TerrainType.DESERT, TerrainType.MOUNTAIN, TerrainType.FOREST],
	populationCost: 1,
	resourcesCost: Resources.zero(),
	armyCapacityUpgrade: 10,
	populationCapacityUpgrade: 5,
	production: new Resources(1, 1, 1, 1, 1),
	productionRate: 1,
	vision: 3,
	buildable: false,
	},
	[BuildingType.FARM]: {
	name: "Farm",
	description: "Produces food to feed your population.",
	baseHealth: 40,
	buildableTerrains: [TerrainType.PLAIN],
	populationCost: 1,
	resourcesCost: Resources.zero(),
	armyCapacityUpgrade: 0,
	populationCapacityUpgrade: 0,
	production: new Resources(1, 0, 0, 0, 0),
	productionRate: 1,
	vision: 1,
	buildable: true,
	},
	[BuildingType.HOUSE]: {
	name: "House",
	description: "Adds population.",
	baseHealth: 60,
	buildableTerrains: [TerrainType.PLAIN, TerrainType.DESERT],
	populationCost: 0,
	resourcesCost: new Resources(10, 0, 5, 0, 0),
	armyCapacityUpgrade: 0,
	populationCapacityUpgrade: 5,
	production: Resources.zero(),
	productionRate: 0,
	vision: 1,
	buildable: true,
	},
	[BuildingType.BARRACKS]: {
	name: "Barracks",
	description: "Train your army faster.",
	baseHealth: 100,
	buildableTerrains: [TerrainType.PLAIN, TerrainType.DESERT],
	populationCost: 1,
	resourcesCost: new Resources(5, 10, 0, 0, 0),
	armyCapacityUpgrade: 0,
	populationCapacityUpgrade: 0,
	production: new Resources(0, 0, 0, 0, 1),
	productionRate: 1,
	vision: 1,
	buildable: true,
	},
	[BuildingType.LIBRARY]: {
	name: "Library",
	description: "Produce science to get discoveries.",
	baseHealth: 60,
	buildableTerrains: [TerrainType.PLAIN, TerrainType.DESERT],
	populationCost: 1,
	resourcesCost: new Resources(0, 10, 0, 0, 0),
	armyCapacityUpgrade: 0,
	populationCapacityUpgrade: 0,
	production: new Resources(0, 0, 0, 1, 0),
	productionRate: 1,
	vision: 1,
	buildable: true,
	},
	[BuildingType.MARKET]: {
	name: "Market",
	description: "Produce wealth in your empire.",
	baseHealth: 60,
	buildableTerrains: [TerrainType.PLAIN, TerrainType.DESERT],
	populationCost: 1,
	resourcesCost: new Resources(10, 0, 5, 0, 0),
	armyCapacityUpgrade: 0,
	populationCapacityUpgrade: 0,
	production: new Resources(0, 1, 0, 0, 0),
	productionRate: 1,
	vision: 1,
	buildable: true,
	},
	[BuildingType.MINE]: {
	name: "Mine",
	description: "Produce stone for your empire.",
	baseHealth: 60,
	buildableTerrains: [TerrainType.MOUNTAIN],
	populationCost: 1,
	resourcesCost: new Resources(5, 10, 0, 0, 0),
	armyCapacityUpgrade: 0,
	populationCapacityUpgrade: 0,
	production: new Resources(0, 0, 1, 0, 0),
	productionRate: 1,
	vision: 1,
	buildable: true,
	},
	[BuildingType.FORTIFICATIONS]: {
	name: "Fortifications",
	description: "A strong fortification to defend your ground.",
	baseHealth: 150,
	buildableTerrains: [TerrainType.MOUNTAIN, TerrainType.PLAIN, TerrainType.FOREST],
	populationCost: 1,
	resourcesCost: new Resources(0, 0, 20, 0, 0),
	armyCapacityUpgrade: 0,
	populationCapacityUpgrade: 0,
	production: Resources.zero(),
	productionRate: 0,
	vision: 3,
	buildable: true,
	},
	[BuildingType.WATCH_TOWER]: {
	name: "Watch tower",
	description: "Building used to claim territory. Can be replaced by another building.",
	baseHealth: 100,
	buildableTerrains: [TerrainType.PLAIN, TerrainType.FOREST, TerrainType.DESERT, TerrainType.MOUNTAIN],
	populationCost: 0,
	resourcesCost: Resources.zero(),
	armyCapacityUpgrade: 0,
	populationCapacityUpgrade: 0,
	production: Resources.zero(),
	productionRate: 0,
	vision: 1,
	buildable: false,
	},
	[BuildingType.FISHING_ZONE]: {
	name: "Fishing zone",
	description: "",
	baseHealth: 40,
	buildableTerrains: [TerrainType.WATER],
	populationCost: 1,
	resourcesCost: new Resources(0, 10, 0, 0, 0),
	armyCapacityUpgrade: 0,
	populationCapacityUpgrade: 0,
	production: new Resources(1, 0, 0, 0, 0),
	productionRate: 1,
	vision: 1,
	buildable: true,
	},
	[BuildingType.BARBARIAN_CAMP]: {
	name: "Barbarian Camp",
	description: "Ennemy barbarian camp.",
	baseHealth: 30,
	buildableTerrains: [TerrainType.PLAIN, TerrainType.FOREST, TerrainType.DESERT, TerrainType.MOUNTAIN],
	populationCost: 0,
	resourcesCost: Resources.zero(),
	armyCapacityUpgrade: 0,
	populationCapacityUpgrade: 0,
	production: Resources.zero(),
	productionRate: 0,
	vision: 0,
	buildable: false,
	},
});