import { socket } from "../socket";

export const useGameActions = (selectedTileId: string | null, setSelectedTileId: (id: string | null) => void) => {
  const handleBuild = (buildingTypeKey: string) => {
    if (!selectedTileId) return;
    socket.emit("build", { tileKey: selectedTileId, buildingTypeKey });
    setSelectedTileId(null);
  };

  const handleUpgrade = () => {
    if (!selectedTileId) return;
    socket.emit("upgrade", { tileKey: selectedTileId });
  };

  return { handleBuild, handleUpgrade };
};