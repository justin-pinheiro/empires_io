import React, { useEffect } from 'react';
import { useResearch } from '../hooks/useResearch';

export const ResearchBottomBar: React.FC = () => {
    const { pendingUpgrades, currentOptions, pullOptions, selectUpgrade, isLoading } = useResearch();

    useEffect(() => {
        if (pendingUpgrades > 0 && currentOptions.length === 0 && !isLoading) {
            pullOptions();
        }
    }, [pendingUpgrades, currentOptions, isLoading, pullOptions]);

    if (pendingUpgrades === 0 && currentOptions.length === 0) return null;

    const containerStyle = {
        ...styles.container,
        ...(currentOptions.length > 0 ? styles.whooshIn : styles.whooshOut)
    };

    return (
        <div style={containerStyle}>
            <div style={styles.header}>
                <h3>Available Upgrades</h3>
                <span style={styles.badge}>{pendingUpgrades} Point(s)</span>
            </div>

            <div style={styles.grid}>
                {currentOptions.map((option) => (
                    <div key={option.bonusType} style={styles.card}>
                        <div style={styles.cardTitle}>
                            <h4>{option.name}</h4>
                            <p style={styles.description}>{option.description}</p>
                        </div>
                        <div style={styles.bottom}>
                            <span style={styles.upgradeText}>{option.upgrade}</span>
                            <button 
                                disabled={isLoading}
                                onClick={() => selectUpgrade(option.bonusType)}
                            >
                                Choose
                            </button>
                        </div>
                    </div>
                ))}
            </div>
        </div>
    );
};
    
const styles: Record<string, React.CSSProperties> = {
    container: {
        position: 'fixed',
        bottom: '30px',
        left: '50%',
        transform: 'translateX(-50%)',
        width: '85%',
        maxWidth: '1000px',
        backgroundColor: 'rgba(15, 15, 20, 0.95)',
        border: '1px solid #444',
        borderRadius: '12px',
        padding: '20px',
        boxShadow: '0 10px 30px rgba(0,0,0,0.5)',
        zIndex: 1000,
        transition: 'transform 0.5s cubic-bezier(0.175, 0.885, 0.32, 1.275), opacity 0.3s ease-in-out',
    },
    // Used when currentOptions.length > 0
    whooshIn: {
        transform: 'translateX(-50%) translateY(0)',
        opacity: 1,
    },
    // Used when currentOptions.length === 0
    whooshOut: {
        transform: 'translateX(-50%) translateY(150%)',
        opacity: 0,
    },
    header: {
        display: 'flex',
        justifyContent: 'space-between',
        alignItems: 'center',
        marginBottom: '15px',
        borderBottom: '1px solid #333',
        paddingBottom: '10px',
    },
    title: {
        margin: 0,
        color: '#eee',
        fontSize: '1.2rem',
        textTransform: 'uppercase',
        letterSpacing: '1px',
    },
    badge: {
        backgroundColor: '#ccac00', // Gold color for importance
        color: '#000',
        padding: '4px 12px',
        borderRadius: '20px',
        fontWeight: 'bold',
        fontSize: '0.8rem',
    },
    grid: {
        display: 'flex',
        gap: '15px',
        justifyContent: 'center',
    },
    card: {
        flex: 1,
        backgroundColor: '#1e1e24',
        border: '1px solid #3d3d45',
        borderRadius: '8px',
        padding: '15px',
        display: 'flex',
        flexDirection: 'column',
        justifyContent: 'space-between',
        transition: 'background-color 0.2s',
    },
    cardTitle: {
        margin: '0 0 8px 0',
        color: '#fff',
        fontSize: '1rem',
    },
    description: {
        margin: '0 0 12px 0',
        color: '#bbb',
        fontSize: '0.85rem',
        lineHeight: '1.4',
    },
    deltaContainer: {
        marginTop: 'auto',
    },
    upgradeText: {
        display: 'block',
        color: '#4caf50', // Green for positive progression
        fontSize: '0.8rem',
        fontWeight: 'bold',
        marginBottom: '10px',
        fontFamily: 'monospace',
    },
    button: {
        width: '100%',
        padding: '8px',
        backgroundColor: '#3498db',
        color: 'white',
        border: 'none',
        borderRadius: '4px',
        cursor: 'pointer',
        fontWeight: 'bold',
        transition: 'filter 0.2s',
    }
}