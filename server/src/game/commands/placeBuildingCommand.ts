import { BUILDING_STATS, BuildingType } from "../../models/buildingData.js";
import type { ICommand } from "../../utils/ICommand.js";
import type { GameState } from "../gameState.js";

export class PlaceBuildingCommand implements ICommand {
  constructor(
    private gameState: GameState,
    private playerId: string,
    private buildingType: keyof typeof BUILDING_STATS,
    private tileId: string
  ) {}

  validate(): string | null {
    const player = this.gameState.getPlayer(this.playerId);
    if (!player) return "Player " + this.playerId + " does not exist.";

    const stats = BUILDING_STATS[this.buildingType];
    if (!stats) return "Invalid building type : " + this.tileId + ".";

    if (!player.getCivilisation().getResources().hasEnough(stats.resourcesCost)) {
        return "Insufficient resources to build " + stats.name;
    }

    const availablePopulation = player.getCivilisation().getPopulationCapacity() - player.getCivilisation().getWorkingPopulation();
    if (stats.populationCost > availablePopulation) {
        return "Insufficient population to build " + stats.name;
    }

    const map = this.gameState.getMap()
    const tile = map.getTile(this.tileId)

    if (!tile) {
      return "Tile " + this.tileId +  " does not exist."
    }

    if (map.getBuilding(this.tileId) && map.getBuilding(this.tileId)?.type != BuildingType.WATCH_TOWER) {
        return "Tile is already occupied.";
    }

    const terrain = tile.getTerrainType()
    if (!(stats.buildableTerrains.includes(terrain))) {
      return "Cannot build " + stats.name + " on terrain type " + terrain + ". Allowed : " + stats.buildableTerrains;
    }

    return null;
}

  execute(): void {
    this.gameState.addBuilding(this.playerId, this.buildingType, this.tileId);
  }
}