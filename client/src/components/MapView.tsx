// components/MapView.tsx
import React, { useEffect, useRef, useState } from 'react';
import { useMapSocket } from '../hooks/useMapSockets';
import { MapRenderer } from '../rendering/mapRenderer';
import { loadAssets } from '../utils/assetLoader';
import { pixelToHex } from '../utils/hexMath';
import { usePlayersSocket } from '../hooks/usePlayersSockets';
import { BuildSidebar } from './BuildSidebar';
import { socket } from '../socket';
import { useResources } from '../hooks/useResources';
import { ActionSidebar } from './ActionSidebar';
import { ATTACK_ACTIONS } from '../types/attackStats';

export const MapView: React.FC = () => {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const resources = useResources();
  const [assetsLoaded, setAssetsLoaded] = useState(false);
  const [selectedTileId, setSelectedTileId] = useState<string | null>(null);
  const { tilesRef, buildingsRef } = useMapSocket();
  const { playersRef } = usePlayersSocket();
  const cameraRef = useRef({ x: window.innerWidth / 2, y: window.innerHeight / 2, zoom: 1.0 });
  const mouseState = useRef({ isDragging: false });
  const selectedTileRef = useRef<string | null>(null);

  const handleBuild = (buildingTypeId: string) => {
  if (!selectedTileId) return;
  
  socket.emit('build', { tileKey: selectedTileId, buildingTypeKey: buildingTypeId });
  
  console.log(`Building ${buildingTypeId} on ${selectedTileId}`);
  setSelectedTileId(null);
};

  useEffect(() => {
    selectedTileRef.current = selectedTileId;
  }, [selectedTileId]);

  useEffect(() => {
    loadAssets().then(() => {
      setAssetsLoaded(true);
    });
  }, []);

  useEffect(() => {
    if (!assetsLoaded) return;

    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d', { alpha: false });
    if (!ctx) return;

    let frameId: number;

    const handleResize = () => {
      const dpr = window.devicePixelRatio || 1;
      canvas.width = window.innerWidth * dpr;
      canvas.height = window.innerHeight * dpr;
      canvas.style.width = `${window.innerWidth}px`;
      canvas.style.height = `${window.innerHeight}px`;
      ctx.scale(dpr, dpr);
    };

    const loop = () => {
      MapRenderer.draw(ctx, {
        tiles: tilesRef.current,
        buildings: buildingsRef.current,
        players: playersRef.current,
        camera: cameraRef.current,
        selectedTileId: selectedTileRef.current,
      });
      frameId = requestAnimationFrame(loop);
      if (buildingsRef.current.size > 0 && frameId % 100 === 0) {
        console.log("Rendering buildings count:", buildingsRef.current.size);
      }
    };

    window.addEventListener('resize', handleResize);
    handleResize();
    loop();

    return () => {
      window.removeEventListener('resize', handleResize);
      cancelAnimationFrame(frameId);
    };
  }, [assetsLoaded]); 

  // --- Interaction Handlers ---
  const onMouseMove = (e: React.MouseEvent) => {
    if (mouseState.current.isDragging) {
      cameraRef.current.x += e.movementX;
      cameraRef.current.y += e.movementY;
    }
  };

  const onWheel = (e: React.WheelEvent) => {
    const zoomSpeed = 0.001;
    const newZoom = cameraRef.current.zoom - e.deltaY * zoomSpeed;
    cameraRef.current.zoom = Math.min(Math.max(newZoom, 0.4), 3.0);
  };

  const onClick = (e: React.MouseEvent) => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const rect = canvas.getBoundingClientRect();
    const x = e.clientX - rect.left;
    const y = e.clientY - rect.top;

    const { q, r } = pixelToHex(x, y, cameraRef.current.x, cameraRef.current.y, cameraRef.current.zoom);

    const clickedTile = tilesRef.current.find(t => t.x === q && t.y === r);

    if (clickedTile) {
      setSelectedTileId(clickedTile.id);
      console.log("Clicked tile ", clickedTile.id)
    } else {
      setSelectedTileId(null);
    }
  };

  if (!assetsLoaded) return <div>Loading Assets...</div>;

  const selectedTileObj = tilesRef.current.find(t => t.id === selectedTileId);
  const isEnemyTile = selectedTileObj && selectedTileObj.ownerId && selectedTileObj.ownerId !== socket.id;

  // Check if any neighbor of the selected tile is owned by the current player
  const isNeighborOfPlayer = selectedTileObj?.neighbors?.some((neighborId: string) => {
      const neighbor = tilesRef.current.find(t => t.id === neighborId);
      return neighbor && String(neighbor.ownerId) === String(socket.id);
  }) ?? false;

  return (
    <div style={{ position: 'relative', width: '100vw', height: '100vh', background: '#000' }}>
      <canvas
        ref={canvasRef}
        onMouseDown={() => (mouseState.current.isDragging = true)}
        onMouseUp={() => (mouseState.current.isDragging = false)}
        onMouseLeave={() => (mouseState.current.isDragging = false)}
        onMouseMove={onMouseMove}
        onWheel={onWheel}
        onClick={onClick}
        style={{ display: 'block', cursor: 'grab', touchAction: 'none' }}
      />
    {selectedTileId && selectedTileObj && (
        String(selectedTileObj.ownerId) === String(socket.id) ? (
            <BuildSidebar 
                selectedTile={selectedTileObj} 
                resources={resources} 
                onBuild={handleBuild}
                onClose={() => setSelectedTileId(null)}
            />
        ) : (
            <ActionSidebar 
                tile={selectedTileObj} 
                resources={resources} 
                isNeighbor={isNeighborOfPlayer} // Calculated in step 2
                onAttack={(type) => socket.emit('attack', { tileKey: selectedTileId, troopCount: ATTACK_ACTIONS[type as keyof typeof ATTACK_ACTIONS].damage })}
                onClose={() => setSelectedTileId(null)}
            />
        )
    )}
    </div>
  );
};