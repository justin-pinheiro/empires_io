import { describe, it, expect, beforeEach, vi } from 'vitest';
import { HexagonalMap } from '../../models/hexagonalMap.js';


vi.mock('./terrainTypeEnum', async (importOriginal) => {
  const actual = await importOriginal<typeof import('../../models/terrainTypeEnum.js')>();
  return {
    ...actual,
    getRandomTerrainType: vi.fn(() => 'PLAIN'),
  };
});

describe('HexagonalMap', () => {
  const MAP_SIZE = 2; // 19 tiles for a radius of 2

  describe('Grid Generation', () => {
    it('should generate the correct number of tiles for a given size', () => {
      const map = new HexagonalMap(MAP_SIZE);
      // Formula for hex grid tiles: 3n^2 + 3n + 1
      const expectedCount = 3 * Math.pow(MAP_SIZE, 2) + 3 * MAP_SIZE + 1;
      
      expect(map.getAllTileIds().length).toBe(expectedCount);
      expect(map.getCenterTile()).toBeDefined();
      expect(map.getTile(`${MAP_SIZE},0`)).toBeDefined();
      expect(map.getTile(`${MAP_SIZE + 1},0`)).toBeUndefined();
    });

    it('should link neighbors correctly for the center tile', () => {
      const map = new HexagonalMap(MAP_SIZE);
      
      const centerTile = map.getCenterTile();
      expect(centerTile).toBeDefined();
      
      const neighbors = centerTile.getNeighbors();
      const expectedNeighbors = ["1,0", "1,-1", "0,-1", "-1,0", "-1,1", "0,1"];
      
      expectedNeighbors.forEach(id => {
        expect(neighbors, `Neighbor ${id} missing from center tile`).toContain(id);
      });

      expect(neighbors).toHaveLength(6);
    });
  });

  describe('Spatial Queries', () => {
    it('should find all tiles in range 1 (center + immediate neighbors)', () => {
      const map = new HexagonalMap(MAP_SIZE);
      const center = map.getTile("0,0")!;
      const inRange = map.getTileIdsInRange(center, 1);

      expect(inRange.size).toBe(7);
      expect(inRange.has("0,0")).toBe(true);
      expect(inRange.has("1,0")).toBe(true);
    });

    it('should return a tile far from center and players', () => {
      const map = new HexagonalMap(5); // Larger map for better distance testing
      const playerTile = map.getTile("5,0")!; // Edge tile
      
      const farTile = map.getRandomTileIdFarFromCenterAndOtherPlayers([playerTile]);
      
      expect(farTile).not.toBeNull();
      expect(farTile?.getId()).not.toBe("0,0");
      expect(farTile?.getId()).not.toBe("5,0");
    });
  });

  describe('Building Management', () => {
    let map: HexagonalMap;
    const mockBuilding = { name: 'Barracks' } as any;

    beforeEach(() => {
      map = new HexagonalMap(MAP_SIZE);
    });

    it('should place and retrieve a building', () => {
      map.setBuilding("0,0", mockBuilding);
      expect(map.getBuilding("0,0")).toBe(mockBuilding);
    });

    it('should throw error when placing building on non-existent tile', () => {
      expect(() => map.setBuilding("99,99", mockBuilding)).toThrow();
    });

    it('should remove buildings correctly', () => {
      map.setBuilding("0,0", mockBuilding);
      map.removeBuilding("0,0");
      expect(map.getBuilding("0,0")).toBeUndefined();
    });

    it('should return all buildings as an array', () => {
      map.setBuilding("0,0", mockBuilding);
      map.setBuilding("1,0", { name: 'Farm' } as any);
      
      const all = map.getAllBuildings();
      expect(all).toHaveLength(2);
      expect(all).toContain(mockBuilding);
    });
  });
});