import type { ICommand } from "../interfaces/ICommand.js";
import type { GameState } from "../game/gameState.js";

export class DeleteBuildingCommand implements ICommand {
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

		return null
	}

	execute(): void {
		this.gameState.removeBuilding(this.tileId);
	}
}