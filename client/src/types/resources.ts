export interface Resources {
  food: number;
  gold: number;
  science: number;
  soldiers: number;
  workers: number;
}

export const RESOURCE_ICONS: Record<keyof Resources, string> = {
  food: '🌾',
  gold: '💰',
  science: '🧪',
  soldiers: '⚔️',
  workers: '🛠️',
};

export const RESOURCE_COLORS : Record<keyof Resources, string> = {
  food: '#81C784',    // Soft pastel green
  gold: '#FFD54F',    // Warm gold
  science: '#4FC3F7', // Tech blue
  soldiers: '#FF5F5F', // Muted alert red
  workers: '#A162E9', // Neutral light grey
};