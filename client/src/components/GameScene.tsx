import React, { useState, useEffect } from 'react';
import { MapView } from './MapView';
import { socket } from '../socket';
import { ResourceHUD } from './HUD';

export const GameScene: React.FC = () => {
  const [resources, setResources] = useState({
    food: 0, gold: 0, stone: 0, science: 0, army: 0
  });

  useEffect(() => {
    socket.on('resourcesUpdate', (data) => {
      setResources(data);
    });
    return () => { socket.off('resourcesUpdate'); };
  }, []);

  return (
    <div style={{ width: '100vw', height: '100vh', background: '#000' }}>
      <ResourceHUD resources={resources} />
      <MapView />
    </div>
  );
};