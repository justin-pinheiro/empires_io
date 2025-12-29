import type { BuildingType } from "./buildingType";
import type { Resources } from "./resources";

export interface Building {
    ownerId: string,
    type: BuildingType,
    name: string,
    description: string,
    health: { current: number, max: number },
    resourcesToMaintain: Resources,
    production: Resources,
    productionRate: number,
    isDestroyed: boolean
}