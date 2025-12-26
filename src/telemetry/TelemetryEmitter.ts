import type { TelemetryEvent } from './TelemetryEvent';
import { TelemetryContext } from './TelemetryContext';
import { telemetryStore, TelemetryStore } from './TelemetryStore';
import {
  TELEMETRY_ENDPOINT_TYPE,
  TELEMETRY_EVENT_TYPE,
  TELEMETRY_INTERACTION_ID,
  TELEMETRY_STANDARD,
  TelemetryStatus,
  getUtcIsoString,
} from './TelemetryTypes';

export class TelemetryEmitter {
  private readonly store: TelemetryStore;

  constructor(store: TelemetryStore = telemetryStore) {
    this.store = store;
  }

  emit(event: TelemetryEvent): void {
    try {
      this.store.add(event);
    } catch (error) {
      // Telemetry failures must not impact PD responses
      // eslint-disable-next-line no-console
      console.error('Telemetry emit failed', error);
    }
  }
}

export const telemetryEmitter = new TelemetryEmitter();

export function examplePdResponderIntegration(
  requestId: string,
  messageId: string,
  organization: string,
  qhin: string,
  environment: 'TEST' | 'PROD',
): void {
  const ctx = new TelemetryContext(requestId, messageId);
  let status: TelemetryStatus = 'SUCCESS';
  let resultCount = 0;
  let errorCode: string | null = null;
  let errorMessage: string | null = null;

  try {
    // build HL7 response
    resultCount = 1;
  } catch (err) {
    status = 'ERROR';
    errorCode = 'PD-ERROR';
    errorMessage = err instanceof Error ? err.message : String(err);
  }

  const { endTime, durationMs } = ctx.end();

  telemetryEmitter.emit({
    eventId: ctx.eventId,
    eventType: TELEMETRY_EVENT_TYPE,
    timestamp: getUtcIsoString(),
    correlation: {
      requestId,
      messageId,
    },
    source: {
      organization,
      qhin,
      environment,
      endpointType: TELEMETRY_ENDPOINT_TYPE,
    },
    execution: {
      startTime: ctx.startTime,
      endTime,
      durationMs,
    },
    outcome: {
      status,
      resultCount,
      errorCode,
      errorMessage,
    },
    protocol: {
      standard: TELEMETRY_STANDARD,
      interactionId: TELEMETRY_INTERACTION_ID,
    },
  });
}
