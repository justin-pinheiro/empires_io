import type { BUILDING_STATS } from "../models/buildingData.js";
import { CommandHandler } from "./commands/commandHandler.js";
import { PlaceBuildingCommand } from "./commands/placeBuildingCommand.js";
import { GameState } from "./gameState.js";

export class GameEngine {    
    private gameState: GameState;
    private commandHandler: CommandHandler;

    constructor (mapSize: number) {
        this.gameState = new GameState(mapSize);
        this.commandHandler = new CommandHandler();
    }
    
    public addPlayer(playerId: string) {
        this.gameState.addPlayer(playerId);
    }
    
    public removePlayer(playerId: string) {
        this.gameState.removePlayer(playerId);
    }
        
    public placeBuilding(playerId: string, buildingType: keyof typeof BUILDING_STATS, tileId: string) {
        this.commandHandler.handleCommand(
            new PlaceBuildingCommand(this.gameState, playerId, buildingType, tileId)
        );
    }

    public getVisibleTileKeysForPlayer(playerId: string): any {
        return this.gameState.getMap().getAllTilesAsObject();
    }

    setPlayerCapital(playerId: string) {
        const tileId = this.gameState.getMap().getRandomTileId();
        if (!tileId) throw new Error('No tile available to set as capital');
        this.gameState.addBuilding(playerId, "CAPITAL", tileId);
    }
}