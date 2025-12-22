/**
 * Enum for terrain types.
 */
export enum TerrainType {
    WATER,
    PLAIN,
    MONTAIN,
    FOREST,
    DESERT
}

export function getRandomTerrainType() {
    const values = Object.values(TerrainType).filter(v => typeof v === 'number');
    const randomIndex = Math.floor(Math.random() * values.length);
    return values[randomIndex] as TerrainType;
}