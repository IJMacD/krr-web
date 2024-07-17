import React, { CSSProperties, ReactNode, useState } from "react";
import { RecommendationResult, ScanResult } from "./types";
import { useSavedState } from "./useSavedState";
import { forumFormat } from "./forum-formatter";

export function ScanResults({ results }: { results: RecommendationResult }) {
    const [filter, setFilter] = useState("");
    const [hiddenNamespaces, setHiddenNamespaces] = useSavedState("krr-web.hiddenNamespaces", [] as string[]);

    const scans = results.scans
        .filter(scan => !hiddenNamespaces.includes(scan.object.namespace))
        .filter(scan => scan.object.namespace.includes(filter) || scan.object.name.includes(filter));

    scans.sort((a, b) => a.object.namespace.localeCompare(b.object.namespace));

    const allNamespaces = [...new Set(results.scans.map(s => s.object.namespace))];

    return (
        <>
            <p style={{ fontSize: "2em" }}>Score: {results.score}</p>
            <pre dangerouslySetInnerHTML={{ __html: forumFormat(results.description) }} />
            <HiddenNamespaceUI allNamespaces={allNamespaces} hiddenNamespaces={hiddenNamespaces} setHiddenNamespaces={setHiddenNamespaces} />
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

    const noChange = currentValue === recommendedValue;
    const isIncrease = typeof recommendedValue === "number" && typeof currentValue === "number" && recommendedValue > currentValue;
    const isDecrease = typeof recommendedValue === "number" && typeof currentValue === "number" && recommendedValue < currentValue;

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

    const arr = isIncrease ? "↗" : (isDecrease ? "↘" : "→");

    return (
        <>
            <svg viewBox="0 0 10 10" style={{ height: 16, marginRight: 4 }} className={className}><circle cx={5} cy={5} r={5} fill={fill} /></svg>
            {noChange ? currentValueString : <>{currentValueString} {arr} {recommendedValueString}</>}
        </>
    );
}

function formatBytes(bytes: number) {
    const units = ["bytes", "kiB", "MiB", "GiB", "TiB", "PiB"];
    const NBSP = `\xa0`;

    for (let i = 0; i < units.length; i++) {
        // Use fixed number of significant figures
        if (bytes < 10) return `${bytes.toFixed(2)}${NBSP}${units[i]}`;
        if (bytes < 100) return `${bytes.toFixed(1)}${NBSP}${units[i]}`;
        if (bytes < 1000) return `${bytes.toFixed()}${NBSP}${units[i]}`;

        bytes /= 1024;
    }

    return "big";
}

function HiddenNamespaceUI({ allNamespaces, hiddenNamespaces, setHiddenNamespaces }: { allNamespaces: string[], hiddenNamespaces: string[], setHiddenNamespaces: React.Dispatch<React.SetStateAction<string[]>> }) {
    const [textInput, setTextInput] = useState("");

    function handleRemoveNamespace(namespace: string) {
        setHiddenNamespaces(nss => nss.filter(ns => ns !== namespace));
    }

    function handleAddNamespace() {
        setHiddenNamespaces(namespaces => {
            if (!namespaces.includes(textInput)) {
                return [...namespaces, textInput];
            }
            return namespaces;
        });
        setTextInput("");
    }

    const namespaceStyle: CSSProperties = {
        border: "1px solid #338",
        borderRadius: 3,
        paddingLeft: 4,
        marginInlineEnd: 8,
        // display: "flex"
    }

    const namespaceButtonStyle: CSSProperties = {
        background: "transparent",
        padding: "8px 8px",
        margin: "-1px -1px -1px",
        borderRadius: 0,
        borderTopRightRadius: 3,
        borderBottomRightRadius: 3,
        lineHeight: "100%",
    }

    const inputStyle: CSSProperties = {
        border: "none",
        outline: "none",
        fontSize: "inherit",
        padding: "4px 0"
    }

    return (<>
        <label style={{ fontSize: "1.5em" }}>Hidden Namespaces:</label>
        <div style={{ display: "flex", alignItems: "center", flexWrap: "wrap" }}>
            {
                hiddenNamespaces.map(ns => <span key={ns} style={namespaceStyle}>{ns} <button onClick={() => handleRemoveNamespace(ns)} style={namespaceButtonStyle}>&times;</button></span>)
            }
            <span style={namespaceStyle}>
                {/* <input value={textInput} onChange={e => setTextInput(e.target.value)} style={inputStyle} /> */}
                <select value={textInput} onChange={e => setTextInput(e.target.value)} style={inputStyle}>
                    <option></option>
                    {
                        allNamespaces.filter(ns => !hiddenNamespaces.includes(ns)).map(ns => <option key={ns}>{ns}</option>)
                    }
                </select>
                <button onClick={handleAddNamespace} style={namespaceButtonStyle}>Hide</button>
            </span>
        </div>
    </>
    );
}