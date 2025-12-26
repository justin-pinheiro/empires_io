import React, { useEffect, useRef, useState } from 'react';
import { socket } from '../socket'; 
import { getHexPixelPos, drawHexagon, HEX_SIZE } from '../utils/hexMath';
import { BUILDING_ICONS } from '../utils/assetLoader';

interface SerializedTile {
  id: string;
  x: number;
  y: number;
  neighbors: string[];
  terrain: {
    name: string;
    color: string;
  };
}
interface BuildingData {
  tileKey: string;
  type: string;
  ownerId: string;
  health: { current: number; max: number };
}

export const Map: React.FC = () => {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const [visibleTiles, setVisibleTiles] = useState<SerializedTile[]>([]);
  const [buildings, setBuildings] = useState<Record<string, BuildingData>>({});
  const [camera, setCamera] = useState({ 
    x: window.innerWidth / 2, 
    y: window.innerHeight / 2, 
    zoom: 1.0 
  });

    useEffect(() => {
    socket.on('buildingsUpdate', (data: BuildingData[]) => {
        console.log("📥 Buildings update:", data.length, "buildings received.");
        const buildingMap: Record<string, BuildingData> = {};
        data.forEach(b => {
        buildingMap[b.tileKey] = b;
        });
        setBuildings(buildingMap);
    });
    return () => { socket.off('buildingsUpdate'); };
    }, []);

  // 1. Socket Listener & Window Resize
  useEffect(() => {
    socket.connect();
    socket.emit('join');

    socket.on('mapUpdate', (data: SerializedTile[]) => {
      console.log("📥 Map Update:", data.length, "tiles received.");
      setVisibleTiles(data);
    });

    const handleResize = () => {
      if (canvasRef.current) {
        canvasRef.current.width = window.innerWidth;
        canvasRef.current.height = window.innerHeight;
      }
    };

    window.addEventListener('resize', handleResize);
    return () => {
      socket.off('mapUpdate');
      window.removeEventListener('resize', handleResize);
    };
  }, []);

  // 2. Render Loop
  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    let frameId: number;

    const render = () => {
      ctx.clearRect(0, 0, canvas.width, canvas.height);

      visibleTiles.forEach((tile) => {
        const { x, y } = getHexPixelPos(tile.x, tile.y, camera.x, camera.y, camera.zoom);
        const size = HEX_SIZE * camera.zoom;

        if (x < -size || x > canvas.width + size || y < -size || y > canvas.height + size) return;

        // 1. Draw Hex Terrain
        drawHexagon(ctx, x, y, size, tile.terrain?.color || '#333', false);

        // 2. Draw Building if it exists on this tile
        const building = buildings[tile.id]; // tile.id matches tileKey from server
        if (building) {
            console.log(BUILDING_ICONS)
            const icon = BUILDING_ICONS[building.type.toUpperCase()];
            if (icon && icon.complete) {
            const iconSize = size * 1.2; // Slightly larger than hex or adjusted to fit
            ctx.drawImage(
                icon, 
                x - iconSize / 2, 
                y - iconSize / 2, 
                iconSize, 
                iconSize
            );
            }

            // 3. Optional: Draw Health Bar for the building
            if (building.health.current < building.health.max) {
            const healthPct = building.health.current / building.health.max;
            ctx.fillStyle = 'red';
            ctx.fillRect(x - size/2, y + size/2, size, 4);
            ctx.fillStyle = '#00ff00';
            ctx.fillRect(x - size/2, y + size/2, size * healthPct, 4);
            }
        }
    });

      frameId = requestAnimationFrame(render);
    };

    render();
    return () => cancelAnimationFrame(frameId);
  }, [visibleTiles, camera]);

  const handleMouseMove = (e: React.MouseEvent) => {
    if (e.buttons === 1) {
      setCamera(prev => ({
        ...prev,
        x: prev.x + e.movementX,
        y: prev.y + e.movementY
      }));
    }
  };

  return (
    <canvas
      ref={canvasRef}
      width={window.innerWidth}
      height={window.innerHeight}
      onMouseMove={handleMouseMove}
      style={{ display: 'block', background: '#1a1a1a', cursor: 'grab' }}
    />
  );
};