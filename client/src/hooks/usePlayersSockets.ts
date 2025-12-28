import { useEffect, useRef } from 'react';
import { socket } from '../socket';

interface SerializedPlayer {
  id: string;
  name: string;
  color: string;
  isNPC: boolean;
  civilisationName: string;
}

export const usePlayersSocket = () => {
  const playersRef = useRef<Map<string, SerializedPlayer>>(new Map());

  useEffect(() => {
    socket.on('playersUpdate', (data: Record<string, SerializedPlayer>) => {
      playersRef.current = new Map(Object.entries(data));
    });

    return () => {
      socket.off('playersUpdate');
    };
  }, []);

  return { playersRef };
};