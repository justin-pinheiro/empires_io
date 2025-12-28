import type { ResourceState } from "../hooks/useResources";
import type { BuildingType } from "./buildingType";

export interface Building {
    ownerId: string,
    type: BuildingType,
    name: string,
    description: string,
    health: { current: number, max: number },
    production: ResourceState,
    productionRate: number,
    isDestroyed: boolean,
}