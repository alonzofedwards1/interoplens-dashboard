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
            organization: 'VA',
            qhin: 'CommonWell',
            environment: 'PROD',
            endpointType: 'PD_RESPONDER',
        },
        execution: {
            startTime: '2025-12-18T14:05:00Z',
            endTime: '2025-12-18T14:05:02Z',
            durationMs: 412,
        },
        outcome: {
            status: 'SUCCESS',
            resultCount: 1,
        },
        protocol: {
            standard: 'HL7v3',
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
            organization: 'VA',
            qhin: 'CommonWell',
            environment: 'PROD',
            endpointType: 'PD_RESPONDER',
        },
        execution: {
            startTime: '2025-12-18T14:06:00Z',
            endTime: '2025-12-18T14:06:01Z',
            durationMs: 980,
        },
        outcome: {
            status: 'PARTIAL',
            resultCount: 2,
            errorMessage: 'Multiple candidate matches returned',
        },
        protocol: {
            standard: 'HL7v3',
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
            organization: 'VA',
            qhin: 'CommonWell',
            environment: 'PROD',
            endpointType: 'PD_RESPONDER',
        },
        execution: {
            startTime: '2025-12-18T14:07:00Z',
            endTime: '2025-12-18T14:07:03Z',
            durationMs: 0,
        },
        outcome: {
            status: 'ERROR',
            resultCount: 0,
            errorCode: 'PRPA-102',
            errorMessage: 'Timeout communicating with QHIN',
        },
        protocol: {
            standard: 'HL7v3',
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
            organization: 'DoD',
            qhin: 'Carequality',
            environment: 'PROD',
            endpointType: 'PD_RESPONDER',
        },
        execution: {
            startTime: '2025-12-18T13:42:00Z',
            endTime: '2025-12-18T13:42:01Z',
            durationMs: 365,
        },
        outcome: {
            status: 'SUCCESS',
            resultCount: 1,
        },
        protocol: {
            standard: 'HL7v3',
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
            organization: 'DoD',
            qhin: 'Carequality',
            environment: 'PROD',
            endpointType: 'PD_RESPONDER',
        },
        execution: {
            startTime: '2025-12-18T13:43:00Z',
            endTime: '2025-12-18T13:43:01Z',
            durationMs: 510,
        },
        outcome: {
            status: 'NO_MATCH',
            resultCount: 0,
        },
        protocol: {
            standard: 'HL7v3',
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
            organization: 'DoD',
            qhin: 'Carequality',
            environment: 'PROD',
            endpointType: 'PD_RESPONDER',
        },
        execution: {
            startTime: '2025-12-18T13:44:00Z',
            endTime: '2025-12-18T13:44:04Z',
            durationMs: 0,
        },
        outcome: {
            status: 'ERROR',
            resultCount: 0,
            errorCode: 'PRPA-201',
            errorMessage: 'SOAP Fault: Receiver unavailable',
        },
        protocol: {
            standard: 'HL7v3',
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
            organization: 'Mayo Clinic',
            qhin: 'CommonWell',
            environment: 'TEST',
            endpointType: 'PD_RESPONDER',
        },
        execution: {
            startTime: '2025-12-18T12:21:00Z',
            endTime: '2025-12-18T12:21:00Z',
            durationMs: 288,
        },
        outcome: {
            status: 'SUCCESS',
            resultCount: 1,
        },
        protocol: {
            standard: 'HL7v3',
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
            organization: 'Mayo Clinic',
            qhin: 'CommonWell',
            environment: 'TEST',
            endpointType: 'PD_RESPONDER',
        },
        execution: {
            startTime: '2025-12-18T12:22:00Z',
            endTime: '2025-12-18T12:22:02Z',
            durationMs: 745,
        },
        outcome: {
            status: 'PARTIAL',
            resultCount: 2,
            errorMessage: 'Two demographics-qualified matches',
        },
        protocol: {
            standard: 'HL7v3',
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
            organization: 'Kaiser Permanente',
            qhin: 'Carequality',
            environment: 'PROD',
            endpointType: 'PD_RESPONDER',
        },
        execution: {
            startTime: '2025-12-18T11:10:00Z',
            endTime: '2025-12-18T11:10:00Z',
            durationMs: 398,
        },
        outcome: {
            status: 'SUCCESS',
            resultCount: 1,
        },
        protocol: {
            standard: 'HL7v3',
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
            organization: 'Kaiser Permanente',
            qhin: 'Carequality',
            environment: 'PROD',
            endpointType: 'PD_RESPONDER',
        },
        execution: {
            startTime: '2025-12-18T11:11:00Z',
            endTime: '2025-12-18T11:11:02Z',
            durationMs: 880,
        },
        outcome: {
            status: 'NO_MATCH',
            resultCount: 0,
        },
        protocol: {
            standard: 'HL7v3',
            interactionId: 'PRPA_IN201306UV02',
        },
    },
];
