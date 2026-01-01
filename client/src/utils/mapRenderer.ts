// rendering/MapRenderer.ts
import { BUILDING_ICONS } from './assetLoader';
import { getHexPixelPos, drawHexagon, HEX_SIZE, hexToRgba } from './hexMath';

export interface RenderState {
  tiles: any[];
  buildings: Map<string, any>;
  players: Map<string, any>;
  camera: { x: number; y: number; zoom: number };
  selectedTileId: string | null;
}

export class MapRenderer {
  
  /**
   * Main draw loop for the entire scene.
   */
  static draw(ctx: CanvasRenderingContext2D, state: RenderState) {
    const { tiles, buildings, players, camera, selectedTileId } = state;
    const canvas = ctx.canvas;

    // 1. Clear with background color (Optimization: clear only the logical size)
    const dpr = window.devicePixelRatio || 1;
    ctx.fillStyle = '#1a1a1a';
    ctx.fillRect(0, 0, canvas.width / dpr, canvas.height / dpr);

    // 2. Render Layers
    this.drawTerrain(ctx, tiles, camera);

    this.drawTerritories(ctx, tiles, players, camera);

    if (selectedTileId) this.drawSelection(ctx, tiles, selectedTileId, camera);
    this.drawBuildings(ctx, tiles, players, buildings, camera); // Passed tiles for coordinate lookup
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

  private static drawSelection(ctx: CanvasRenderingContext2D, tiles: any[], selectedId: string, camera: any) {
    const tile = tiles.find(t => t.id === selectedId);
    if (!tile) return;

    const { x, y } = getHexPixelPos(tile.x, tile.y, camera.x, camera.y, camera.zoom);
    const size = HEX_SIZE * camera.zoom;

    // Draw the dark border
    ctx.save(); // Save state to avoid messing up other draws
    ctx.beginPath();
    for (let i = 0; i < 6; i++) {
      const angle = (Math.PI / 3) * i;
      ctx.lineTo(x + size * Math.cos(angle), y + size * Math.sin(angle));
    }
    ctx.closePath();

    ctx.strokeStyle = 'rgba(20, 20, 20, 0.8)'; // Dark/Grey border
    ctx.lineWidth = 5 * camera.zoom;
    ctx.stroke();
    ctx.restore();
  }

  private static drawBuildings(ctx: CanvasRenderingContext2D, tiles: any[], players: Map<string, any>, buildings: Map<string, any>, camera: any) {
    if (buildings.size === 0) return;

    // Optimization: Create a Map for tiles if it's currently an array
    // Ideally, do this once in your Hook, not inside the draw loop!
    const tileMap = new Map(tiles.map(t => [t.id.toString(), t])); 

    const size = HEX_SIZE * camera.zoom;

    buildings.forEach((building, tileId) => {
      // Ensure tileId is treated as a string to match Map keys
      const tile = tileMap.get(tileId.toString());
      
      if (!tile) {
        // console.warn(`No tile found for building at ${tileId}`);
        return;
      }

      const { x, y } = getHexPixelPos(tile.x, tile.y, camera.x, camera.y, camera.zoom);

      if (this.isOffscreen(x, y, size, ctx.canvas)) return;

      const originalIcon = BUILDING_ICONS[building.type.toUpperCase()];

      if (originalIcon && originalIcon.complete) {
          // Find the owner's color (default to white if not found)
          const owner = players.get(String(building.ownerId));
          const color = owner ? owner.color : '#ffffff';

          // Get the tinted version
          const tintedIcon = this.getTintedIcon(originalIcon, color);

          const iconSize = size * 2;

          ctx.drawImage(tintedIcon, x - iconSize / 2, y - iconSize / 2, iconSize, iconSize);
        } else {
        // Temporary fallback: Draw a circle so we can at least see where it should be
        ctx.beginPath();
        ctx.arc(x, y, size / 3, 0, Math.PI * 2);
        ctx.fillStyle = 'red';
        ctx.fill();
      }

      if (building.health && building.health.current < building.health.max) {
        this.drawHealthBar(ctx, x, y, size, building.health.current / building.health.max);
      }
  });
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

  private static drawTerritories(ctx: CanvasRenderingContext2D, tiles: any[], players: Map<string, any>, camera: any) {
    const size = HEX_SIZE * camera.zoom;
    const tileMap = new Map(tiles.map(t => [String(t.id), t]));

    for (const tile of tiles) {
      if (!tile.ownerId) continue;
      
      const player = players.get(String(tile.ownerId));
      if (!player) continue;

      const { x, y } = getHexPixelPos(tile.x, tile.y, camera.x, camera.y, camera.zoom);
      if (this.isOffscreen(x, y, size, ctx.canvas)) continue;

      // Call Function 1: The Overlay
      this.drawTerritoryOverlay(ctx, x, y, size, player.color);
    }
  }

  private static drawTerritoryOverlay(ctx: CanvasRenderingContext2D, x: number, y: number, size: number, color: string) {
    ctx.beginPath();
    for (let i = 0; i < 6; i++) {
      const angle = (Math.PI / 3) * i;
      ctx.lineTo(x + size * Math.cos(angle), y + size * Math.sin(angle));
    }
    ctx.closePath();
    ctx.fillStyle = hexToRgba(color, 0.1);
    ctx.fill();
  }

  private static drawInternalBorders(
    ctx: CanvasRenderingContext2D, 
    tile: any, 
    tileMap: Map<string, any>, 
    x: number, 
    y: number, 
    size: number, 
    playerColor: string,
    zoom: number
  ) {
    if (!tile.ownerId) return;

    ctx.save();
    
    // Set style
    ctx.strokeStyle = playerColor;
    const borderThickness = 4 * zoom; // Slightly thinner looks better when doubled
    ctx.lineWidth = borderThickness; 
    ctx.lineCap = 'round';

    // 1. Calculate the offset distance (how much to move inside)
    // We move in by half the thickness plus a tiny gap (1px) so they don't touch
    const inset = (borderThickness / 4) + (1 * zoom);

    // 2. Pre-calculate all 6 vertices (Poi2ty-Top)
    const v: {x: number, y: number}[] = [];
    for (let i = 0; i < 6; i++) {
      const angle = (Math.PI / 3) * i;
      v.push({
        x: x + size * Math.cos(angle),
        y: y + size * Math.sin(angle)
      });
    }

    const edgeIndices = [
      [0, 1], [5, 0], [4, 5], [3, 4], [2, 3], [1, 2]
    ];

    tile.neighbors.forEach((neighborId: string | null, i: number) => {
      const neighbor = neighborId ? tileMap.get(String(neighborId)) : null;
      const isDifferentOwner = !neighbor || String(neighbor.ownerId) !== String(tile.ownerId);

      if (isDifferentOwner) {
        const [vStartIdx, vEndIdx] = edgeIndices[i];
        const vStart = v[vStartIdx];
        const vEnd = v[vEndIdx];

        // --- INSET CALCULATION ---
        // 1. Get the vector of the edge
        const dx = vEnd.x - vStart.x;
        const dy = vEnd.y - vStart.y;
        
        // 2. Find the normal (perpendicular) vector pointing toward the center
        // For a hex centered at (x,y), the direction to center is:
        const edgeMidX = (vStart.x + vEnd.x) / 2;
        const edgeMidY = (vStart.y + vEnd.y) / 2;
        const toCenterX = x - edgeMidX;
        const toCenterY = y - edgeMidY;

        // 3. Normalize the vector pointing to center
        const dist = Math.sqrt(toCenterX * toCenterX + toCenterY * toCenterY);
        const offsetX = (toCenterX / dist) * inset;
        const offsetY = (toCenterY / dist) * inset;

        // 4. Draw the line shifted inward
        ctx.beginPath();
        ctx.moveTo(vStart.x + offsetX, vStart.y + offsetY);
        ctx.lineTo(vEnd.x + offsetX, vEnd.y + offsetY);
        ctx.stroke();
      }
    });

    ctx.restore();
  }

  private static tintCache = new Map<string, HTMLCanvasElement>();

  private static getTintedIcon(icon: HTMLImageElement, color: string): HTMLCanvasElement {
      const key = `${icon.src}-${color}`;
      if (this.tintCache.has(key)) return this.tintCache.get(key)!;

      const tempCanvas = document.createElement('canvas');
      const tempCtx = tempCanvas.getContext('2d')!;
      tempCanvas.width = icon.width;
      tempCanvas.height = icon.height;

      // 1. Draw the icon
      tempCtx.drawImage(icon, 0, 0);

      // 2. Overlay the color
      tempCtx.globalCompositeOperation = 'source-in';
      tempCtx.fillStyle = color;
      tempCtx.fillRect(0, 0, tempCanvas.width, tempCanvas.height);

      this.tintCache.set(key, tempCanvas);
      return tempCanvas;
  }
}