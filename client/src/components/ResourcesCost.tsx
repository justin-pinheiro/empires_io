import React from 'react';
import { RESOURCE_COLORS, type Resources } from "../types/resources";

interface ResourceCostProps {
  title: string;
  cost: Resources;
  resources: Resources;
}

export const ResourcesCost: React.FC<ResourceCostProps> = ({ title, cost, resources }) => {
  return (
    <div style={styles.container}>
      <h4 style={styles.miniTitle}>{title}</h4>
    
      <div style={styles.miniGrid}>
        {(Object.entries(cost) as [keyof Resources, number][]).map(([res, val]) => {
          if (val === 0) return null;

          const canAfford = resources[res] >= val;
          const resColor = RESOURCE_COLORS[res] || '#fff';

          // Colorized Image Icon logic
          const iconStyle: React.CSSProperties = {
            width: '16px',
            height: '16px',
            backgroundColor: resColor,
            WebkitMaskImage: `url(/resources/${res}.png)`,
            maskImage: `url(/resources/${res}.png)`,
            WebkitMaskRepeat: 'no-repeat',
            maskRepeat: 'no-repeat',
            WebkitMaskSize: 'contain',
            maskSize: 'contain',
            flexShrink: 0,
          };

          return (
            <span key={res} style={styles.resItem}>
              {/* 1. Colorized Icon */}
              <div style={iconStyle} />
              
              {/* 2. Affordability Value */}
              <span 
                style={{ 
                  ...styles.value, 
                  color: canAfford ? '#fff' : '#ff4d4d',
                  textDecoration: canAfford ? 'none' : '#ff4d4d',
                }}
              >
                {val.toFixed(0)}
              </span>
            </span>
          );
        })}
      </div>
    </div>
  );
};

// --- Styles ---

const styles = {
  container: {
    display: 'flex',
    flexDirection: 'column' as const,
    gap: '4px',
  },
  miniTitle: {
    margin: 0,
    fontSize: '10px',
    textTransform: 'uppercase' as const,
    color: 'rgba(255, 255, 255, 0.4)',
    letterSpacing: '0.05em',
    fontWeight: 700,
  },
  miniGrid: {
    display: 'flex',
    flexWrap: 'wrap' as const,
    gap: '12px',
    alignItems: 'center',
  },
  resItem: {
    display: 'flex',
    alignItems: 'center',
    gap: '6px',
  },
  value: {
    fontSize: '14px',
    fontWeight: 'bold' as const,
    fontFamily: '"JetBrains Mono", monospace',
    fontVariantNumeric: 'tabular-nums',
  },
};