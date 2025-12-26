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