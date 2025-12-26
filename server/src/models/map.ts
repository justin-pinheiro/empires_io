import { Tile } from "./tile.js";
import { getRandomTerrainType } from "./terrainTypeEnum.js";
import { Building } from "./building.js";

export class GameMap {
    private readonly tiles: Map<string, Tile> = new Map();
    private readonly buildings: Map<string, Building> = new Map();

    constructor(size: number) {
        this.generateHexagonalTiles(size);
        this.linkNeighbors();
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
            this.tiles.set(id, new Tile(id, q, r, getRandomTerrainType(), []));
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

    /**
     * Standard Axial hex neighbor offsets.
     */
    private calculateNeighborIds(tileId: string): string[] {
        const parts = tileId.split(',');
        const q = Number(parts[0]);
        const r = Number(parts[1]);
        const neighbors: string[] = [];
        
        // The 6 directions in a hex grid
        const directions: [number, number][] = [
            [1, 0], [1, -1], [0, -1],
            [-1, 0], [-1, 1], [0, 1]
        ];

        for (const [dq, dr] of directions) {
            const targetId = this.getCoordKey((q + dq), (r + dr));
            if (this.tiles.has(targetId)) {
                neighbors.push(targetId);
            }
        }
        return neighbors;
    }

    // --- Building Management ---

    public setBuilding(tileKey: string, building: Building): void {
        if (!this.tiles.has(tileKey)) throw new Error(`Tile ${tileKey} does not exist.`);
        this.buildings.set(tileKey, building);
    }

    public removeBuilding(tileKey: string): void {
        this.buildings.delete(tileKey);
    }

    public getBuilding(tileKey: string): Building | undefined {
        return this.buildings.get(tileKey);
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
}