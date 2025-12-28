export const HEX_SIZE = 30;

/**
 * Calculates the center pixel position of a hex given axial coordinates
 */
export const getHexPixelPos = (q: number, r: number, camX: number, camY: number, zoom: number) => {
  const x = HEX_SIZE * (3/2 * q) * zoom + camX;
  const y = HEX_SIZE * (Math.sqrt(3)/2 * q + Math.sqrt(3) * r) * zoom + camY;
  return { x, y };
};

/**
 * Draws a single hexagon
 */
export const drawHexagon = (
  ctx: CanvasRenderingContext2D, 
  x: number, 
  y: number, 
  size: number, 
  color: string,
  isHovered: boolean
) => {
  ctx.beginPath();
  for (let i = 0; i < 6; i++) {
    const angle = (Math.PI / 3) * i;
    ctx.lineTo(x + size * Math.cos(angle), y + size * Math.sin(angle));
  }
  ctx.closePath();
  
  ctx.fillStyle = color;
  ctx.fill();
  
  ctx.strokeStyle = isHovered ? '#fff' : '#444';
  ctx.lineWidth = isHovered ? 3 : 1;
  ctx.stroke();
};

/**
 * Converts screen pixels back to axial hex coordinates (q, r)
 */
export const pixelToHex = (mouseX: number, mouseY: number, camX: number, camY: number, zoom: number) => {
  // 1. Adjust for Camera and Zoom to get "World Space" coordinates
  const worldX = (mouseX - camX) / zoom;
  const worldY = (mouseY - camY) / zoom;

  // 2. Inverse of the layout matrix (Pointy-top hexes)
  const q = (2/3 * worldX) / HEX_SIZE;
  const r = (-1/3 * worldX + Math.sqrt(3)/3 * worldY) / HEX_SIZE;

  // 3. Hex Rounding (crucial for finding the exact hex center)
  return hexRound(q, r);
};

/**
 * Rounds fractional hex coordinates to the nearest whole integer hex
 */
function hexRound(fracQ: number, fracR: number) {
  let q = Math.round(fracQ);
  let r = Math.round(fracR);
  let s = Math.round(-fracQ - fracR);

  const qDiff = Math.abs(q - fracQ);
  const rDiff = Math.abs(r - fracR);
  const sDiff = Math.abs(s - (-fracQ - fracR));

  if (qDiff > rDiff && qDiff > sDiff) {
    q = -r - s;
  } else if (rDiff > sDiff) {
    r = -q - s;
  }
  
  return { q, r };
}

export const hexToRgba = (hex: string, alpha: number) => {
  const r = parseInt(hex.slice(1, 3), 16);
  const g = parseInt(hex.slice(3, 5), 16);
  const b = parseInt(hex.slice(5, 7), 16);
  return `rgba(${r}, ${g}, ${b}, ${alpha})`;
};