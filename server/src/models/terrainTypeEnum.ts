/**
 * Represents the physical characteristics of a map tile.
 */
export enum TerrainType {
    WATER,
    PLAIN,
    MOUNTAIN,
    FOREST,
    DESERT
}

export const TERRAIN_TYPE_VALUES = Object.values(TerrainType).filter(v => typeof v === "number") as TerrainType[];

export interface TerrainDefinition {
  readonly name: string;
  readonly color: string;
}

/**
 * Metadata registry for terrain types. 
 * Using `Readonly` and `Record` ensures type-safety and immutability.
 */
export const TERRAIN_DATA: Record<TerrainType, TerrainDefinition> = {
  [TerrainType.WATER]:    { name: "WATER",    color: "#3498db" },
  [TerrainType.PLAIN]:    { name: "PLAIN",    color: "#2ecc71" },
  [TerrainType.MOUNTAIN]: { name: "MOUNTAIN", color: "#95a5a6" },
  [TerrainType.FOREST]:   { name: "FOREST",   color: "#27ae60" },
  [TerrainType.DESERT]:   { name: "DESERT",   color: "#f1c40f" },
} as const;

/**
 * Returns a random TerrainType from the available enum members.
 */
export function getRandomTerrainType(): TerrainType {
  const randomIndex = Math.floor(Math.random() * TERRAIN_TYPE_VALUES.length);
  return TERRAIN_TYPE_VALUES[randomIndex]!;
}