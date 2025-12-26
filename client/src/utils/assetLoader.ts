export const BUILDING_ICONS: Record<string, HTMLImageElement> = {};
const buildingTypes = ['FARM', 'MARKET', 'MINE', 'HOUSE', 'CAMP', 'TOWER', 'CAPITAL', 'BARBARIAN_CAMP'];

let assetsLoaded = false;

export const loadAssets = (onComplete: () => void) => {
  if (assetsLoaded) return onComplete();

  let loadedCount = 0;
  buildingTypes.forEach(type => {
    const img = new Image();
    img.src = `../../public/buildings/${type.toLowerCase()}.png`; 
    img.onload = () => {
      loadedCount++;  
      if (loadedCount === buildingTypes.length) {
        assetsLoaded = true;
        onComplete();
      }
    };
    img.onerror = () => console.error(`Failed to load icon: ${type}`);
    BUILDING_ICONS[type] = img;
  });
};