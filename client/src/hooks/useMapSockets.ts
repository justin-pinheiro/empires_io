// hooks/useMapSocket.ts
import { useEffect, useRef } from 'react';
import { socket } from '../socket';

interface SerializedTile {
  id: string;
  x: number;
  y: number;
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
    socket.on('mapUpdate', (data) => { tilesRef.current = data; });
    socket.on('buildingsUpdate', (data) => {
      const bMap = new Map();
      data.forEach((b: { tileKey: any; }) => bMap.set(b.tileKey, b));
      buildingsRef.current = bMap;
    });

    return () => {
      socket.off('mapUpdate');
      socket.off('buildingsUpdate');
    };
  }, []);

  return { tilesRef, buildingsRef };
};