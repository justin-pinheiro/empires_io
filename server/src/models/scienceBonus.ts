export enum ScienceBonusType {
    ARMY = "ARMY",
    BUILDING_HP = "BUILDING_HP",
    PRODUCTION = "PRODUCTION"
}

export interface ScienceBonusData {
    readonly name: string;
    readonly description: string;
    readonly upgrade: string;
    readonly bonusType: ScienceBonusType;
    readonly level: number;
    readonly multiplier: number;
}

/**
 * Registry organized by Branch and Level.
 * This structure allows O(1) lookup: BRANCHES[type][nextLevel]
 */
export const SCIENCE_BRANCHES: Readonly<Record<ScienceBonusType, Record<number, ScienceBonusData>>> = Object.freeze({
    [ScienceBonusType.ARMY]: {
        1: {
            name: "Army I",
            description: "Increases army damage by 10%",
            upgrade: "+10%",
            bonusType: ScienceBonusType.ARMY,
            level: 1,
            multiplier: 1.10
        },
        2: {
            name: "Army II",
            description: "Increases army damage by 20%",
            upgrade: "+10% => +20%",
            bonusType: ScienceBonusType.ARMY,
            level: 2,
            multiplier: 1.20
        },
        3: {
            name: "Army III",
            description: "Increases army damage by 30%",
            upgrade: "+20% => +30%",
            bonusType: ScienceBonusType.ARMY,
            level: 3,
            multiplier: 1.30
        }
    },
    [ScienceBonusType.BUILDING_HP]: {
        1: {
            name: "Buildings I",
            description: "Increases buildings HP by 10%",
            upgrade: "+10%",
            bonusType: ScienceBonusType.BUILDING_HP,
            level: 1,
            multiplier: 1.10
        },
        2: {
            name: "Buildings II",
            description: "Increases buildings HP by 20%",
            upgrade: "+10% => +20%",
            bonusType: ScienceBonusType.BUILDING_HP,
            level: 2,
            multiplier: 1.20
        },
        3: {
            name: "Buildings III",
            description: "Increases buildings HP by 30%",
            upgrade: "+20% => +30%",
            bonusType: ScienceBonusType.BUILDING_HP,
            level: 3,
            multiplier: 1.30
        }
    },
    [ScienceBonusType.PRODUCTION]: {
        1: {
            name: "Production I",
            description: "Increases production by 10%",
            upgrade: "+10%",
            bonusType: ScienceBonusType.PRODUCTION,
            level: 1,
            multiplier: 1.10
        },
        2: {
            name: "Production II",
            description: "Increases production by 20%",
            upgrade: "+10% => +20%",
            bonusType: ScienceBonusType.PRODUCTION,
            level: 2,
            multiplier: 1.20
        },
        3: {
            name: "Production III",
            description: "Increases production by 30%",
            upgrade: "+20% => +30%",
            bonusType: ScienceBonusType.PRODUCTION,
            level: 3,
            multiplier: 1.30
        }
    }
});

/**
 * Flattened helper for initial constant sync to client.
 */
export function getSerializedScienceData() {
    return { ...SCIENCE_BRANCHES };
}