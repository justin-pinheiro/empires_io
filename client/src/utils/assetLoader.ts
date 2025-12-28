import { BuildingType } from "../types/buildingType";

const ALL_BUILDING_TYPES = Object.values(BuildingType);
export const BUILDING_ICONS: Record<string, HTMLImageElement> = {};

export const loadAssets = (): Promise<void[]> => {
  const promises = ALL_BUILDING_TYPES.map((type) => {
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