// types/attackStats.ts
export const ATTACK_ACTIONS = {
    SKIRMISH: {
        name: "Skirmish",
        description: "A quick raid to weaken defenses.",
        armyCost: 10,
        damage: 10
    },
    ASSAULT: {
        name: "Assault",
        description: "Battle using infantry.",
        armyCost: 50,
        damage: 50
    },
    SIEGE: {
        name: "Siege",
        description: "Long and slow fight using machinery.",
        armyCost: 100,
        damage: 100
    },
} as const;

export type AttackType = keyof typeof ATTACK_ACTIONS;