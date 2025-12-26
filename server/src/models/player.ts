import { Civilisation } from "./civilisation.js";

export class Player {
    private id: string;
    private name: string;
    private civilisation: Civilisation;
    private color: string;
    private isNPC: boolean;

    constructor(
        id: string,
        name: string, 
        civilisation: Civilisation,
        color: string,
        isNPC: boolean
    ) {
        this.id = id;
        this.name = name;
        this.civilisation = civilisation;
        this.color = color;
        this.isNPC = isNPC;
    }

    getCivilisation() {
        return this.civilisation;
    }
}