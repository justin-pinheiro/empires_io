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

export const TERRAIN_TYPE_VALUES = Object.values(TerrainType) as TerrainType[];

export interface TerrainDefinition {
  readonly name: string;
  readonly color: string;
}

/**
 * Metadata registry for terrain types. 
 * Using `Readonly` and `Record` ensures type-safety and immutability.
 */
export const TERRAIN_DATA: Record<TerrainType, TerrainDefinition> = {
  [TerrainType.WATER]:    { name: "Water",    color: "#3498db" },
  [TerrainType.PLAIN]:    { name: "Plain",    color: "#2ecc71" },
  [TerrainType.MOUNTAIN]: { name: "Mountain", color: "#95a5a6" },
  [TerrainType.FOREST]:   { name: "Forest",   color: "#27ae60" },
  [TerrainType.DESERT]:   { name: "Desert",   color: "#f1c40f" },
} as const;

/**
 * Returns a random TerrainType from the available enum members.
 */
export function getRandomTerrainType(): TerrainType {
  const randomIndex = Math.floor(Math.random() * TERRAIN_TYPE_VALUES.length);
  const randomType = TERRAIN_TYPE_VALUES[randomIndex];
  return randomType as TerrainType;
}