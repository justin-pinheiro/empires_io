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
        civilisation: this.civilisation.serialize(),
        };
    }

    public toJSON() {
        return this.serialize();
    }
}