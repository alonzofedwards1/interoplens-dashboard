import { TelemetryEvent } from '../../../telemetry/TelemetryEvent';

const telemetryEventsRaw = [
    {
        eventId: 'evt-1001',
        eventType: 'PD_EXECUTION',
        timestamp: '2025-12-18T14:05:02Z',
        status: 'SUCCESS',
        durationMs: 412,
        channelId: 'mirth-pd-01',
        environment: 'PROD',
        requestId: 'REQ-9001',
        interactionId: 'PRPA_IN201306UV02',
    },
    {
        eventId: 'evt-1002',
        eventType: 'PD_EXECUTION',
        timestamp: '2025-12-18T14:06:01Z',
        status: 'PARTIAL',
        durationMs: 980,
        channelId: 'mirth-pd-02',
        environment: 'PROD',
        requestId: 'REQ-9002',
        interactionId: 'PRPA_IN201306UV02',
    },
    {
        eventId: 'evt-1003',
        eventType: 'PD_EXECUTION',
        timestamp: '2025-12-18T14:07:03Z',
        status: 'ERROR',
        durationMs: 0,
        channelId: 'mirth-pd-03',
        environment: 'PROD',
        requestId: 'REQ-9003',
        interactionId: 'PRPA_IN201306UV02',
    },
    {
        eventId: 'evt-1004',
        eventType: 'PD_EXECUTION',
        timestamp: '2025-12-18T13:42:01Z',
        status: 'SUCCESS',
        durationMs: 365,
        channelId: 'mirth-pd-04',
        environment: 'PROD',
        requestId: 'REQ-9004',
        interactionId: 'PRPA_IN201306UV02',
    },
    {
        eventId: 'evt-1005',
        eventType: 'PD_EXECUTION',
        timestamp: '2025-12-18T13:43:01Z',
        status: 'NO_MATCH',
        durationMs: 510,
        channelId: 'mirth-pd-05',
        environment: 'PROD',
        requestId: 'REQ-9005',
        interactionId: 'PRPA_IN201306UV02',
    },
    {
        eventId: 'evt-1006',
        eventType: 'PD_EXECUTION',
        timestamp: '2025-12-18T13:44:04Z',
        status: 'ERROR',
        durationMs: 0,
        channelId: 'mirth-pd-06',
        environment: 'PROD',
        requestId: 'REQ-9006',
        interactionId: 'PRPA_IN201306UV02',
    },
    {
        eventId: 'evt-1007',
        eventType: 'PD_EXECUTION',
        timestamp: '2025-12-18T12:21:00Z',
        status: 'SUCCESS',
        durationMs: 288,
        channelId: 'mirth-pd-07',
        environment: 'TEST',
        requestId: 'REQ-9007',
        interactionId: 'PRPA_IN201306UV02',
    },
    {
        eventId: 'evt-1008',
        eventType: 'PD_EXECUTION',
        timestamp: '2025-12-18T12:22:02Z',
        status: 'PARTIAL',
        durationMs: 745,
        channelId: 'mirth-pd-08',
        environment: 'TEST',
        requestId: 'REQ-9008',
        interactionId: 'PRPA_IN201306UV02',
    },
    {
        eventId: 'evt-1009',
        eventType: 'PD_EXECUTION',
        timestamp: '2025-12-18T11:10:00Z',
        status: 'SUCCESS',
        durationMs: 398,
        channelId: 'mirth-pd-09',
        environment: 'PROD',
        requestId: 'REQ-9009',
        interactionId: 'PRPA_IN201306UV02',
    },
    {
        eventId: 'evt-1010',
        eventType: 'PD_EXECUTION',
        timestamp: '2025-12-18T11:11:02Z',
        status: 'NO_MATCH',
        durationMs: 880,
        channelId: 'mirth-pd-10',
        environment: 'PROD',
        requestId: 'REQ-9010',
        interactionId: 'PRPA_IN201306UV02',
    },
];

export const telemetryEventsData: TelemetryEvent[] = telemetryEventsRaw.map(event => ({
    eventId: event.eventId,
    eventType: event.eventType,
    timestamp: event.timestamp,
    correlation: event.correlation
        ? {
              requestId: event.correlation.requestId,
              messageId: event.correlation.messageId,
          }
        : undefined,
    source: event.source
        ? {
              environment: event.source.environment,
              channelId: event.source.channelId,
          }
        : undefined,
    execution: event.execution
        ? {
              durationMs: event.execution.durationMs,
          }
        : undefined,
    outcome: event.outcome
        ? {
              status: event.outcome.status,
          }
        : undefined,
    protocol: event.protocol
        ? {
              interactionId: event.protocol.interactionId,
          }
        : undefined,
}));
