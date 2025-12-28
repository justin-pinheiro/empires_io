import { useMemo } from 'react';
import { useBuildings } from './useBuildings';
import type { Resources } from '../types/resources';

export const usePlayerProduction = (playerId: string | undefined) => {
    const { buildingsRef } = useBuildings();

    const totalProduction = useMemo(() => {
        const totals: Resources = { food: 0, gold: 0, stone: 0, science: 0, army: 0 };

        if (!playerId) return totals;

        buildingsRef.current.forEach((building) => {
            if (building.ownerId === playerId && !building.isDestroyed) {
                const rate = building.productionRate;
                
                totals.food += building.production.food * rate;
                totals.gold += building.production.gold * rate;
                totals.stone += building.production.stone * rate;
                totals.science += building.production.science * rate;
                totals.army += building.production.army * rate;
            }
        });

        return totals;
    }, [buildingsRef.current, playerId]);

    return totalProduction;
};