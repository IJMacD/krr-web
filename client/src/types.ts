export interface RecommendationResult {
    scans: ScanResult[];
    score: number;
    resources: string[];
    description: string;
    strategy: {
        name: string;
        settings: {
            history_duration: number
            timeframe_duration: number,
            cpu_percentile: number,
            memory_buffer_percentage: number,
            points_required: number,
            allow_hpa: boolean,
            use_oomkill_data: boolean,
            oom_memory_buffer_percentage: number,
        };
    };
    errors: any[];
    config: object;
}

export interface ScanResult {
    object: {
        cluster: string,
        name: string,
        container: string,
        pods: PodInfo[];
        hpa: null,
        namespace: string,
        kind: string,
        allocations: {
            requests: {
                cpu: number | null,
                memory: number | null
            },
            limits: {
                cpu: number | null,
                memory: number | null
            },
            info: {
                cpu: number | null | undefined,
                memory: number | null | undefined
            }
        },
        warnings: string[]
    },
    recommended: {
        requests: {
            cpu: Recommendation,
            memory: Recommendation
        },
        limits: {
            cpu: Recommendation,
            memory: Recommendation
        },
        info: {
            cpu: string | null,
            memory: string | null
        }
    },
    severity: Severity
}

interface PodInfo {
    name: string;
    deleted: boolean;
}

interface Recommendation {
    value: number | null | "?",
    severity: Severity;
}

type Severity = "WARNING" | "OK" | "GOOD" | "UNKNOWN";