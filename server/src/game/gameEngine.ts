import { EventEmitter } from 'events';
import { BuildingType } from "../models/buildingData.js";
import { GameLoop } from "./gameLoop.js";
import { GameState } from "./gameState.js";
import { CommandHandler } from "../commands/commandHandler.js";
import { PlaceBuildingCommand } from "../commands/placeBuildingCommand.js";
import { AttackBuildingCommand } from "../commands/attackBuildingCommand.js";
import { BarbarianManager } from "./barbarianManager.js";
import Logger from "../config/logger.js";
import { Player } from '../models/player.js';
import type { Tile } from '../models/tile.js';
import { UpgradeBuildingCommand } from '../commands/upgradeBuildingCommand.js';
import { DeleteBuildingCommand } from '../commands/deleteBuildingCommand.js';
import { Resources } from '../models/resources.js';
import { PLAYER_COLORS } from '../config/constants.js';

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
    this.emit('buildingsUpdate');
  }
  
  public upgradeBuilding(playerId: string, tileId: any) {
    this.commandHandler.handleCommand(
      new UpgradeBuildingCommand(this.state, playerId, tileId)
    );
    this.emit('buildingsUpdate');
  }

  public deleteBuilding(playerId: string, tileId: any) {
    this.commandHandler.handleCommand(
      new DeleteBuildingCommand(this.state, playerId, tileId)
    );
    this.emit('buildingsUpdate');
  }

  public setStartingResources(playerId: string) {
    const civ = this.getPlayer(playerId)?.getCivilisation();
    civ?.addToResources(new Resources (
      civ.getCapacity().getFood(),
      civ.getCapacity().getGold(),
      0,
      civ.getCapacity().getSoldiers(),
      civ.getCapacity().getWorkers(),
    ))
  }
  

  // --- Visibility & Fog of War ---

  /**
   * Helper to get all unique Tile IDs visible to a specific player.
   */
  private getVisibleTileIdsForPlayer(playerId: string): Set<string> {
      const visibleTileIds = new Set<string>();
      const map = this.state.getMap();
      
      const playerTileIds = map.getAllTileIds().filter(tileId => {
        const building = map.getBuilding(tileId)
        if (building) return building.getOwnerId() === playerId;
        return false;
      });

      playerTileIds.forEach(id => {
          const building = map.getBuilding(id);
          const tile = map.getTile(id);
          
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
            const data = building.serialize();
            visibleBuildings[id] = data;
        }
    });

    return visibleBuildings;
  }

  // --- Player Logic ---

  public addPlayer(playerId: string, name: string, hex_color: string | null = null): void {
    if (!hex_color) {
      const colors = PLAYER_COLORS;
      const randomIndex = Math.floor(Math.random() * colors.length);
      hex_color = colors[randomIndex]!;
    }
    this.state.addPlayer(playerId, name, hex_color);
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
    const playerTileIds = this.state.getMap().getAllTileIds().filter(tileId => {
      return this.state.getMap().getBuilding(tileId) ? true : false;
    });
    let tiles: Array<Tile> = []
    playerTileIds.forEach(id => {
      const tile = this.state.getMap().getTile(id)
      if (tile) tiles.push(tile);
    });
    return this.state.getMap().getRandomTileIdFarFromCenterAndOtherPlayers(tiles)
  }

  public setPlayerCapital(playerId: string, tileId: string): void {
    if (!tileId) throw new Error('Capital tile ID is required.');
    this.state.addBuilding(playerId, BuildingType.CAPITAL, tileId);
  }
}
