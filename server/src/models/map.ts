import { Tile } from "./tile.js";
import { getRandomTerrainType } from "./terrainTypeEnum.js";
import { Building } from "./building.js";

export class GameMap {
    private readonly tiles: Map<string, Tile> = new Map();
    private readonly buildings: Map<string, Building> = new Map();
    private readonly size: number;
   
    
    constructor(size: number) {
        this.generateHexagonalTiles(size);
        this.linkNeighbors();
        this.size = size;
    }
    
    /**
     * Generates a hexagonal grid using Axial Coordinates (q, r).
    */
   private generateHexagonalTiles(size: number): void {
        for (let q = -size; q <= size; q++) {
            const r1 = Math.max(-size, -q - size);
            const r2 = Math.min(size, -q + size);
            
        for (let r = r1; r <= r2; r++) {
            const id = this.getCoordKey(q, r);
            this.tiles.set(id, new Tile(id, q, r, null, getRandomTerrainType(), []));
        }
    }
}

/**
     * Helper to ensure consistent coordinate key formatting.
     */
    private getCoordKey(q: number, r: number): string {
        return `${q},${r}`;
    }
    
    private linkNeighbors(): void {
        for (const [id, tile] of this.tiles) {
            const neighborIds = this.calculateNeighborIds(id);
            neighborIds.forEach(neighborId => {
                tile.addNeighbor(neighborId);
            });
        }
    }
    
    private getCenterTile() {
        return this.getTile("0,0");
    }
    
    public getTileIdsInRange(startTile: Tile, range: number): string[] {
        const visited = new Set<string>();
        let currentFringe: string[] = [startTile.getId()];
        visited.add(startTile.getId());
        
        for (let i = 0; i < range; i++) {
            const nextFringe: string[] = [];
            for (const tileId of currentFringe) {
                const tile = this.getTile(tileId);
                if (!tile) continue;
                
                tile.getNeighbors().forEach(neighborId => {
                    if (neighborId && !visited.has(neighborId)) {
                        visited.add(neighborId);
                        nextFringe.push(neighborId);
                    }
                });
            }
            currentFringe = nextFringe;
        }
        
        return Array.from(visited);
    }
    
    /**
     * Returns a tile that is far from center of the map 
     * (distance from center = map size / 2)
     * and far from other players 
     * (minimum distance = map size)
    */
    public getRandomTileIdFarFromCenterAndOtherPlayers(playerTiles: Array<Tile>) {
        let possibleTiles = this.getAllTileIds();
        const centerTile = this.getCenterTile();
        
        if (centerTile) {
            playerTiles.push(centerTile);
        };
        
        playerTiles.forEach(tile => {
            let inRangeTileIds = this.getTileIdsInRange(tile, Math.floor(this.size/2))
            inRangeTileIds.forEach(tileId => { 
                if (possibleTiles.includes(tileId)) {
                    possibleTiles.splice(possibleTiles.indexOf(tileId), 1);
                }
            });
        })
        
        return possibleTiles[Math.floor(Math.random()*possibleTiles.length)];;
    }

    /**
     * Standard Axial hex neighbor offsets.
     */
    private calculateNeighborIds(tileId: string): (string | null)[] {
        const parts = tileId.split(',');
        const q = Number(parts[0]);
        const r = Number(parts[1]);
        
        const directions: [number, number][] = [
            [1, 0], [1, -1], [0, -1],
            [-1, 0], [-1, 1], [0, 1]
        ];
        
        return directions.map(([dq, dr]) => {
            const targetId = this.getCoordKey((q + dq), (r + dr));
            return this.tiles.has(targetId) ? targetId : null;
        });
    }

    // --- Building Management ---
    
    public setBuilding(tileKey: string, building: Building): void {
        if (!this.tiles.has(tileKey)) throw new Error(`Tile ${tileKey} does not exist.`);
        this.buildings.set(tileKey, building);
    }

    public setTileOwner(tileKey: string, playerId: string) {
        if (!this.tiles.has(tileKey)) throw new Error(`Tile ${tileKey} does not exist.`);
        this.getTile(tileKey)!.setOwnerId(playerId);
    }

    removeTileOwner(tileKey: string) {
        if (!this.tiles.has(tileKey)) throw new Error(`Tile ${tileKey} does not exist.`);
            this.getTile(tileKey)!.removeOwnerId();
    }
    
    public setNeighboringTilesOwner(tileKey: string, playerId: string) {
        if (!this.tiles.has(tileKey)) throw new Error(`Tile ${tileKey} does not exist.`);
        this.getTile(tileKey)?.getNeighbors().forEach(neighbor => {
            if (neighbor && this.getTile(neighbor)?.getOwnerId() === null) this.getTile(neighbor)?.setOwnerId(playerId);
        })
    }

    public removeBuilding(tileKey: string): void {
        this.buildings.delete(tileKey);
    }

    public getBuilding(tileKey: string): Building | undefined {
        return this.buildings.get(tileKey);
    }

    public getAllBuildings(): Array<Building> {
        return this.buildings.values().toArray();
    }

    public getAllBuildingTiles(): Array<string> {
        return this.buildings.keys().toArray();
    }

    // --- Getters ---

    public getTile(id: string): Tile | undefined {
        return this.tiles.get(id);
    }

    public getAllTileIds(): string[] {
        return Array.from(this.tiles.keys());
    }

    public getBuildingsCount(): number {
        return this.buildings.size;
    }

    public getTileIds(tiles: Array<Tile>) {
        let tileIds: Array<string> = [];
        tiles.forEach(tile => {
            if (!tileIds.includes(tile.getId())) 
                tileIds.push(tile.getId());
        })
    }
}