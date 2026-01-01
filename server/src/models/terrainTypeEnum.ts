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
  [TerrainType.WATER]:    { name: "WATER",    color: "#bde0fe" },
  [TerrainType.PLAIN]:    { name: "PLAIN",    color: "#C5D89D" },
  [TerrainType.MOUNTAIN]: { name: "MOUNTAIN", color: "#d4a373" },
  [TerrainType.FOREST]:   { name: "FOREST",   color: "#89986D" },
  [TerrainType.DESERT]:   { name: "DESERT",   color: "#F6F0D7" },
} as const;

/**
 * Returns a random TerrainType from the available enum members.
 */
export function getRandomTerrainType(): TerrainType {
  const randomIndex = Math.floor(Math.random() * TERRAIN_TYPE_VALUES.length);
  return TERRAIN_TYPE_VALUES[randomIndex]!;
}