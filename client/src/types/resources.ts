export interface Resources {
  food: number;
  gold: number;
  science: number;
  soldiers: number;
  workers: number;
}

export function hasEnough(cost: Resources, available: Resources) {
  return (
    available.food >= cost.food &&
    available.gold >= cost.gold &&
    available.science >= cost.science &&
    available.soldiers >= cost.soldiers &&
    available.workers >= cost.workers
  )
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