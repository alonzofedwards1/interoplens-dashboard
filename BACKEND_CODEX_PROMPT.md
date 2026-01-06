# Codex Prompt — FastAPI Backend Contract for Interoplens Dashboard

You are building a FastAPI backend that must exactly match the existing Interoplens React dashboard. The frontend code is fixed and MUST NOT be changed. Implement the backend so every dashboard call succeeds without local-dev fallbacks, mock logic, or silent failures.

## Environment and hosts
- Control API base: `http://control.interop.100.48.218.100.nip.io` (or `REACT_APP_API_BASE_URL`).
- Telemetry API base: `http://telemetry.interop.100.48.218.100.nip.io` (or `REACT_APP_TELEMETRY_BASE_URL`).
- Endpoints MUST NOT include trailing slashes.
- All responses (success or error) MUST be JSON; never return empty bodies or HTML errors. Errors must be `{ "message": "<human readable>" }`.

## CORS and networking
- Allow origins: `http://dashboard.interop.100.48.218.100.nip.io` and `http://localhost:3000`.
- Allow headers: `Authorization`, `Content-Type`.
- Allow methods: `GET`, `POST`, `OPTIONS`.
- The frontend does NOT send cookies; authentication is via `Authorization: Bearer <token>`.

## Authentication — Control API
**POST /api/auth/token**
Request body:
```json
{ "email": "string", "password": "string" }
```
Success (200): JSON containing `digest` **or** `token` AND `user`:
```json
{
  "digest": "<jwt>",
  "user": {
    "id": "<uuid>",
    "name": "<display name>",
    "email": "user@example.com",
    "role": "admin" | "analyst" | "committee"
  }
}
```
- Never return 200 without `digest` or `token` (the frontend will throw).
- If OAuth/auth config is missing, return non-200 with a JSON error that includes the word `oauth`.
Failure (non-200): `{ "message": "<reason>" }`.

### Password reset — Control API
**POST /api/auth/password/forgot**
- Request: `{ "email": "string" }`
- Success 200: `{ "message": "Reset email sent" }`
- Failure: non-200 `{ "message": "<reason>" }`

**POST /api/auth/password/reset**
- Request: `{ "email": "string", "token": "string", "password": "string" }`
- Success 200: `{ "message": "Password updated successfully" }`
- Failure: non-200 `{ "message": "<reason>" }`

## Data endpoints — Control API
These must return arrays directly (no wrapping objects). On errors, respond with non-200 `{ "message": "<reason>" }`.
- **GET /api/findings** → returns `[]` when no data.
- **GET /api/pd-executions** → returns `[]` when no data.
- **GET /api/committee/queue** → returns `[]` when no data.

## Telemetry API
- **GET /api/telemetry/events** → returns an array of telemetry events (`[]` when empty).

## Dev seed user (required)
- Seed on startup if missing:
  - Email: `admin@interoplens.io`
  - Password: `admin123`
  - Role: `admin`
  - Name: `Interoplens Admin`

## Implementation rules
- Use FastAPI with Pydantic models.
- Use JWT for auth (SECRET_KEY from env; a dev fallback is allowed).
- Hash passwords (bcrypt or argon2).
- No trailing slashes on routes.
- No HTML error pages and no empty responses.
- Keep unauthenticated data endpoints returning JSON arrays even if backing storage is empty.

## Final verification commands
Ensure these succeed with correct JSON shapes:
- `curl -X POST /api/auth/token` → returns token/digest + user.
- `curl /api/findings` → `[]`
- `curl /api/pd-executions` → `[]`
- `curl /api/committee/queue` → `[]`
- `curl /api/telemetry/events` → `[]`
