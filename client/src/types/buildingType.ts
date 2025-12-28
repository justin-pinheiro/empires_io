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
    FISHING_ZONE: "FISHING_ZONE",
    WATCH_TOWER: "OUTPOST",
} as const;

export type BuildingType = typeof BuildingType[keyof typeof BuildingType];