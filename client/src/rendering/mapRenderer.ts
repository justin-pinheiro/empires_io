// utils/MapRenderer.ts
import { BUILDING_ICONS } from '../utils/assetLoader';
import { getHexPixelPos, drawHexagon, HEX_SIZE } from '../utils/hexMath';

export interface RenderState {
  tiles: any[];
  buildings: Map<string, any>;
  camera: { x: number; y: number; zoom: number };
}

export class MapRenderer {
  /**
   * Main draw loop for the entire scene.
   */
  static draw(ctx: CanvasRenderingContext2D, state: RenderState) {
    const { tiles, buildings, camera } = state;
    const canvas = ctx.canvas;

    // 1. Clear with background color
    ctx.fillStyle = '#1a1a1a';
    ctx.fillRect(0, 0, canvas.width / window.devicePixelRatio, canvas.height / window.devicePixelRatio);

    // 2. Render Layers
    this.drawTerrain(ctx, tiles, camera);
    this.drawBuildings(ctx, tiles, buildings, camera);
  }

  private static drawTerrain(ctx: CanvasRenderingContext2D, tiles: any[], camera: any) {
    const size = HEX_SIZE * camera.zoom;
    
    for (const tile of tiles) {
      const { x, y } = getHexPixelPos(tile.x, tile.y, camera.x, camera.y, camera.zoom);

      // Frustum Culling
      if (this.isOffscreen(x, y, size, ctx.canvas)) continue;

      drawHexagon(ctx, x, y, size, tile.terrain?.color || '#333', false);
    }
  }

  private static drawBuildings(ctx: CanvasRenderingContext2D, tiles: any[], buildings: Map<string, any>, camera: any) {
    const size = HEX_SIZE * camera.zoom;

    for (const tile of tiles) {
      const building = buildings.get(tile.id);
      if (!building) continue;

      const { x, y } = getHexPixelPos(tile.x, tile.y, camera.x, camera.y, camera.zoom);
      if (this.isOffscreen(x, y, size, ctx.canvas)) continue;

      // Draw Icon
      const icon = BUILDING_ICONS[building.type.toUpperCase()];
      const iconSize = size * 1.3;
      if (icon?.complete) {
        ctx.drawImage(icon, x - iconSize / 2, y - iconSize / 2, iconSize, iconSize);
      }

      // Draw Health Bar
      if (building.health.current < building.health.max) {
        this.drawHealthBar(ctx, x, y, size, building.health.current / building.health.max);
      }
    }
  }

  private static drawHealthBar(ctx: CanvasRenderingContext2D, x: number, y: number, size: number, pct: number) {
    const barW = size;
    const barH = 4;
    ctx.fillStyle = '#444';
    ctx.fillRect(x - barW / 2, y + size / 2, barW, barH);
    ctx.fillStyle = pct < 0.3 ? '#ff4d4d' : '#00ff00';
    ctx.fillRect(x - barW / 2, y + size / 2, barW * pct, barH);
  }

  private static isOffscreen(x: number, y: number, size: number, canvas: HTMLCanvasElement): boolean {
    return (
      x < -size || 
      x > window.innerWidth + size || 
      y < -size || 
      y > window.innerHeight + size
    );
  }
}