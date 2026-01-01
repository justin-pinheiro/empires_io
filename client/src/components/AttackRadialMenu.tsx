import React, { useState } from 'react';
import { getHexPixelPos } from '../utils/hexMath';
import { BUILDING_ICONS } from '../utils/assetLoader';
import { ResourcesCost } from './ResourcesCost';
import { ATTACK_ACTIONS } from '../types/attackStats';
import type { Resources } from '../types/resources';
import type { Tile } from '../types/tile';
import type { Building } from '../types/building';
import type { Civilisation } from '../types/civilisation';
import { ResourcesUpdate } from './ResourcesUpdate';

interface AttackRadialMenuProps {
    selectedTile: Tile;
    enemyBuilding: Building;
    camera: { x: number; y: number; zoom: number };
    civilisation: Civilisation;
    onAttack: (troopCount: number) => void;
}

export const AttackRadialMenu: React.FC<AttackRadialMenuProps> = ({
    selectedTile,
    enemyBuilding,
    camera,
    civilisation,
    onAttack
}) => {
    const [hoveredActionKey, setHoveredActionKey] = useState<string | null>(null);

    if (!selectedTile) return null;

    const { x, y } = getHexPixelPos(selectedTile.x, selectedTile.y, camera.x, camera.y, camera.zoom);

    // Convert Object to array and ensure we handle 6 slots
    const attackOptions = Object.entries(ATTACK_ACTIONS).slice(0, 6);
    const hoveredAction = hoveredActionKey ? ATTACK_ACTIONS[hoveredActionKey as keyof typeof ATTACK_ACTIONS] : null;
    const healthPct = enemyBuilding ? (enemyBuilding.health.current / enemyBuilding.health.max) * 100 : 0;

    return (
        <div style={{ ...styles.menuContainer, left: x, top: y }}>

            {/* --- CENTRAL HUB: ENEMY INFO --- */}
            <div style={styles.centralHub}>
                <div style={styles.infoContainer}>
                    <span style={styles.enemyTitle}>{enemyBuilding?.name || "Target"}</span>
                    <div style={styles.healthBarBg}>
                        <div style={{ ...styles.healthBarFill, width: `${healthPct}%` }} />
                    </div>
                    <span style={styles.hpText}>{Math.floor(enemyBuilding?.health.current)}/{Math.floor(enemyBuilding?.health.max)} HP</span>
                    
                    {!hoveredActionKey && enemyBuilding && (
                        <img 
                            src={BUILDING_ICONS[enemyBuilding.type]?.src} 
                            style={styles.buildingIcon} 
                            alt="enemy" 
                        />
                    )}
                </div>
            </div>

            {/* --- ATTACK SLICES (6 EQUAL SLICES) --- */}
            <svg width="100%" height="100%" viewBox="0 0 100 100">
                {attackOptions.map(([key, action], i) => {
                    const canAfford = civilisation.resources.soldiers >= action.soldiersCost;
                    const isHovered = hoveredActionKey === key;
                    
                    // 6 equal slices = 60 degrees each
                    const rotation = i * 60;

                    return (
                        <g 
                            key={key}
                            style={{ cursor: canAfford ? 'pointer' : 'not-allowed', pointerEvents: 'auto' }}
                            onMouseEnter={() => setHoveredActionKey(key)}
                            onMouseLeave={() => setHoveredActionKey(null)}
                            onClick={() => canAfford && onAttack(action.soldiersCost)}
                        >
                            <path
                                d="M 50 50 L 50 5 A 45 45 0 0 1 89 27.5 Z"
                                fill={isHovered ? '#d03737' : '#441111'}
                                opacity={canAfford ? 0.8 : 0.3}
                                stroke="#ff4d4d"
                                strokeWidth="0.5"
                                transform={`rotate(${rotation}, 50, 50)`}
                                style={styles.sliceTransition}
                            />
                            
                            <foreignObject 
                                x={50 + 32 * Math.cos((rotation + 30) * Math.PI / 180 - Math.PI / 2)} 
                                y={50 + 32 * Math.sin((rotation + 30) * Math.PI / 180 - Math.PI / 2)} 
                                width="30" height="30"
                                style={styles.foreignObjectCenter}
                            >
                                <div style={styles.sliceContent}>
                                    <span style={styles.actionIcon}>⚔️</span>
                                    <span style={styles.damageText}>-{action.soldiersCost}</span>
                                </div>
                            </foreignObject>
                        </g>
                    );
                })}
            </svg>

            {/* --- COST BAR --- */}
            {hoveredAction && (
                <div style={styles.costBarContainer}>
                    <ResourcesCost 
                        title={hoveredAction.name}
                        cost={{ soldiers: hoveredAction.soldiersCost } as Resources}
                        resources={civilisation.resources}
                    />
                </div>
            )}
        </div>
    );
};

const styles = {
    menuContainer: {
        position: 'absolute' as const,
        transform: 'translate(-50%, -50%)',
        width: '320px',
        height: '320px',
        zIndex: 1001,
        pointerEvents: 'none' as const,
    },
    centralHub: {
        position: 'absolute' as const,
        left: '50%',
        top: '50%',
        transform: 'translate(-50%, -50%)',
        width: '90px',
        height: '90px',
        backgroundColor: '#1a0505',
        borderRadius: '50%',
        border: '3px solid #ff4d4d',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        boxShadow: '0 0 20px rgba(255, 77, 77, 0.4)',
        zIndex: 10,
    },
    infoContainer: {
        display: 'flex',
        flexDirection: 'column' as const,
        alignItems: 'center',
        width: '85%',
    },
    enemyTitle: {
        color: '#ff4d4d',
        fontSize: '9px',
        fontWeight: 'bold' as const,
        marginBottom: '2px',
    },
    healthBarBg: {
        width: '100%',
        height: '5px',
        backgroundColor: '#331111',
        borderRadius: '2px',
        overflow: 'hidden' as const,
    },
    healthBarFill: {
        height: '100%',
        backgroundColor: '#ff4d4d',
        transition: 'width 0.3s ease',
    },
    hpText: {
        fontSize: '8px',
        color: '#ccc',
        marginTop: '2px',
    },
    buildingIcon: {
        width: '24px',
        height: '24px',
        marginTop: '4px',
        filter: 'sepia(1) saturate(3) hue-rotate(-50deg)',
    },
    sliceTransition: {
        transition: 'all 0.15s ease-in-out',
    },
    foreignObjectCenter: {
        transform: 'translate(-15px, -15px)',
    },
    sliceContent: {
        display: 'flex',
        flexDirection: 'column' as const,
        alignItems: 'center',
        justifyContent: 'center',
        height: '100%',
        pointerEvents: 'none' as const,
    },
    actionIcon: {
        fontSize: '8px',
    },
    damageText: {
        color: '#fff',
        fontSize: '6px',
        fontWeight: 'bold' as const,
    },
    costBarContainer: {
        position: 'absolute' as const,
        bottom: '100%',
        left: '50%',
        transform: 'translateX(-50%)',
        backgroundColor: 'rgba(20, 0, 0, 0.95)',
        padding: '8px 12px',
        borderRadius: '8px',
        border: '1px solid #ff4d4d',
        minWidth: '120px',
        pointerEvents: 'auto' as const,
    },
};