import { SCIENCE_BRANCHES, ScienceBonusType, type ScienceBonusData } from "./scienceBonus.js";

export class Research {
    private pendingUpgrades: number = 0;
    private levels: Map<ScienceBonusType, number> = new Map([
        [ScienceBonusType.ARMY, 0],
        [ScienceBonusType.BUILDING_HP, 0],
        [ScienceBonusType.PRODUCTION, 0]
    ]);

    public addUpgradePoint(): void {
        this.pendingUpgrades++;
    }

    public getLevel(type: ScienceBonusType): number {
        return this.levels.get(type) || 0;
    }

    public getPendingUpgrades(): number {
        return this.pendingUpgrades;
    }

    /**
     * Returns the current multiplier for a specific bonus type.
     * If no upgrades have been researched (Level 0), returns 1.0.
     */
    public getMultiplier(type: ScienceBonusType): number {
        const currentLevel = this.levels.get(type) || 0;
        if (currentLevel === 0) { return 1.0;}

        const bonusData = SCIENCE_BRANCHES[type][currentLevel];
        return bonusData ? bonusData.multiplier : 1.0;
    }   

    public getAvailableOptions(): ScienceBonusData[] {
        if (this.pendingUpgrades <= 0) return [];

        const types = Object.values(ScienceBonusType) as ScienceBonusType[];

        return types
            .map(type => {
                const currentLevel = this.levels.get(type) || 0;
                const nextLevel = currentLevel + 1;
                return SCIENCE_BRANCHES[type][nextLevel];
            })
            .filter((v): v is ScienceBonusData => v !== undefined);
    }

    public applyUpgrade(type: ScienceBonusType): boolean {
        if (this.pendingUpgrades <= 0) return false;

        const currentLevel = this.levels.get(type) || 0;
        const nextLevel = currentLevel + 1;

        if (SCIENCE_BRANCHES[type][nextLevel]) {
            this.levels.set(type, nextLevel);
            this.pendingUpgrades--;
            return true;
        }

        return false;
    }
}