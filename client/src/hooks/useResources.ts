import { useState, useEffect } from 'react';
import { socket } from '../socket';
import type { Resources } from '../types/resources';

export const useResources = () => {
  const [resources, setResources] = useState<Resources>({
    food: 0, 
    gold: 0, 
    stone: 0, 
    science: 0, 
    army: 0
  });

  useEffect(() => {
    socket.on('resourcesUpdate', (data: Resources) => {
      setResources(data);
    });

    return () => {
      socket.off('resourcesUpdate');
    };
  }, []);

  return resources;
};