import type { BUILDING_STATS } from "../models/buildingData.js";
import { EventEmitter } from 'events';
import { CommandHandler } from "./commands/commandHandler.js";
import { PlaceBuildingCommand } from "./commands/placeBuildingCommand.js";
import { GameLoop } from "./gameLoop.js";
import { GameState } from "./gameState.js";
import type { Building } from "../models/building.js";
import type { Tile } from "../models/tile.js";

export class GameEngine extends EventEmitter {
    private state: GameState;
    private commandHandler: CommandHandler;
    private loop: GameLoop;
    
    constructor (state: GameState, commandHandler: CommandHandler) {
        super();
        this.state = state;
        this.commandHandler = commandHandler;
        this.loop = new GameLoop(this.update.bind(this), 1);
    }
    
    public start(): void {
        this.loop.start();
    }
    
    update(dt: number) {
        this.state.updatePlayersResources(dt);
        this.emit('resourcesUpdate');
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
    
    public getVisibleTileKeysForPlayer(playerId: string): Array<string> {
        return this.state.getMap().getAllTileIds();
    }
    
    public getVisibleBuildingsForPlayer(playerId: string): Array<Building> {
        const visibleTileIds = this.getVisibleTileKeysForPlayer(playerId);
        let buildings: Array<Building> = []
        visibleTileIds.forEach(tile => {
            buildings.push(this.state.getBuilding(tile))
        });
        return buildings;
    }
    
    public getPlayer(playerId: string) {
        return this.state.getPlayer(playerId);
    }
    
    setPlayerCapital(playerId: string, tileId: string) {
        if (!tileId) throw new Error('Tile cannot be null.');
        this.state.addBuilding(playerId, "CAPITAL", tileId);
        this.emit('buildingsUpdate');
    }

    getCapitalLocation(): string {
        return this.state.getMap().getRandomTileId();
    }    
}