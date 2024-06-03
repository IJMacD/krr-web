import { CSSProperties, ReactNode, useState } from "react";
import { RecommendationResult, ScanResult } from "./types";

export function ScanResults({ results }: { results: RecommendationResult }) {
    const [filter, setFilter] = useState("");

    const scans = results.scans.filter(scan => scan.object.namespace.includes(filter) || scan.object.name.includes(filter));

    scans.sort((a, b) => a.object.namespace.localeCompare(b.object.namespace));

    return (
        <>
            <h2>Score: {results.score}</h2>
            <div style={{ display: "flex", justifyContent: "flex-end" }}>
                <input type="search" value={filter} onChange={e => setFilter(e.target.value)} placeholder="Filter" />
            </div>
            <table className="ScanResults-ResultsTable">
                <thead>
                    <tr>
                        <th>Namespace</th>
                        <th>Name</th>
                        <th>Container</th>
                        <th colSpan={2}>CPU</th>
                        <th colSpan={2}>Memory</th>
                    </tr>
                    <tr>
                        <th colSpan={3}></th>
                        <th>Requests</th>
                        <th>Limits</th>
                        <th>Requests</th>
                        <th>Limits</th>
                    </tr>
                </thead>
                <tbody>
                    {
                        scans.map(scan =>
                            <tr key={containerKey(scan)}>
                                <td>{scan.object.namespace}</td>
                                <td>{scan.object.kind}/{scan.object.name}</td>
                                <td>{scan.object.container}</td>
                                <td style={{ whiteSpace: "nowrap" }}><RecommendationCell result={scan} resource="cpu" type="requests" /></td>
                                <td style={{ whiteSpace: "nowrap" }}><RecommendationCell result={scan} resource="cpu" type="limits" /></td>
                                <td style={{ whiteSpace: "nowrap" }}><RecommendationCell result={scan} resource="memory" type="requests" /></td>
                                <td style={{ whiteSpace: "nowrap" }}><RecommendationCell result={scan} resource="memory" type="limits" /></td>
                            </tr>
                        )
                    }
                </tbody>
            </table>
        </>
    );
}

function containerKey(scan: ScanResult) {
    return `${scan.object.namespace}:${scan.object.kind}/${scan.object.name}{${scan.object.container}}`;
}

function RecommendationCell({ result, resource, type }: { result: ScanResult; resource: "cpu" | "memory"; type: "requests" | "limits" }) {
    const currentValue = result.object.allocations[type][resource];
    const recommendedValue = result.recommended[type][resource].value;

    let currentValueString: ReactNode;
    let recommendedValueString: ReactNode;

    const unsetStyle: CSSProperties = {
        color: "#666",
        fontStyle: "italic",
    };

    const unknownStyle: CSSProperties = {
        fontSize: "0.8em",
    };

    if (resource === "cpu") {
        currentValueString = typeof currentValue === "number" ? currentValue.toFixed(3) : <span style={unsetStyle}>unset</span>;
        recommendedValueString = recommendedValue === "?" ? <span style={unknownStyle}>{result.recommended.info[resource]}</span> : (
            typeof recommendedValue === "number" ? recommendedValue.toFixed(3) : <span style={unsetStyle}>unset</span>
        );
    }
    else {
        currentValueString = typeof currentValue === "number" ? formatBytes(currentValue) : <span style={unsetStyle}>unset</span>;
        recommendedValueString = recommendedValue === "?" ? <span style={unknownStyle}>{result.recommended.info[resource]}</span> : (
            typeof recommendedValue === "number" ? formatBytes(recommendedValue) : <span style={unsetStyle}>unset</span>
        );
    }

    // const noRecommendation = recommendedValue === "?";
    const noChange = currentValue === recommendedValue;
    // const isClose = noChange || Math.abs(difference) < 0.10;

    // const fill = noRecommendation ? "grey" : (isClose ? "green" : (difference > 0 ? "red" : "orange"));

    const fill = {
        "CRITICAL": "red",
        "WARNING": "red",
        "GOOD": "green",
        "OK": "orange",
        "UNKNOWN": "grey",
    }[result.recommended[type][resource].severity];

    const className =
        result.recommended[type][resource].severity === "CRITICAL"
            ? "blink" : undefined;

    return (
        <>
            <svg viewBox="0 0 10 10" style={{ height: 16, marginRight: 4 }} className={className}><circle cx={5} cy={5} r={5} fill={fill} /></svg>
            {noChange ? currentValueString : <>{currentValueString}  →  {recommendedValueString}</>}
        </>
    );
}

function formatBytes(bytes: number) {
    const units = ["bytes", "kiB", "MiB", "GiB", "TiB", "PiB"];

    for (let i = 0; i < units.length; i++) {
        if (bytes < 1024) return `${bytes.toFixed()}\xa0${units[i]}`;

        bytes /= 1024;
    }

    return "big";
}