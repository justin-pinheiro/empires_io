const BUILDING_TYPES = ['FARM', 'MARKET', 'MINE', 'HOUSE', 'BARRACKS', 'FORTIFICATIONS', 'CAPITAL', 'BARBARIAN_CAMP'];
export const BUILDING_ICONS: Record<string, HTMLImageElement> = {};

export const loadAssets = (): Promise<void[]> => {
  const promises = BUILDING_TYPES.map((type) => {
    return new Promise<void>((resolve, reject) => {
      const img = new Image();
      img.src = `/buildings/${type.toLowerCase()}.png`; 
      
      img.onload = () => {
        BUILDING_ICONS[type] = img;
        resolve();
      };
      
      img.onerror = () => {
        console.error(`Failed to load icon: ${img.src}`);
        resolve();
      };
    });
  });

  return Promise.all(promises);
};