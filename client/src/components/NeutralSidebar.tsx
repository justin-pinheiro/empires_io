import React from 'react';
import { BaseSidebar } from './BaseSidebar';

interface NeutralSidebarProps {
    tile: any;
    onClose: () => void;
}

export const NeutralSidebar: React.FC<NeutralSidebarProps> = ({ tile, onClose }) => {
    const terrainName = tile.terrain?.name || tile.terrainType || "Unknown";
    
    return (
        <BaseSidebar 
            title="Unclaimed Territory" 
            subtitle={`Terrain: ${terrainName}`}
            onClose={onClose}
            borderColor="#888"
        >
            <div style={styles.container}>
                <div style={styles.infoBox}>
                    <p style={styles.description}>
                        This land is currently wild and unoccupied.
                    </p>
                </div>
            </div>
        </BaseSidebar>
    );
};

const styles: Record<string, React.CSSProperties> = {
    container: { display: 'flex', flexDirection: 'column', gap: '20px' },
    infoBox: { backgroundColor: '#222', padding: '15px', borderRadius: '6px', border: '1px solid #333' },
    description: { fontSize: '14px', color: '#ccc', margin: 0, lineHeight: '1.5' },
};