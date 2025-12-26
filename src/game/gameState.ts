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
    
    public getMap() {
        return this.map;
    }
    
    public updatePlayersResources(dt: number) {
        const buildings = Object.values(this.map.getAllBuildings());
        
        buildings.forEach(building => {
            const production = building.getProduction(dt);
            const owner = building.ownerId;
            this.addResourcesToPlayer(owner, production);
        });
    }
    
    public repairBuildings(dt: number) {
        const buildings = Object.values(this.map.getAllBuildings());
        
        buildings.forEach(building => {
            building.repair(1)
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
        this.players[playerId]?.getCivilisation().getResources().substract(building.getResourcesCost());
        this.players[playerId]?.getCivilisation().updateArmyCapacity(building.getArmyCapacityUpgrade());
        this.players[playerId]?.getCivilisation().updateWorkingPopulation(building.getPopulationCost());
        this.players[playerId]?.getCivilisation().updatePopulationCapacity(building.getPopulationCapacityUpgrade());
    }

    getBuilding(tileId: string): any {
        return this.map.getBuilding(tileId);
    }
    
    public removeBuilding(tileId: string) {
        this.map.removeBuilding(tileId);
    }
    
    public addPlayer(playerId: string) {
        const playerCivilisation = new Civilisation("Civilisation of " + playerId)
        this.players[playerId] = new Player(playerId,`Player {id}`, playerCivilisation, `hsl(${Math.random() * 360}, 70%, 50%)`,false);
    }

    public getPlayer(playerId: string) {
        const player = this.players[playerId];
        return player;
    }
    
    public getPlayers() {
        return this.players;
    }

    public removePlayer(playerId: any) {
        delete this.players[playerId];
    }
}