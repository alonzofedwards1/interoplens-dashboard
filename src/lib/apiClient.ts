import { Finding } from '../features/findings/data/findings.data';
import { PDExecution } from '../features/pd-executions/data/pdExecutions.data';
import { CommitteeQueueItem } from '../features/committee/data/committeeQueue.data';
import { TelemetryEvent } from '../telemetry/TelemetryEvent';
import { API_BASE_URL } from '../config/api';
import { fetchTelemetryEvents } from './telemetryClient';

const buildUrl = (base: string, path: string) => `${base}${path}`;

export class ApiClient {
    async getFindings(): Promise<Finding[]> {
        const res = await fetch(buildUrl(API_BASE_URL, '/api/findings'));
        if (!res.ok) throw new Error(`Failed to load findings (${res.status})`);
        return res.json();
    }

    async getPdExecutions(): Promise<PDExecution[]> {
        const res = await fetch(buildUrl(API_BASE_URL, '/api/pd-executions'));
        if (!res.ok)
            throw new Error(`Failed to load PD executions (${res.status})`);
        return res.json();
    }

    async getCommitteeQueue(): Promise<CommitteeQueueItem[]> {
        const res = await fetch(buildUrl(API_BASE_URL, '/api/committee-queue'));
        if (!res.ok)
            throw new Error(`Failed to load committee queue (${res.status})`);
        return res.json();
    }

    async getTelemetryEvents(): Promise<TelemetryEvent[]> {
        // Normalization already handled in telemetryClient.ts
        return fetchTelemetryEvents();
    }
}

export const apiClient = new ApiClient();
