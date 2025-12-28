// hooks/useGameConstants.ts
import { useEffect, useState } from "react";
import { socket } from "../socket";

let cachedConstants: any = null;

export const useGameConstants = () => {
    const [constants, setConstants] = useState<any>(cachedConstants);

    useEffect(() => {
        if (cachedConstants) return;

        const handleInit = (data: any) => {
            cachedConstants = data;
            setConstants(data);
        };

        socket.on('init_constants', handleInit);
        socket.emit('request_constants');

        return () => {
            socket.off('init_constants', handleInit);
        };
    }, []);

    return constants;
};