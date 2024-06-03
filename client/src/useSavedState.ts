import { useEffect, useState } from "react";

export function useSavedState<T>(key: string, initialValue: T) {
    const [state, setState] = useState(() => {
        const savedValue = localStorage.getItem(key);

        if (savedValue) {
            try {
                return JSON.parse(savedValue);
            } catch (e) { }
        }

        return initialValue;
    });

    useEffect(() => {
        localStorage.setItem(key, JSON.stringify(state));
    }, [state]);

    return [state, setState];
}