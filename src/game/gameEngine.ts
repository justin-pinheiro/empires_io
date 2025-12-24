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
    
    addPlayer(id: string) {
        const playerCivilisation = new Civilisation(
            `Civilisation of {id}`
        )
        
        this.players[id] = new Player(
            id,
            `Player {id}`,
            playerCivilisation,
            `hsl(${Math.random() * 360}, 70%, 50%)`,
            false,
        )
    }
    
    removePlayer(id: string) {
        delete this.players[id];
    }
    
    addBuilding(playerId: string, building: Building, tileKey: string) {
        const player = this.players[playerId];
        
        if (!player) {
            return; // @TODO throw exception 
        }
        
        this.map.setTileBuilding(tileKey, building);
    }
    
    attackTile(id: string, tileKey: any, troopsCount: any) {
        throw new Error('Method not implemented.');
    }
    
    getVisibleTileKeysForPlayer(id: string): any {
        return this.map.getAllTilesAsObject();
    }

    setPlayerCapital(id: string) {
        const tileId = this.map.getRandomTileId();
        if (!tileId) {
            throw new Error('No tile available to set as capital');
        }

        this.addBuilding(
            id,
            new Building("CAPITAL"),
            tileId
        );
    }
}