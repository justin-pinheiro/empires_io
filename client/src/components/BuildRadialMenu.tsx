import React, { useState } from 'react';
import { getHexPixelPos } from '../utils/hexMath';
import { BUILDING_ICONS } from '../utils/assetLoader';
import { ResourcesCost } from './ResourcesCost';
import type { BuildingStats } from '../types/buildingStats';
import type { Tile } from '../types/tile';
import { ResourcesUpdate } from './ResourcesUpdate';
import { RESOURCE_ICONS } from '../types/resources';

const RADIAL_CATEGORIES = [
  { label: 'Food', icon: RESOURCE_ICONS.food, color: '#4CAF50', options: ['FARM', 'FISHING_ZONE'] },
  { label: 'Gold', icon: RESOURCE_ICONS.gold, color: '#FFD700', options: ['MARKET', 'MINE'] },
  { label: 'Workers', icon: RESOURCE_ICONS.workers, color: '#2196F3', options: ['HOUSE'] },
  { label: 'Soldiers', icon: RESOURCE_ICONS.soldiers, color: '#F44336', options: ['BARRACKS'] },
  { label: 'Science', icon: RESOURCE_ICONS.science, color: '#9C27B0', options: ['LIBRARY'] },
  { label: 'Defense', icon: '🛡️', color: '#795548', options: ['FORTIFICATIONS'] },
];

interface RadialMenuProps {
  selectedTile: Tile;
  camera: { x: number; y: number; zoom: number };
  civilisation: any;
  buildingStats: Record<string, BuildingStats>;
  onBuild: (type: string) => void;
}

export const BuildRadialMenu: React.FC<RadialMenuProps> = ({ 
  selectedTile, 
  camera, 
  civilisation, 
  buildingStats, 
  onBuild 
}) => {
  const [hoveredKey, setHoveredKey] = useState<string | null>(null);

  if (!selectedTile) return null;

  const { x, y } = getHexPixelPos(selectedTile.x, selectedTile.y, camera.x, camera.y, camera.zoom);

  // --- LOGIC HELPERS ---

  const isTerrainValid = (stats: BuildingStats) => {
    return stats.buildableTerrains.includes(selectedTile.terrain.name);
  };

  const getActiveBuildingInSlot = (options: string[]) => {
    const validOption = options.find(key => {
      const stats = buildingStats[key];
      return stats && isTerrainValid(stats);
    });
    return validOption || options[0];
  };

  const hoveredStats = hoveredKey ? buildingStats[hoveredKey] : null;
  const isHoveredValid = hoveredStats ? isTerrainValid(hoveredStats) : false;

  return (
    <div style={{ ...styles.menuContainer, left: x, top: y }}>
      
      {/* --- CENTRAL HUB (GHOST PREVIEW) --- */}
      <div style={{ 
        ...styles.centralHub, 
        backgroundColor: selectedTile.terrain.color 
      }}>
        {hoveredKey && BUILDING_ICONS[hoveredKey] ? (
          <div style={styles.ghostContainer}>
            <img 
              src={BUILDING_ICONS[hoveredKey].src} 
              style={styles.ghostImage} 
              alt="ghost"
            />
            <div style={styles.ghostLabel}>
              {buildingStats[hoveredKey]?.name.toUpperCase()}
            </div>
          </div>
        ) : (
          <div style={styles.hubPlaceholder}>BUILD</div>
        )}
      </div>

      {/* --- RADIAL SLICES --- */}
      <svg width="100%" height="100%" viewBox="0 0 100 100">
        {RADIAL_CATEGORIES.map((category, i) => {
          const activeKey = getActiveBuildingInSlot(category.options);
          const stats = buildingStats[activeKey];
          if (!stats) return null;

          const terrainValid = isTerrainValid(stats);
          const isHovered = hoveredKey === activeKey;
          const rotation = i * 60;

          return (
            <g 
              key={category.label}
              style={{ 
                cursor: terrainValid ? 'pointer' : 'not-allowed', 
                pointerEvents: 'auto' 
              }}
              onMouseEnter={() => setHoveredKey(activeKey)}
              onMouseLeave={() => setHoveredKey(null)}
              onClick={() => terrainValid && onBuild(activeKey)}
            >
              <path
                d="M 50 50 L 50 5 A 45 45 0 0 1 89 27.5 Z"
                fill={terrainValid ? category.color : styles.invalidSliceColor}
                opacity={isHovered ? 0.9 : 0.5}
                stroke="#000"
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
                  <span style={{ 
                    ...styles.categoryIcon, 
                    filter: terrainValid ? 'none' : 'grayscale(1) opacity(0.2)' 
                  }}>
                    {category.icon}
                  </span>
                  {!terrainValid && (
                    <span style={styles.invalidText}>INVALID</span>
                  )}
                </div>
              </foreignObject>
            </g>
          );
        })}
      </svg>

      {/* --- COST BAR (Only shows if building available on this terrain) --- */}
      {hoveredStats && isHoveredValid && (
        <div style={styles.costBarContainer}>
          <ResourcesCost 
            title={`Cost`}
            cost={hoveredStats.resourcesToBuild}
            resources={civilisation.resources}
          />
        </div>
      )}

      {/* --- PRODUCTION BAR --- */}

      {hoveredStats && isHoveredValid && (
        <div style={styles.bottomProductionContainer}>
          {hoveredStats.production && (
            <div style={styles.productionBarContainer}>
              <ResourcesUpdate 
                  title={"Production"}
                  update={hoveredStats.production}
              />
            </div>
          )}
          {hoveredStats.resourcesCapacityUpgrade && (
          <div style={styles.productionBarContainer}>
              <ResourcesUpdate 
                  title={"Storage"}
                  update={hoveredStats.resourcesCapacityUpgrade}
              />
          </div>
      )}
        </div>
      )}

      {/* --- STORAGE BAR --- */}
      
    </div>
  );
};

// --- Styles ---

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
    width: '85px',
    height: '85px',
    borderRadius: '50%',
    border: '4px solid rgba(255,255,255,0.3)',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    boxShadow: '0 0 30px rgba(0,0,0,0.6)',
    zIndex: 10,
    overflow: 'hidden' as const,
  },
  ghostContainer: {
    textAlign: 'center' as const,
  },
  ghostImage: {
    width: '45px',
    height: '45px',
    opacity: 0.6,
    filter: 'drop-shadow(0 0 5px white)',
  },
  ghostLabel: {
    color: 'white',
    fontSize: '9px',
    fontWeight: 'bold',
    textShadow: '1px 1px 2px black',
  },
  hubPlaceholder: {
    opacity: 0.4,
    color: 'white',
    fontSize: '10px',
    fontWeight: 'bold' as const,
  },
  invalidSliceColor: '#1a1a1a',
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
    textShadow: '1px 1px 3px black',
  },
  categoryIcon: {
    fontSize: '10px',
  },
  invalidText: {
    color: '#ff4444',
    fontSize: '3px',
    fontWeight: 'bold' as const,
  },
  costBarContainer: {
    position: 'absolute' as const,
    bottom: '100%',
    left: '50%',
    transform: 'translateX(-50%)',
    backgroundColor: 'rgba(0,0,0,0.85)',
    padding: '8px 12px',
    borderRadius: '8px',
    border: '1px solid rgba(255,255,255,0.1)',
    minWidth: '100px',
    pointerEvents: 'auto' as const,
  },
  bottomProductionContainer: {
    position: 'absolute' as const,
    bottom: '-20%',
    left: '50%',
    transform: 'translateX(-50%)',
    display: 'flex',
    flexDirection: 'row' as const,
    gap: "8px"
  },
  productionBarContainer: {
    backgroundColor: 'rgba(0,0,0,0.85)',
    padding: '8px 12px',
    borderRadius: '8px',
    border: '1px solid rgba(255,255,255,0.1)',
    minWidth: '100px',
    pointerEvents: 'auto' as const,
  },
};