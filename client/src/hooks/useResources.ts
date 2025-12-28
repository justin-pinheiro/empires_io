// hooks/useResources.ts
import { useState, useEffect } from 'react';
import { socket } from '../socket';

export interface ResourceState {
  food: number;
  gold: number;
  stone: number;
  science: number;
  army: number;
}

export const useResources = () => {
  const [resources, setResources] = useState<ResourceState>({
    food: 0, gold: 0, stone: 0, science: 0, army: 0
  });

  useEffect(() => {
    socket.on('resourcesUpdate', (data: ResourceState) => {
      setResources(data);
    });

    return () => {
      socket.off('resourcesUpdate');
    };
  }, []);

  return resources;
};