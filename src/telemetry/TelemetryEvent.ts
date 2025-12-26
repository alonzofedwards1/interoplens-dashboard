export interface TelemetryEvent {
  eventId: string;
  eventType: "PD_EXECUTION";
  timestamp: string;

  source: Record<string, any>;
  correlation: Record<string, any>;
  execution: Record<string, any>;
  outcome: Record<string, any>;
  protocol: Record<string, any>;
}
