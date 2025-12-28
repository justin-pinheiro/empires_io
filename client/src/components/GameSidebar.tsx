import type { Building } from "../types/building";
import { BuildingType } from "../types/buildingType";
import type { Civilisation } from "../types/civilisation";
import type { Tile } from "../types/tile";
import { AttackSidebar } from "./AttackSidebar";
import { BuildingInfoSidebar } from "./BuildingInfoSidebar";
import { BuildSidebar } from "./BuildSidebar";
import { NeutralSidebar } from "./NeutralSidebar";


interface GameSidebarsProps {
    playerId: string;
    selectedTile: Tile | null;
    buildings: Map<string, Building>;
    civilisation: Civilisation;
    onBuild: (buildingTypeId: string) => void;
    onClose: () => void;
}


export const GameSidebars: React.FC<GameSidebarsProps> = ({ playerId, selectedTile, buildings, civilisation, onBuild, onClose }) => {
  if (!selectedTile) return null;

  const building = buildings.get(selectedTile.id);
  const isOwner = selectedTile.ownerId === playerId;
  const isNeutral = selectedTile.ownerId === null;

  if (isOwner) {
    const isWatchTower = building?.type === BuildingType.WATCH_TOWER;
    const isWater = selectedTile.terrain.name === "WATER";

    if (!building || isWatchTower || isWater) {
      return <BuildSidebar 
        selectedTile={selectedTile} 
        resources={civilisation.resources} 
        onBuild={onBuild} onClose={onClose} 
      />;
    }
    return <BuildingInfoSidebar 
      building={building} 
      resources={civilisation.resources} 
      onUpgrade={() => {}} 
      onClose={onClose} 
    />;
  }

  if (isNeutral) return <NeutralSidebar 
    tile={selectedTile} 
    onClose={onClose} 
    />;
  
  return <AttackSidebar 
    tile={selectedTile} 
    resources={civilisation.resources} 
    isNeighbor={true} 
    onAttack={() => {}} 
    onClose={onClose} 
    />;
};