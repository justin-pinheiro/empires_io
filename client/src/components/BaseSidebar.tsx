import React from 'react';

interface BaseSidebarProps {
    title: string;
    subtitle?: string;
    onClose: () => void;
    children: React.ReactNode;
    borderColor?: string; // Optional: red for enemies, green for friends
}

export const BaseSidebar: React.FC<BaseSidebarProps> = ({ 
    title, 
    subtitle, 
    onClose, 
    children, 
    borderColor = '#444' 
}) => {
    return (
        <div style={{ ...styles.sidebar, borderLeft: `2px solid ${borderColor}` }}>
            <div style={styles.header}>
                <h2 style={styles.title}>{title}</h2>
                <button onClick={onClose} style={styles.closeBtn}>✕</button>
            </div>

            {subtitle && (
                <p style={styles.subtitle}>{subtitle}</p>
            )}

            <div style={styles.scrollArea}>
                {children}
            </div>
        </div>
    );
};

const styles: Record<string, React.CSSProperties> = {
    sidebar: {
        position: 'absolute', right: 0, top: 0, bottom: 0, width: '320px',
        backgroundColor: 'rgba(15, 15, 15, 0.98)', color: 'white',
        padding: '20px', zIndex: 1000, 
        display: 'flex', flexDirection: 'column', fontFamily: 'sans-serif',
        boxShadow: '-4px 0 10px rgba(0,0,0,0.5)'
    },
    header: { display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '5px' },
    title: { margin: 0, fontSize: '22px', letterSpacing: '0.5px' },
    closeBtn: { background: 'none', border: 'none', color: '#888', cursor: 'pointer', fontSize: '24px' },
    subtitle: { color: '#aaa', marginBottom: '20px', fontSize: '14px', textTransform: 'uppercase', letterSpacing: '1px' },
    scrollArea: { overflowY: 'auto', flex: 1, paddingRight: '5px' },
};