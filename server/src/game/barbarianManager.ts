import { GameState } from './gameState.js';
import { GameEngine } from './gameEngine.js';
import { Resources } from '../models/resources.js';
import { BARBARIAN_ATTACK_INTERVAL_SECONDS, BARBARIAN_BASE_SPAWN_COUNT, BARBARIAN_POP_PER_CAMP, BARBARIAN_SPAWN_INTERVAL_SECONDS, BARBARIAN_TROOPS_PER_CAMP } from '../utils/constants.js';
import { BuildingType } from '../models/buildingData.js';

export class BarbarianManager {
  private spawnAccumulator = 0;
  private attackAccumulator = 0;
  private campTileIds: Set<string> = new Set();
  private readonly playerId = 'Barbarians';
  private readonly playerName = 'Barbarians';

  constructor(private state: GameState, private game: GameEngine) {
    if (!this.state.getPlayer(this.playerId)) {
      this.state.addPlayer(this.playerId, this.playerName);
    }
  }

  public update(dt: number) {
    this.spawnAccumulator += dt;
    this.attackAccumulator += dt;

    if (this.spawnAccumulator >= BARBARIAN_SPAWN_INTERVAL_SECONDS) {
      this.spawnAccumulator = 0;
      this.spawnCamps();
    }

    if (this.attackAccumulator >= BARBARIAN_ATTACK_INTERVAL_SECONDS) {
      this.attackAccumulator = 0;
      this.performAttacks();
    }
  }

  private spawnCamps() {
    const players = Object.keys(this.state.getPlayers()).filter(id => id !== this.playerId);
    if (players.length === 0) return;

    let totalAdditional = 0;
    for (const id of players) {
      const civ = this.state.getPlayer(id)?.getCivilisation();
      if (civ) {
        totalAdditional += Math.floor(civ.getPopulationCapacity() / BARBARIAN_POP_PER_CAMP);
      }
    }

    const totalSpawns = BARBARIAN_BASE_SPAWN_COUNT + totalAdditional;

    this.state.getPlayer(this.playerId)?.getCivilisation().addToResources(new Resources(0, 0, 0, 0, totalSpawns * BARBARIAN_TROOPS_PER_CAMP));

    for (const id of players) {
      const tileKeys = this.state.getMap().getAllTileIds();
      const playerOwnedBuildings = tileKeys.filter(t => this.state.getMap().getBuilding(t)?.getOwnerId() === id);
      const neighborCandidates = new Set<string>();
      playerOwnedBuildings.forEach(t => {
        const neighbors = this.state.getMap().getTile(t)?.getNeighbors();
        if (neighbors) {
          neighbors.forEach(n => {
            if (!this.state.getMap().getBuilding(n)) neighborCandidates.add(n);
          });
        }
      });

      const candidates = Array.from(neighborCandidates);
      if (candidates.length === 0) continue;

      const numToSpawn = Math.max(1, Math.floor(totalSpawns / players.length));
      for (let i = 0; i < numToSpawn; i++) {
        const idx = Math.floor(Math.random() * candidates.length);
        const tileId = candidates[idx];
        if (tileId && !this.state.getMap().getBuilding(tileId)) {
          this.state.addBuilding(this.playerId, BuildingType.BARBARIAN_CAMP, tileId);
          this.campTileIds.add(tileId);
        }
      }
    }
  }

  private performAttacks() {
    for (const tileId of Array.from(this.campTileIds)) {
      const neighbors = this.state.getMap().getTile(tileId)?.getNeighbors();
      if (neighbors) {
        const possibleTargets = neighbors.filter(n => {
          const b = this.state.getMap().getBuilding(n);
          return b && b.getOwnerId() !== this.playerId;
        });

        if (possibleTargets.length === 0) continue;
  
        const target = possibleTargets[Math.floor(Math.random() * possibleTargets.length)];
        if (target) 
          this.game.attackBuilding(this.playerId, target, BARBARIAN_TROOPS_PER_CAMP);
  
        if (!this.state.getMap().getBuilding(tileId) || this.state.getMap().getBuilding(tileId)?.getOwnerId() !== this.playerId) {
          this.campTileIds.delete(tileId);
        }
      }
    }
  }

  public getCampCount() { return this.campTileIds.size; }
}
