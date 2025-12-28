import { useRef } from "react";

export const useMapCamera = () => {
  const cameraRef = useRef({ x: window.innerWidth / 2, y: window.innerHeight / 2, zoom: 1.0 });
  const mouseState = useRef({ isDragging: false });

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

  return { cameraRef, mouseState, onMouseMove, onWheel };
};