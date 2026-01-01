import React, { useState } from 'react';
import { getHexPixelPos } from '../utils/hexMath';
import { BUILDING_ICONS } from '../utils/assetLoader';
import { ResourcesCost } from './ResourcesCost';
import type { BuildingStats } from '../types/buildingStats';
import type { Tile } from '../types/tile';
import { ResourcesUpdate } from './ResourcesUpdate';
import { RESOURCE_COLORS } from '../types/resources';

const RADIAL_CATEGORIES = [
  { label: 'Food', iconKey: 'food', color: RESOURCE_COLORS.food, options: ['FARM', 'FISHING_ZONE'] },
  { label: 'Gold', iconKey: 'gold', color: RESOURCE_COLORS.gold, options: ['MARKET', 'MINE'] },
  { label: 'Workers', iconKey: 'workers', color: RESOURCE_COLORS.workers, options: ['HOUSE'] },
  { label: 'Soldiers', iconKey: 'soldiers', color: RESOURCE_COLORS.soldiers, options: ['BARRACKS'] },
  { label: 'Science', iconKey: 'science', color: RESOURCE_COLORS.science, options: ['LIBRARY'] },
  { label: 'Defense', iconKey: 'defense', color: '#90A4AE', options: ['FORTIFICATIONS'] },
];

const FIRST_LEVEL = 1;

interface RadialMenuProps {
  selectedTile: Tile;
  camera: { x: number; y: number; zoom: number };
  civilisation: any;
  buildingStats: Record<string, Record<number, BuildingStats>>;
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
      const stats = buildingStats[key][FIRST_LEVEL];
      return stats && isTerrainValid(stats);
    });
    return validOption || options[0];
  };

  const hoveredStats = hoveredKey ? buildingStats[hoveredKey] : null;
  const isHoveredValid = hoveredStats ? isTerrainValid(hoveredStats[FIRST_LEVEL]) : false;

  return (
    <div style={{ ...styles.menuContainer, left: x, top: y }}>
      
      {/* --- CENTRAL HUB (GHOST PREVIEW) --- */}
      <div style={{ 
        ...styles.centralHub, 
        backgroundColor: selectedTile.terrain.color 
      }}>
        {hoveredKey && BUILDING_ICONS[hoveredKey] ? (
          <div style={styles.ghostContainer}>
            <div style={styles.ghostLabel}>
              {isHoveredValid ? buildingStats[hoveredKey][FIRST_LEVEL]?.name.toUpperCase() : ""}
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
          const stats = buildingStats[activeKey][FIRST_LEVEL];
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
                x={55 + 30 * Math.cos((rotation + 30) * Math.PI / 180 - Math.PI / 2)} 
                y={55 + 30 * Math.sin((rotation + 30) * Math.PI / 180 - Math.PI / 2)} 
                width="20" height="20"
                style={styles.foreignObjectCenter}
              >
                <div style={styles.sliceContent}>
                  <div style={{
                    width: '12px',
                    height: '12px',
                    backgroundColor: terrainValid ? '#FFFFFF' : 'rgba(255,255,255,0.2)', // White icon on colored slice
                    maskImage: `url(/resources/${category.iconKey}.png)`,
                    WebkitMaskImage: `url(/resources/${category.iconKey}.png)`,
                    maskSize: 'contain',
                    maskRepeat: 'no-repeat',
                  }} />
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
            cost={hoveredStats[FIRST_LEVEL].resourcesToBuild}
            resources={civilisation.resources}
          />
        </div>
      )}

      {/* --- PRODUCTION BAR --- */}

      {hoveredStats && isHoveredValid && (
        <div style={styles.bottomProductionContainer}>
          {hoveredStats[FIRST_LEVEL].production && (
            <div style={styles.productionBarContainer}>
              <ResourcesUpdate 
                  title={"Production"}
                  update={hoveredStats[FIRST_LEVEL].production}
              />
            </div>
          )}
          {hoveredStats[FIRST_LEVEL].resourcesCapacityUpgrade && (
          <div style={styles.productionBarContainer}>
              <ResourcesUpdate 
                  title={"Storage"}
                  update={hoveredStats[FIRST_LEVEL].resourcesCapacityUpgrade}
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
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    boxShadow: '0 0 30px rgba(0,0,0,0.6)',
    zIndex: 10,
    overflow: 'hidden' as const,
    backgroundColor: 'rgba(15, 15, 15, 0.8)',
    backdropFilter: 'blur(10px)',
    border: '2px solid rgba(255,255,255,0.1)',
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
  invalidSliceColor: 'rgba(255, 255, 255, 0.05)',
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
    width: '100px',
    height: '100px',
  },
  invalidText: {
    color: '#ff4d4d',
    fontSize: '5px',
    fontWeight: 800,
    marginTop: '2px',
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