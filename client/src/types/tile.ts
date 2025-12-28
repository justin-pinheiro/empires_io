import type { TerrainDefinition } from "./terrain";

export interface Tile {
  id: string;
  x: number;
  y: number;
  ownerId: string;
  neighbors: string[];
  terrain: TerrainDefinition;
}
