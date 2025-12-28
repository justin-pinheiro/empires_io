// hooks/useMapSocket.ts
import { useEffect, useRef } from 'react';
import { socket } from '../socket';

interface SerializedTile {
  id: string;
  x: number;
  y: number;
  ownerId: string;
  neighbors: string[];
  terrain: { name: string; color: string };
}

interface BuildingData {
  tileKey: string;
  type: string;
  ownerId: string;
  health: { current: number; max: number };
}

export const useMapSocket = () => {
  const tilesRef = useRef<SerializedTile[]>([]);
  const buildingsRef = useRef<Map<string, BuildingData>>(new Map());

  useEffect(() => {
    socket.on('mapUpdate', (data) => { 
      tilesRef.current = data;
    });
    socket.on('buildingsUpdate', (buildingMap: Record<string, BuildingData>) => {
      buildingsRef.current = new Map(Object.entries(buildingMap));
    });

    return () => {
      socket.off('mapUpdate');
      socket.off('buildingsUpdate');
    };
  }, []);

  return { tilesRef, buildingsRef };
};