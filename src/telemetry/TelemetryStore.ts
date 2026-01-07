import type { TelemetryEvent } from './TelemetryEvent';

export class TelemetryStore {
  private events: TelemetryEvent[] = [];

  add(event: TelemetryEvent): void {
    this.events.push(event);
  }

  getAll(
    _params?: {
      page?: number;
      pageSize?: number;
      status?: string;
      environment?: string;
      search?: string;
    },
  ): TelemetryEvent[] {
    return [...this.events];
  }

  clear(): void {
    this.events = [];
  }
}

export const telemetryStore = new TelemetryStore();
