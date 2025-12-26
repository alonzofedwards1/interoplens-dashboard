import type { TelemetryEvent } from './TelemetryEvent';

export class TelemetryStore {
  private events: TelemetryEvent[] = [];

  add(event: TelemetryEvent): void {
    this.events.push(event);
  }

  getAll(): TelemetryEvent[] {
    return [...this.events];
  }

  clear(): void {
    this.events = [];
  }
}

export const telemetryStore = new TelemetryStore();
