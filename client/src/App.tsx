import { useEffect } from 'react';
import { socket } from './socket';
import { MapView } from './components/MapView';

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
      <MapView />
    </div>
  );
}

export default App
