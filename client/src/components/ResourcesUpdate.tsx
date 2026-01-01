import React from 'react';
import { RESOURCE_COLORS, type Resources } from "../types/resources";

interface ResourceUpdateProps {
  title: string;
  update: Partial<Resources>; // Partial because not all buildings update all resources
}

export const ResourcesUpdate: React.FC<ResourceUpdateProps> = ({ title, update }) => {
  return (
    <div style={styles.container}>
      <h4 style={styles.miniTitle}>{title}</h4>
    
      <div style={styles.miniGrid}>
        {(Object.entries(update) as [keyof Resources, number][]).map(([res, val]) => {
          if (val === 0 || val === undefined) return null;
          
          const isPositiveUpdate = val > 0;
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
              {/* Colorized Icon to reinforce the resource type */}
              <div style={iconStyle} />
              
              <span 
                style={{ 
                  ...styles.value,
                }}
              >
                {isPositiveUpdate ? '+' : ''}{val.toFixed(0)}
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
    color: 'rgba(255, 255, 255, 0.4)', // Dimmer title to keep focus on numbers
    letterSpacing: '0.1em',
    fontWeight: 800,
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
    textShadow: '0 1px 2px rgba(0,0,0,0.5)',
  },
};