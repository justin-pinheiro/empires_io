import { RESOURCE_ICONS, type Resources } from "../types/resources";


interface ResourceStatsProps {
  title: string;
  resources: Resources;
}

export const ResourceStats: React.FC<ResourceStatsProps> = ({ title, resources: resources }) => {
  return (
    <div style={styles.container}>
      <h4 style={styles.miniTitle}>{title}</h4>
    
      <div style={styles.miniGrid}>
        {(Object.entries(resources) as [keyof Resources, number][]).map(([res, val]) => {
          if (val === 0) return null;

          return (
            <span key={res} style={styles.resItem}>
              <span style={styles.icon}>{RESOURCE_ICONS[res]}</span>
              <span style={styles.value}>
                {val > 0 ? '+' : ''}{val.toFixed(1)}
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
    fontSize: '0.85rem', // Shrunk text
    gap: '3px',
  },
  icon: {
    fontSize: '0.9rem',
  },
  value: {
    fontWeight: 500,
  }
};