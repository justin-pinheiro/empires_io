import { Player } from '../models/player.js';
import { Civilisation } from '../models/civilisation.js';
import { Map } from '../models/map.js';
import { Building } from '../models/building.js';

import Logger from '../utils/logger.js';


export class GameEngine {
    private players : Record<string, Player>;
    private map : Map;
    
    constructor(mapSize: number) {
        this.players = {}
        this.map = new Map(mapSize);
    }
    
    addPlayer(playerId: string) {
        const playerCivilisation = new Civilisation(
            `Civilisation of {id}`
        )
        
        this.players[playerId] = new Player(
            playerId,
            `Player {id}`,
            playerCivilisation,
            `hsl(${Math.random() * 360}, 70%, 50%)`,
            false,
        )

        Logger.debug("Added player " + playerId + " to players. Player count: " + Object.keys(this.players).length);
    }
    
    removePlayer(id: string) {
        delete this.players[id];
    }
    
    addBuilding(playerId: string, buildingKey: string, tileKey: string) {
        const player = this.players[playerId];
        
        if (!player) {
            return; // @TODO throw exception 
        }

        const building = new Building(buildingKey, playerId);

        if (!this.canAddBuilding(playerId, building, tileKey)) {
            return;
        }
        
        this.map.setTileBuilding(tileKey, building);
        player.getCivilisation().addResources(building.getCost())
    }
    
    canAddBuilding(playerId: string, building: Building, tileKey: string) {
        // check if tile exists and has no building
        // check if one neighbor of tile is player 
        // check if player has enough resources and exists
        return true;
    }
    
    attackTile(id: string, tileKey: any, troopsCount: any) {
        throw new Error('Method not implemented.');
    }
    
    getVisibleTileKeysForPlayer(id: string): any {
        return this.map.getAllTilesAsObject();
    }

    setPlayerCapital(playerId: string) {
        const tileId = this.map.getRandomTileId();
        
        if (!tileId) {
            throw new Error('No tile available to set as capital');
        }

        this.addBuilding(playerId, "CAPITAL", tileId);

        Logger.debug("Generated capital for player " + playerId + " on tile " + tileId)
    }
}