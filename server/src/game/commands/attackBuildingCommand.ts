import { Building } from "../../models/building.js";
import { Resources } from "../../models/resources.js";
import type { ICommand } from "../../utils/ICommand.js";
import type { GameState } from "../gameState.js";

export class AttackBuildingCommand implements ICommand {
	constructor(
		private gameState: GameState,
		private attackerId: string,
		private tileId: string,
		private troopCount: number
	) {}

	validate(): string | null {
		const attacker = this.gameState.getPlayer(this.attackerId);
		if (!attacker) 
		return "Player " + this.attackerId + " does not exist.";

		const attackedBuilding = this.gameState.getBuilding(this.tileId);
		if (!attackedBuilding) {
		return "No building found on tile " + this.tileId;
		}

		if (this.attackerId === attackedBuilding.getOwnerId())
		return "Player " + this.attackerId + " cannot attack its own building on tile " + this.tileId;

		const defenderTileNeighbors = this.gameState.getMap().getNeighborsIds(this.tileId, 1);
		let isAttackerNeighbor = false
		defenderTileNeighbors.forEach(id => {
			if (this.gameState.getBuilding(id)?.getOwnerId() === this.attackerId) 
				isAttackerNeighbor = true;
		})
		if (!isAttackerNeighbor) {
			return "Cannot attack building on tile " + this.tileId + " : not a neighbor."
		}

		if (attacker.getCivilisation().getResources().getArmy() < this.troopCount) {
			return "Insufficient army to attack with " + this.troopCount + " troops.";
		}

		return null
	}

	execute(): void {
		this.gameState.getPlayer(this.attackerId)?.getCivilisation().getResources().substract(
			new Resources(0,0,0,0,this.troopCount)
		)
		const building = this.gameState.getBuilding(this.tileId)
		building?.takeDamage(this.troopCount);
		if (building?.isDestroyed()) {
			this.gameState.removeBuilding(this.tileId);
		}
	}
}