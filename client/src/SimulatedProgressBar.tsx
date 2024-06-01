import { useEffect, useRef, useState } from "react";

export function SimulatedProgressBar({ estimatedDuration }: { estimatedDuration: number; }) {
    const now = useTickingClock();
    const createdAtRef = useRef(now);

    const x = (now - createdAtRef.current) / estimatedDuration;

    // https://www.geogebra.org/calculator/bbjyv74z
    // const max = 0.95;
    // const value = x > 1 ? max : Math.sin(Math.pow(x, 0.5) * Math.PI / 2) * max;

    const value = 1 - Math.exp(-Math.E * x);

    return <progress value={value} style={{ width: "100%", height: 40 }} />;
}

function useTickingClock() {
    const [now, setNow] = useState(() => Date.now());

    useEffect(() => {
        const id = setInterval(() => {
            setNow(Date.now());
        }, 100);

        return () => { clearInterval(id); };
    }, []);

    return now;
}