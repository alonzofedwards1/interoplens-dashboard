import { TelemetryEvent } from '../../../telemetry/TelemetryEvent';

export const telemetryEventsData: TelemetryEvent[] = [
    {
        eventId: 'evt-1001',
        eventType: 'PD_EXECUTION',
        timestamp: '2025-12-18T14:05:02Z',
        correlation: {
            requestId: 'REQ-9001',
            messageId: 'MSG-1001',
        },
        source: {
            environment: 'PROD',
            channelId: 'mirth-pd-01',
        },
        execution: {
            durationMs: 412,
        },
        outcome: {
            status: 'SUCCESS',
        },
        protocol: {
            interactionId: 'PRPA_IN201306UV02',
        },
    },
    {
        eventId: 'evt-1002',
        eventType: 'PD_EXECUTION',
        timestamp: '2025-12-18T14:06:01Z',
        correlation: {
            requestId: 'REQ-9002',
            messageId: 'MSG-1002',
        },
        source: {
            environment: 'PROD',
            channelId: 'mirth-pd-02',
        },
        execution: {
            durationMs: 980,
        },
        outcome: {
            status: 'PARTIAL',
        },
        protocol: {
            interactionId: 'PRPA_IN201306UV02',
        },
    },
    {
        eventId: 'evt-1003',
        eventType: 'PD_EXECUTION',
        timestamp: '2025-12-18T14:07:03Z',
        correlation: {
            requestId: 'REQ-9003',
            messageId: 'MSG-1003',
        },
        source: {
            environment: 'PROD',
            channelId: 'mirth-pd-03',
        },
        execution: {
            durationMs: 0,
        },
        outcome: {
            status: 'ERROR',
        },
        protocol: {
            interactionId: 'PRPA_IN201306UV02',
        },
    },
    {
        eventId: 'evt-1004',
        eventType: 'PD_EXECUTION',
        timestamp: '2025-12-18T13:42:01Z',
        correlation: {
            requestId: 'REQ-9004',
            messageId: 'MSG-1004',
        },
        source: {
            environment: 'PROD',
            channelId: 'mirth-pd-04',
        },
        execution: {
            durationMs: 365,
        },
        outcome: {
            status: 'SUCCESS',
        },
        protocol: {
            interactionId: 'PRPA_IN201306UV02',
        },
    },
    {
        eventId: 'evt-1005',
        eventType: 'PD_EXECUTION',
        timestamp: '2025-12-18T13:43:01Z',
        correlation: {
            requestId: 'REQ-9005',
            messageId: 'MSG-1005',
        },
        source: {
            environment: 'PROD',
            channelId: 'mirth-pd-05',
        },
        execution: {
            durationMs: 510,
        },
        outcome: {
            status: 'NO_MATCH',
        },
        protocol: {
            interactionId: 'PRPA_IN201306UV02',
        },
    },
    {
        eventId: 'evt-1006',
        eventType: 'PD_EXECUTION',
        timestamp: '2025-12-18T13:44:04Z',
        correlation: {
            requestId: 'REQ-9006',
            messageId: 'MSG-1006',
        },
        source: {
            environment: 'PROD',
            channelId: 'mirth-pd-06',
        },
        execution: {
            durationMs: 0,
        },
        outcome: {
            status: 'ERROR',
        },
        protocol: {
            interactionId: 'PRPA_IN201306UV02',
        },
    },
    {
        eventId: 'evt-1007',
        eventType: 'PD_EXECUTION',
        timestamp: '2025-12-18T12:21:00Z',
        correlation: {
            requestId: 'REQ-9007',
            messageId: 'MSG-1007',
        },
        source: {
            environment: 'TEST',
            channelId: 'mirth-pd-07',
        },
        execution: {
            durationMs: 288,
        },
        outcome: {
            status: 'SUCCESS',
        },
        protocol: {
            interactionId: 'PRPA_IN201306UV02',
        },
    },
    {
        eventId: 'evt-1008',
        eventType: 'PD_EXECUTION',
        timestamp: '2025-12-18T12:22:02Z',
        correlation: {
            requestId: 'REQ-9008',
            messageId: 'MSG-1008',
        },
        source: {
            environment: 'TEST',
            channelId: 'mirth-pd-08',
        },
        execution: {
            durationMs: 745,
        },
        outcome: {
            status: 'PARTIAL',
        },
        protocol: {
            interactionId: 'PRPA_IN201306UV02',
        },
    },
    {
        eventId: 'evt-1009',
        eventType: 'PD_EXECUTION',
        timestamp: '2025-12-18T11:10:00Z',
        correlation: {
            requestId: 'REQ-9009',
            messageId: 'MSG-1009',
        },
        source: {
            environment: 'PROD',
            channelId: 'mirth-pd-09',
        },
        execution: {
            durationMs: 398,
        },
        outcome: {
            status: 'SUCCESS',
        },
        protocol: {
            interactionId: 'PRPA_IN201306UV02',
        },
    },
    {
        eventId: 'evt-1010',
        eventType: 'PD_EXECUTION',
        timestamp: '2025-12-18T11:11:02Z',
        correlation: {
            requestId: 'REQ-9010',
            messageId: 'MSG-1010',
        },
        source: {
            environment: 'PROD',
            channelId: 'mirth-pd-10',
        },
        execution: {
            durationMs: 880,
        },
        outcome: {
            status: 'NO_MATCH',
        },
        protocol: {
            interactionId: 'PRPA_IN201306UV02',
        },
    },
];
