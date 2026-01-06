import { Building } from "../../models/building.js";
import { BuildingType } from "../../models/buildingData.js";
import { Resources } from "../../models/resources.js";
import { ScienceBonusType } from "../../models/scienceBonus.js";
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

		const attackedBuilding = this.gameState.getMap().getBuilding(this.tileId);
		if (!attackedBuilding) {
		return "No building found on tile " + this.tileId;
		}

		if (this.attackerId === attackedBuilding.getOwnerId())
		return "Player " + this.attackerId + " cannot attack its own building on tile " + this.tileId;

		const defenderTileNeighbors = this.gameState.getMap().getTile(this.tileId)?.getNeighbors();
		let isAttackerNeighbor = false
		if (defenderTileNeighbors) {
			for (const id of defenderTileNeighbors) {
				if (!id) continue;
				const neighborTile = this.gameState.getMap().getTile(id);
				if (neighborTile?.getOwnerId() === this.attackerId) {
					isAttackerNeighbor = true;
					break;
				}
			}
		}

		if (!isAttackerNeighbor)
			return "Cannot attack building on tile " + this.tileId + " : not a neighbor."

		if (attacker.getCivilisation().getResources().getSoldiers() < this.troopCount)
			return "Insufficient army to attack with " + this.troopCount + " troops.";

		return null
	}

	execute(): void {
		const attackerCivilisation = this.gameState.getPlayer(this.attackerId)?.getCivilisation()!
		attackerCivilisation.subtractFromResources(new Resources(0,0,0,this.troopCount,0))

		const building = this.gameState.getMap().getBuilding(this.tileId)
		building?.takeDamage(this.troopCount * attackerCivilisation.getResearch().getMultiplier(ScienceBonusType.ARMY));
		if (building?.isDestroyed()) {
			this.gameState.playerDestroyedBuilding(this.tileId, this.attackerId);
		}
	}
}