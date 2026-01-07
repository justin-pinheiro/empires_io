import { useEffect } from 'react';
import { socket } from '../socket';
import type { Building } from '../types/building';

export const useBuildingEvents = (
  onEnemyBuildingDestroyed: (tileId: string) => void,
  onBuildingDestroyedByEnemy: (tileId: string, building: Building) => void
) => {
  useEffect(() => {
    if (!socket) return;

    const handleEnemyBuildingDestroyed = (tileId: string) => {
      console.log(`Success! You destroyed a building at ${tileId}`);
      onEnemyBuildingDestroyed(tileId);
    };

    const handleBuildingDestroyedByEnemy = (tileId: string, building: Building) => {
      console.log(`Alert! Your ${building.name} was destroyed at ${tileId}`);
      onBuildingDestroyedByEnemy(tileId, building);
    };

    socket.on('enemyBuildingDestroyed', handleEnemyBuildingDestroyed);
    socket.on('buildingDestroyedByEnemy', handleBuildingDestroyedByEnemy);

    return () => {
      socket.off('enemyBuildingDestroyed', handleEnemyBuildingDestroyed);
      socket.off('buildingDestroyedByEnemy', handleBuildingDestroyedByEnemy);
    };
  }, [onEnemyBuildingDestroyed, onBuildingDestroyedByEnemy]);
};