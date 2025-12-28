import React from 'react';
import { BaseSidebar } from './BaseSidebar';
import type { Resources } from '../types/resources';
import type { Building } from '../types/building';

interface BuildingInfoSidebarProps {
    building: Building;
    resources: Resources;
    onUpgrade: () => void;
    onClose: () => void;
}

export const BuildingInfoSidebar: React.FC<BuildingInfoSidebarProps> = ({ 
    building, onClose 
}) => {
    if (!building) return null;

    return (
        <BaseSidebar 
            title={building.name} 
            subtitle={``} 
            onClose={onClose}
            borderColor="#4CAF50"
        >
            <div style={styles.container}>
                {/* 1. STATUS SECTION */}
                <div style={styles.section}>
                    <div style={styles.healthBarContainer}>
                        <div style={{...styles.healthBar, width: `${(building.health.current / building.health.max) * 100}%`}} />
                    </div>
                    <span style={styles.hpLabel}>HP: {building.health.current} / {building.health.max}</span>
                    <p style={styles.description}>{building.description}</p>
                </div>

                {/* 2. PRODUCTION SECTION */}
                <div style={styles.statsCard}>
                    <h4 style={styles.cardTitle}>Current Production</h4>
                    <div style={styles.resGrid}>
                        {Object.entries(building.production).map(([res, val]) => {
                            if (val === 0) return null;
                            return <span key={res}>{res}: +{(val as number) * building.productionRate}</span>;
                        })}
                    </div>
                </div>
            </div>
        </BaseSidebar>
    );
};

const styles: Record<string, React.CSSProperties> = {
    container: { display: 'flex', flexDirection: 'column', gap: '15px' },
    section: { marginBottom: '10px' },
    description: { fontSize: '13px', color: '#ccc', marginTop: '10px', lineHeight: '1.4' },
    healthBarContainer: { width: '100%', height: '10px', backgroundColor: '#222', borderRadius: '5px', overflow: 'hidden' },
    healthBar: { height: '100%', backgroundColor: '#4CAF50' },
    hpLabel: { fontSize: '11px', color: '#aaa' },
    statsCard: { backgroundColor: '#222', padding: '12px', borderRadius: '6px' },
    cardTitle: { margin: '0 0 8px 0', fontSize: '12px', color: '#888', textTransform: 'uppercase' },
    resGrid: { display: 'flex', gap: '15px', fontSize: '14px' },
    divider: { border: '0', borderTop: '1px solid #333', margin: '10px 0' },
};