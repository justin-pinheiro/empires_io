import React from 'react';
import { useGameConstants } from '../hooks/useGameConstants';
import type { BuildingStats } from '../types/buildingStats';
import { BaseSidebar } from './BaseSidebar';
import type { Resources } from '../types/resources';
import { ResourceStats } from './ResourcesStatsComponent';

interface BuildSidebarProps {
    selectedTile: any;
    resources: Resources;
    onBuild: (buildingTypeId: string) => void;
    onClose: () => void;
}

export const BuildSidebar: React.FC<BuildSidebarProps> = ({ 
    selectedTile, 
    resources, 
    onBuild, 
    onClose 
}) => {
    const constants = useGameConstants();
    if (!constants) return null;

    const canAfford = (cost: Resources) => {
        return (
            resources.food >= (cost.food || 0) &&
            resources.gold >= (cost.gold || 0) &&
            resources.materials >= (cost.materials || 0) &&
            resources.science >= (cost.science || 0) &&
            resources.soldiers >= (cost.soldiers || 0) &&
            resources.workers >= (cost.workers || 0)
        );
    };

    return (
        <BaseSidebar 
            title="Construction" 
            subtitle={`Terrain: ${selectedTile.terrain.name}`} 
            onClose={onClose}
            borderColor="#4CAF50"
        >
            <div style={styles.scrollArea}>
                {Object.entries(constants.buildingStats as Record<string, BuildingStats>).map(([key, stats]) => {
                    
                    if (!stats.buildable) return null;

                    const isCorrectTerrain = stats.buildableTerrains.includes(selectedTile.terrain.name);
                    if (!isCorrectTerrain) return null;

                    const affordable = canAfford(stats.resourcesToBuild);

                    return (
                        <div key={key} style={styles.card}>
                            <div style={styles.cardHeader}>
                                <span style={styles.name}>{stats.name}</span>
                                <span style={styles.hp}>❤️ {stats.baseHealth} HP</span>
                            </div>

                            <p style={styles.description}>{stats.description}</p>

                            {/* <div style={styles.costGrid}>
                                {Object.entries(stats.resourcesToBuild).map(([res, amount]) => {
                                    if (amount === 0) return null;
                                    
                                    const hasEnough = (resources as any)[res] >= (amount as number);
                                    
                                    return (
                                        <span key={res} style={{ 
                                            color: hasEnough ? '#fff' : '#ff4d4d', 
                                            fontSize: '12px',
                                            fontWeight: hasEnough ? 'normal' : 'bold' 
                                        }}>
                                            {res === 'food' && '🌾'}
                                            {res === 'gold' && '💰'}
                                            {res === 'materials' && '🪵'}
                                            {res === 'science' && '🧪'}
                                            {res === 'soldiers' && '⚔️'}
                                            {res === 'workers' && '🛠️'}
                                            {amount}
                                        </span>
                                    );
                                })}
                            </div> */}

                            <ResourceStats
                                title="Construction cost (once)"
                                resources={stats.resourcesToBuild}
                            />

                            <ResourceStats
                                title="Maintenance cost (every turn)"
                                resources={stats.resourcesToMaintain}
                            />

                            <ResourceStats
                                title="Storage upgrade"
                                resources={stats.resourcesCapacityUpgrade}
                            />

                            <ResourceStats
                                title="Production upgrade"
                                resources={stats.production}
                            />

                            <button
                                disabled={!affordable}
                                onClick={() => onBuild(key)}
                                style={{
                                    ...styles.buildBtn,
                                    backgroundColor: affordable ? '#4CAF50' : '#333',
                                    cursor: affordable ? 'pointer' : 'not-allowed',
                                }}
                            >
                                {affordable ? 'Build' : 'Insufficient Resources'}
                            </button>
                        </div>
                    );
                })}
            </div>
        </BaseSidebar>
    );
};

const styles: Record<string, React.CSSProperties> = {
    sidebar: {
        position: 'absolute', right: 0, top: 0, bottom: 0, width: '320px',
        backgroundColor: 'rgba(15, 15, 15, 0.98)', color: 'white',
        padding: '20px', zIndex: 1000, borderLeft: '2px solid #444',
        display: 'flex', flexDirection: 'column', fontFamily: 'sans-serif',
        boxShadow: '-4px 0 10px rgba(0,0,0,0.5)'
    },
    header: { display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '5px' },
    closeBtn: { background: 'none', border: 'none', color: '#888', cursor: 'pointer', fontSize: '24px' },
    subtitle: { color: '#aaa', marginBottom: '20px', fontSize: '14px', textTransform: 'uppercase', letterSpacing: '1px' },
    scrollArea: { overflowY: 'auto', flex: 1 },
    card: { 
        backgroundColor: '#252525', padding: '15px', borderRadius: '8px', 
        marginBottom: '15px', display: 'flex', flexDirection: 'column', gap: '8px',
        border: '1px solid #333'
    },
    cardHeader: { display: 'flex', justifyContent: 'space-between', alignItems: 'center' },
    name: { fontWeight: 'bold', fontSize: '18px' },
    hp: { fontSize: '12px', color: '#ff7675' },
    description: { fontSize: '13px', color: '#ffffff', margin: '5px 0', lineHeight: '1.4' },
    costGrid: { 
        display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '8px', 
        padding: '10px', backgroundColor: '#111', borderRadius: '4px', margin: '5px 0' 
    },
    buildBtn: { 
        marginTop: '8px', padding: '12px', border: 'none', borderRadius: '4px', 
        color: 'white', fontWeight: 'bold', transition: '0.2s' 
    }
};