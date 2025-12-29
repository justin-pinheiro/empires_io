export enum AgeType {
    AGE_1 = 1,
    AGE_2 = 2,
    AGE_3 = 3,
    AGE_4 = 4,
    AGE_5 = 5,
    AGE_6 = 6,
    AGE_7 = 7,
    AGE_8 = 8,
    AGE_9 = 9,
    AGE_10 = 10
}

export interface AgeStats {
    readonly ageNumber: number,
    readonly requiredScience: number;
}

export const AGES_DATA: Readonly<Record<AgeType, AgeStats>> = Object.freeze({
    [AgeType.AGE_1]: {
        ageNumber: 1,
        requiredScience: 50,
    },
    [AgeType.AGE_2]: {
        ageNumber: 2,
        requiredScience: 100,
    },
    [AgeType.AGE_3]: {
        ageNumber: 3,
        requiredScience: 200,
    },
    [AgeType.AGE_4]: {
        ageNumber: 4,
        requiredScience: 400,
    },
    [AgeType.AGE_5]: {
        ageNumber: 5,
        requiredScience: 800,
    },
    [AgeType.AGE_6]: {
        ageNumber: 6,
        requiredScience: 1600,
    },
    [AgeType.AGE_7]: {
        ageNumber: 7,
        requiredScience: 3200,
    },
    [AgeType.AGE_8]: {
        ageNumber: 8,
        requiredScience: 6400,
    },
    [AgeType.AGE_9]: {
        ageNumber: 9,
        requiredScience: 12800,
    },
    [AgeType.AGE_10]: {
        ageNumber: 10,
        requiredScience: 25600,
    },
})

export function getSerializedAgesData() {
    const buildableStatsReadable = Object.fromEntries(
        Object.entries(AGES_DATA).map(([key, stats]) => [
            key, stats
        ])
    );
    return buildableStatsReadable;
}

/**
 * Returns the next AgeType based on the current age number.
 * Returns null if the player is already at max age.
 */
export function getNextAge(currentAgeNumber: number): AgeType | null {
    const nextAgeNumber = currentAgeNumber + 1;
    if (nextAgeNumber in AgeType) {
        return nextAgeNumber as AgeType;
    }

    return null;
}
