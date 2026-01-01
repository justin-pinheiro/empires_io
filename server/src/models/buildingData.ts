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
export const BUILDING_STATS: Readonly<Record<BuildingType, Record<number, BuildingStats>>> = Object.freeze({
	[BuildingType.CAPITAL]: {
		1: {
			buildableTerrains: [TerrainType.PLAIN, TerrainType.DESERT, TerrainType.MOUNTAIN, TerrainType.FOREST],
			name: "Capital",
			description: "The capital of your civilisation.",
			baseHealth: 500,
			resourcesToBuild: Resources.zero(),
			resourcesCapacityUpgrade: new Resources(100, 100, 99999, 100, 100),
			production: new Resources(1, 1, 1, 1, 1),
			productionRate: 1,
			vision: 3,
			buildable: false,
		},
	},
	[BuildingType.FARM]: {
		1: {
			name: "Farm",
			description: "Produces food to feed your population.",
			baseHealth: 250,
			buildableTerrains: [TerrainType.PLAIN],
			resourcesToBuild: new Resources(0,0,0,0,60),
			resourcesCapacityUpgrade: new Resources(50, 0, 0, 0, 0),
			production: new Resources(1, 0, 0, 0, 0),
			productionRate: 1,
			vision: 1,
			buildable: true,
		},
		2: {
			name: "Farm",
			description: "Produces food to feed your population.",
			baseHealth: 500,
			buildableTerrains: [TerrainType.PLAIN],
			resourcesToBuild: new Resources(0,0,0,0,200),
			resourcesCapacityUpgrade: new Resources(100, 0, 0, 0, 0),
			production: new Resources(2, 0, 0, 0, 0),
			productionRate: 1,
			vision: 1,
			buildable: true,
		},
	},
	[BuildingType.HOUSE]: {
	1: {
		name: "House",
		description: "Adds workers to your empire.",
		baseHealth: 250,
		buildableTerrains: [TerrainType.PLAIN, TerrainType.DESERT, TerrainType.MOUNTAIN, TerrainType.FOREST],
		resourcesToBuild: new Resources(60,0,0,0,0),
		resourcesCapacityUpgrade: new Resources(0, 0, 0, 0, 50),
		production: new Resources(0,0,0,0,1),
		productionRate: 1,
		vision: 1,
		buildable: true,
		},
	},
	[BuildingType.BARRACKS]: {
	1: {
		name: "Barracks",
		description: "To train your soldiers.",
		baseHealth: 250,
		buildableTerrains: [TerrainType.PLAIN, TerrainType.DESERT],
		resourcesToBuild: new Resources(40,80,0,0,0),
		resourcesCapacityUpgrade: new Resources(0, 0, 0, 50, 0),
		production: new Resources(0, 0, 0, 1, 0),
		productionRate: 1,
		vision: 1,
		buildable: true,
		},
	},
	[BuildingType.LIBRARY]: {
	1: {
		name: "Library",
		description: "Produce science to get discoveries.",
		baseHealth: 250,
		buildableTerrains: [TerrainType.PLAIN, TerrainType.DESERT, TerrainType.MOUNTAIN, TerrainType.FOREST], 
		resourcesToBuild: new Resources(40,80,0,0,0),
		resourcesCapacityUpgrade: new Resources(0, 0, 0, 0, 0),
		production: new Resources(0, 0, 1, 0, 0),
		productionRate: 1,
		vision: 1,
		buildable: true,
		},
	},
	[BuildingType.MARKET]: {
	1: {
		name: "Market",
		description: "Produce wealth in your empire.",
		baseHealth: 300,
		buildableTerrains: [TerrainType.PLAIN, TerrainType.FOREST],
		resourcesToBuild: new Resources(50,0,0,0,50),
		resourcesCapacityUpgrade: new Resources(0, 50, 0, 0, 0),
		production: new Resources(0, 1, 0, 0, 0),
		productionRate: 1,
		vision: 1,
		buildable: true,
		},
	},
	[BuildingType.MINE]: {
	1: {
		name: "Mine",
		description: "Produces materials for your empire.",
		baseHealth: 300,
		buildableTerrains: [TerrainType.MOUNTAIN, TerrainType.DESERT],
		resourcesToBuild: new Resources(50,0,0,0,50),
		resourcesCapacityUpgrade: new Resources(0, 50, 0, 0, 0),
		production: new Resources(0, 1, 0, 0, 0),
		productionRate: 1,
		vision: 1,
		buildable: true,
		},
	},
	[BuildingType.FORTIFICATIONS]: {
	1: {
		name: "Fortifications",
		description: "A strong fortification to defend your ground.",
		baseHealth: 500,
		buildableTerrains: [TerrainType.MOUNTAIN, TerrainType.PLAIN, TerrainType.FOREST],
		resourcesToBuild: new Resources(0,150,0,0,0),
		resourcesCapacityUpgrade: new Resources(0, 0, 0, 0, 0),
		production: Resources.zero(),
		productionRate: 0,
		vision: 3,
		buildable: true,
		},
	},
	[BuildingType.OUTPOST]: {
	1: {
		name: "Outpost",
		description: "Building used to claim territory. Can be replaced by another building.",
		baseHealth: 500,
		buildableTerrains: [TerrainType.PLAIN, TerrainType.FOREST, TerrainType.DESERT, TerrainType.MOUNTAIN, TerrainType.WATER],
		resourcesToBuild: Resources.zero(),
		resourcesCapacityUpgrade: Resources.zero(),
		production: Resources.zero(),
		productionRate: 0,
		vision: 1,
		buildable: false,
		},
	},
	[BuildingType.FISHING_ZONE]: {
	1: {
		name: "Fishing zone",
		description: "",
		baseHealth: 250,
		buildableTerrains: [TerrainType.WATER],
		resourcesToBuild: new Resources(0,0,0,0,60),
		resourcesCapacityUpgrade: new Resources(50, 0, 0, 0, 0),
		production: new Resources(1, 0, 0, 0, 0),
		productionRate: 1,
		vision: 1,
		buildable: true,
		},
	},
	[BuildingType.BARBARIAN_CAMP]: {
	1: {
		name: "Barbarian Camp",
		description: "Ennemy barbarian camp.",
		baseHealth: 300,
		buildableTerrains: [TerrainType.PLAIN, TerrainType.FOREST, TerrainType.DESERT, TerrainType.MOUNTAIN],
		resourcesToBuild: Resources.zero(),
		resourcesCapacityUpgrade: new Resources(0, 0, 0, 99999, 0),
		production: new Resources(0,0,0,99999,0),
		productionRate: 0,
		vision: 0,
		buildable: false,
		},
	}
});

/**
 * Checks if a higher level is defined in the registry for a specific building.
 */
export function hasNextLevel(type: BuildingType, currentLevel: number): boolean {
    const nextLevel = currentLevel + 1;
    return !!(BUILDING_STATS[type] && BUILDING_STATS[type][nextLevel]);
}

/**
 * Returns next level stats for a specific building. Assumes it exist.
 */
export function getNextLevel(type: BuildingType, currentLevel: number): BuildingStats {
    const nextLevel = currentLevel + 1;
    return BUILDING_STATS[type][nextLevel]!;
}

export function getSerializedBuildingsData() {
    return Object.fromEntries(
        Object.entries(BUILDING_STATS).map(([buildingType, levels]) => [
            buildingType,
            Object.fromEntries(
                Object.entries(levels).map(([level, stats]) => [
                    level,
                    {
                        ...stats,
                        buildableTerrains: stats.buildableTerrains.map(t => TerrainType[t])
                    }
                ])
            )
        ])
    );
}
