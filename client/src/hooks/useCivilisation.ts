import { useState, useEffect } from 'react';
import { socket } from '../socket';
import type { Civilisation } from '../types/civilisation';

export const useCivilisation = () => {
  const [civilisation, setCivilisation] = useState<Civilisation>({
    name: "",
    resources: {
      food: 0, 
      gold: 0, 
      stone: 0, 
      science: 0, 
      army: 0
    },
    populationCapacity: 0,
    workingPopulation: 0,
    armyCapacity: 0,
  });

  useEffect(() => {
    socket.on('civilisationUpdate', (data: Civilisation) => {
      setCivilisation(data);
    });

    return () => {
      socket.off('civilisationUpdate');
    };
  }, []);

  return civilisation;
};