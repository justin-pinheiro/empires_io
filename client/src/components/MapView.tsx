// components/MapView.tsx
import React, { useEffect, useRef } from 'react';
import { useMapSocket } from '../hooks/useMapSockets';
import { MapRenderer } from '../rendering/mapRenderer';

export const MapView: React.FC = () => {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  
  // Data and Camera State (using Refs for performance)
  const { tilesRef, buildingsRef } = useMapSocket();
  const cameraRef = useRef({ x: window.innerWidth / 2, y: window.innerHeight / 2, zoom: 1.0 });
  const mouseState = useRef({ isDragging: false });

  useEffect(() => {
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
        camera: cameraRef.current,
      });
      frameId = requestAnimationFrame(loop);
    };

    window.addEventListener('resize', handleResize);
    handleResize();
    loop();

    return () => {
      window.removeEventListener('resize', handleResize);
      cancelAnimationFrame(frameId);
    };
  }, []);

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

  return (
    <canvas
      ref={canvasRef}
      onMouseDown={() => (mouseState.current.isDragging = true)}
      onMouseUp={() => (mouseState.current.isDragging = false)}
      onMouseLeave={() => (mouseState.current.isDragging = false)}
      onMouseMove={onMouseMove}
      onWheel={onWheel}
      style={{ display: 'block', cursor: 'grab', touchAction: 'none' }}
    />
  );
};