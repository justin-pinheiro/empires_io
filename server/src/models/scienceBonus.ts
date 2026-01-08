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

const BRANCH_CONFIGS: Record<ScienceBonusType, { label: string, baseMultiplier: (lvl: number) => number, desc: (lvl: number) => string }> = {
    [ScienceBonusType.ARMY]: {
        label: "Army",
        baseMultiplier: (lvl) => 1 + (0.5 * Math.pow(2, lvl-1)),
        desc: (lvl) => `Increases soldiers damage by ${((1 + (0.5 * Math.pow(2, lvl-1))) - 1) * 100}%`
    },
    [ScienceBonusType.BUILDING_HP]: {
        label: "Buildings",
        baseMultiplier: (lvl) => lvl + 1,
        desc: (lvl) => `Building repair speed x${lvl + 1}`
    },
    [ScienceBonusType.PRODUCTION]: {
        label: "Production",
        baseMultiplier: (lvl) => 1 + (0.5 * Math.pow(2, lvl-1)),
        desc: (lvl) => `Increases all buildings production by ${((1 + (0.5 * Math.pow(2, lvl-1))) - 1) * 100}%`
    }
};

export const SCIENCE_BRANCHES: Record<ScienceBonusType, Record<number, ScienceBonusData>> = Object.freeze(
    Object.fromEntries(
        Object.entries(BRANCH_CONFIGS).map(([type, config]) => {
            const levels = Object.fromEntries([1, 2, 3].map(lvl => {
                const mult = config.baseMultiplier(lvl);
                const prevMult = lvl > 1 ? config.baseMultiplier(lvl - 1) : null;
                
                const data: ScienceBonusData = {
                    name: `${config.label} ${"I".repeat(lvl)}`,
                    description: config.desc(lvl),
                    upgrade: prevMult ? `x${prevMult} => x${mult}` : `x${mult}`,
                    bonusType: type as ScienceBonusType,
                    level: lvl,
                    multiplier: mult
                };
                return [lvl, data];
            }));
            return [type, levels];
        })
    )
) as any;

export function getSerializedScienceData() {
    return SCIENCE_BRANCHES;
}