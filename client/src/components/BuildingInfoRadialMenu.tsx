import React, { useState } from 'react';
import { getHexPixelPos } from '../utils/hexMath';
import { ResourcesUpdate } from './ResourcesUpdate';
import { ResourcesCost } from './ResourcesCost';
import { hasEnough, RESOURCE_COLORS } from '../types/resources';
import type { Building } from '../types/building';
import type { Resources } from '../types/resources';
import type { BuildingStats } from '../types/buildingStats';
import type { Tile } from '../types/tile';
import { BuildingType } from '../types/buildingType';
import { useGameSounds } from '../hooks/useGameSound';

interface BuildingInfoRadialProps {
    selectedTile: Tile;
    selectedBuilding: Building;
    nextLevelStats: BuildingStats;
    playerResources: Resources;
    camera: { x: number; y: number; zoom: number };
    onUpgrade: (building: Building) => void;
    onDestroy: (building: Building) => void;
}

type MenuOption = 'INFO' | 'UPGRADE' | 'DELETE' | null;

export const BuildingInfoRadial: React.FC<BuildingInfoRadialProps> = ({
    selectedTile,
    selectedBuilding,
    nextLevelStats,
    playerResources,
    camera,
    onUpgrade,
    onDestroy
}) => {
    const [hoveredOption, setHoveredOption] = useState<MenuOption>(null);
    const { playHover, playDestroy, playSuccess, playCancel } = useGameSounds();

    if (!selectedBuilding) return null;

    const { x, y } = getHexPixelPos(selectedTile.x, selectedTile.y, camera.x, camera.y, camera.zoom);

    // --- Action Configuration ---
    const ACTIONS = [
        { id: 'UPGRADE' as MenuOption, label: 'UPGRADE', iconName: 'upgrade.png', color: RESOURCE_COLORS.gold, active: !!nextLevelStats },
        { id: null as MenuOption, label: '', iconName: '', color: '#333', active: false },
        { id: 'DELETE' as MenuOption, label: 'DELETE', iconName: 'delete.png', color: RESOURCE_COLORS.soldiers, active: true },
        { id: null as MenuOption, label: '', iconName: '', color: '#333', active: false },
        { id: null as MenuOption, label: '', iconName: '', color: '#333', active: false },
        { id: 'INFO' as MenuOption, label: 'INFO', iconName: 'information.png', color: RESOURCE_COLORS.science, active: true },
    ];

    const renderCenterContent = () => {
        const healthPct = (selectedBuilding.health.current / selectedBuilding.health.max) * 100;

        switch (hoveredOption) {
            case 'INFO':
                return (
                    <div style={styles.contentBox}>
                        <div style={styles.title}>{selectedBuilding.name.toUpperCase()} - level {selectedBuilding.level}</div>
                        <div style={styles.healthContainer}>
                            <div style={styles.healthBarBg}><div style={{...styles.healthBarFill, width: `${healthPct}%`}} /></div>
                            <span style={styles.hpText}>{Math.floor(selectedBuilding.health.current)} / {selectedBuilding.health.max} HP</span>
                        </div>
                        <ResourcesUpdate title="Production" update={selectedBuilding.production} />
                    </div>
                );
            case 'UPGRADE':
                return nextLevelStats ? (
                    <div style={styles.contentBox}>
                        <div style={{...styles.title, color: RESOURCE_COLORS.gold}}>UPGRADE</div>
                        <ResourcesCost title="Cost" cost={nextLevelStats.resourcesToBuild} resources={playerResources} />
                        <ResourcesUpdate title="New production" update={nextLevelStats.production} />
                    </div>
                ) : <div style={styles.contentBox}><div style={styles.title}>MAX LEVEL</div></div>;
            case 'DELETE':
                return (
                    <div style={styles.contentBox}>
                        <div style={{...styles.title, color: RESOURCE_COLORS.soldiers}}>REMOVE</div>
                        <div style={styles.warningText}>This action cannot be undone!</div>
                    </div>
                );
            default:
                return (
                    <div style={styles.contentBox}>
                        <div style={styles.hubPlaceholder}>BUILDING INFO</div>
                        <div style={styles.desc}>Hover icons for details</div>
                    </div>
                );
        }
    };

    return (
        <div style={{ ...styles.menuContainer, left: x, top: y }}>
            <div style={styles.centralHub} onClick={(e) => e.stopPropagation()}>
                {renderCenterContent()}
            </div>

            <svg width="100%" height="100%" viewBox="0 0 100 100" style={{ pointerEvents: 'none' }}>
                {ACTIONS.map((action, i) => {
                    if (action.id === "DELETE" && selectedBuilding.type === BuildingType.CAPITAL)
                        return null;

                    const rotation = i * 60;
                    const isHovered = hoveredOption === action.id && action.id !== null;
                    const canAffordUpgrade = nextLevelStats ? hasEnough(nextLevelStats.resourcesToBuild, playerResources) : false;

                    return (
                        <g 
                            key={i}
                            style={{ cursor: action.active ? 'pointer' : 'default', pointerEvents: 'auto' }}
                            onMouseEnter={() => {
                                if (action.active) playHover();
                                action.id && setHoveredOption(action.id)
                            }}
                            onMouseLeave={() => setHoveredOption(null)}
                            onClick={(e) => {
                                e.stopPropagation();
                                if (!action.active) return;
                                if (action.id === 'UPGRADE') {
                                    if (canAffordUpgrade) {
                                        playSuccess();
                                        onUpgrade(selectedBuilding);
                                    }
                                    else {
                                        playCancel();
                                    }
                                }
                                if (action.id === 'DELETE') {
                                    onDestroy(selectedBuilding);
                                    playDestroy();
                                };
                            }}
                        >
                            <path
                                d="M 50 50 L 50 5 A 45 45 0 0 1 89 27.5 Z"
                                fill={action.color}
                                opacity={isHovered ? 0.9 : 0.5}
                                stroke={action.color}
                                strokeWidth={isHovered ? "1" : "0.5"}
                                transform={`rotate(${rotation}, 50, 50)`}
                                style={styles.sliceTransition}
                            />

                            <foreignObject 
                                x={50 + 32 * Math.cos((rotation + 30) * Math.PI / 180 - Math.PI / 2)} 
                                y={50 + 32 * Math.sin((rotation + 30) * Math.PI / 180 - Math.PI / 2)} 
                                width="16" height="16"
                                style={styles.foreignObjectCenter}
                            >
                                <div style={styles.sliceContent}>
                                    {action.iconName && (
                                        <div style={{
                                            width: '12px',
                                            height: '12px',
                                            backgroundColor: isHovered ? '#fff' : action.color,
                                            maskImage: `url(/menu/${action.iconName})`,
                                            WebkitMaskImage: `url(/menu/${action.iconName})`,
                                            maskSize: 'contain',
                                            maskRepeat: 'no-repeat',
                                        }} />
                                    )}
                                </div>
                            </foreignObject>
                        </g>
                    );
                })}
            </svg>
        </div>
    );
};

const styles = {
    menuContainer: {
        position: 'absolute' as const,
        transform: 'translate(-50%, -50%)',
        width: '340px',
        height: '340px',
        zIndex: 1000,
        pointerEvents: 'none' as const,
    },
    centralHub: {
        position: 'absolute' as const,
        left: '50%',
        top: '50%',
        transform: 'translate(-50%, -50%)',
        width: '250px',
        height: '70px',
        borderRadius: '16px',
        backgroundColor: 'rgba(10, 10, 10, 0.9)',
        backdropFilter: 'blur(12px)',
        border: '1px solid rgba(255,255,255,0.1)',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        padding: '12px',
        boxShadow: '0 8px 32px rgba(0,0,0,0.5)',
        zIndex: 10,
    },
    contentBox: {
        display: 'flex',
        flexDirection: 'column' as const,
        width: '100%',
        gap: '8px',
    },
    title: {
        fontSize: '11px',
        fontWeight: 900,
        color: '#fff',
        letterSpacing: '0.05em',
    },
    levelBadge: {
        fontSize: '9px',
        color: 'rgba(255,255,255,0.4)',
        fontWeight: 700,
        marginTop: '-4px',
    },
    desc: {
        fontSize: '10px',
        color: 'rgba(255,255,255,0.6)',
        lineHeight: '1.2',
    },
    healthContainer: {
        width: '100%',
        margin: '4px 0',
    },
    healthBarBg: {
        width: '100%',
        height: '3px',
        backgroundColor: 'rgba(255,255,255,0.1)',
        borderRadius: '2px',
    },
    healthBarFill: {
        height: '100%',
        backgroundColor: '#81C784',
        borderRadius: '2px',
        transition: 'width 0.3s ease',
    },
    hpText: {
        fontSize: '9px',
        fontFamily: 'JetBrains Mono',
        color: 'rgba(255,255,255,0.5)',
        marginTop: '2px',
        display: 'block',
    },
    warningText: {
        fontSize: '8px',
        color: RESOURCE_COLORS.soldiers,
        fontWeight: 800,
        marginTop: 'auto',
    },
    hubPlaceholder: {
        fontSize: '10px',
        color: '#fff',
        fontWeight: 800,
        opacity: 0.3,
    },
    sliceTransition: {
        transition: 'all 0.2s cubic-bezier(0.4, 0, 0.2, 1)',
    },
    foreignObjectCenter: {
        transform: 'translate(-8px, -8px)',
    },
    sliceContent: {
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        height: '100%',
    }
};