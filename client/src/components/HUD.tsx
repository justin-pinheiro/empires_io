import React from 'react';

interface ResourceData {
  food: number;
  gold: number;
  stone: number;
  science: number;
  army: number;
}

export const HUD: React.FC<{ resources: ResourceData }> = ({ resources }) => {
  const stats = [
    { id: 'food', val: resources.food, icon: '🌾', color: '#50fa7b' },
    { id: 'gold', val: resources.gold, icon: '🪙', color: '#f1fa8c' },
    { id: 'stone', val: resources.stone, icon: '🪨', color: '#bd93f9' },
    { id: 'science', val: resources.science, icon: '🧪', color: '#8be9fd' },
    { id: 'army', val: resources.army, icon: '⚔️', color: '#ff5555' },
  ];

  return (
    <div className="hud-container">
      <div className="resource-bar">
        {stats.map((s) => (
          <div key={s.id} className="resource-item">
            <span className="res-icon">{s.icon}</span>
            <div className="res-details">
              <span className="res-label">{s.id}</span>
              <span className="res-value" style={{ color: s.color }}>
                {s.val.toLocaleString()}
              </span>
            </div>
          </div>
        ))}
      </div>

      <style>{`
        .hud-container {
          position: fixed;
          top: 0;
          left: 0;
          width: 100%;
          pointer-events: none; /* Let clicks pass to map */
          z-index: 10;
          padding: 20px;
          display: flex;
          justify-content: center;
        }
        .resource-bar {
          display: flex;
          gap: 25px;
          background: rgba(15, 15, 20, 0.8);
          backdrop-filter: blur(8px);
          padding: 10px 40px;
          border-radius: 0 0 20px 20px;
          border: 1px solid rgba(255,255,255,0.1);
          border-top: none;
          box-shadow: 0 10px 30px rgba(0,0,0,0.5);
          pointer-events: auto; /* Buttons inside will work */
        }
        .resource-item {
          display: flex;
          align-items: center;
          gap: 12px;
        }
        .res-icon { font-size: 24px; }
        .res-details { display: flex; flexDirection: column; }
        .res-label { 
          font-size: 10px; 
          text-transform: uppercase; 
          letter-spacing: 1px; 
          color: #6272a4; 
        }
        .res-value { 
          font-size: 18px; 
          font-weight: 800; 
          font-family: 'monospace';
        }
      `}</style>
    </div>
  );
};