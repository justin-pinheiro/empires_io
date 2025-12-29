export interface Resources {
  food: number;
  gold: number;
  materials: number;
  science: number;
  soldiers: number;
  workers: number;
}

export const RESOURCE_ICONS: Record<keyof Resources, string> = {
  food: '🌾',
  gold: '💰',
  materials: '🪵',
  science: '🧪',
  soldiers: '⚔️',
  workers: '🛠️',
};