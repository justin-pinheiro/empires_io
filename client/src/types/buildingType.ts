export const BuildingType = {
    CAPITAL: "CAPITAL",
    FARM: "FARM",
    HOUSE: "HOUSE",
    BARRACKS: "BARRACKS",
    LIBRARY: "LIBRARY",
    MARKET: "MARKET",
    MINE: "MINE",
    FORTIFICATIONS: "FORTIFICATIONS",
    BARBARIAN_CAMP: "BARBARIAN_CAMP",
} as const;

export type BuildingType = typeof BuildingType[keyof typeof BuildingType];