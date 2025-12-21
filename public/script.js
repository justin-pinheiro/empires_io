const socket = io();
const canvas = document.getElementById('gameCanvas');
const ctx = canvas.getContext('2d');

let worldMap = {};
let myId = null;
let currentBuildType = 'farm';
const HEX_SIZE = 30;

// Camera State
let camX = window.innerWidth / 2;
let camY = window.innerHeight / 2;
let zoom = 1.0;
let isDragging = false;
let lastMouseX, lastMouseY;
let needsRedraw = true;

// --- OFFSCREEN PRERENDERING ---
const hexCache = document.createElement('canvas');
const hctx = hexCache.getContext('2d');
const cachePadding = 5;

function updateHexCache() {
    const size = HEX_SIZE;
    hexCache.width = (size * 2 + cachePadding) * 2;
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
    hctx.lineWidth = 2;
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
    zoom -= e.deltaY * 0.001;
    zoom = Math.min(Math.max(0.1, zoom), 3);
    needsRedraw = true;
}, { passive: false });

canvas.addEventListener('mousedown', (e) => {
    isDragging = false; // Reset dragging flag on new click
    lastMouseX = e.clientX;
    lastMouseY = e.clientY;
});

window.addEventListener('mousemove', (e) => {
    const dx = Math.abs(e.clientX - lastMouseX);
    const dy = Math.abs(e.clientY - lastMouseY);
    if (dx > 2 || dy > 2) { // Tolerance for "accidental" drag
        if (e.buttons === 1) { // Left mouse button held
            isDragging = true;
            camX += e.clientX - lastMouseX;
            camY += e.clientY - lastMouseY;
            lastMouseX = e.clientX;
            lastMouseY = e.clientY;
            needsRedraw = true;
        }
    }
});

canvas.addEventListener('click', (e) => {
    if (isDragging) return; 
    const hexKey = pixelToHex(e.clientX, e.clientY);
    socket.emit('build', { coords: hexKey, type: currentBuildType });
});

// --- MATH HELPERS ---

function pixelToHex(x, y) {
    let ptX = (x - camX) / zoom;
    let ptY = (y - camY) / zoom;
    let q = (2/3 * ptX) / HEX_SIZE;
    let r = (-1/3 * ptX + Math.sqrt(3)/3 * ptY) / HEX_SIZE;
    return hexRound(q, r);
}

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

// --- RENDERING ---

function gameLoop() {
    if (needsRedraw) {
        render();
        needsRedraw = false;
    }
    requestAnimationFrame(gameLoop);
}

function render() {
    ctx.clearRect(0, 0, canvas.width, canvas.height);
    const dynamicSize = HEX_SIZE * zoom;
    const drawW = hexCache.width * zoom;
    const drawH = hexCache.height * zoom;
    const offset = drawW / 2;

    for (let key in worldMap) {
        const [q, r] = key.split(',').map(Number);
        const px = HEX_SIZE * (3/2 * q) * zoom + camX;
        const py = HEX_SIZE * (Math.sqrt(3)/2 * q + Math.sqrt(3) * r) * zoom + camY;

        // Culling
        if (px < -offset || px > canvas.width + offset || py < -offset || py > canvas.height + offset) continue;

        // 1. Draw Background Hex
        ctx.drawImage(hexCache, px - offset, py - offset, drawW, drawH);

        // 2. Draw Owner Color & Type
        const hex = worldMap[key];
        if (hex.owner) {
            ctx.globalAlpha = 0.7;
            ctx.fillStyle = hex.color;
            ctx.beginPath();
            ctx.arc(px, py, dynamicSize * 0.7, 0, Math.PI * 2);
            ctx.fill();
            ctx.globalAlpha = 1.0;

            if (zoom > 0.5) {
                ctx.fillStyle = "white";
                ctx.font = `${12 * zoom}px Arial`;
                ctx.textAlign = "center";
                ctx.fillText(
                    hex.type[0].toUpperCase()+hex.type[1].toLowerCase()
                    , px, py + (5 * zoom));
            }
        }
    }
}

// --- SOCKETS ---

socket.on('mapUpdate', (data) => {
    worldMap = data;
    needsRedraw = true;
});

socket.on('resourceUpdate', (data) => {
    document.getElementById('foodVal').innerText = data.food;
    document.getElementById('goldVal').innerText = data.gold;
    document.getElementById('stoneVal').innerText = data.stone;
    document.getElementById('tilesVal').innerText = data.tiles;
    document.getElementById('populationVal').innerText = data.population;
});

socket.on('connect', () => {
    socket.emit('join'); // Automatically join on connection
});

socket.on('error', (msg) => showMessage(msg));

requestAnimationFrame(gameLoop);

// UI Helper
function setBuildType(type) {
    currentBuildType = type;
}


function showMessage(text) {
    const el = document.createElement("div");
    el.innerText = text;
    Object.assign(el.style, {
        position: "fixed", top: "20%", left: "50%", transform: "translateX(-50%)",
        background: "rgba(255, 0, 0, 0.8)", color: "white", padding: "15px",
        borderRadius: "8px", zIndex: "9999", pointerEvents: "none", fontFamily: "sans-serif"
    });
    document.body.appendChild(el);
    setTimeout(() => el.remove(), 3000);
}