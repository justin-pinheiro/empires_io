import { AGE_BASE_SCIENCE_COST, AGE_MAX } from "../config/constants.js";

export enum AgeType {
    MIN = 1,
    MAX = AGE_MAX
}

/**
 * Calculates science cost: doubles every age
 */
export function getRequiredScience(age: number): number {
    return AGE_BASE_SCIENCE_COST * Math.pow(2, age-1);
}

/**
 * Returns the next Age number or null if at max.
 */
export function getNextAge(currentAge: number): number | null {
    return currentAge < AgeType.MAX ? currentAge + 1 : null;
}

/**
 * If you still need the full data for the UI/Serialization
 */
export function getSerializedAgesData() {
    return Array.from({ length: AgeType.MAX }, (_, i) => {
        const age = i + 1;
        return {
            ageNumber: age,
            requiredScience: getRequiredScience(age)
        };
    });
}