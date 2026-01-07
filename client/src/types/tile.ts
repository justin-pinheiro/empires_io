import type { TerrainDefinition } from "./terrain";

export interface Tile {
  id: string;
  x: number;
  y: number;
  neighbors: string[];
  terrain: TerrainDefinition;
}
