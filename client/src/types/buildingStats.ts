export interface BuildingStats {
    name: string;
    description: string;
    baseHealth: number;
    buildableTerrains: string[];
    resourcesCost: {
        food: number;
        gold: number;
        stone: number;
        science: number;
        army: number;
    };
    production: {
        food: number;
        gold: number;
        stone: number;
        science: number;
        army: number;
    };
    productionRate: number;
}