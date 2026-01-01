// types/attackStats.ts
export const ATTACK_ACTIONS = {
    ATTACK_1: {
        name: "Skirmish",
        description: "A quick raid to weaken defenses.",
        soldiersCost: 10,
    },
    ATTACK_2: {
        name: "Assault",
        description: "Battle using infantry.",
        soldiersCost: 50,
    },
    ATTACK_3: {
        name: "Siege",
        description: "Long and slow fight using machinery.",
        soldiersCost: 100
    },
    ATTACK_4: {
        name: "Assault",
        description: "Battle using infantry.",
        soldiersCost: 200
    },
    ATTACK_5: {
        name: "Assault",
        description: "Battle using infantry.",
        soldiersCost: 500
    },
    ATTACK_6: {
        name: "Assault",
        description: "Battle using infantry.",
        soldiersCost: 1000
    },
} as const;

export type AttackType = keyof typeof ATTACK_ACTIONS;