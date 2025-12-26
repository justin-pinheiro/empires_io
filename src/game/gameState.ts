import { Player } from "../models/player.js";
import { Map } from "../models/map.js";
import { Resources } from "../models/resources.js";
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
    
    public updatePlayersResources(dt: number) {
        const buildings = Object.values(this.map.getAllBuildings());

        buildings.forEach(building => {
            if (building.hasSteadyProduction()) {
                const production = building.getProduction(dt);
                const owner = building.ownerId;
                this.addResourcesToPlayer(owner, production);
            }
        });
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
        const building = new Building(buildingType, playerId);
        this.map.setBuilding(tileId, building);
        if (!building.hasSteadyProduction()) {
            this.players[playerId]?.getCivilisation().getResources().add(building.getProduction(1));
        }
    }
    
    public removeBuilding(tileId: string) {
        this.map.removeBuilding(tileId);
    }
    
    public addPlayer(playerId: string) {
        const playerCivilisation = new Civilisation("Civilisation of " + playerId)
        this.players[playerId] = new Player(playerId,`Player {id}`, playerCivilisation, `hsl(${Math.random() * 360}, 70%, 50%)`,false);
    }

    public removePlayer(playerId: any) {
        delete this.players[playerId];
    }
}