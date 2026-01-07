import React, { useCallback, useEffect, useRef, useState } from "react";
import { useCivilisation } from "../hooks/useCivilisation";
import { useGameConstants } from "../hooks/useGameConstants";
import { useTiles } from "../hooks/useTiles";
import { useBuildings } from "../hooks/useBuildings";
import { useBuildingEvents } from '../hooks/useBuildingEvents';
import { usePlayersSocket } from "../hooks/usePlayersSockets";
import { useCamera } from "../hooks/useMapCamera";
import { socket } from "../socket";
import { loadAssets } from "../utils/assetLoader";
import { MapRenderer } from "../utils/mapRenderer";
import { GameHUD } from "./HUD";
import { pixelToHex } from "../utils/hexMath";
import { LoadingScreen } from "./LoadingScreen";
import { ResearchBottomBar } from "./ResearchBottomBar";
import { useMapEvents } from "../hooks/useMapEvents";
import { BuildRadialMenu } from "./BuildRadialMenu";
import { BuildingType } from "../types/buildingType";
import { AttackRadialMenu } from "./AttackRadialMenu";
import { BuildingInfoRadial } from "./BuildingInfoRadialMenu";
import { useGameSounds } from "../hooks/useGameSound";

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
  const { playSelect } = useGameSounds();

  // 2. Load Assets
  useEffect(() => {
    loadAssets().then(() => setAssetsLoaded(true));
  }, []);

  useMapEvents(centerOnTile);

  // 3. Main Render Loop
  useEffect(() => {
    if (!assetsLoaded || !canvasRef.current) {
      return;
    }

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
  }, [
    assetsLoaded, 
    selectedTileId, 
    !!constants,
    !!civilisation
  ]);

  // 4. Handlers
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

    if (clickedTile)
      playSelect();

    setSelectedTileId(clickedTile ? clickedTile.id : null);
  };
  
  const handleBuild = (buildingTypeId: string) => {
    if (!selectedTileId) return;
    socket.emit('build', { tileKey: selectedTileId, buildingTypeKey: buildingTypeId });
    setSelectedTileId(null);
  };

  const handleAttack = (troopCount: number) => {
      if (!selectedTileId) return;
      socket.emit('attack', { tileKey: selectedTileId, troopCount: troopCount });
    };

  const handleUpgrade = () => {
      if (!selectedTileId) return;
      socket.emit('upgrade', { tileKey: selectedTileId });
    };

  const handleDelete = () => {
      if (!selectedTileId) return;
      socket.emit('delete', { tileKey: selectedTileId });
    };

  const getNextLevel = (type: BuildingType, currentLevel: number) => {
    const nextLevel = currentLevel + 1;
    return constants?.buildingStats[type][nextLevel]!;
  }

  const handleEnemyBuildingDestroyed = useCallback((tileId: string) => {
  }, []);

  const handleBuildingDestroyedByEnemy = useCallback((tileId: string, building: any) => {
  }, []);

  useBuildingEvents(handleEnemyBuildingDestroyed, handleBuildingDestroyedByEnemy);

  // 5. Early Return (Must be AFTER hooks)
  if (!constants || !civilisation || !assetsLoaded) {
    return <LoadingScreen />;
  }

  const selectedTile = tilesRef.current.find(t => t.id === selectedTileId) ?? null;
  const playerId = String(socket.id);
  const selectedBuilding = selectedTile ? buildingsRef.current.get(selectedTile.id) : null;

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

      {selectedTile && selectedBuilding && (selectedBuilding.ownerId === playerId) && (selectedBuilding.type != BuildingType.OUTPOST) && (
        <BuildingInfoRadial 
          selectedTile={selectedTile} 
          selectedBuilding={selectedBuilding} 
          camera={cameraRef.current}
          nextLevelStats={getNextLevel(selectedBuilding.type, selectedBuilding.level)}
          playerResources={civilisation.resources}
          onUpgrade={handleUpgrade}
          onDestroy={handleDelete}
        />
      )}

      {selectedTile && selectedBuilding && (selectedBuilding.ownerId === playerId) && (selectedBuilding.type === BuildingType.OUTPOST) && (
        <BuildRadialMenu 
          selectedTile={selectedTile} 
          camera={cameraRef.current}
          civilisation={civilisation}
          buildingStats={constants.buildingStats}
          onBuild={handleBuild}
        />
      )}

      {selectedTile && selectedBuilding && (selectedBuilding.ownerId !== playerId) && (
        <AttackRadialMenu 
          selectedTile={selectedTile}
          enemyBuilding={selectedBuilding}
          camera={cameraRef.current}
          civilisation={civilisation}
          onAttack={handleAttack}
        />
      )}

    </div>
  );
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