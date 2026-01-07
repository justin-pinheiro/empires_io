import type { Resources } from "./resources";

export interface BuildingStats {
    name: string;
    description: string;
    buildableTerrains: string[];
	vision: number;
    buildable: boolean;
    baseHealth: number;
    resourcesToBuild: Resources;
	resourcesCapacityUpgrade: Resources;
    production: Resources;
    productionRate: number;
}
