import { useEffect, useRef } from 'react';
import { socket } from '../socket';
import type { Building } from '../types/building';

export const useBuildings = () => {
  const buildingsRef = useRef<Map<string, Building>>(new Map());

  useEffect(() => {
    socket.on('buildingsUpdate', (buildingMap: Record<string, Building>) => {
      buildingsRef.current = new Map(Object.entries(buildingMap));
    });

    return () => {
      socket.off('mapUpdate');
      socket.off('buildingsUpdate');
    };
  }, []);

  return { buildingsRef };
};