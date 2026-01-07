import type { TelemetryEvent } from './TelemetryEvent';
import { TelemetryContext } from './TelemetryContext';
import { telemetryStore, TelemetryStore } from './TelemetryStore';
import {
  TELEMETRY_EVENT_TYPE,
  TELEMETRY_INTERACTION_ID,
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
  environment: 'TEST' | 'PROD',
): void {
  const ctx = new TelemetryContext(requestId, messageId);
  let status: TelemetryStatus = 'SUCCESS';

  try {
    // build HL7 response
  } catch {
    status = 'ERROR';
  }

  const { durationMs } = ctx.end();

  telemetryEmitter.emit({
    eventId: ctx.eventId,
    eventType: TELEMETRY_EVENT_TYPE,
    timestamp: getUtcIsoString(),
    correlation: {
      requestId,
      messageId,
    },
    source: {
      environment,
    },
    execution: {
      durationMs,
    },
    outcome: {
      status,
    },
    protocol: {
      interactionId: TELEMETRY_INTERACTION_ID,
    },
  });
}
