export interface ScienceBonusData {
    readonly name: string;
    readonly description: string;
    readonly upgrade: string;
    readonly bonusType: string;
    readonly level: number;
    readonly multiplier: number;
}

export interface ResearchChoiceState {
    options: ScienceBonusData[];
    pendingCount: number;
}