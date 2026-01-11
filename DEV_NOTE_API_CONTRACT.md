# Frontend API Contract Notes

## Endpoints the UI calls
- `GET /api/telemetry/events`
- `GET /api/pd-executions`
- `GET /api/committee-queue`
- `GET /api/findings`

## Expected response shapes
- `/api/telemetry/events`: array of telemetry events with
  `eventId`, `eventType`, `timestamp`, `source{channelId,environment}`,
  `outcome{status,durationMs}`, `correlation{requestId}`, `raw?`.
- `/api/pd-executions`: array of PD executions with
  `requestId`, `startedAt`, `completedAt`, `executionTimeMs`,
  `outcome`, `channelId`, `environment`.
- `/api/pd-executions/count`: `{ "count": number }`.

## Where shapes are parsed/used
- API calls: `src/lib/apiClient.ts` (findings, PD executions, committee queue).
- Telemetry normalization: `src/lib/telemetryClient.ts`.
- PD execution typing: `src/features/pd-executions/data/pdExecutions.data.ts`.
