// hooks/useCamera.ts
import { useRef } from 'react';

export const useCamera = () => {
  const cameraRef = useRef({ x: window.innerWidth / 2, y: window.innerHeight / 2, zoom: 1.0 });
  const isDragging = useRef(false);

  const handlePan = (dx: number, dy: number) => {
    cameraRef.current.x += dx;
    cameraRef.current.y += dy;
  };

  const handleZoom = (delta: number) => {
    const zoomSpeed = 0.001;
    cameraRef.current.zoom = Math.min(Math.max(cameraRef.current.zoom - delta * zoomSpeed, 0.5), 3);
  };

  return { cameraRef, isDragging, handlePan, handleZoom };
};