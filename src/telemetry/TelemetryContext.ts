import { generateTelemetryEventId, getUtcIsoString } from './TelemetryTypes';

export class TelemetryContext {
  private readonly start: Date;
  public readonly startTime: string;
  public readonly eventId: string;
  public readonly requestId: string;
  public readonly messageId: string;

  constructor(requestId: string, messageId: string) {
    this.start = new Date();
    this.startTime = getUtcIsoString(this.start);
    this.eventId = generateTelemetryEventId();
    this.requestId = requestId;
    this.messageId = messageId;
  }

  end(): { endTime: string; durationMs: number } {
    const end = new Date();
    return {
      endTime: getUtcIsoString(end),
      durationMs: end.getTime() - this.start.getTime(),
    };
  }
}
