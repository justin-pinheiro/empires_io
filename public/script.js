const socket = io();
const canvas = document.getElementById('gameCanvas');
const ctx = canvas.getContext('2d');

let worldMap = {};
let myId = null;
let currentBuildType = 'FARM';
let sendCount = 1; 
const HEX_SIZE = 30;

const BUILDING_ICONS = {};
const iconNames = ['farm', 'market', 'mine', 'house', 'camp', 'tower', 'capital', 'barbarian_camp'];

iconNames.forEach(name => {
    const img = new Image();
    img.src = `/buildings/${name}.png`;
    BUILDING_ICONS[name.toUpperCase()] = img;
});

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
    zoom -= e.deltaY * 0.002;
    zoom = Math.min(Math.max(0.1, zoom), 3);
    needsRedraw = true;
}, { passive: false });

canvas.addEventListener('mousedown', (e) => {
    isDragging = false; // Reset dragging flag on new click
    lastMouseX = e.clientX;
    lastMouseY = e.clientY;
});

let hoveredHexKey = null;

// UI elements (populated after DOM load)
const waveTimerEl = document.getElementById('waveTimer');
const waveBarFill = document.getElementById('waveBarFill');
const buildTimerEl = document.getElementById('buildTimer');
const buildBarFill = document.getElementById('buildBarFill');
const buildMenu = document.getElementById('buildMenu');

window.addEventListener('mousemove', (e) => {
    const dx = Math.abs(e.clientX - lastMouseX);
    const dy = Math.abs(e.clientY - lastMouseY);

    // Always update cursor position (used for hover tooltip)
    mouseX = e.clientX;
    mouseY = e.clientY;

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
    hoveredHexKey = pixelToHex(e.clientX, e.clientY);
    needsRedraw = true;
});

canvas.addEventListener('click', (e) => {
    if (isDragging) return;
    const hexKey = pixelToHex(e.clientX, e.clientY);
    const hex = worldMap[hexKey];

    if (!hex) return;

    if (hex.owner && hex.owner !== socket.id) {
        // ATTACK: server expects { tileKey, troopCount }
        socket.emit('attack', { tileKey: hexKey, troopCount: sendCount });
        document.querySelectorAll('.build-btn').forEach(btn => {
            btn.classList.remove('active');
        });
        currentBuildType = null;
    } else if (!hex.owner && currentBuildType) {
        // BUILD: server expects { tileKey, buildingTypeKey }
        socket.emit('build', { tileKey: hexKey, buildingTypeKey: currentBuildType });
        document.querySelectorAll('.build-btn').forEach(btn => {
            btn.classList.remove('active');
        });
        currentBuildType = null;
    }
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

        const hex = worldMap[key];

        // 1. Draw terrain fill for the whole hex so colors are visible
        if (hex.terrain) {
            ctx.fillStyle = hex.terrain.color || '#333';
            ctx.beginPath();
            for (let i = 0; i < 6; i++) {
                const angle = (Math.PI / 3) * i;
                const x = px + dynamicSize * Math.cos(angle);
                const y = py + dynamicSize * Math.sin(angle);
                if (i === 0) ctx.moveTo(x, y);
                else ctx.lineTo(x, y);
            }
            ctx.closePath();
            ctx.fill();
        }

        if (key === hoveredHexKey) {
            const hex = worldMap[key];
            
            // 1. ATTACK OVERLAY
            if (isTileNeighbor(key) && hex && hex.owner && hex.owner !== socket.id) {
                ctx.strokeStyle = "red";
                ctx.lineWidth = 3;
                ctx.beginPath();
                ctx.moveTo(px - 10, py - 10); ctx.lineTo(px + 10, py + 10);
                ctx.moveTo(px + 10, py - 10); ctx.lineTo(px - 10, py + 10);
                ctx.stroke();
            } 
            // 2. GHOST BUILDING PREVIEW
            else if (hex && !hex.owner && currentBuildType) {

                const valid = isBuildableTerrain(key, currentBuildType);
                
                ctx.save(); // Start isolation
                
                // Draw the background highlight
                ctx.globalAlpha = 0.3;
                ctx.fillStyle = valid ? "#00ff00" : "#ff0000";
                ctx.beginPath();
                for (let i = 0; i < 6; i++) {
                    let angle = (Math.PI / 3) * i;
                    ctx.lineTo(px + dynamicSize * Math.cos(angle), py + dynamicSize * Math.sin(angle));
                }
                ctx.closePath();
                ctx.fill();
                
                // Draw the Ghost Building Icon
                if (valid && zoom > 0.5) {
                    ctx.globalAlpha = 0.4;
                    const icon = BUILDING_ICONS[currentBuildType];
                    if (icon && icon.complete) {
                        const iconSize = dynamicSize * 0.8;
                        ctx.drawImage(icon, px - iconSize / 2, py - iconSize / 2, iconSize, iconSize);
                    }
                }

                ctx.restore(); // <--- ADD THIS HERE to reset alpha to 1.0 for the next hex
            }
        }

        // 2. Draw Hex Outline
        ctx.drawImage(hexCache, px - offset, py - offset, drawW, drawH);

        // 3. Draw Owner Overlay & Type
        if (hex.owner) {
            ctx.globalAlpha = 0.6;
            ctx.fillStyle = hex.color || 'white';
            ctx.beginPath();
            ctx.arc(px, py, dynamicSize * 0.7, 0, Math.PI * 2);
            ctx.fill();
            ctx.globalAlpha = 1.0;

            const icon = hex.building ? BUILDING_ICONS[hex.building.type] : null;
            if (icon && icon.complete && zoom > 0.4) {
                const iconSize = dynamicSize * 0.8;
                ctx.drawImage(icon, px - iconSize / 2, py - iconSize / 2, iconSize, iconSize);
            }
        }


        if (hex.owner && hex.hp < hex.maxHp) {
            const barWidth = dynamicSize;
            const barHeight = 4;
            const healthPercent = hex.hp / hex.maxHp;

            ctx.fillStyle = "red";
            ctx.fillRect(px - barWidth/2, py + dynamicSize/2, barWidth, barHeight);

            ctx.fillStyle = "#00ff00";
            ctx.fillRect(px - barWidth/2, py + dynamicSize/2, barWidth * healthPercent, barHeight);
        }
    }

}

// --- SOCKETS ---

socket.on('mapUpdate', (data) => {
    console.log('mapUpdate received, type:', Array.isArray(data) ? 'array' : typeof data, data?.length ?? 'n/a');

    // Server now sends either an object map or an array of tile ids.
    // Be tolerant: if we receive an array of ids, build minimal tile objects locally.
    if (Array.isArray(data)) {
        const newMap = {};
        for (const id of data) {
            newMap[id] = worldMap[id] && typeof worldMap[id] === 'object' ? worldMap[id] : {
                id,
                terrain: { name: 'Plain', color: '#2ecc71' },
                owner: null,
                building: null,
                hp: 0,
                maxHp: 0
            };
        }
        worldMap = newMap;
    }
    else if (data && typeof data === 'object') {
        // older format (object map) — accept as-is
        worldMap = data;
    }
    needsRedraw = true;
});

socket.on('waveCountdown', (data) => {
    // legacy: some servers may not send these anymore — keep handler for compatibility
    const secs = data.seconds ?? 0;
    const total = data.total ?? 15;
    if (waveTimerEl) waveTimerEl.innerText = `${secs}s`;
    if (waveBarFill) waveBarFill.style.width = `${Math.round(100 * (1 - secs / total))}%`;
});

socket.on('waveEvent', (data) => {
    const msg = data && data.message ? data.message : 'A barbarian wave has arrived!';
    showMessage(msg);
});

socket.on('abilityUpdate', (data) => {
    // legacy / compatibility: server may later add build cooldown info
    const secs = data.buildCooldown || 0;
    const total = data.total ?? 5;
    if (secs > 0) {
        buildTimerEl.innerText = `Building available in ${secs}s`;
        buildMenu.style.display = 'none';
    }
    else {
        buildTimerEl.innerText = `Ready to build`;
        buildMenu.style.display = 'block';
    }
    if (buildBarFill) buildBarFill.style.width = `${Math.round(100 * (1 - secs / total))}%`;
});

socket.on('resourcesUpdate', (data) => {
    console.log('resourcesUpdate:', data);
    // Updated server now emits 'resourcesUpdate' with serialized Resources: { food, gold, stone, science, army }
    const setIfExists = (id, val) => { const el = document.getElementById(id); if (el) el.innerText = val; };
    setIfExists('foodVal', data?.food ?? 0);
    setIfExists('goldVal', data?.gold ?? 0);
    setIfExists('stoneVal', data?.stone ?? 0);
    setIfExists('scienceVal', data?.science ?? 0);
    setIfExists('armyVal', data?.army ?? 0);
});

socket.on('buildingsUpdate', (data) => {
    // Server sends an array of building-like objects. If they include a tile id (tileKey/tileId) we map them to tiles.
    if (!Array.isArray(data)) return;

    // Clear existing building info
    for (const k in worldMap) {
        worldMap[k].building = null;
        worldMap[k].owner = null;
        worldMap[k].hp = 0;
        worldMap[k].maxHp = 0;
    }

    data.forEach(b => {
        const tileKey = b.tileKey || b.tileId || b.id || b.tile;
        if (tileKey && worldMap[tileKey]) {
            const type = (b.type || b.typeKey || b.name || '').toString().toUpperCase();
            worldMap[tileKey].owner = b.owner || b.ownerId || null;
            worldMap[tileKey].building = { type };
            worldMap[tileKey].hp = b.health?.current ?? b.currentHealth ?? 0;
            worldMap[tileKey].maxHp = b.health?.max ?? b.maxHp ?? ((b.stats?.baseHealth ?? worldMap[tileKey].maxHp) || 0);
        }
        else {
            console.warn('buildingsUpdate: item missing tile id or tile not visible', b);
        }
    });

    needsRedraw = true;
});

socket.on('connect', () => {
    // Save our socket id locally so client-side validation can know which tiles belong to us
    myId = socket.id;
    socket.emit('join');
    console.log("%c🔌 Connected to Server", "ID:", myId);
});

socket.on('error', (msg) => showMessage(msg));


function setBuildType(buttonElement, type) {
    currentBuildType = type;
    document.querySelectorAll('.build-btn').forEach(btn => {
        btn.classList.remove('active');
    });
    buttonElement.classList.add('active');
}

function setTroopCount(buttonElement, count) {
    sendCount = count;
    document.querySelectorAll('.troop-btn').forEach(btn => btn.classList.remove('active'));
    buttonElement.classList.add('active');
}

// Prevent camera jump when interacting with UI buttons:
// Reset dragging and last mouse positions on mousedown so the next canvas mousemove doesn't jump the camera.
document.querySelectorAll('.build-btn').forEach(btn => {
    btn.setAttribute('type', 'button'); // ensure no default submit behavior
    btn.addEventListener('mousedown', (e) => {
        e.preventDefault();
        isDragging = false;
        lastMouseX = e.clientX;
        lastMouseY = e.clientY;
    });
});

// Same protection for troop buttons
document.querySelectorAll('.troop-btn').forEach(btn => {
    btn.setAttribute('type', 'button');
    btn.addEventListener('mousedown', (e) => {
        e.preventDefault();
        isDragging = false;
        lastMouseX = e.clientX;
        lastMouseY = e.clientY;
    });
});

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