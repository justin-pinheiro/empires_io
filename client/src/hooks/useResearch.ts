import { useState, useEffect, useCallback } from 'react';
import { socket } from '../socket';
import type { ResearchChoiceState, ScienceBonusData } from '../types/scienceBonus';

export const useResearch = () => {
    const [pendingUpgrades, setPendingUpgrades] = useState(0);
    const [currentOptions, setCurrentOptions] = useState<ScienceBonusData[]>([]);
    const [isLoading, setIsLoading] = useState(false);

    // Helper to request data from server
    const pullOptions = useCallback(() => {
        if (!isLoading) {
            setIsLoading(true);
            socket.emit('request_research_options');
        }
    }, [isLoading]);

    useEffect(() => {
        // 1. Initial alert that a point was earned
        socket.on('available_upgrade_alert', () => {
            // We increment locally, and the component's useEffect will see 
            // currentOptions is empty and trigger a pullOptions()
            setPendingUpgrades(prev => prev + 1);

            console.log('available_upgrade_alert')
        });

        // 2. Data arrival from polling
        socket.on('research_options', (data: ResearchChoiceState) => {
            setCurrentOptions(data.options);
            setPendingUpgrades(data.pendingCount);
            setIsLoading(false);
        });

        // 3. Success with more points left
        socket.on('research_point_remaining', (remainingCount: number) => {
            setPendingUpgrades(remainingCount);
            setIsLoading(false);
            // We keep currentOptions empty here so the UI triggers a fresh pull
            setCurrentOptions([]);
        });

        // 4. Success with no points left
        socket.on('research_complete', () => {
            setPendingUpgrades(0);
            setIsLoading(false);
            setCurrentOptions([]);
        });

        return () => {
            socket.off('available_upgrade_alert');
            socket.off('research_options');
            socket.off('research_point_remaining');
            socket.off('research_complete');
        };
    }, []);

    const selectUpgrade = (bonusType: string) => {
        if (isLoading) return;
        setIsLoading(true);
        socket.emit('select_research', { bonusType });
        // Clear immediately to trigger the "whoosh out" animation
        setCurrentOptions([]); 
    };

    return { 
        pendingUpgrades, 
        currentOptions, 
        pullOptions, 
        selectUpgrade, 
        isLoading 
    };
};