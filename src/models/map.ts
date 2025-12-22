import { Tile } from "./tile";
import { getRandomTerrainType } from "./terrainTypeEnum";

export class Map {
    private tiles : Record<string, Tile> = {};

    constructor(size: number) {
        this.tiles = this.generateHexagonalTiles(size);
    }

    /**
    * Generates tiles objects in an hexagonal shape.
    * @param {string} size - How large the generate tiles map should be.
    * @return {Record<string, Tile>} tiles generated.
    */
    generateHexagonalTiles(size: number) {
        let tiles: Record<string, Tile> = {};

        for (let x = -size; x <= size; x++) {
            let y1 = Math.max(-size, -x - size);
            let y2 = Math.min(size, -x + size);

            for (let y = y1; y <= y2; y++) {
                const coordKey = `${x},${y}`;
                this.tiles[coordKey] = new Tile(coordKey, x, y, this.getNeighborsIds(coordKey, 1), getRandomTerrainType());
            }
        }

        return tiles;
    }

    /**
    * Retrieves neighboring tile ids within a certain distance.
    * @param {string} tileId - The "x,z" coordinate string.
    * @param {number} distance - How many rings out to search (default 1).
    * @returns {string[]} Array of found tile ids.
    */
    getNeighborsIds(tileId: string, distance: number = 1) {
        const [startX, startZ] = tileId.split(',').map(Number);
        const neighborsFound = [];

        for (let dx = -distance; dx <= distance; dx++) {
            for (let dz = Math.max(-distance, -dx - distance); dz <= Math.min(distance, -dx + distance); dz++) {
                if (dx === 0 && dz === 0) continue;

                const targetX = startX + dx;
                const targetZ = startZ + dz;
                const targetId = `${targetX},${targetZ}`;

                if (this.tiles[targetId]) {
                neighborsFound.push(targetId);
                }
            }
        }

        return neighborsFound;
    }
}