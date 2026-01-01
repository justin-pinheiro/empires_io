import { Civilisation } from "./civilisation.js";

/**
 * Represents a human or AI entity in the game world.
 */
export class Player {
    constructor(
        private readonly id: string,
        private readonly name: string,
        private readonly civilisation: Civilisation,
        private readonly color: string,
        private readonly isNPC: boolean = false
    ) {
        this.validateColor(color);
    }

    // --- Getters ---
    public getId() { return this.id; }
    public getName() { return this.name; }
    public getCivilisation() { return this.civilisation; }
    public getColor() { return this.color; }
    public getIsNPC() { return this.isNPC; }

    // --- Validation ---
    private validateColor(color: string) {
        const hexRegex = /^#([A-Fa-f0-9]{6}|[A-Fa-f0-9]{3})$/;
        if (!hexRegex.test(color)) {
        throw new Error(`Invalid color format: ${color}. Expected Hex code.`);
        }
    }

    /**
     * Serializes the player state.
     * This nests the civilisation's own serialization logic.
     */
    public serialize() {
        return {
        id: this.id,
        name: this.name,
        color: this.color,
        isNPC: this.isNPC,
        civilisationName: this.civilisation.getName(),
        };
    }

    public toJSON() {
        return this.serialize();
    }

    public static getColors() {
        return [
            "#C0392B",
            "#E67E22",
            "#E74C3C",
            "#A04000",
            "#D4AC0D",
            "#B7950B",
            "#F1C40F",
            "#9A7D0A",
            "#27AE60",
            "#1E8449",
            "#138D75",
            "#145A32",
            "#2980B9",
            "#1F618D",
            "#154360",
            "#2471A3",
            "#8E44AD",
            "#7D3C98",
            "#9B59B6",
            "#A569BD",
        ]
    }
}