import type { BUILDING_STATS } from "../models/buildingData.js";
import { EventEmitter } from 'events';
import { CommandHandler } from "./commands/commandHandler.js";
import { PlaceBuildingCommand } from "./commands/placeBuildingCommand.js";
import { GameLoop } from "./gameLoop.js";
import { GameState } from "./gameState.js";
import type { Building } from "../models/building.js";
import type { Tile } from "../models/tile.js";
import { AttackBuildingCommand } from "./commands/attackBuildingCommand.js";
import { BarbarianManager } from "./barbarians/barbarianManager.js";
import Logger from "../utils/logger.js";

export class GameEngine extends EventEmitter {
    private state: GameState;
    private commandHandler: CommandHandler;
    private loop: GameLoop;
    private barbarianManager: BarbarianManager;
    
    constructor (state: GameState, commandHandler: CommandHandler) {
        super();
        this.state = state;
        this.commandHandler = commandHandler;
        this.loop = new GameLoop(this.update.bind(this), 1);
        this.barbarianManager = new BarbarianManager(this.state, this);
    }
    
    public start(): void {
        this.loop.start();
    }
    
    update(dt: number) {
        Logger.debug("Updating game")
        this.state.updatePlayersResources(dt);
        this.barbarianManager.update(dt);
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
    
    public attackBuilding(playerId: string, tileId: string, troopCount: number) {
        this.commandHandler.handleCommand(
            new AttackBuildingCommand(this.state, playerId, tileId, troopCount)
        );
    }
    
    public getVisibleTileKeysForPlayer(playerId: string): Array<string> {
        return this.state.getMap().getAllTileIds();
    }
    
    public getVisibleBuildingsForPlayer(playerId: string): Array<Building> {
        const visibleTileIds = this.getVisibleTileKeysForPlayer(playerId);
        let buildings: Array<Building> = []
        visibleTileIds.forEach(tile => {
            const building = this.state.getBuilding(tile)
            if (building) buildings.push(building)
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