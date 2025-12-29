import type { Resources } from "./resources";

export interface BuildingStats {
    name: string;
    description: string;
    baseHealth: number;
    buildableTerrains: string[];
    resourcesToBuild: Resources;
    resourcesToMaintain: Resources;
	resourcesCapacityUpgrade: Resources;
    production: Resources;
    productionRate: number;
	vision: number;
    buildable: boolean;
}