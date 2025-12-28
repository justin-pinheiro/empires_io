import React from 'react';
import { ATTACK_ACTIONS, type AttackType } from '../types/attackStats';
import type { ResourceState } from '../hooks/useResources';

interface ActionSidebarProps {
    tile: any;
    resources: ResourceState;
    isNeighbor: boolean;
    onAttack: (type: AttackType) => void;
    onClose: () => void;
}

export const ActionSidebar: React.FC<ActionSidebarProps> = ({ tile, resources, isNeighbor, onAttack, onClose }) => {
    
    const canAfford = (armyCost: number) => {
        return resources.army >= armyCost;
    };

    return (
        <div style={styles.sidebar}>
            <div style={styles.header}>
                <h2 style={{ margin: 0, color: '#ff4d4d' }}>Enemy Territory</h2>
                <button onClick={onClose} style={styles.closeBtn}>✕</button>
            </div>

            {/* INTEL SECTION */}
            <div style={styles.section}>
                <p style={styles.label}>Owner: <span style={{color: '#fff'}}>{tile.ownerName || "Unknown Occupant"}</span></p>
                <p style={styles.label}>Terrain: <span style={{color: '#fff'}}>{tile.terrainType}</span></p>
                {tile.building && (
                    <div style={styles.buildingInfo}>
                        <p style={{margin: '0 0 5px 0'}}>Structure: <strong>{tile.building.type}</strong></p>
                        <div style={styles.healthBarContainer}>
                            <div style={{...styles.healthBar, width: `${(tile.building.health / tile.building.maxHealth) * 100}%`}} />
                        </div>
                        <span style={{fontSize: '10px'}}>HP: {tile.building.health} / {tile.building.maxHealth}</span>
                    </div>
                )}
            </div>

            <hr style={styles.divider} />

            {/* ATTACK SECTION */}
            <div style={styles.scrollArea}>
                <h3 style={{fontSize: '14px', textTransform: 'uppercase', color: '#888'}}>Available Actions</h3>
                
                {!isNeighbor ? (
                    <p style={styles.warningText}>⚠️ You can only attack tiles adjacent to your borders.</p>
                ) : (
                    Object.entries(ATTACK_ACTIONS).map(([key, action]) => {
                        const affordable = canAfford(action.armyCost);
                        return (
                            <div key={key} style={styles.card}>
                                <div style={styles.cardHeader}>
                                    <span><strong>{action.name}</strong></span>
                                    <span style={{color: '#ff4d4d', fontWeight: 'bold'}}>-{action.damage} HP</span>
                                </div>
                                <p style={styles.description}>{action.description}</p>
                                
                                <div style={styles.costRow}>
                                    {action.armyCost > 0 && <span style={{color: resources.army >= action.armyCost ? '#fff' : '#ff4d4d'}}>⚔️{action.armyCost}</span>}
                                </div>

                                <button 
                                    disabled={!affordable}
                                    onClick={() => onAttack(key as AttackType)}
                                    style={{
                                        ...styles.attackBtn,
                                        backgroundColor: affordable ? '#ff4d4d' : '#333'
                                    }}
                                >
                                    {affordable ? 'Launch Attack' : 'Insufficient Resources'}
                                </button>
                            </div>
                        )
                    })
                )}
            </div>
        </div>
    );
};

const styles: Record<string, React.CSSProperties> = {
    sidebar: { position: 'absolute', right: 0, top: 0, bottom: 0, width: '320px', backgroundColor: 'rgba(30, 10, 10, 0.95)', color: 'white', padding: '20px', zIndex: 1000, borderLeft: '2px solid #ff4d4d', display: 'flex', flexDirection: 'column' },
    header: { display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '20px' },
    closeBtn: { background: 'none', border: 'none', color: '#888', cursor: 'pointer', fontSize: '20px' },
    section: { marginBottom: '15px' },
    label: { fontSize: '14px', color: '#aaa', margin: '5px 0' },
    buildingInfo: { backgroundColor: '#000', padding: '10px', borderRadius: '4px', marginTop: '10px' },
    healthBarContainer: { width: '100%', height: '8px', backgroundColor: '#333', borderRadius: '4px', overflow: 'hidden' },
    healthBar: { height: '100%', backgroundColor: '#ff4d4d', transition: 'width 0.3s ease' },
    divider: { border: '0', borderTop: '1px solid #444', margin: '10px 0 20px 0' },
    scrollArea: { overflowY: 'auto', flex: 1 },
    card: { backgroundColor: '#251515', padding: '15px', borderRadius: '6px', marginBottom: '15px', border: '1px solid #442222' },
    cardHeader: { display: 'flex', justifyContent: 'space-between', fontSize: '16px', marginBottom: '8px' },
    description: { fontSize: '12px', color: '#ccc', margin: '0 0 10px 0' },
    costRow: { display: 'flex', gap: '10px', fontSize: '12px', marginBottom: '10px' },
    attackBtn: { width: '100%', padding: '10px', border: 'none', borderRadius: '4px', color: 'white', fontWeight: 'bold', cursor: 'pointer' },
    warningText: { color: '#ffb300', fontSize: '13px', fontStyle: 'italic', textAlign: 'center', marginTop: '20px' }
};