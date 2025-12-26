import { useEffect, useState } from 'react';
import { socket } from './socket';
import { GameScene } from './components/GameScene';

function App() {
  useEffect(() => {
    socket.connect();

    socket.on('connect', () => {
        console.log("🟢 Connected to server with ID:", socket.id);
        socket.emit('join'); 
    });

    return () => {
      socket.off('connect');
      socket.disconnect();
    };
  }, []);

  return (
    <div style={{ width: '100vw', height: '100vh', overflow: 'hidden' }}>
      <GameScene />
    </div>
  );
}

export default App
