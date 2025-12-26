import type { BUILDING_STATS } from "../models/buildingData.js";
import { CommandHandler } from "./commands/commandHandler.js";
import { PlaceBuildingCommand } from "./commands/placeBuildingCommand.js";
import { GameLoop } from "./gameLoop.js";
import { GameState } from "./gameState.js";

export class GameEngine {
    private state: GameState;
    private commandHandler: CommandHandler;
    private loop: GameLoop;
    
    constructor (state: GameState, commandHandler: CommandHandler) {
        this.state = state;
        this.commandHandler = commandHandler;
        this.loop = new GameLoop(this.update.bind(this), 1);
    }
    
    public start(): void {
        this.loop.start();
    }
    
    update(dt: number) {
        this.state.updatePlayersResources(dt);
    }
    
    public addPlayer(playerId: string) {
        this.state.addPlayer(playerId);
    }
    
    public removePlayer(playerId: string) {
        this.state.removePlayer(playerId);
    }
    
    public placeBuilding(playerId: string, buildingType: keyof typeof BUILDING_STATS, tileId: string) {
        this.commandHandler.handleCommand(
            new PlaceBuildingCommand(this.state, playerId, buildingType, tileId)
        );
    }
    
    public getVisibleTileKeysForPlayer(playerId: string): any {
        return this.state.getMap().getAllTilesAsObject();
    }
    
    public getPlayer(playerId: string) {
        return this.state.getPlayer(playerId);
    }
    
    setPlayerCapital(playerId: string, tileId: string) {
        if (!tileId) throw new Error('No tile available to set as capital');
        this.state.addBuilding(playerId, "CAPITAL", tileId);
    }

    getCapitalLocation(): string {
        return this.state.getMap().getRandomTileId();
    }    
}