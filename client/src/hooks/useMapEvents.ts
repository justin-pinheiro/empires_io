import { useEffect, useRef } from "react";
import { socket } from "../socket";

interface StartData {
  startTile: { x: number; y: number };
}

export const useMapEvents = (centerOnTile: (q: number, r: number) => void) => {
  const hasCentered = useRef(false);

  useEffect(() => {
    const handleStart = (data: StartData) => {
      if (data.startTile && !hasCentered.current) {
        centerOnTile(data.startTile.x, data.startTile.y);
        hasCentered.current = true;
      }
    };

    socket.on("civilisationStart", handleStart);

    return () => {
      socket.off("civilisationStart", handleStart);
    };
  }, [centerOnTile]);

  return { resetCenter: () => (hasCentered.current = false) };
};