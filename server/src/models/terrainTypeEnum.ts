import { serialize } from "node:v8";

/**
 * Enum for terrain types.
 */
export enum TerrainType {
    WATER,
    PLAIN,
    MOUNTAIN,
    FOREST,
    DESERT
}

export interface TerrainDefinition {
    name: string;
    color: string;
}

export const TERRAIN_DATA: Record<TerrainType, TerrainDefinition> = {
    [TerrainType.WATER]:    { name: "Water",    color: "#3498db" },
    [TerrainType.PLAIN]:    { name: "Plain",    color: "#2ecc71" },
    [TerrainType.MOUNTAIN]: { name: "Mountain", color: "#95a5a6" },
    [TerrainType.FOREST]:   { name: "Forest",   color: "#27ae60" },
    [TerrainType.DESERT]:   { name: "Desert",   color: "#f1c40f" },
};

export function getRandomTerrainType() {
    const values = Object.values(TerrainType).filter(v => typeof v === 'number');
    const randomIndex = Math.floor(Math.random() * values.length);
    return values[randomIndex] as TerrainType;
}