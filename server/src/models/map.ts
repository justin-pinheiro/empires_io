import { Tile } from "./tile.js";
import { getRandomTerrainType } from "./terrainTypeEnum.js";
import { Building } from "./building.js";

export class Map {
    private tiles : Record<string, Tile>;
    private buildings : Record<string, Building>;
    
    constructor(size: number) {
        this.tiles = this.generateHexagonalTiles(size);
        this.buildings = {};
        this.linkNeighbors();
    }
    
    /**
     * Generates tiles objects in an hexagonal shape.
     * @param {string} size - How large the generate tiles map should be.
     * @return {Record<string, Tile>} tiles generated.
    */
   generateHexagonalTiles(size: number): Record<string, Tile> {
        let tempTiles: Record<string, Tile> = {}; // Use a local variable
        
        for (let x = -size; x <= size; x++) {
            let y1 = Math.max(-size, -x - size);
            let y2 = Math.min(size, -x + size);
            
            for (let y = y1; y <= y2; y++) {
                const coordKey = `${x},${y}`;
                // Create tile without neighbors for now
                tempTiles[coordKey] = new Tile(coordKey, x, y, [], getRandomTerrainType());
            }
        }
        return tempTiles;
    }
    
    private linkNeighbors() {
        // Now 'this.tiles' is fully populated, we can safely find neighbors
        for (const tileId in this.tiles) {
            const neighborIds = this.getNeighborsIds(tileId, 1);
            
            if (this.tiles[tileId]) {
                this.tiles[tileId].setNeighbors(neighborIds);
            }
        }
    }
    
    /**
     * Retrieves neighboring tile ids within a certain distance.
     * @param {string} tileId - The "x,z" coordinate string.
     * @param {number} distance - How many rings out to search (default 1).
     * @returns {string[]} Array of found tile ids.
    */
   getNeighborsIds(tileId: string, distance: number = 1) {
       const [startXStr, startZStr] = tileId.split(',');
       const startX = Number(startXStr);
       const startZ = Number(startZStr);
       const neighborsFound: string[] = [];
       
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
    
    getTile(tileId: string) {
        return this.tiles[tileId];
    }
    
    /**
     * Retrieves a random tile id from all tiles.
     * @returns {string} Random tile id.
    */
   getRandomTileId(): string {
        const tileKeys = Object.keys(this.tiles);
        const tile = null;
    
        do {
            const randomKeyIndex = Math.floor(Math.random() * tileKeys.length);
            const tile = tileKeys[randomKeyIndex];
        } while (!tile)

        return tile;
    }
    
    setBuilding(tileKey: string, building: Building) {
        const tile = this.tiles[tileKey];
        if (!tile) {
            throw new Error(`Tile ${tileKey} not found`);
        }
        this.buildings[tileKey] = building;
    }
    
    removeBuilding(tileKey: string) {
        const tile = this.tiles[tileKey];
        if (!tile) {
            throw new Error(`Tile ${tileKey} not found`);
        }
        delete this.buildings[tileKey];
    }

    tileHasBuilding(tileKey: string) {
      return this.buildings[tileKey] != null;
    }
    
    getBuilding(tileKey: string) {
        return this.buildings[tileKey];
    }

    getAllBuildings() {
        return Object.values(this.buildings);
    }

    getBuildingsCount() {
        return Object.values(this.buildings).length;
    }

    getAllTileKeys() {
        if (!this.tiles) {
            throw Error("this.tiles does not exist.")
        }
        return Object.keys(this.tiles);
        
    }

    getAllTileIds() {
        return Object.keys(this.tiles);
    }
}