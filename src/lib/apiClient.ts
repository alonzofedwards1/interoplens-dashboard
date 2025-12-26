import { Finding } from '../features/findings/data/findings.data';
import { PDExecution } from '../features/pd-executions/data/pdExecutions.data';
import { CommitteeQueueItem } from '../features/committee/data/committeeQueue.data';
const API_BASE = process.env.REACT_APP_API_BASE_URL || 'http://localhost:8080/api';

const request = async <T>(path: string, baseUrl: string = API_BASE): Promise<T> => {
    const response = await fetch(`${baseUrl}${path}`);
    if (!response.ok) {
        throw new Error(`API request failed for ${path}: ${response.status}`);
    }
    return response.json() as Promise<T>;
};

export const apiClient = {
    getFindings: () => request<Finding[]>('/findings'),
    getPdExecutions: () => request<PDExecution[]>('/pd-executions'),
    getCommitteeQueue: () => request<CommitteeQueueItem[]>('/committee/queue'),
    getTelemetryEvents: () => request<TelemetryEvent[]>('/telemetry/events'),
};

export type ApiClient = typeof apiClient;
