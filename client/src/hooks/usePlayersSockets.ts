import { useEffect, useRef } from 'react';
import { socket } from '../socket';
import type { Player } from '../types/player';

export const usePlayersSocket = () => {
  const playersRef = useRef<Map<string, Player>>(new Map());

  useEffect(() => {
    socket.on('playersUpdate', (data: Record<string, Player>) => {
      playersRef.current = new Map(Object.entries(data));
    });

    return () => {
      socket.off('playersUpdate');
    };
  }, []);

  return { playersRef };
};