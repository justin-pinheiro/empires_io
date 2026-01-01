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
            {/* Minimalist Points Indicator */}
            <div style={styles.floatingBadge}>
                {pendingUpgrades} RESEARCH POINT{pendingUpgrades !== 1 ? 'S' : ''} REMAINING
            </div>

            <div style={styles.grid}>
                {currentOptions.map((option) => (
                    <div key={option.bonusType} style={styles.card}>
                        <div style={styles.cardContent}>
                            <div style={styles.titleRow}>
                                <h4 style={styles.bigTitle}>{option.name}</h4>
                                <span style={styles.upgradeText}>{option.upgrade}</span>
                            </div>
                            <p style={styles.description}>{option.description}</p>
                        </div>
                        
                        <button 
                            style={styles.button}
                            disabled={isLoading}
                            onClick={() => selectUpgrade(option.bonusType)}
                        >
                            CHOOSE
                        </button>
                    </div>
                ))}
            </div>
        </div>
    );
};

const styles: Record<string, React.CSSProperties> = {
    container: {
        position: 'fixed',
        bottom: '50px',
        left: '50%',
        width: '95%',
        maxWidth: '1000px',
        zIndex: 1000,
        transition: 'all 0.5s cubic-bezier(0.175, 0.885, 0.32, 1.275)',
    },
    whooshIn: {
        transform: 'translateX(-50%) translateY(0)',
        opacity: 1,
    },
    whooshOut: {
        transform: 'translateX(-50%) translateY(150%)',
        opacity: 0,
    },
    floatingBadge: {
        textAlign: 'center',
        color: '#ccac00',
        fontSize: '20px',
        fontWeight: 'bold',
        letterSpacing: '2px',
        marginBottom: '16px',
        textShadow: '0 0 10px rgba(204, 172, 0, 0.3)',
    },
    grid: {
        display: 'flex',
        gap: '30px',
        justifyContent: 'center',
        alignItems: 'stretch',
    },
    card: {
        flex: 1,
        backgroundColor: 'rgba(20, 20, 25, 0.98)',
        border: '1px solid #444',
        borderRadius: '8px',
        padding: '20px',
        display: 'flex',
        flexDirection: 'column',
        boxShadow: '0 4px 16px rgba(0,0,0,0.6)',
    },
    cardContent: {
        marginBottom: '10px',
    },
    titleRow: {
        display: 'flex',
        justifyContent: 'space-between',
        alignItems: 'flex-end',
        marginBottom: '8px',
    },
    bigTitle: {
        margin: 0,
        color: '#fff',
        fontSize: '24px',
        textTransform: 'uppercase',
        lineHeight: '1',
    },
    upgradeText: {
        color: '#4caf50',
        fontSize: '14px',
        fontWeight: 'bold',
    },
    description: {
        margin: 0,
        color: '#bbb',
        fontSize: '14px',
    },
    button: {
        width: '100%',
        padding: '6px',
        backgroundColor: '#3498db',
        color: 'white',
        border: 'none',
        borderRadius: '4px',
        cursor: 'pointer',
        fontWeight: '900',
        fontSize: '0.75rem',
        marginTop: 'auto',
    }
};