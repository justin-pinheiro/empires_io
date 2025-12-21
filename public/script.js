const socket = io();
const canvas = document.getElementById('gameCanvas');
const ctx = canvas.getContext('2d');

let worldMap = {};
const HEX_SIZE = 30;

// Camera State
let camX = window.innerWidth / 2;
let camY = window.innerHeight / 2;
let zoom = 1.0;
let isDragging = false;
let lastMouseX, lastMouseY;
let needsRedraw = true;

// --- OFFSCREEN PRERENDERING ---
// Create a cache for the hex shape to avoid path calculations
const hexCache = document.createElement('canvas');
const hctx = hexCache.getContext('2d');
const cachePadding = 2;

function updateHexCache() {
    const size = HEX_SIZE;
    hexCache.width = (size * 2 + cachePadding) * 2; // Extra room for stroke
    hexCache.height = (size * 2 + cachePadding) * 2;
    
    const centerX = hexCache.width / 2;
    const centerY = hexCache.height / 2;

    hctx.beginPath();
    for (let i = 0; i < 6; i++) {
        let angle = (Math.PI / 3) * i;
        hctx.lineTo(centerX + size * Math.cos(angle), centerY + size * Math.sin(angle));
    }
    hctx.closePath();
    
    hctx.strokeStyle = '#444';
    hctx.lineWidth = 1;
    hctx.stroke();
    hctx.fillStyle = '#333';
    hctx.fill();
}
updateHexCache();

// --- INPUT HANDLING ---

window.addEventListener('resize', () => {
    canvas.width = window.innerWidth;
    canvas.height = window.innerHeight;
    needsRedraw = true;
});
canvas.width = window.innerWidth;
canvas.height = window.innerHeight;

canvas.addEventListener('wheel', (e) => {
    e.preventDefault();
    const zoomSpeed = 0.002;
    const delta = e.deltaY;
    zoom -= delta * zoomSpeed;
    zoom = Math.min(Math.max(0.1, zoom), 3);
    needsRedraw = true;
}, { passive: false });

canvas.addEventListener('mousedown', (e) => {
    isDragging = true;
    lastMouseX = e.clientX;
    lastMouseY = e.clientY;
});

window.addEventListener('mousemove', (e) => {
    if (!isDragging) return;
    camX += e.clientX - lastMouseX;
    camY += e.clientY - lastMouseY;
    lastMouseX = e.clientX;
    lastMouseY = e.clientY;
    needsRedraw = true;
});

window.addEventListener('mouseup', () => isDragging = false);

// --- RENDERING LOGIC ---

function gameLoop() {
    if (needsRedraw) {
        render();
        needsRedraw = false;
    }
    requestAnimationFrame(gameLoop);
}
requestAnimationFrame(gameLoop);

function render() {
    ctx.clearRect(0, 0, canvas.width, canvas.height);
    
    // Constants for the loop
    const sqrt3 = Math.sqrt(3);
    const horizontalDist = HEX_SIZE * 1.5 * zoom;
    const verticalDist = HEX_SIZE * sqrt3 * zoom;
    const halfVertical = verticalDist / 2;
    
    const drawWidth = hexCache.width * zoom;
    const drawHeight = hexCache.height * zoom;
    const offset = (hexCache.width * zoom) / 2;

    for (let key in worldMap) {
        let [q, r] = key.split(',').map(Number);
        
        // Axial to Pixel calculation (Optimized)
        const px = HEX_SIZE * (3/2 * q) * zoom + camX;
        const py = HEX_SIZE * (sqrt3/2 * q + sqrt3 * r) * zoom + camY;

        // Culling: Skip if hex is off-screen
        if (px < -drawWidth || px > canvas.width + drawWidth || 
            py < -drawHeight || py > canvas.height + drawHeight) {
            continue; 
        }

        // Use drawImage instead of path drawing (Much faster)
        ctx.drawImage(
            hexCache, 
            px - offset, 
            py - offset, 
            drawWidth, 
            drawHeight
        );

        // Only draw text if extremely zoomed in
        if (zoom > 1.2) {
            ctx.fillStyle = "rgba(255,255,255,0.3)";
            ctx.font = "10px Arial";
            ctx.textAlign = "center";
            ctx.fillText(key, px, py + 4);
        }
    }
}

socket.on('mapUpdate', (data) => {
    worldMap = data;
    needsRedraw = true;
});

// Add these variables at the top
let myId = null;

// Convert Pixel (Screen) back to Axial (Hex)
function pixelToHex(x, y) {
    // Adjust for camera and zoom
    let ptX = (x - camX) / zoom;
    let ptY = (y - camY) / zoom;

    let q = (2/3 * ptX) / HEX_SIZE;
    let r = (-1/3 * ptX + Math.sqrt(3)/3 * ptY) / HEX_SIZE;

    return hexRound(q, r);
}

// Rounding fractional hex coordinates to nearest integer hex
function hexRound(fQ, fR) {
    let fS = -fQ - fR;
    let q = Math.round(fQ);
    let r = Math.round(fR);
    let s = Math.round(fS);

    let qDiff = Math.abs(q - fQ);
    let rDiff = Math.abs(r - fR);
    let sDiff = Math.abs(s - fS);

    if (qDiff > rDiff && qDiff > sDiff) q = -r - s;
    else if (rDiff > sDiff) r = -q - s;
    
    return `${q},${r}`;
}

// Handle Click to Build
canvas.addEventListener('click', (e) => {
    if (isDragging) return; // Don't build if we were just dragging the map
    
    const hexKey = pixelToHex(e.clientX, e.clientY);
    socket.emit('build', hexKey);
});

// Update the render function to use the color from the map
function render() {
    ctx.clearRect(0, 0, canvas.width, canvas.height);
    const dynamicSize = HEX_SIZE * zoom;
    const offset = (hexCache.width * zoom) / 2;

    for (let key in worldMap) {
        let [q, r] = key.split(',').map(Number);
        const px = HEX_SIZE * (3/2 * q) * zoom + camX;
        const py = HEX_SIZE * (Math.sqrt(3)/2 * q + Math.sqrt(3) * r) * zoom + camY;

        if (px < -offset || px > canvas.width + offset || 
            py < -offset || py > canvas.height + offset) continue;

        // Draw cached hex
        ctx.drawImage(hexCache, px - offset, py - offset, hexCache.width * zoom, hexCache.height * zoom);

        // If owned, draw a colored overlay
        if (worldMap[key].owner) {
            ctx.globalAlpha = 0.6;
            ctx.fillStyle = worldMap[key].color;
            // Draw a simple circle or smaller hex for the color
            ctx.beginPath();
            ctx.arc(px, py, dynamicSize * 0.8, 0, Math.PI * 2);
            ctx.fill();
            ctx.globalAlpha = 1.0;
        }
    }
}

socket.on('init', (data) => {
    myId = data.id;
    worldMap = data.map;
    // Optional: Center camera on the player's village
    needsRedraw = true;
});