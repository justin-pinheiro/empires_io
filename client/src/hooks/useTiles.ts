import { useEffect, useRef } from 'react';
import { socket } from '../socket';
import type { Tile } from '../types/tile';

export const useTiles = () => {
  const tilesRef = useRef<Tile[]>([]);

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