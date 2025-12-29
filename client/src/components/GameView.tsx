import React, { useEffect, useRef, useState } from "react";
import { useCivilisation } from "../hooks/useCivilisation";
import { useGameConstants } from "../hooks/useGameConstants";
import { useTiles } from "../hooks/useTiles";
import { useBuildings } from "../hooks/useBuildings";
import { usePlayersSocket } from "../hooks/usePlayersSockets";
import { useCamera } from "../hooks/useMapCamera";
import { socket } from "../socket";
import { loadAssets } from "../utils/assetLoader";
import { MapRenderer } from "../rendering/mapRenderer";
import { GameHUD } from "./HUD";
import { GameSidebars } from "./GameSidebar";
import { pixelToHex } from "../utils/hexMath";
import { LoadingScreen } from "./LoadingScreen";
import { ResearchBottomBar } from "./ResearchBottomBar";
import { useMapEvents } from "../hooks/useMapEvents";

export const GameView: React.FC = () => {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  
  // 1. Initialize Hooks
  const { tilesRef } = useTiles();
  const { buildingsRef } = useBuildings();
  const { playersRef } = usePlayersSocket();
  const { cameraRef, mouseState, onMouseMove, onWheel, centerOnTile } = useCamera();
  
  const civilisation = useCivilisation();
  const constants = useGameConstants();
  
  const [assetsLoaded, setAssetsLoaded] = useState(false);
  const [selectedTileId, setSelectedTileId] = useState<string | null>(null);

  // 2. Load Assets
  useEffect(() => {
    loadAssets().then(() => setAssetsLoaded(true));
  }, []);

  useMapEvents(centerOnTile);

  // 3. Main Render Loop
  useEffect(() => {
    // Only start if assets are ready and the canvas exists
    if (!assetsLoaded || !canvasRef.current) return;

    const canvas = canvasRef.current;
    const ctx = canvas.getContext('2d', { alpha: false })!;
    
    const handleResize = () => {
      const dpr = window.devicePixelRatio || 1;
      canvas.width = window.innerWidth * dpr;
      canvas.height = window.innerHeight * dpr;
      canvas.style.width = `${window.innerWidth}px`;
      canvas.style.height = `${window.innerHeight}px`;
      ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
    };

    window.addEventListener('resize', handleResize);
    handleResize();

    let frameId: number;
    const loop = () => {
      // Manual background clear to prevent black screen flickers
      ctx.fillStyle = '#1a1a1a';
      ctx.fillRect(0, 0, window.innerWidth, window.innerHeight);

      // Draw the scene
      MapRenderer.draw(ctx, {
        tiles: tilesRef.current,
        buildings: buildingsRef.current,
        players: playersRef.current,
        camera: cameraRef.current,
        selectedTileId: selectedTileId,
      });
      
      frameId = requestAnimationFrame(loop);
    };

    loop();

    return () => {
      window.removeEventListener('resize', handleResize);
      cancelAnimationFrame(frameId);
    };
    // Re-run this effect when tiles first arrive to "kickstart" the canvas
  }, [assetsLoaded, selectedTileId, tilesRef.current.length]);

  // 4. Handlers
  const handleBuild = (buildingTypeId: string) => {
    if (!selectedTileId) return;
    socket.emit('build', { tileKey: selectedTileId, buildingTypeKey: buildingTypeId });
    setSelectedTileId(null);
  };

  // 5. Early Return (Must be AFTER hooks)
  if (!constants || !civilisation || !assetsLoaded) {
    return <LoadingScreen />;
  }

  const selectedTileObj = tilesRef.current.find(t => t.id === selectedTileId) ?? null;

  return (
    <div style={containerStyle}>
      <GameHUD 
        civilisation={civilisation} 
        production={civilisation.production} 
        nextAge={constants.agesData[civilisation.age + 1]}
      />

      <ResearchBottomBar/>
      
      <canvas
        ref={canvasRef}
        style={canvasStyle}
        onMouseDown={() => (mouseState.current.isDragging = true)}
        onMouseUp={() => (mouseState.current.isDragging = false)}
        onMouseLeave={() => (mouseState.current.isDragging = false)}
        onMouseMove={onMouseMove}
        onWheel={onWheel}
        onClick={(e) => handleMapClick(e, cameraRef, tilesRef, setSelectedTileId)}
      />

      <GameSidebars 
        playerId={String(socket.id)}
        selectedTile={selectedTileObj}
        buildings={buildingsRef.current}
        civilisation={civilisation}
        onBuild={handleBuild} 
        onClose={() => setSelectedTileId(null)}
      />
    </div>
  );
};

// --- Styles & Helpers ---

const handleMapClick = (
  e: React.MouseEvent,
  cameraRef: React.MutableRefObject<{ x: number; y: number; zoom: number }>,
  tilesRef: React.MutableRefObject<any[]>,
  setSelectedTileId: (id: string | null) => void
) => {
  const rect = (e.target as HTMLCanvasElement).getBoundingClientRect();
  const x = e.clientX - rect.left;
  const y = e.clientY - rect.top;

  const { q, r } = pixelToHex(x, y, cameraRef.current.x, cameraRef.current.y, cameraRef.current.zoom);
  const clickedTile = tilesRef.current.find(t => t.x === q && t.y === r);

  setSelectedTileId(clickedTile ? clickedTile.id : null);
};

const containerStyle: React.CSSProperties = { 
  position: 'relative', 
  width: '100vw', 
  height: '100vh', 
  background: '#000',
  overflow: 'hidden' 
};

const canvasStyle: React.CSSProperties = {
  display: 'block', 
  position: 'absolute',
  top: 0, 
  left: 0,
  zIndex: 1,
  cursor: 'grab'
};