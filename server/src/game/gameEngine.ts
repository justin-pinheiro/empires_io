import { EventEmitter } from 'events';
import { BUILDING_STATS, BuildingType } from "../models/buildingData.js";
import { GameLoop } from "./gameLoop.js";
import { GameState } from "./gameState.js";
import { CommandHandler } from "./commands/commandHandler.js";
import { PlaceBuildingCommand } from "./commands/placeBuildingCommand.js";
import { AttackBuildingCommand } from "./commands/attackBuildingCommand.js";
import { BarbarianManager } from "./barbarianManager.js";
import Logger from "../utils/logger.js";
import type { Player } from '../models/player.js';
import type { Tile } from '../models/tile.js';

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
    this.loop = new GameLoop((dt) => this.update(dt), 1);
    this.barbarianManager = new BarbarianManager(this.state, this);
  }

  public start(): void {
    Logger.info("Game Engine Starting...");
    this.loop.start();
  }

  private update(dt: number): void {    
    this.state.update(dt);
    const agedUpPlayerIds = this.state.processScience();
    agedUpPlayerIds.forEach(playerId => {
        const player = this.state.getPlayer(playerId);
        if (player) {
            this.emit('ageIncrease', playerId, player.getCivilisation().getAge());
        }
    });
    this.barbarianManager.update(dt);
    this.emit('resourcesUpdate');
    this.emit('buildingsUpdate');
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

  /**
   * Helper to get all unique Tile IDs visible to a specific player.
   */
  private getVisibleTileIdsForPlayer(playerId: string): Set<string> {
      const visibleTileIds = new Set<string>();
      const map = this.state.getMap();
      
      const playerBuildings = map.getAllBuildingTiles().filter(tileId => {
          return map.getBuilding(tileId)?.getOwnerId() === playerId;
      });

      playerBuildings.forEach(tileId => {
          const building = map.getBuilding(tileId);
          const tile = map.getTile(tileId);
          
          if (building && tile) {
              const visionRange = building.stats.vision || 1;
              const seenIds = map.getTileIdsInRange(tile, visionRange);
              seenIds.forEach(id => visibleTileIds.add(id));
          }
      });

      return visibleTileIds;
  }

  /**
   * Returns only the tiles the player can currently see.
   */
  public getVisibleTilesForPlayer(playerId: string) {
      const visibleIds = this.getVisibleTileIdsForPlayer(playerId);
      const map = this.state.getMap();

      return Array.from(visibleIds)
          .map(id => map.getTile(id)?.serialize())
          .filter(Boolean);
  }

  /**
   * Returns only the buildings located on tiles the player can see.
   */
  public getVisibleBuildingsForPlayer(playerId: string): Record<string, any> {
      const visibleIds = this.getVisibleTileIdsForPlayer(playerId);
      const visibleBuildings: Record<string, any> = {};
      const map = this.state.getMap();

      visibleIds.forEach(id => {
          const building = map.getBuilding(id);
          if (building) {
              visibleBuildings[id] = building.serialize();
          }
      });

      return visibleBuildings;
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

  public getPlayers(): Map<string, Player> {
    return this.state.getPlayers();
  }

  public getRandomStartingTile() {
    const playerTileIds = this.state.getMap().getAllBuildingTiles();
    let tiles: Array<Tile> = []
    playerTileIds.forEach(id => {
      const tile = this.state.getMap().getTile(id)
      if (tile) tiles.push(tile);
    });
    return this.state.getMap().getRandomTileIdFarFromCenterAndOtherPlayers(tiles)
  }

  public setPlayerCapital(playerId: string, tileId: string): void {
    if (!tileId) throw new Error('Capital tile ID is required.');
    
    // Bypass command handler for initial setup if necessary, 
    // or use a command for consistency.
    this.state.addBuilding(playerId, BuildingType.CAPITAL, tileId);
    this.emit('buildingsUpdate');
  }

  public removePlayerBuildings(playerId: string) {
    const buildingTilesIds = this.state.getMap().getAllBuildingTiles();
    buildingTilesIds.forEach(tileId => {
      if (this.state.getMap().getBuilding(tileId)?.getOwnerId() === playerId) {
        this.state.removeBuilding(tileId);
      }
    })
  }
  
  public removePlayerTilesOwnership(playerId: string) {
    const tilesIds = this.state.getMap().getAllTileIds();
    tilesIds.forEach(tileId => {
      if (this.state.getMap().getTile(tileId)?.getOwnerId() === playerId) {
        this.state.getMap().removeTileOwner(tileId);
      }
    })
  }
}
