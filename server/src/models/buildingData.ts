import { BUILDINGS_BARBARIAN_CAMPS_BASE_HEALTH, BUILDINGS_BASE_DEFAULT_CAPACITY, BUILDINGS_BASE_DEFAULT_COST, BUILDINGS_BASE_DEFAULT_HEALTH, BUILDINGS_BASE_HIGH_COST, BUILDINGS_BASE_PRODUCTION, BUILDINGS_CAPACITY_LINEAR_INCREMENT, BUILDINGS_CAPITAL_BASE_CAPACITY, BUILDINGS_CAPITAL_BASE_COST, BUILDINGS_CAPITAL_BASE_HEALTH, BUILDINGS_COST_EXPONENTIAL_FACTOR, BUILDINGS_DEFAULT_VISION, BUILDINGS_FORTIFICATIONS_BASE_HEALTH, BUILDINGS_HEALTH_EXPONENTIAL_FACTOR, BUILDINGS_LONG_VISION, BUILDINGS_OUTPOST_BASE_HEALTH, BUILDINGS_PRODUCTION_EXPONENTIAL_FACTOR } from "../config/constants.js";
import { Resources } from "./resources.js";
import { TerrainType } from "./terrainTypeEnum.js";

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

export const scale = {
    // Linear: base + (increment * (level - 1))
    linear: (base: number, inc: number, lvl: number) => base + (inc * (lvl - 1)),
    // Exponential: base * (multiplier ^ (level - 1))
    exponential: (base: number, mult: number, lvl: number) => Math.floor(base * Math.pow(mult, lvl - 1)),
};

export interface BuildingDynamicStats {
	readonly baseHealth: number;
	readonly resourcesToBuild: Resources;
	readonly resourcesCapacityUpgrade: Resources;
	readonly production: Resources;
	readonly productionRate: number;
	readonly imagePath: string;
}

export interface BuildingBlueprint {
    readonly name: string;
    readonly description: string;
    readonly maxLevel: number;
	readonly buildableTerrains: TerrainType[];
	readonly vision: number;
	readonly buildable: boolean;
    readonly stats: (level: number) => BuildingDynamicStats;
}

/**
 * Global registry for building statistics.
 * Wrapped in Object.freeze to ensure runtime immutability.
 */
export const BLUEPRINTS: Record<BuildingType, BuildingBlueprint> = {
	[BuildingType.CAPITAL]: {
		name: "Capital",
		description: "The capital of your civilisation.",
        maxLevel: 4,
		buildableTerrains: [TerrainType.PLAIN, TerrainType.DESERT, TerrainType.MOUNTAIN, TerrainType.FOREST],
		vision: BUILDINGS_LONG_VISION,
		buildable: false,
        stats: (lvl) => ({
            imagePath: `capital${lvl > 1 ? lvl - 1 : ""}.png`,
            baseHealth: scale.exponential(
                BUILDINGS_CAPITAL_BASE_HEALTH, 
                BUILDINGS_HEALTH_EXPONENTIAL_FACTOR, 
                lvl
            ),
            resourcesToBuild: Resources.from({
				food: lvl == 1 ? 0 : scale.exponential(
                    BUILDINGS_CAPITAL_BASE_COST, 
                    BUILDINGS_COST_EXPONENTIAL_FACTOR, 
                    lvl-1
                ), 
				gold: lvl == 1 ? 0 : scale.exponential(
                    BUILDINGS_CAPITAL_BASE_COST, 
                    BUILDINGS_COST_EXPONENTIAL_FACTOR, 
                    lvl-1
                ), 
				workers: lvl == 1 ? 0 : scale.exponential(
                    BUILDINGS_CAPITAL_BASE_COST, 
                    BUILDINGS_COST_EXPONENTIAL_FACTOR, 
                    lvl-1
                ), 
			}),
            resourcesCapacityUpgrade: new Resources(
				scale.linear(
                    BUILDINGS_CAPITAL_BASE_CAPACITY, 
                    BUILDINGS_CAPACITY_LINEAR_INCREMENT, 
                    lvl
                ), 
				scale.linear(
                    BUILDINGS_CAPITAL_BASE_CAPACITY, 
                    BUILDINGS_CAPACITY_LINEAR_INCREMENT, 
                    lvl
                ), 
				scale.linear(
                    BUILDINGS_CAPITAL_BASE_CAPACITY, 
                    BUILDINGS_CAPACITY_LINEAR_INCREMENT, 
                    lvl
                ), 
				scale.linear(
                    BUILDINGS_CAPITAL_BASE_CAPACITY, 
                    BUILDINGS_CAPACITY_LINEAR_INCREMENT, 
                    lvl
                ), 
				scale.linear(
                    BUILDINGS_CAPITAL_BASE_CAPACITY, 
                    BUILDINGS_CAPACITY_LINEAR_INCREMENT, 
                    lvl
                ), 
			),
            production: new Resources(
				scale.exponential(
                    BUILDINGS_BASE_PRODUCTION, 
                    BUILDINGS_PRODUCTION_EXPONENTIAL_FACTOR, 
                    lvl
                ), 
				scale.exponential(
                    BUILDINGS_BASE_PRODUCTION, 
                    BUILDINGS_PRODUCTION_EXPONENTIAL_FACTOR, 
                    lvl
                ), 
				scale.exponential(
                    BUILDINGS_BASE_PRODUCTION, 
                    BUILDINGS_PRODUCTION_EXPONENTIAL_FACTOR, 
                    lvl
                ), 
				scale.exponential(
                    BUILDINGS_BASE_PRODUCTION, 
                    BUILDINGS_PRODUCTION_EXPONENTIAL_FACTOR, 
                    lvl
                ), 
				scale.exponential(
                    BUILDINGS_BASE_PRODUCTION, 
                    BUILDINGS_PRODUCTION_EXPONENTIAL_FACTOR, 
                    lvl
                ),
			),
            productionRate: 1,
        })
	},
	[BuildingType.OUTPOST]: {
		name: "Outpost",
		description: "Building used to claim territory. Can be replaced by another building.",
        maxLevel: 1,
		buildableTerrains: [TerrainType.WATER, TerrainType.MOUNTAIN, TerrainType.PLAIN, TerrainType.FOREST, TerrainType.DESERT],
		vision: BUILDINGS_DEFAULT_VISION,
		buildable: true,
        stats: (lvl) => ({
            imagePath: `outpost.png`,
            baseHealth: BUILDINGS_OUTPOST_BASE_HEALTH,
			resourcesToBuild: Resources.zero(),
			resourcesCapacityUpgrade: Resources.zero(), 
            production: Resources.zero(),
            productionRate: 0,
        })
	},
	[BuildingType.FARM]: {
		name: "Farm",
		description: "Produces food to feed your population.",
        maxLevel: 4,
		buildableTerrains: [TerrainType.PLAIN],
		vision: BUILDINGS_DEFAULT_VISION,
		buildable: true,
        stats: (lvl) => ({
            imagePath: `farm${lvl > 1 ? lvl - 1 : ""}.png`,
            baseHealth: scale.exponential(
                BUILDINGS_BASE_DEFAULT_HEALTH, 
                BUILDINGS_HEALTH_EXPONENTIAL_FACTOR, 
                lvl
            ),
			resourcesToBuild: Resources.from({ 
                workers: scale.exponential(
                    BUILDINGS_BASE_DEFAULT_COST, 
                    BUILDINGS_COST_EXPONENTIAL_FACTOR, 
                    lvl
                ) 
            }),            
			resourcesCapacityUpgrade: Resources.from({ 
                food: scale.linear(
                    BUILDINGS_BASE_DEFAULT_CAPACITY, 
                    BUILDINGS_CAPACITY_LINEAR_INCREMENT, 
                    lvl
                ) 
            }), 
            production: Resources.from({ 
                food: scale.exponential(
                    BUILDINGS_BASE_PRODUCTION, 
                    BUILDINGS_PRODUCTION_EXPONENTIAL_FACTOR, 
                    lvl
                ) 
            }),
            productionRate: 1,
        })
	},
	[BuildingType.FISHING_ZONE]: {
		name: "Fishing zone",
		description: "Produces food to feed your population.",
        maxLevel: 4,
		buildableTerrains: [TerrainType.WATER],
		vision: 1,
		buildable: true,
        stats: (lvl) => ({
            imagePath: `fishing_zone${lvl > 1 ? lvl - 1 : ""}.png`,
            baseHealth: scale.exponential(
                BUILDINGS_BASE_DEFAULT_HEALTH, 
                BUILDINGS_HEALTH_EXPONENTIAL_FACTOR, 
                lvl
            ),
			resourcesToBuild: Resources.from({ 
                workers: scale.exponential(
                    BUILDINGS_BASE_DEFAULT_COST, 
                    BUILDINGS_COST_EXPONENTIAL_FACTOR, 
                    lvl
                ) 
            }),            
			resourcesCapacityUpgrade: Resources.from({ 
                food: scale.linear(
                    BUILDINGS_BASE_DEFAULT_CAPACITY, 
                    BUILDINGS_CAPACITY_LINEAR_INCREMENT, 
                    lvl
                ) 
            }), 
            production: Resources.from({ 
                food: scale.exponential(
                    BUILDINGS_BASE_PRODUCTION, 
                    BUILDINGS_PRODUCTION_EXPONENTIAL_FACTOR, 
                    lvl
                ) 
            }),
            productionRate: 1,
        })
	},
	[BuildingType.MARKET]: {
		name: "Market",
		description: "Produce wealth in your empire.",
        maxLevel: 4,
		buildableTerrains: [TerrainType.PLAIN, TerrainType.FOREST],
		vision: 1,
		buildable: true,
        stats: (lvl) => ({
            imagePath: `market${lvl > 1 ? lvl - 1 : ""}.png`,
            baseHealth: scale.exponential(
                BUILDINGS_BASE_DEFAULT_HEALTH, 
                BUILDINGS_HEALTH_EXPONENTIAL_FACTOR, 
                lvl
            ),
			resourcesToBuild: Resources.from({ 
                workers: scale.exponential(
                    BUILDINGS_BASE_DEFAULT_COST, 
                    BUILDINGS_COST_EXPONENTIAL_FACTOR, 
                    lvl
                ),
                food: scale.exponential(
                    BUILDINGS_BASE_DEFAULT_COST, 
                    BUILDINGS_COST_EXPONENTIAL_FACTOR, 
                    lvl
                )
            }),            
			resourcesCapacityUpgrade: Resources.from({ 
                gold: scale.linear(
                    BUILDINGS_BASE_DEFAULT_CAPACITY, 
                    BUILDINGS_CAPACITY_LINEAR_INCREMENT, 
                    lvl
                ) 
            }), 
            production: Resources.from({ 
                gold: scale.exponential(
                    BUILDINGS_BASE_PRODUCTION, 
                    BUILDINGS_PRODUCTION_EXPONENTIAL_FACTOR, 
                    lvl
                ) 
            }),
            productionRate: 1,
        })
	},
	[BuildingType.MINE]: {
		name: "Mine",
		description: "Produce wealth in your empire.",
        maxLevel: 4,
		buildableTerrains: [TerrainType.MOUNTAIN, TerrainType.DESERT],
		vision: 1,
		buildable: true,
        stats: (lvl) => ({
            imagePath: `mine${lvl > 1 ? lvl - 1 : ""}.png`,
            baseHealth: scale.exponential(
                BUILDINGS_BASE_DEFAULT_HEALTH, 
                BUILDINGS_HEALTH_EXPONENTIAL_FACTOR, 
                lvl
            ),
			resourcesToBuild: Resources.from({ 
                workers: scale.exponential(
                    BUILDINGS_BASE_DEFAULT_COST, 
                    BUILDINGS_COST_EXPONENTIAL_FACTOR, 
                    lvl
                ),
                food: scale.exponential(
                    BUILDINGS_BASE_DEFAULT_COST, 
                    BUILDINGS_COST_EXPONENTIAL_FACTOR, 
                    lvl
                )
            }),            
			resourcesCapacityUpgrade: Resources.from({ 
                gold: scale.linear(
                    BUILDINGS_BASE_DEFAULT_CAPACITY, 
                    BUILDINGS_CAPACITY_LINEAR_INCREMENT, 
                    lvl
                ) 
            }), 
            production: Resources.from({ 
                gold: scale.exponential(
                    BUILDINGS_BASE_PRODUCTION, 
                    BUILDINGS_PRODUCTION_EXPONENTIAL_FACTOR, 
                    lvl
                ) 
            }),
            productionRate: 1,
        })
	},
	[BuildingType.LIBRARY]: {
		name: "Library",
		description: "Produce science to get discoveries.",
        maxLevel: 4,
		buildableTerrains: [TerrainType.PLAIN, TerrainType.DESERT, TerrainType.MOUNTAIN, TerrainType.FOREST],
		vision: 1,
		buildable: true,
        stats: (lvl) => ({
            imagePath: `library${lvl > 1 ? lvl - 1 : ""}.png`,
            baseHealth: scale.exponential(
                BUILDINGS_BASE_DEFAULT_HEALTH, 
                BUILDINGS_HEALTH_EXPONENTIAL_FACTOR, 
                lvl
            ),
			resourcesToBuild: Resources.from({ 
                gold: scale.exponential(
                    BUILDINGS_BASE_DEFAULT_COST, 
                    BUILDINGS_COST_EXPONENTIAL_FACTOR, 
                    lvl
                )
            }),  
			resourcesCapacityUpgrade: Resources.from({ 
                science: scale.linear(
                    BUILDINGS_BASE_DEFAULT_CAPACITY, 
                    BUILDINGS_CAPACITY_LINEAR_INCREMENT, 
                    lvl
                ) 
            }), 
            production: Resources.from({ 
                science: scale.exponential(
                    BUILDINGS_BASE_PRODUCTION, 
                    BUILDINGS_PRODUCTION_EXPONENTIAL_FACTOR, 
                    lvl
                ) 
            }),
            productionRate: 1,
        })
	},
	[BuildingType.BARRACKS]: {
		name: "Barracks",
		description: "To train your soldiers.",
        maxLevel: 4,
		buildableTerrains: [TerrainType.PLAIN, TerrainType.DESERT, TerrainType.MOUNTAIN, TerrainType.FOREST],
		vision: 1,
		buildable: true,
        stats: (lvl) => ({
            imagePath: `barracks${lvl > 1 ? lvl - 1 : ""}.png`,
            baseHealth: scale.exponential(
                BUILDINGS_BASE_DEFAULT_HEALTH, 
                BUILDINGS_HEALTH_EXPONENTIAL_FACTOR, 
                lvl
            ),
			resourcesToBuild: Resources.from({ 
                gold: scale.exponential(
                    BUILDINGS_BASE_DEFAULT_COST, 
                    BUILDINGS_COST_EXPONENTIAL_FACTOR, 
                    lvl
                )
            }),  
			resourcesCapacityUpgrade: Resources.from({ 
                soldiers: scale.linear(
                    BUILDINGS_BASE_DEFAULT_CAPACITY, 
                    BUILDINGS_CAPACITY_LINEAR_INCREMENT, 
                    lvl
                ) 
            }), 
            production: Resources.from({ 
                soldiers: scale.exponential(
                    BUILDINGS_BASE_PRODUCTION, 
                    BUILDINGS_PRODUCTION_EXPONENTIAL_FACTOR, 
                    lvl
                ) 
            }),
            productionRate: 1,
        })
	},
	[BuildingType.HOUSE]: {
		name: "House",
		description: "Adds workers to your empire.",
        maxLevel: 4,
		buildableTerrains: [TerrainType.PLAIN, TerrainType.DESERT, TerrainType.MOUNTAIN, TerrainType.FOREST],
		vision: 1,
		buildable: true,
        stats: (lvl) => ({
            imagePath: `house${lvl > 1 ? lvl - 1 : ""}.png`,
            baseHealth: scale.exponential(
                BUILDINGS_BASE_DEFAULT_HEALTH, 
                BUILDINGS_HEALTH_EXPONENTIAL_FACTOR, 
                lvl
            ),
			resourcesToBuild: Resources.from({ 
                food: scale.exponential(
                    BUILDINGS_BASE_DEFAULT_COST, 
                    BUILDINGS_COST_EXPONENTIAL_FACTOR, 
                    lvl
                )
            }),  
			resourcesCapacityUpgrade: Resources.from({ 
                workers: scale.linear(
                    BUILDINGS_BASE_DEFAULT_CAPACITY, 
                    BUILDINGS_CAPACITY_LINEAR_INCREMENT, 
                    lvl
                ) 
            }), 
            production: Resources.from({ 
                workers: scale.exponential(
                    BUILDINGS_BASE_PRODUCTION, 
                    BUILDINGS_PRODUCTION_EXPONENTIAL_FACTOR, 
                    lvl
                ) 
            }),
            productionRate: 1,
        })
	},
	[BuildingType.FORTIFICATIONS]: {
		name: "Fortifications",
		description: "A strong fortification to defend your ground.",
        maxLevel: 4,
		buildableTerrains: [TerrainType.MOUNTAIN, TerrainType.PLAIN, TerrainType.FOREST, TerrainType.DESERT],
		vision: 3,
		buildable: true,
        stats: (lvl) => ({
            imagePath: `fortifications${lvl > 1 ? lvl - 1 : ""}.png`,
            baseHealth: scale.exponential(
                BUILDINGS_FORTIFICATIONS_BASE_HEALTH, 
                BUILDINGS_HEALTH_EXPONENTIAL_FACTOR, 
                lvl
            ),			
            resourcesToBuild: Resources.from({ 
                gold: scale.exponential(
                    BUILDINGS_BASE_HIGH_COST, 
                    BUILDINGS_COST_EXPONENTIAL_FACTOR, 
                    lvl
                )
            }), 
			resourcesCapacityUpgrade: Resources.zero(), 
            production: Resources.zero(),
            productionRate: 0,
        })
	},
	[BuildingType.BARBARIAN_CAMP]: {
		name: "Barbarian Camp",
		description: "Ennemy barbarian camp.",
        maxLevel: 1,
		buildableTerrains: [TerrainType.MOUNTAIN, TerrainType.PLAIN, TerrainType.FOREST, TerrainType.DESERT],
		vision: 0,
		buildable: false,
        stats: (lvl) => ({
            imagePath: `barbarian_camp.png`,
            baseHealth: BUILDINGS_BARBARIAN_CAMPS_BASE_HEALTH,
			resourcesToBuild: Resources.zero(),
			resourcesCapacityUpgrade: Resources.from({ soldiers: 99999 }), 
            production: Resources.from({ soldiers: 99999 }),
            productionRate: 1,
        })
	},
};

export const BUILDING_STATS: Record<BuildingType, Record<number, BuildingDynamicStats & BuildingBlueprint>> = Object.freeze(    Object.fromEntries(
        Object.entries(BLUEPRINTS).map(([type, bp]) => [
            type,
            Object.fromEntries(
                Array.from({ length: bp.maxLevel }, (_, i) => [
                    i + 1, 
                    {
                        name: bp.name,
                        description: bp.description,
						maxLevel: bp.maxLevel,
                        buildableTerrains: bp.buildableTerrains,
                        vision: bp.vision,
                        buildable: bp.buildable,
                        ...bp.stats(i + 1) 
                    }
                ])
            )
        ])
	) as Record<BuildingType, Record<number, BuildingDynamicStats & BuildingBlueprint>>
);

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
export function getNextLevel(type: BuildingType, currentLevel: number): BuildingDynamicStats {
    const nextLevel = currentLevel + 1;
    const stats = BUILDING_STATS[type]?.[nextLevel];
    
    if (!stats) {
        throw new Error(`Level ${nextLevel} for building ${type} does not exist in registry.`);
    }
    
    return stats;
}

export function getSerializedBuildingsData() {
    return Object.fromEntries(
        Object.entries(BLUEPRINTS).map(([buildingType, bp]) => [
            buildingType,
            Object.fromEntries(
                Array.from({ length: bp.maxLevel }, (_, i) => {
                    const level = i + 1;
                    const stats = bp.stats(level);
                    
                    return [
                        level,
                        {
                            name: bp.name,
                            description: bp.description,
                            vision: bp.vision,
                            buildable: bp.buildable,
                            buildableTerrains: bp.buildableTerrains.map(t => TerrainType[t]),
                            ...stats,
                            resourcesToBuild: { ...stats.resourcesToBuild },
                            resourcesCapacityUpgrade: { ...stats.resourcesCapacityUpgrade },
                            production: { ...stats.production }
                        }
                    ];
                })
            )
        ])
    );
}
