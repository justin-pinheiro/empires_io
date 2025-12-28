import React from 'react';
import type { Civilisation } from '../types/civilisation';
import type { Resources } from '../types/resources';

interface HUDProps {
    civilisation: Civilisation;
    production: Resources;
}

export const HUD: React.FC<HUDProps> = ({ civilisation, production }) => {
    // Panel 1: Civilization State (Left)
    const stateItems = [
        { 
            label: 'Pop', 
            value: `${Math.floor(civilisation.workingPopulation)}/${Math.floor(civilisation.populationCapacity)}`, 
            production: null,
            icon: '👥', 
            color: '#a162e9' 
        },
        { 
            label: 'Army', 
            value: `${Math.floor(civilisation.resources.army)}/${Math.floor(civilisation.armyCapacity)}`, 
            production: production.army, 
            icon: '⚔️', 
            color: '#ff4d4d' 
        },
    ];

    // Panel 2: Treasury (Right)
    const resourceItems = [
        { label: 'Food', value: Math.floor(civilisation.resources.food), production: production.food, icon: '🌾', color: '#4285d6' },
        { label: 'Gold', value: Math.floor(civilisation.resources.gold), production: production.gold, icon: '💰', color: '#ffd700' },
        { label: 'Stone', value: Math.floor(civilisation.resources.stone), production: production.stone, icon: '🪨', color: '#aaaaaa' },
        { label: 'Science', value: Math.floor(civilisation.resources.science), production: production.science, icon: '🧪', color: '#6cde63' },
    ];

    const renderItem = (item: any) => (
        <div key={item.label} style={itemStyle}>
            <span style={iconStyle}>{item.icon}</span>
            <div style={textWrapperStyle}>
                <span style={labelStyle}>{item.label}</span>
                <div style={valueContainerStyle}>
                    <span style={{ ...valueStyle, color: item.color }}>{item.value}</span>
                    {item.production !== null && item.production > 0 && (
                        <span style={{ ...productionStyle, color: item.color }}>
                            +{item.production.toFixed(1)}
                        </span>
                    )}
                </div>
            </div>
        </div>
    );

    return (
        <div style={containerStyle}>
            {/* LEFT PANEL: CIV STATE */}
            <div style={panelStyle}>
                {stateItems.map(renderItem)}
            </div>

            {/* RIGHT PANEL: RESOURCES */}
            <div style={panelStyle}>
                {resourceItems.map(renderItem)}
            </div>
        </div>
    );
};

// --- Styles ---

const containerStyle: React.CSSProperties = {
    position: 'absolute',
    top: '20px',
    left: '50%',
    transform: 'translateX(-50%)',
    display: 'flex',
    gap: '30px', // Gap between the two panels
    zIndex: 200,
    pointerEvents: 'none', // Allows clicking through to the map if needed
};

const panelStyle: React.CSSProperties = {
    display: 'flex',
    gap: '20px',
    padding: '10px 20px',
    backgroundColor: 'rgba(15, 15, 15, 0.8)',
    borderRadius: '16px',
    border: '1px solid rgba(255, 255, 255, 0.1)',
    backdropFilter: 'blur(12px)',
    boxShadow: '0 8px 32px rgba(0,0,0,0.4)',
    pointerEvents: 'auto',
};

const itemStyle: React.CSSProperties = {
    display: 'flex',
    alignItems: 'center',
    gap: '12px',
};

const iconStyle: React.CSSProperties = {
    fontSize: '1.4rem',
    filter: 'drop-shadow(0 2px 4px rgba(0,0,0,0.5))',
};

const textWrapperStyle: React.CSSProperties = {
    display: 'flex',
    flexDirection: 'column',
    justifyContent: 'center',
};

const labelStyle: React.CSSProperties = {
    fontSize: '10px',
    textTransform: 'uppercase',
    color: 'rgba(255, 255, 255, 0.5)',
    fontWeight: 800,
    letterSpacing: '1px',
    marginBottom: '-2px',
};

const valueContainerStyle: React.CSSProperties = {
    display: 'flex',
    alignItems: 'baseline',
    gap: '6px',
};

const valueStyle: React.CSSProperties = {
    fontSize: '18px',
    fontWeight: 'bold',
    fontFamily: '"JetBrains Mono", monospace',
    textShadow: '0 2px 4px rgba(0,0,0,0.3)',
};

const productionStyle: React.CSSProperties = {
    fontSize: '12px',
    fontWeight: 'bold',
    opacity: 0.8,
};