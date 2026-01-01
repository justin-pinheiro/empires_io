import { GameState } from './gameState.js';
import { GameEngine } from './gameEngine.js';
import { BuildingType } from '../models/buildingData.js';
import Logger from '../utils/logger.js';
import { Resources } from '../models/resources.js';

export class BarbarianManager {
  private spawnAccumulator = 0;
  private attackAccumulator = 0;
  
  private activeCamps: Map<string, string> = new Map();
  
  private readonly playerId = 'Barbarians';
  private readonly playerName = 'Barbarians';

  private readonly BUILDINGS_PER_CAMP = 10; 
  private readonly SPAWN_INTERVAL = 60;     
  private readonly ATTACK_INTERVAL = 1;    
  private readonly ATTACK_POWER = 5;

  constructor(private state: GameState, private game: GameEngine) {
    if (!this.state.getPlayer(this.playerId)) {
      this.state.addPlayer(this.playerId, this.playerName, "#000000");
    }
  }

  public update(dt: number) {
    this.spawnAccumulator += dt;
    this.attackAccumulator += dt;

    if (this.spawnAccumulator >= this.SPAWN_INTERVAL) {
      this.spawnAccumulator = 0;
      this.spawnCampsIndependently();
    }

    if (this.attackAccumulator >= this.ATTACK_INTERVAL) {
      this.attackAccumulator = 0;
      this.performFocusedAttacks();
    }
  }

  private spawnCampsIndependently() {
    this.state.getPlayers().forEach((player, id) => {
      if (id === this.playerId) return;

      const allTiles = this.state.getMap().getAllTileIds();
      const playerBuildings = allTiles.filter(t => 
        this.state.getMap().getBuilding(t)?.getOwnerId() === id
      );

      const playerOutposts = playerBuildings.filter(t => 
        this.state.getMap().getBuilding(t)?.type === BuildingType.OUTPOST
      );

      const campsTargetingPlayer = Array.from(this.activeCamps.values()).filter(targetId => {
        return this.state.getMap().getBuilding(targetId)?.getOwnerId() === id;
      }).length;

      const targetCampCount = Math.floor(playerBuildings.length / this.BUILDINGS_PER_CAMP);
      const spawnsNeeded = Math.max(0, targetCampCount - campsTargetingPlayer);

      if (spawnsNeeded > 0 && playerOutposts.length > 0) {
        this.triggerRebellion(playerOutposts, id, spawnsNeeded);
      }
    });
  }

  private triggerRebellion(outpostCandidates: string[], targetPlayerId: string, count: number) {
    const available = [...outpostCandidates];
    
    for (let i = 0; i < count && available.length > 0; i++) {
      const idx = Math.floor(Math.random() * available.length);
      const tileId = available.splice(idx, 1)[0];

      if (tileId) {
        this.state.removeBuilding(tileId);
        // Use addBarbarianCamp to ensure territory transfer
        this.state.addBarbarianCamp(this.playerId, tileId);
  
        const targetId = this.findNeighboringPlayerBuilding(tileId, targetPlayerId);
        if (targetId) {
          this.activeCamps.set(tileId, targetId);
          Logger.info(`Rebellion: Outpost ${tileId} converted. Targeting ${targetId}`);
        }
      }
    }
  }

  private performFocusedAttacks() {
    for (const [campId, targetId] of this.activeCamps.entries()) {
      const camp = this.state.getMap().getBuilding(campId);
      
      if (!camp || camp.getOwnerId() !== this.playerId) {
        this.activeCamps.delete(campId);
        continue;
      }

      const targetBuilding = this.state.getMap().getBuilding(targetId);
      
      // If target is destroyed, convert it and find new targets
      if (!targetBuilding || targetBuilding.isDestroyed()) {
        const lastOwner = targetBuilding?.getOwnerId();
        this.spreadInfection(targetId, campId, lastOwner);
        continue;
      }

      // Attack Logic
      this.game.getPlayer(this.playerId)?.getCivilisation().addToResources(new Resources(0,0,0,this.ATTACK_POWER,0));
      this.game.getPlayer(this.playerId)?.getCivilisation().updateResourcesCapacity(new Resources(0,0,0,this.ATTACK_POWER,0), 1);
      this.game.attackBuilding(this.playerId, targetId, this.ATTACK_POWER);
    }
  }

  private spreadInfection(destroyedTileId: string, sourceCampId: string, targetPlayerId?: string) {
    Logger.info(`Target ${destroyedTileId} destroyed. Spreading infection...`);

    // 1. Transform the target tile into a Barbarian Camp FIRST
    this.state.removeBuilding(destroyedTileId);
    this.state.addBarbarianCamp(this.playerId, destroyedTileId);
    
    // 2. Original camp looks for a NEW target
    // Because destroyedTileId is now owned by Barbarians, findNeighboringPlayerBuilding will skip it
    const nextTargetForSource = this.findNeighboringPlayerBuilding(sourceCampId);
    if (nextTargetForSource) {
      this.activeCamps.set(sourceCampId, nextTargetForSource);
      Logger.debug(`Source camp ${sourceCampId} shifted focus to ${nextTargetForSource}`);
    } else {
      this.activeCamps.delete(sourceCampId); 
    }

    // 3. The NEW camp at the destroyed location looks for its own target
    const nextTargetForNewCamp = this.findNeighboringPlayerBuilding(destroyedTileId, targetPlayerId);
    if (nextTargetForNewCamp) {
      this.activeCamps.set(destroyedTileId, nextTargetForNewCamp);
      Logger.debug(`New camp ${destroyedTileId} focusing on ${nextTargetForNewCamp}`);
    }
  }

  private findNeighboringPlayerBuilding(tileId: string, preferredOwnerId?: string): string | null {
    const neighbors = this.state.getMap().getTile(tileId)?.getNeighbors();
    if (!neighbors) return null;

    for (const n of neighbors) {
      if (!n) continue;
      const b = this.state.getMap().getBuilding(n);
      
      // VALID TARGET CHECK: 
      // Must have a building AND not be owned by Barbarians
      if (b && b.getOwnerId() !== this.playerId) {
        if (!preferredOwnerId || b.getOwnerId() === preferredOwnerId) {
          return n;
        }
      }
    }
    return null;
  }
}