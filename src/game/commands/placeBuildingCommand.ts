import { BUILDING_STATS } from "../../models/buildingData.js";
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
    if (!player) return "Player does not exist.";

    const stats = BUILDING_STATS[this.buildingType];
    if (!stats) return "Invalid building type.";

    if (!player.getCivilisation().getResources().superiorOrEqualTo(stats.cost)) {
        return "Insufficient resources to build " + stats.name;
    }

    const tile = this.gameState.getMap().getTile(this.tileId)
    if (tile && tile.hasBuilding()) {
        return "Tile is already occupied.";
    }

    return null;
}

  execute(): void {
    this.gameState.addBuilding(this.playerId, this.buildingType, this.tileId);
  }
}