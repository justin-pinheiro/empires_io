export const BUILDING_ICONS: Record<string, HTMLImageElement> = {};

export const loadAssets = async () => {
  const modules = import.meta.glob('/public/buildings/*.png', { eager: true });
  
  const promises = Object.keys(modules).map((path) => {
    return new Promise<void>((resolve) => {
      const fileName = path.split('/').pop() || '';
      const img = new Image();
      img.src = path; 
      
      img.onload = () => {
        BUILDING_ICONS[fileName] = img;
        resolve();
      };
      resolve();
    });
  });
  
  return Promise.all(promises);
};