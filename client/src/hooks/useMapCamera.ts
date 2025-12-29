import { useRef } from "react";
import { HEX_SIZE } from "../utils/hexMath";

export const useCamera = () => {
  const cameraRef = useRef({ x: window.innerWidth / 2, y: window.innerHeight / 2, zoom: 1.0 });
  const mouseState = useRef({ isDragging: false });

  const SENSITIVITY = 0.6;

  const onMouseMove = (e: React.MouseEvent) => {
    if (mouseState.current.isDragging) {
      cameraRef.current.x += e.movementX * SENSITIVITY;
      cameraRef.current.y += e.movementY * SENSITIVITY;
    }
  };

  const onWheel = (e: React.WheelEvent) => {
    const zoomSpeed = 0.001;
    const oldZoom = cameraRef.current.zoom;
    
    // 1. Calculate new zoom level
    const nextZoom = oldZoom - e.deltaY * zoomSpeed;
    const newZoom = Math.min(Math.max(nextZoom, 0.4), 3.0);

    if (oldZoom === newZoom) return;

    // 2. Get mouse position relative to the canvas
    const rect = (e.currentTarget as HTMLElement).getBoundingClientRect();
    const mouseX = e.clientX - rect.left;
    const mouseY = e.clientY - rect.top;

    // 3. Adjust x and y to "pin" the zoom to the mouse position
    // Formula: NewOffset = MousePos - (MousePos - OldOffset) * (NewZoom / OldZoom)
    const zoomRatio = newZoom / oldZoom;
    cameraRef.current.x = mouseX - (mouseX - cameraRef.current.x) * zoomRatio;
    cameraRef.current.y = mouseY - (mouseY - cameraRef.current.y) * zoomRatio;
    cameraRef.current.zoom = newZoom;
  };

  const centerOnTile = (q: number, r: number) => {
    const zoom = cameraRef.current.zoom;
    
    // 1. Calculate the raw pixel position of the hex (relative to world 0,0)
    const worldX = HEX_SIZE * (3/2 * q) * zoom;
    const worldY = HEX_SIZE * (Math.sqrt(3)/2 * q + Math.sqrt(3) * r) * zoom;

    // 2. Set camera so that worldX/worldY appears at screen center
    cameraRef.current.x = (window.innerWidth / 2) - worldX;
    cameraRef.current.y = (window.innerHeight / 2) - worldY;
  };

  return { cameraRef, mouseState, onMouseMove, onWheel, centerOnTile };
};