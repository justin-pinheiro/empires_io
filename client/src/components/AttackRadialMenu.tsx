import React, { useState } from 'react';
import { getHexPixelPos } from '../utils/hexMath';
import { BUILDING_ICONS } from '../utils/assetLoader';
import { ResourcesCost } from './ResourcesCost';
import { ATTACK_ACTIONS } from '../types/attackStats';
import { RESOURCE_COLORS } from '../types/resources';
import type { Resources } from '../types/resources';
import type { Tile } from '../types/tile';
import type { Building } from '../types/building';
import type { Civilisation } from '../types/civilisation';

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

    const attackOptions = Object.entries(ATTACK_ACTIONS).slice(0, 6);
    const hoveredAction = hoveredActionKey ? ATTACK_ACTIONS[hoveredActionKey as keyof typeof ATTACK_ACTIONS] : null;
    const healthPct = enemyBuilding ? (enemyBuilding.health.current / enemyBuilding.health.max) * 100 : 0;

    return (
        <div style={{ ...styles.menuContainer, left: x, top: y }}>

            {/* --- CENTRAL HUB: ENEMY INFO --- */}
            <div style={styles.centralHub}>
                <div style={styles.infoContainer}>
                    <span style={styles.enemyTitle}>{enemyBuilding?.name.toUpperCase() || "TARGET"}</span>
                    <div style={styles.healthBarBg}>
                        <div style={{ ...styles.healthBarFill, width: `${healthPct}%` }} />
                    </div>
                    <span style={styles.hpText}>
                        {Math.floor(enemyBuilding?.health.current)} <span style={{opacity: 0.5}}>/</span> {Math.floor(enemyBuilding?.health.max)}
                    </span>
                    
                    {!hoveredActionKey && enemyBuilding && (
                        <img 
                            src={BUILDING_ICONS[enemyBuilding.type]?.src} 
                            style={styles.buildingIcon} 
                            alt="enemy" 
                        />
                    )}
                </div>
            </div>

            {/* --- ATTACK SLICES --- */}
            <svg width="100%" height="100%" viewBox="0 0 100 100">
                {attackOptions.map(([key, action], i) => {
                    const canAfford = civilisation.resources.soldiers >= action.soldiersCost;
                    const isHovered = hoveredActionKey === key;
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
                                fill={isHovered ? RESOURCE_COLORS.soldiers : '#220a0a'}
                                opacity={canAfford ? (isHovered ? 0.9 : 0.6) : 0.2}
                                stroke={RESOURCE_COLORS.soldiers}
                                strokeWidth="0.5"
                                transform={`rotate(${rotation}, 50, 50)`}
                                style={styles.sliceTransition}
                            />
                            
                            <foreignObject 
                                x={50 + 32 * Math.cos((rotation + 30) * Math.PI / 180 - Math.PI / 2)} 
                                y={50 + 32 * Math.sin((rotation + 30) * Math.PI / 180 - Math.PI / 2)} 
                                width="20" height="20"
                                style={styles.foreignObjectCenter}
                            >
                                <div style={styles.sliceContent}>
                                    {/* Colorized Attack Icon */}
                                    <div style={{
                                        width: '14px',
                                        height: '14px',
                                        backgroundColor: isHovered ? '#fff' : RESOURCE_COLORS.soldiers,
                                        WebkitMaskImage: 'url(/resources/soldiers.png)',
                                        maskImage: 'url(/resources/soldiers.png)',
                                        maskSize: 'contain',
                                        maskRepeat: 'no-repeat',
                                        transition: 'background-color 0.2s ease'
                                    }} />
                                    <span style={{
                                        ...styles.damageText,
                                        color: isHovered ? '#fff' : RESOURCE_COLORS.soldiers
                                    }}>
                                        -{action.soldiersCost}
                                    </span>
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
        zIndex: 1000,
        pointerEvents: 'none' as const,
    },
    centralHub: {
        position: 'absolute' as const,
        left: '50%',
        top: '50%',
        transform: 'translate(-50%, -50%)',
        width: '100px',
        height: '100px',
        borderRadius: '50%',
        backgroundColor: 'rgba(15, 5, 5, 0.9)',
        backdropFilter: 'blur(12px)',
        border: `2px solid ${RESOURCE_COLORS.soldiers}44`, // 44 is low opacity hex
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        boxShadow: '0 0 30px rgba(0,0,0,0.8)',
        zIndex: 10,
    },
    infoContainer: {
        display: 'flex',
        flexDirection: 'column' as const,
        alignItems: 'center',
        width: '80%',
    },
    enemyTitle: {
        color: '#fff',
        fontSize: '10px',
        fontWeight: 800,
        letterSpacing: '0.05em',
        marginBottom: '6px',
    },
    healthBarBg: {
        width: '100%',
        height: '4px',
        backgroundColor: 'rgba(255,255,255,0.1)',
        borderRadius: '2px',
        overflow: 'hidden',
    },
    healthBarFill: {
        height: '100%',
        backgroundColor: '#ff4d4d',
        transition: 'width 0.3s ease-out',
    },
    hpText: {
        color: '#fff',
        fontSize: '10px',
        fontFamily: '"JetBrains Mono", monospace',
        marginTop: '4px',
    },
    buildingIcon: {
        width: '30px',
        height: '30px',
        marginTop: '6px',
        opacity: 0.8,
    },
    sliceTransition: {
        transition: 'all 0.2s cubic-bezier(0.4, 0, 0.2, 1)',
    },
    foreignObjectCenter: {
        transform: 'translate(-10px, -10px)',
    },
    sliceContent: {
        display: 'flex',
        flexDirection: 'column' as const,
        alignItems: 'center',
        justifyContent: 'center',
        height: '100%',
    },
    damageText: {
        fontSize: '9px',
        fontWeight: 900,
        fontFamily: '"JetBrains Mono", monospace',
        marginTop: '2px',
    },
    costBarContainer: {
        position: 'absolute' as const,
        bottom: '100%',
        left: '50%',
        transform: 'translateX(-50%)',
        backgroundColor: 'rgba(15, 0, 0, 0.9)',
        padding: '10px 16px',
        borderRadius: '12px',
        border: `1px solid ${RESOURCE_COLORS.soldiers}55`,
        minWidth: '120px',
        pointerEvents: 'auto' as const,
        backdropFilter: 'blur(10px)',
    },
};