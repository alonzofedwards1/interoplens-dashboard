import type { TelemetryEnvironment, TelemetryStatus } from './TelemetryTypes';

export interface TelemetryEvent {
  eventId: string;
  eventType: 'PD_EXECUTION';
  timestamp: string;

  correlation: {
    requestId: string;
    messageId: string;
  };

  source: {
    organization: string;
    qhin: string;
    environment: TelemetryEnvironment;
    endpointType: 'PD_RESPONDER';
  };

  execution: {
    startTime: string;
    endTime: string;
    durationMs: number;
  };

  outcome: {
    status: TelemetryStatus;
    resultCount: number;
    errorCode?: string | null;
    errorMessage?: string | null;
  };

  protocol: {
    standard: 'HL7v3';
    interactionId: 'PRPA_IN201306UV02';
  };
}
