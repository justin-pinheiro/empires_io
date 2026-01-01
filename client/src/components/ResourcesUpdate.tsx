import { RESOURCE_ICONS, type Resources } from "../types/resources";


interface ResourceUpdateProps {
  title: string;
  update: Resources;
}

export const ResourcesUpdate: React.FC<ResourceUpdateProps> = ({ title, update }) => {
  return (
    <div style={styles.container}>
      <h4 style={styles.miniTitle}>{title}</h4>
    

      <div style={styles.miniGrid}>
        {(Object.entries(update) as [keyof Resources, number][]).map(([res, val]) => {
          if (val === 0) return null;
          
          const isPositiveUpdate = val > 0
          
          return (
            <span key={res} style={styles.resItem}>
              <span style={styles.icon}>{RESOURCE_ICONS[res]}</span>
              <span 
                style={{ 
                  ...styles.value, 
                  color: isPositiveUpdate ? '#ffffffff' : '#ff4d4d'
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

const styles = {
  container: {
    display: 'flex',
    flexDirection: 'column' as const,
    gap: '2px', // Tighten gap between title and resources
    margin: '4px 0',
  },
  miniTitle: {
    margin: 0,
    fontSize: '0.75rem', // Reduced size
    fontWeight: 'bold',
    color: '#666',
    textAlign: 'left' as const,
  },
  miniGrid: {
    display: 'flex',
    flexWrap: 'wrap' as const,
    gap: '8px',
    padding: '2px 0',
  },
  resItem: {
    display: 'flex',
    alignItems: 'center',
    fontSize: '0.85rem',
    gap: '3px',
  },
  icon: {
    fontSize: '0.9rem',
  },
  value: {
    fontWeight: 'bold'
  }
};