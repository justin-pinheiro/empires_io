// hooks/useGameConstants.ts
import { useEffect, useState } from "react";
import { socket } from "../socket";
import type { BuildingStats } from "../types/buildingStats";
import type { TerrainDefinition } from "../types/terrain";
import type { AgeStats } from "../types/age";

export interface GameConstants {
    buildingStats: Record<string, BuildingStats>;
    terrainData: Record<string, TerrainDefinition>;
    agesData: Record<number, AgeStats>;
}

let cachedConstants: GameConstants | null = null;

export const useGameConstants = () => {
    const [constants, setConstants] = useState<GameConstants | null>(cachedConstants);

    useEffect(() => {
        if (cachedConstants) return;

        const handleInit = (data: any) => {
            cachedConstants = data;
            setConstants(data);
        };

        socket.on('init_constants', handleInit);
        socket.emit('request_constants');

        return () => {
            socket.off('init_constants', handleInit);
        };
    }, []);

    return constants;
};