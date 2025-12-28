import { Player } from "../models/player.js";
import { GameMap } from "../models/map.js";
import { Building } from "../models/building.js";
import { Civilisation } from "../models/civilisation.js";
import type { BuildingType } from "../models/buildingData.js";

export class GameState {
  private players: Map<string, Player> = new Map();
  private map: GameMap;

  constructor(mapSize: number) {
    this.map = new GameMap(mapSize);
  }

  // --- Core Game Loop Methods ---

  /**
   * Processes production for all buildings based on elapsed time.
   */
  public update(dt: number): void {
    this.processEconomy(dt);
    this.processAutoRepair(dt);
  }

  private processEconomy(dt: number): void {
    const allBuildings = this.map.getAllBuildings();
    
    for (const building of allBuildings) {
      if (!building || building.isDestroyed()) continue;

      const owner = this.getPlayer(building.getOwnerId());
      if (owner) {
        const yieldGenerated = building.calculateYield(dt);
        owner.getCivilisation().addToResources(yieldGenerated);
      }
    }
  }

  private processAutoRepair(dt: number): void {
    const repairAmount = 1 * dt;
    this.map.getAllTileIds().forEach(id => {
      this.map.getBuilding(id)?.repair(repairAmount);
    });
  }

  // --- Building Management ---

  public addBuilding(playerId: string, type: BuildingType, tileId: string): void {
    const player = this.getPlayer(playerId);
    if (!player) throw new Error(`Player ${playerId} not found`);

    const building = new Building(type, playerId);
    const civ = player.getCivilisation();

    if (!civ.getResources().hasEnough(building.stats.resourcesCost)) {
      throw new Error("Insufficient resources");
    }

    civ.subtractFromResources(building.stats.resourcesCost);
    this.map.setBuilding(tileId, building);
    this.map.setTileOwner(tileId, playerId);
    this.map.setNeighboringTilesOwner(tileId, playerId);

    this.applyBuildingEffects(civ, building, 1);
  }

  public removeBuilding(tileId: string): void {
    const building = this.map.getBuilding(tileId);
    if (!building) return;

    const player = this.getPlayer(building.getOwnerId());
    if (player) {
      this.applyBuildingEffects(player.getCivilisation(), building, -1);
    }

    this.map.removeBuilding(tileId);
  }

  /**
   * Internal helper to toggle building bonuses on/off
   */
  private applyBuildingEffects(civ: Civilisation, building: Building, multiplier: number): void {
    const s = building.stats;
    civ.updateArmyCapacity(s.armyCapacityUpgrade * multiplier);
    civ.updateWorkingPopulation(s.populationCost * multiplier);
    civ.updatePopulationCapacity(s.populationCapacityUpgrade * multiplier);
  }

  // --- Player Management ---

  public addPlayer(playerId: string, name: string): void {
    const civ = new Civilisation(`${name}'s Empire`);
    const color = "#" + Math.floor(Math.random() * 16777215).toString(16).padStart(6, '0');
    const player = new Player(playerId, name, civ, color, false);
    this.players.set(playerId, player);
  }

  public removePlayer(playerId: string): void {
    const player = this.players.get(playerId);
    if (player) {
        this.players.delete(playerId);
    }
  }

  public getPlayer(playerId: string): Player | undefined {
    return this.players.get(playerId);
  }

  public getPlayers(): Map<string, Player> {
    return this.players;
  }

  public getMap(): GameMap {
    return this.map;
  }
}