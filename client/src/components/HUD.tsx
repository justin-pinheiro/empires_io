// components/ResourceHUD.tsx
import React from 'react';
import type { ResourceState } from '../hooks/useResources';

interface HUDProps {
  resources: ResourceState;
}

export const ResourceHUD: React.FC<HUDProps> = ({ resources }) => {
  const items = [
    { label: 'Food', value: resources.food, icon: '🌾', color: '#90ee90' },
    { label: 'Gold', value: resources.gold, icon: '💰', color: '#ffd700' },
    { label: 'Stone', value: resources.stone, icon: '🪨', color: '#aaaaaa' },
    { label: 'Science', value: resources.science, icon: '🧪', color: '#87ceeb' },
    { label: 'Army', value: resources.army, icon: '⚔️', color: '#ff4d4d' },
  ];

  return (
    <div style={hudWrapperStyle}>
      {items.map((item) => (
        <div key={item.label} style={itemStyle}>
          <span style={{ fontSize: '1.2rem' }}>{item.icon}</span>
          <div style={textWrapperStyle}>
            <span style={labelStyle}>{item.label}</span>
            <span style={{ ...valueStyle, color: item.color }}>
              {Math.floor(item.value).toLocaleString()}
            </span>
          </div>
        </div>
      ))}
    </div>
  );
};

// --- Styles ---
const hudWrapperStyle: React.CSSProperties = {
  position: 'absolute',
  top: '10px',
  left: '50%',
  transform: 'translateX(-50%)',
  display: 'flex',
  gap: '20px',
  padding: '8px 20px',
  backgroundColor: 'rgba(20, 20, 20, 0.85)',
  borderRadius: '30px',
  border: '1px solid #444',
  backdropFilter: 'blur(5px)',
  zIndex: 200, // Above everything
  boxShadow: '0 4px 15px rgba(0,0,0,0.5)',
};

const itemStyle: React.CSSProperties = {
  display: 'flex',
  alignItems: 'center',
  gap: '8px',
};

const textWrapperStyle: React.CSSProperties = {
  display: 'flex',
  flexDirection: 'column',
  lineHeight: '1',
};

const labelStyle: React.CSSProperties = {
  fontSize: '10px',
  textTransform: 'uppercase',
  color: '#888',
  fontWeight: 'bold',
};

const valueStyle: React.CSSProperties = {
  fontSize: '16px',
  fontWeight: 'bold',
  fontFamily: 'monospace',
};