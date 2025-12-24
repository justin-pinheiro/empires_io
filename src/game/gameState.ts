import { Player } from "../models/player.js";
import { Map } from "../models/map.js";
import type { Resources } from "../models/resources.js";
import { Building } from "../models/building.js";
import { Civilisation } from "../models/civilisation.js";

export class GameState {
    private players : Record<string, Player>;
    private map : Map;
    
    constructor(mapSize: number) {
        this.players = {}
        this.map = new Map(mapSize);
    }
    
    public getPlayer(playerId: string) {
        const player = this.players[playerId];
        return player;
    }
    
    public getMap() {
        return this.map;
    }
    
    public addResourcesToPlayer(playerId: string, amount: Resources) {
        const player = this.players[playerId];
        player?.getCivilisation().getResources().add(amount);
    }
    
    public substractResourcesToPlayer(playerId: string, amount: Resources) {
        const player = this.players[playerId];
        player?.getCivilisation().getResources().substract(amount);
    }
    
    public addBuilding(playerId: string, buildingType: string, tileId: string) {
        const building = new Building(tileId, playerId);
        this.map.setTileBuilding(tileId, building);
    }
    
    addPlayer(playerId: string) {
        const playerCivilisation = new Civilisation("Civilisation of " + playerId)
        this.players[playerId] = new Player(playerId,`Player {id}`, playerCivilisation, `hsl(${Math.random() * 360}, 70%, 50%)`,false);
    }

    removePlayer(playerId: any) {
        delete this.players[playerId];
    }
}