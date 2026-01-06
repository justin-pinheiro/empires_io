import { Player } from "../models/player.js";
import { GameMap } from "../models/map.js";
import { Building } from "../models/building.js";
import { Civilisation } from "../models/civilisation.js";
import { BuildingType, getNextLevel } from "../models/buildingData.js";
import { Resources } from "../models/resources.js";
import { ScienceBonusType } from "../models/scienceBonus.js";

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
   this.processProduction(dt);
   this.processAutoRepair(dt);
  }

  private processProduction(dt: number): void {
    this.players.forEach(player => {
      const production = player.getCivilisation().getProduction(dt);
      player.getCivilisation().addToResources(production);
    })
  }
  
  private setProduction(playerId: string) {
    this.getPlayer(playerId)?.getCivilisation().resetProduction();
    const buildings = this.map.getAllBuildings();
    buildings.forEach(building => {
      if (building && !building.isDestroyed() && building.getOwnerId() === playerId) 
        {
          const owner = this.getPlayer(building.getOwnerId());
          if (owner) {
            const multiplier = owner.getCivilisation().getResearch().getMultiplier(ScienceBonusType.PRODUCTION)
            const production = building.calculateProduction(multiplier);
            owner.getCivilisation().updateProduction(production, 1);
          }
        }
      })
  }
  
  private setCapacity(playerId: string) {
    this.getPlayer(playerId)?.getCivilisation().resetCapacity();
    const buildings = this.map.getAllBuildings();
    buildings.forEach(building => {
      if (building && !building.isDestroyed() && building.getOwnerId() === playerId) 
        {
          const owner = this.getPlayer(building.getOwnerId());
          if (owner) {
            const storage = building.getCapacity();
            owner.getCivilisation().updateResourcesCapacity(storage, 1);
          }
        }
      })
  }
  
  private processAutoRepair(dt: number): void {
    const repairAmount = 1 * dt;
    this.map.getAllBuildings().forEach(building => {
      const playerMultiplier = this.getPlayer(building.getOwnerId())?.getCivilisation().getResearch().getMultiplier(ScienceBonusType.BUILDING_HP);
      building.repair(repairAmount * playerMultiplier!);
    });
  }
  
  public processScience(): string[] {
    const leveledUpIds: string[] = [];
    this.players.forEach((player, id) => {
      const hasLeveled = player.getCivilisation().hasProgressedToNextAge();
        if (hasLeveled) {
          leveledUpIds.push(id);
        }
      });
      
      return leveledUpIds;
    }
    
    // --- Building Management ---
    
    public addBuilding(playerId: string, type: BuildingType, tileId: string): void {
      const player = this.getPlayer(playerId);
      if (!player) throw new Error(`Player ${playerId} not found`);
      
      const building = new Building(type, playerId);
      const civ = player.getCivilisation();
      
      if (!civ.getResources().hasEnough(building.stats.resourcesToBuild)) {
          throw new Error("Insufficient resources to build");
      }
      
      civ.subtractFromResources(building.stats.resourcesToBuild);
      
      if (type === BuildingType.CAPITAL) {
        civ.addToResources(new Resources(
          civ.getResourcesCapacity().getFood(),
          civ.getResourcesCapacity().getGold(),
          0,
          civ.getResourcesCapacity().getSoldiers(),
          civ.getResourcesCapacity().getWorkers(),
        ));
      }

      this.map.setBuilding(tileId, building);
      this.map.setTileOwner(tileId, playerId);
      this.setCapacity(playerId);
      this.setProduction(playerId);
      
      this.map.getTile(tileId)?.getNeighbors().forEach(neighbor => {
        if (neighbor && this.map.getTile(neighbor)?.getOwnerId() === null) 
          this.map.getTile(neighbor)?.setOwnerId(playerId);
        if (neighbor && !this.map.getBuilding(neighbor))
          this.map.setBuilding(neighbor, new Building(BuildingType.OUTPOST, playerId));
      })

      // tower special ability
      const tower_bonus = 50
      if (building.type === BuildingType.FORTIFICATIONS) {
        this.map.getTile(tileId)?.getNeighbors().forEach(neighbor => {
          if (neighbor) {
            this.map.getBuilding(neighbor)?.addToMaxHealth(tower_bonus);
          }
        })
      }
    }
  
    public upgradeBuilding(tileId: string): void {      
      const building = this.map.getBuilding(tileId)!;
      const player = this.getPlayer(building?.getOwnerId())!;
      const civ = player.getCivilisation();
      
      const nextLevelCost = getNextLevel(building.type, building.getLevel()).resourcesToBuild;
		  civ.subtractFromResources(nextLevelCost);

      building.upgrade();
      this.setProduction(player.getId());
      this.setCapacity(player.getId());
    }
  
  
  public addBarbarianCamp(barbarianId: string, tileId: string): void {
    const player = this.getPlayer(barbarianId);
    if (!player) throw new Error(`Player ${barbarianId} not found`);
    
    const building = new Building(BuildingType.BARBARIAN_CAMP, barbarianId);
    this.map.setBuilding(tileId, building);
    this.map.removeTileOwner(tileId);
    this.map.setTileOwner(tileId, barbarianId);
  }
  
  playerDestroyedBuilding(tileId: string, attackerId: string) {
    
    const building = this.map.getBuilding(tileId);
    const tower_bonus = 50
      if (building && building.type === BuildingType.FORTIFICATIONS) {
        this.map.getTile(tileId)?.getNeighbors().forEach(neighbor => {
          if (neighbor) {
            this.map.getBuilding(neighbor)?.addToMaxHealth(tower_bonus);
          }
        })
      }
      
    this.removeBuilding(tileId);
    this.getMap().setTileOwner(tileId, attackerId);
      
    if (attackerId === "Barbarians")
      this.getMap().setBuilding(tileId, new Building(BuildingType.BARBARIAN_CAMP, attackerId));
    else
      this.getMap().setBuilding(tileId, new Building(BuildingType.OUTPOST, attackerId));
  }
  
  public removeBuilding(tileId: string): void {
    const building = this.map.getBuilding(tileId);
    if (!building) return;

    const player = this.getPlayer(building.getOwnerId());
    if (player) {
      this.setProduction(player.getId())
      this.setCapacity(player.getId())
      this.map.removeBuilding(tileId);
      this.getMap().setBuilding(tileId, new Building(BuildingType.OUTPOST, player?.getId()));
    }

  }

  // --- Player Management ---

  public addPlayer(playerId: string, name: string, hex_color: string): void {
    const civ = new Civilisation(`${name}'s Empire`);
    const player = new Player(playerId, name, civ, hex_color, false);
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