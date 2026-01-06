# Codex Prompt — Align Interoplens Backend with Dashboard Auth & Telemetry

You are updating the Interoplens backend services so the existing React dashboard can authenticate, reset passwords, and fetch data without falling back to local dev logic. Implement the following behavior in the Control API (base URL `REACT_APP_API_BASE_URL`) and Telemetry API (base URL `REACT_APP_TELEMETRY_BASE_URL`).

## Environment alignment
- Ensure the Control API is reachable at `http://control.interop.100.48.218.100.nip.io` (or the value provided in `REACT_APP_API_BASE_URL`).
- Ensure the Telemetry API is reachable at `http://telemetry.interop.100.48.218.100.nip.io` (or the value provided in `REACT_APP_TELEMETRY_BASE_URL`).
- All endpoints below must be exposed without trailing slashes.

## Authentication
- **POST /api/auth/token**
  - Request: JSON `{ "email": string, "password": string }`.
  - Success response: status 200 with JSON containing **either** `digest` **or** `token` plus `user`:
    ```json
    {"digest":"<jwt-or-session-token>","user":{"id":"<uuid>","name":"<display>","email":"user@example.com","role":"admin|analyst|committee"}}
    ```
  - Failure response: non-200 with JSON `{ "message": "<human-readable reason>" }` (include the word "oauth" if OAuth configuration is missing, so the frontend can surface the hint).
  - Do not return empty bodies; the frontend throws on missing `digest`/`token`.

## Password reset
- **POST /api/auth/password/forgot**
  - Request: JSON `{ "email": string }`.
  - Success response: 200 with JSON `{ "message": "Reset email sent" }`.
  - Failure response: non-200 with JSON `{ "message": "<reason>" }`.
- **POST /api/auth/password/reset**
  - Request: JSON `{ "email": string, "token": string, "password": string }`.
  - Success response: 200 with JSON `{ "message": "Password updated successfully" }`.
  - Failure response: non-200 with JSON `{ "message": "<reason>" }`.

## Data endpoints
Implement the data routes consumed by the dashboard with JSON payloads the UI can render directly:
- **GET /api/findings** → array of findings objects.
- **GET /api/pd-executions** → array of PD execution objects.
- **GET /api/committee/queue** → array of committee queue items.
- **GET /api/telemetry/events** (served by the Telemetry API host) → array of telemetry events.
- On errors, respond with non-200 and JSON `{ "message": "<reason>" }`.

## Response guarantees
- Every successful response above must be valid JSON; the frontend treats JSON parse failures as errors.
- Populate `message` on error responses to avoid unhelpful fallbacks.
- Preserve CORS/access controls as needed; the dashboard does not send cookies by default.

## Development credential (for local smoke tests)
- Seed a dev account `admin@interoplens.io` with password `admin123` (role `admin`). This mirrors the dashboard's local seed user so backend and frontend behave consistently.
