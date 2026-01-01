import React from 'react';
import type { Civilisation } from '../types/civilisation';
import { RESOURCE_COLORS, type Resources } from '../types/resources';
import type { AgeStats } from '../types/age';

interface HUDProps {
    civilisation: Civilisation;
    production: Resources;
    nextAge: AgeStats
}

export const GameHUD: React.FC<HUDProps> = ({ civilisation, production, nextAge }) => {
    
    // Helper to calculate if a resource is full
    const isFull = (current: number, capacity: number) => current >= capacity && capacity > 0;

    const stateItems = [
        { 
            label: 'Workers', 
            current: civilisation.resources.workers,
            max: civilisation.resourcesCapacity.workers,
            production: production.workers,
            iconName: 'workers.png', 
            color: RESOURCE_COLORS["workers"], 
        },
        { 
            label: 'Soldiers',
            current: civilisation.resources.soldiers,
            max: civilisation.resourcesCapacity.soldiers,
            production: production.soldiers,
            iconName: 'soldiers.png', 
            color: RESOURCE_COLORS["soldiers"], 
        },
    ];

    const resourceItems = [
        { 
            label: 'Food', 
            current: civilisation.resources.food,
            max: civilisation.resourcesCapacity.food,
            production: production.food, 
            iconName: 'food.png', 
            color: RESOURCE_COLORS["food"], 
        },
        { 
            label: 'Gold', 
            current: civilisation.resources.gold,
            max: civilisation.resourcesCapacity.gold,
            production: production.gold, 
            iconName: 'gold.png', 
            color: RESOURCE_COLORS["gold"], 
        }
    ];
    
    const scienceItems = [
        { 
            label: 'Science', 
            current: civilisation.resources.science,
            max: nextAge.requiredScience,
            production: production.science, 
            iconName: 'science.png', 
            color: RESOURCE_COLORS["science"], 
        },
        { 
            label: 'Age', 
            current: civilisation.age,
            max: null,
            production: null, 
            iconName: null,
            color: '#B0BEC5' 
        },
    ];

    const renderItem = (item: any) => {
        const full = isFull(item.current, item.max);
        const isNegative = item.production < 0;
        const productionColor = isNegative ? '#ff4d4d' : item.color;
        
        // Dynamic Icon Style using mask-image to colorize white PNGs
        const colorizedIconStyle: React.CSSProperties = {
            width: '30px',
            height: '30px',
            backgroundColor: item.color, // This "fills" the icon color
            WebkitMaskImage: `url(/resources/${item.iconName})`,
            maskImage: `url(/resources/${item.iconName})`,
            WebkitMaskRepeat: 'no-repeat',
            maskRepeat: 'no-repeat',
            WebkitMaskSize: 'contain',
            maskSize: 'contain',
            filter: full ? `drop-shadow(0 0 4px ${item.color})` : 'none',
        };

        return (
            <div key={item.label} style={itemStyle}>
                <div style={colorizedIconStyle} />
                <div style={textWrapperStyle}>
                    <span style={{ ...labelStyle, opacity: 0.4 }}>{item.label}</span>
                    
                    <div style={valueContainerStyle}>
                        <span style={{ 
                            ...valueStyle, 
                            color: full ? item.color : '#FFFFFF',
                            transition: 'color 0.3s ease'
                        }}>
                            {Math.floor(item.current)}
                            {item.max && ( 
                                <span style={{ opacity: 0.3, fontSize: '0.7em' }}>
                                    /{Math.floor(item.max)}
                                </span>
                            )}
                        </span>
                        {item.production != null && !full && (
                            <span style={{ 
                                ...productionStyle, 
                                color: productionColor,
                                backgroundColor: isNegative ? 'rgba(255, 77, 77, 0.1)' : 'transparent',
                                padding: '2px 4px',
                                borderRadius: '4px'
                            }}>
                                {item.production >= 0 ? '+' : ''}{Math.abs(item.production).toFixed(0)}
                            </span>
                        )}
                    </div>
                </div>
            </div>
        );
    };

    return (
        <div style={containerStyle}>
            <div style={panelStyle}>{stateItems.map(renderItem)}</div>
            <div style={panelStyle}>{resourceItems.map(renderItem)}</div>
            <div style={panelStyle}>{scienceItems.map(renderItem)}</div>
        </div>
    );
};

// --- Styles (Updated for scannability) ---

const containerStyle: React.CSSProperties = {
    position: 'absolute',
    top: '20px',
    left: '50%',
    transform: 'translateX(-50%)',
    display: 'flex',
    gap: '50px', 
    zIndex: 200,
    pointerEvents: 'none',
};

const panelStyle: React.CSSProperties = {
    display: 'flex',
    gap: '24px',
    padding: '12px 24px',
    backgroundColor: 'rgba(10, 10, 10, 0.75)',
    borderRadius: '12px',
    border: '1px solid rgba(255, 255, 255, 0.08)',
    backdropFilter: 'blur(16px)',
    pointerEvents: 'auto',
};

const itemStyle: React.CSSProperties = {
    display: 'flex',
    alignItems: 'center',
    gap: '12px',
};

const textWrapperStyle: React.CSSProperties = {
    display: 'flex',
    flexDirection: 'column',
};

const labelStyle: React.CSSProperties = {
    fontSize: '10px',
    textTransform: 'uppercase',
    color: '#FFF',
    fontWeight: 700,
    letterSpacing: '0.1em',
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
    fontVariantNumeric: 'tabular-nums', // Keeps numbers from jumping
};

const productionStyle: React.CSSProperties = {
    fontSize: '11px',
    fontWeight: 800,
};