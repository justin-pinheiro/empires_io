import { Tile } from "./tile.js";
import { getRandomTerrainType } from "./terrainTypeEnum.js";
import { Building } from "./building.js";

export class HexagonalMap {
    private readonly tiles: Map<string, Tile> = new Map();
    private buildings: Map<string, Building> = new Map();
   
    constructor(
        private readonly size: number
    ) {
        this.generateHexagonalTiles();
        this.linkNeighbors();
    }
    
    private getCoordinatesKey(q: number, r: number): string {return `${q},${r}`;}
    public getTile(id: string): Tile | undefined {return this.tiles.get(id);}
    public getCenterTile(): Tile { return this.getTile("0,0")!; }
    public getAllTileIds(): string[] {return Array.from(this.tiles.keys());}
    public getBuildingsCount(): number {return this.buildings.size;}
    

    private generateHexagonalTiles(): void {
        for (let q = -this.size; q <= this.size; q++) {
            const r1 = Math.max(-this.size, -q - this.size);
            const r2 = Math.min(this.size, -q + this.size);
                
            for (let r = r1; r <= r2; r++) {
                const id = this.getCoordinatesKey(q, r);
                this.tiles.set(id, new Tile(id, q, r, getRandomTerrainType(), []));
            }
        }
    }

    private linkNeighbors(): void {
        const directions: [number, number][] = [
            [1, 0], [1, -1], [0, -1], 
            [-1, 0], [-1, 1], [0, 1]
        ];
        
        for (const tile of this.tiles.values()) {
            const { x: q, y: r } = tile.getCoords();
            
            for (const [dq, dr] of directions) {
                const neighborId = this.getCoordinatesKey(q + dq, r + dr);
                if (this.tiles.has(neighborId)) {
                    tile.addNeighbor(neighborId);
                }
            }
        }
    }
    
    public getTileIdsInRange(startTile: Tile, range: number): Set<string> {
        const visited = new Set<string>([startTile.getId()]);
        let fringe = new Set<string>([startTile.getId()]);

        for (let i = 0; i < range; i++) {
            const nextFringe = new Set<string>();
            for (const tileId of fringe) {
                const tile = this.getTile(tileId);
                tile?.getNeighbors().forEach(nb => {
                    if (nb && !visited.has(nb)) {
                        visited.add(nb);
                        nextFringe.add(nb);
                    }
                });
            }
            fringe = nextFringe;
        }
        return visited;
    }

    /**
     * Returns a tile that is far from center of the map 
     * (distance from center = map size / 2)
     * and far from other players 
     * (minimum distance = map size)
    */
    public getRandomTileIdFarFromCenterAndOtherPlayers(playerTiles: Tile[]): Tile | null {
        const possibleIds = new Set(this.tiles.keys());
        const range = Math.floor(this.size / 2);

        const avoidList = this.getCenterTile() ? [...playerTiles, this.getCenterTile()] : playerTiles;

        avoidList.forEach(tile => {
            const inRange = this.getTileIdsInRange(tile, range);
            inRange.forEach(id => possibleIds.delete(id));
        });

        const remainingIds = Array.from(possibleIds);
        if (remainingIds.length === 0) return null;

        const randomId = remainingIds[Math.floor(Math.random() * remainingIds.length)];
        if (randomId) return this.getTile(randomId) ?? null;
        else return null;
    }

    public setBuilding(tileKey: string, building: Building): void {
        if (!this.tiles.has(tileKey)) throw new Error(`Tile ${tileKey} does not exist.`);
        this.buildings.set(tileKey, building);
    }

    public removeBuilding(tileKey: string): void { this.buildings.delete(tileKey); }
    
    public getBuilding(tileKey: string): Building | undefined { return this.buildings.get(tileKey); }

    public getAllBuildings(): Building[] { return Array.from(this.buildings.values()); }

}