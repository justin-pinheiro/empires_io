import { useState, useEffect } from 'react';
import { socket } from '../socket';
import type { Civilisation } from '../types/civilisation';

export const useCivilisation = () => {
  const [civilisation, setCivilisation] = useState<Civilisation>();

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