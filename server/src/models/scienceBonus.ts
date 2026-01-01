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
            description: "Increases army damage by 50%",
            upgrade: "+50%",
            bonusType: ScienceBonusType.ARMY,
            level: 1,
            multiplier: 1.5
        },
        2: {
            name: "Army II",
            description: "Increases army damage by 100%",
            upgrade: "+50% => +100%",
            bonusType: ScienceBonusType.ARMY,
            level: 2,
            multiplier: 2
        },
        3: {
            name: "Army III",
            description: "Increases army damage by 200%",
            upgrade: "+100% => +200%",
            bonusType: ScienceBonusType.ARMY,
            level: 3,
            multiplier: 3
        }
    },
    [ScienceBonusType.BUILDING_HP]: {
        1: {
            name: "Buildings I",
            description: "Building repair speed x2",
            upgrade: "x2",
            bonusType: ScienceBonusType.BUILDING_HP,
            level: 1,
            multiplier: 2
        },
        2: {
            name: "Buildings II",
            description: "Building repair speed x3",
            upgrade: "x2 => x3",
            bonusType: ScienceBonusType.BUILDING_HP,
            level: 2,
            multiplier: 3
        },
        3: {
            name: "Buildings III",
            description: "Building repair speed x4",
            upgrade: "x3 => x4",
            bonusType: ScienceBonusType.BUILDING_HP,
            level: 3,
            multiplier: 4
        }
    },
    [ScienceBonusType.PRODUCTION]: {
        1: {
            name: "Production I",
            description: "Increases production by 50%",
            upgrade: "+50%",
            bonusType: ScienceBonusType.PRODUCTION,
            level: 1,
            multiplier: 1.5
        },
        2: {
            name: "Production II",
            description: "Increases production by 100%",
            upgrade: "+50% => +100%",
            bonusType: ScienceBonusType.PRODUCTION,
            level: 2,
            multiplier: 2
        },
        3: {
            name: "Production III",
            description: "Increases production by 200%",
            upgrade: "+100% => +200%",
            bonusType: ScienceBonusType.PRODUCTION,
            level: 3,
            multiplier: 3
        }
    }
});

/**
 * Flattened helper for initial constant sync to client.
 */
export function getSerializedScienceData() {
    return { ...SCIENCE_BRANCHES };
}