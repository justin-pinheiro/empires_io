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
	OUTPOST = "OUTPOST",
	FISHING_ZONE = "FISHING_ZONE",
	BARBARIAN_CAMP = "BARBARIAN_CAMP",
}

export interface BuildingStats {
	readonly name: string;
	readonly description: string;
	readonly baseHealth: number;
	readonly buildableTerrains: readonly TerrainType[];
	readonly resourcesToBuild: Resources;
	readonly resourcesToMaintain: Resources;
	readonly resourcesCapacityUpgrade: Resources;
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
	resourcesToBuild: Resources.zero(),
	resourcesToMaintain: Resources.zero(),
	resourcesCapacityUpgrade: new Resources(50, 50, 50, 500, 20, 5),
	production: new Resources(1, 1, 1, 1, 1, 0),
	productionRate: 1,
	vision: 3,
	buildable: false,
	},
	[BuildingType.FARM]: {
	name: "Farm",
	description: "Produces food to feed your population.",
	baseHealth: 40,
	buildableTerrains: [TerrainType.PLAIN],
	resourcesToBuild: new Resources(0,0,0,10,0,1),
	resourcesToMaintain: Resources.zero(),
	resourcesCapacityUpgrade: new Resources(30, 0, 0, 0, 0, 0),
	production: new Resources(1, 0, 0, 0, 0, 0),
	productionRate: 1,
	vision: 1,
	buildable: true,
	},
	[BuildingType.HOUSE]: {
	name: "House",
	description: "Adds population.",
	baseHealth: 60,
	buildableTerrains: [TerrainType.PLAIN, TerrainType.DESERT, TerrainType.MOUNTAIN, TerrainType.FOREST],
	resourcesToBuild: new Resources(0,0,15,0,0,0),
	resourcesToMaintain: new Resources(0,0,1,0,0,0),
	resourcesCapacityUpgrade: new Resources(0, 0, 0, 0, 0, 5),
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
	resourcesToBuild: new Resources(0,0,10,0,0,1),
	resourcesToMaintain: new Resources(0,1,1,0,0,0),
	resourcesCapacityUpgrade: new Resources(0, 0, 0, 0, 10, 0),
	production: new Resources(0, 0, 0, 0, 1, 0),
	productionRate: 1,
	vision: 1,
	buildable: true,
	},
	[BuildingType.LIBRARY]: {
	name: "Library",
	description: "Produce science to get discoveries.",
	baseHealth: 60,
	buildableTerrains: [TerrainType.PLAIN, TerrainType.DESERT], 
	resourcesToBuild: new Resources(0,0,15,0,0,1),
	resourcesToMaintain: new Resources(0,0,1,0,0,0),
	resourcesCapacityUpgrade: new Resources(0, 0, 0, 100, 0),
	production: new Resources(0, 0, 0, 1, 0, 0),
	productionRate: 1,
	vision: 1,
	buildable: true,
	},
	[BuildingType.MARKET]: {
	name: "Market",
	description: "Produce wealth in your empire.",
	baseHealth: 60,
	buildableTerrains: [TerrainType.PLAIN, TerrainType.DESERT],
	resourcesToBuild: new Resources(0,0,20,0,0,1),
	resourcesToMaintain: new Resources(0,0,1,0,0,0),
	resourcesCapacityUpgrade: new Resources(0, 20, 0, 0, 0, 0),
	production: new Resources(0, 1, 0, 0, 0, 0),
	productionRate: 1,
	vision: 1,
	buildable: true,
	},
	[BuildingType.MINE]: {
	name: "Mine",
	description: "Produces materials for your empire.",
	baseHealth: 60,
	buildableTerrains: [TerrainType.MOUNTAIN],
	resourcesToBuild: new Resources(0,0,20,0,0,1),
	resourcesToMaintain: new Resources(0,0,1,0,0,0),
	resourcesCapacityUpgrade: new Resources(0, 0, 20, 0, 0, 0),
	production: new Resources(0, 0, 1, 0, 0, 0),
	productionRate: 1,
	vision: 1,
	buildable: true,
	},
	[BuildingType.FORTIFICATIONS]: {
	name: "Fortifications",
	description: "A strong fortification to defend your ground.",
	baseHealth: 150,
	buildableTerrains: [TerrainType.MOUNTAIN, TerrainType.PLAIN, TerrainType.FOREST],
	resourcesToBuild: new Resources(0,0,50,0,0,1),
	resourcesToMaintain: new Resources(0,0,1,0,0,0),
	resourcesCapacityUpgrade: new Resources(0, 0, 0, 0, 5, 0),
	production: Resources.zero(),
	productionRate: 0,
	vision: 3,
	buildable: true,
	},
	[BuildingType.OUTPOST]: {
	name: "Outpost",
	description: "Building used to claim territory. Can be replaced by another building.",
	baseHealth: 100,
	buildableTerrains: [TerrainType.PLAIN, TerrainType.FOREST, TerrainType.DESERT, TerrainType.MOUNTAIN, TerrainType.WATER],
	resourcesToBuild: Resources.zero(),
	resourcesToMaintain: Resources.zero(),
	resourcesCapacityUpgrade: Resources.zero(),
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
	resourcesToBuild: new Resources(0,0,20,0,0,1),
	resourcesToMaintain: new Resources(0,0,1,0,0,0),
	resourcesCapacityUpgrade: new Resources(20, 0, 0, 0, 0, 0),
	production: new Resources(1, 0, 0, 0, 0, 0),
	productionRate: 1,
	vision: 1,
	buildable: true,
	},
	[BuildingType.BARBARIAN_CAMP]: {
	name: "Barbarian Camp",
	description: "Ennemy barbarian camp.",
	baseHealth: 30,
	buildableTerrains: [TerrainType.PLAIN, TerrainType.FOREST, TerrainType.DESERT, TerrainType.MOUNTAIN],
	resourcesToBuild: Resources.zero(),
	resourcesToMaintain: Resources.zero(),
	resourcesCapacityUpgrade: new Resources(0, 0, 0, 0, 1000, 0),
	production: Resources.zero(),
	productionRate: 0,
	vision: 0,
	buildable: false,
	},
});

export function getSerializedBuildingsData() {
	const buildableStatsReadable = Object.fromEntries(
		Object.entries(BUILDING_STATS).map(([key, stats]) => [
			key,
			{
				...stats,
				buildableTerrains: stats.buildableTerrains.map(t => TerrainType[t])
			}
		])
	);
	return buildableStatsReadable;
}
