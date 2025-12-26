import { EventEmitter } from 'events';
import { BuildingType } from "../models/buildingData.js";
import { GameLoop } from "./gameLoop.js";
import { GameState } from "./gameState.js";
import { CommandHandler } from "./commands/commandHandler.js";
import { PlaceBuildingCommand } from "./commands/placeBuildingCommand.js";
import { AttackBuildingCommand } from "./commands/attackBuildingCommand.js";
import { BarbarianManager } from "./barbarianManager.js";
import Logger from "../utils/logger.js";
import type { Player } from '../models/player.js';

/**
 * The GameEngine coordinates the state, the loop, and external commands.
 */
export class GameEngine extends EventEmitter {
  private loop: GameLoop;
  private barbarianManager: BarbarianManager;

  constructor(
    private readonly state: GameState, 
    private readonly commandHandler: CommandHandler
  ) {
    super();
    // Using 1 second as the tick rate for production/logic
    this.loop = new GameLoop((dt) => this.update(dt), 1);
    this.barbarianManager = new BarbarianManager(this.state, this);
  }

  public start(): void {
    Logger.info("Game Engine Starting...");
    this.loop.start();
  }

  private update(dt: number): void {
    Logger.debug(`Engine Update | dt: ${dt.toFixed(3)}s`);
    
    this.state.update(dt);
    this.barbarianManager.update(dt);

    // Broadcast changes to the Socket/Network layer
    this.emit('resourcesUpdate');
    this.emit('gameStateUpdate'); 
  }

  // --- Command Interface ---

  public placeBuilding(playerId: string, type: BuildingType, tileId: string): void {
    this.commandHandler.handleCommand(
      new PlaceBuildingCommand(this.state, playerId, type, tileId)
    );
    this.emit('buildingsUpdate');
  }

  public attackBuilding(playerId: string, tileId: string, troopCount: number): void {
    this.commandHandler.handleCommand(
      new AttackBuildingCommand(this.state, playerId, tileId, troopCount)
    );
  }

  // --- Visibility & Fog of War ---

  public getVisibleTilesForPlayer(playerId: string) {
    // Currently returns all tiles, but structured for future Fog of War logic
    const allTileIds = this.state.getMap().getAllTileIds();
    return allTileIds
      .map(id => this.state.getMap().getTile(id)?.serialize())
      .filter(Boolean);
  }

  public getVisibleBuildingsForPlayer(playerId: string) {
    const allTileIds = this.state.getMap().getAllTileIds();
    return allTileIds
      .map(id => this.state.getMap().getBuilding(id))
      .filter(Boolean);
  }

  // --- Player Logic ---

  public addPlayer(playerId: string, name: string): void {
    this.state.addPlayer(playerId, name);
    Logger.info(`Player added: ${name} (${playerId})`);
  }

  public removePlayer(playerId: string): void {
    this.state.removePlayer(playerId);
    Logger.info(`Player removed: (${playerId})`);
  }

  public getPlayer(playerId: string): Player | undefined {
    return this.state.getPlayer(playerId);
  }


  public setPlayerCapital(playerId: string, tileId: string): void {
    if (!tileId) throw new Error('Capital tile ID is required.');
    
    // Bypass command handler for initial setup if necessary, 
    // or use a command for consistency.
    this.state.addBuilding(playerId, BuildingType.CAPITAL, tileId);
    this.emit('buildingsUpdate');
  }
}