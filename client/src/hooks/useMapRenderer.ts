import { useEffect } from "react";
import { MapRenderer } from "../rendering/mapRenderer";

export const useMapRenderer = (
  canvasRef: React.RefObject<HTMLCanvasElement | null>,
  assetsLoaded: boolean,
  state: {
    tiles: any[];
    buildings: Map<string, any>;
    players: Map<string, any>;
    camera: { x: number; y: number; zoom: number };
    selectedTileId: string | null;
  }
) => {
    useEffect(() => {
    if (!assetsLoaded || !canvasRef.current || state.tiles.length === 0) return;

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
        ctx.fillStyle = '#1a1a1a';
        ctx.fillRect(0, 0, window.innerWidth, window.innerHeight);

        MapRenderer.draw(ctx, {
        tiles: state.tiles,
        buildings: state.buildings,
        players: state.players,
        camera: state.camera,
        selectedTileId: state.selectedTileId,
        });
        
        frameId = requestAnimationFrame(loop);
    };

    loop();
    return () => {
        window.removeEventListener('resize', handleResize);
        cancelAnimationFrame(frameId);
    };
    }, [assetsLoaded, state.selectedTileId, state.tiles.length]);
};