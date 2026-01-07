import { getNextLevel, hasNextLevel } from "../models/buildingData.js";
import type { ICommand } from "../interfaces/ICommand.js";
import type { GameState } from "../game/gameState.js";

export class UpgradeBuildingCommand implements ICommand {
	constructor(
		private gameState: GameState,
		private playerId: string,
		private tileId: string
	) {}

	validate(): string | null {
		const player = this.gameState.getPlayer(this.playerId);
		if (!player) 
			return "Player " + this.playerId + " does not exist.";

		const upgradedBuilding = this.gameState.getMap().getBuilding(this.tileId);
		if (!upgradedBuilding)
			return "No building found on tile " + this.tileId;
		
		if (this.playerId != upgradedBuilding.getOwnerId())
			return "Player " + this.playerId + " do not own building on tile " + this.tileId;

		const buildingHasNextLevel = hasNextLevel(upgradedBuilding!.type, upgradedBuilding.getLevel())
		
		if (!buildingHasNextLevel)
			return "Building has already reached maximum level!";
		
		const nextLevelCost = getNextLevel(upgradedBuilding!.type, upgradedBuilding.getLevel()).resourcesToBuild;
		if (!player.getCivilisation().getResources().hasEnough(nextLevelCost))
			return `Not enough resources to upgrade! (cost = ${JSON.stringify(nextLevelCost)})`

		return null
	}

	execute(): void {
		this.gameState.upgradeBuilding(this.tileId);
	}
}