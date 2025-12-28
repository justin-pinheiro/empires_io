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

export const useTiles = () => {
  const tilesRef = useRef<SerializedTile[]>([]);

  useEffect(() => {
    socket.on('mapUpdate', (data) => { 
      tilesRef.current = data;
    });

    return () => {
      socket.off('mapUpdate');
    };
  }, []);

  return { tilesRef };
};