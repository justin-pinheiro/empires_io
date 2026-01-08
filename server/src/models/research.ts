import { SCIENCE_BRANCHES, ScienceBonusType, type ScienceBonusData } from "./scienceBonus.js";

export class Research {
    private pendingUpgrades: number = 0;
    private levels: Map<ScienceBonusType, number> = new Map([
        [ScienceBonusType.ARMY, 0],
        [ScienceBonusType.BUILDING_HP, 0],
        [ScienceBonusType.PRODUCTION, 0]
    ]);

    public addUpgradePoint = () => this.pendingUpgrades++;
    public getPendingUpgrades = () => this.pendingUpgrades;
    public getLevel = (type: ScienceBonusType) => this.levels.get(type) ?? 0;

    /**
     * Returns the current multiplier for a specific bonus type.
     * If no upgrades have been researched (Level 0), returns 1.
     */
    public getMultiplier(type: ScienceBonusType): number {
        const lvl = this.getLevel(type);
        return SCIENCE_BRANCHES[type][lvl]?.multiplier ?? 1.0;
    }

    public getAvailableOptions(): ScienceBonusData[] {
        if (this.pendingUpgrades <= 0) return [];

        return (Object.values(ScienceBonusType) as ScienceBonusType[])
            .map(type => SCIENCE_BRANCHES[type][this.getLevel(type) + 1])
            .filter((bonus): bonus is ScienceBonusData => !!bonus);
    }

    public applyUpgrade(type: ScienceBonusType): boolean {
        const nextLevel = this.getLevel(type) + 1;
        const canUpgrade = this.pendingUpgrades > 0 && !!SCIENCE_BRANCHES[type][nextLevel];

        if (canUpgrade) {
            this.levels.set(type, nextLevel);
            this.pendingUpgrades--;
        }

        return canUpgrade;
    }
}