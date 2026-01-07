export type TelemetryEnvironment = 'TEST' | 'PROD';
export type TelemetryStatus = 'SUCCESS' | 'NO_MATCH' | 'ERROR' | 'PARTIAL';

export interface TelemetryEvent {
  eventId: string;
  eventType: string;
  timestamp: string;

  status: string;
  durationMs: number;

  channelId: string;
  environment: string;

  requestId: string;
  interactionId: string;
}

export const TELEMETRY_EVENT_TYPE = 'PD_EXECUTION' as const;
export const TELEMETRY_STANDARD = 'HL7v3' as const;
export const TELEMETRY_INTERACTION_ID = 'PRPA_IN201306UV02' as const;
export const TELEMETRY_ENDPOINT_TYPE = 'PD_RESPONDER' as const;

export function generateTelemetryEventId(): string {
  const cryptoObj = typeof globalThis !== 'undefined' ? (globalThis.crypto as Crypto | undefined) : undefined;

  if (cryptoObj?.randomUUID) {
    return cryptoObj.randomUUID();
  }

  const randomSegment = () => Math.random().toString(16).slice(2, 10);
  return `evt_${Date.now()}_${randomSegment()}_${randomSegment()}`;
}

export function getUtcIsoString(date: Date = new Date()): string {
  return date.toISOString();
}
