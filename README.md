# Interoplens Dashboard

The Interoplens Dashboard is a Create React App project that visualizes interoperability telemetry, findings, committee queues, and PD execution data.

## Getting Started

Install dependencies:

```bash
npm install
```

Run the development server:

```bash
npm start
```

Build for production:

```bash
npm run build
```

## Environment Variables

Copy `.env.example` to `.env.development` (or your preferred env file) and set hosts for the APIs the dashboard should call. These variables are read at build time.

```bash
REACT_APP_API_BASE_URL=http://control.interop.100.48.218.100.nip.io \
REACT_APP_TELEMETRY_BASE_URL=http://telemetry.interop.100.48.218.100.nip.io npm start
```

The telemetry page issues `GET /api/telemetry/events` to retrieve telemetry events and displays them as-is. No additional setup is required beyond exposing that endpoint on the backend.

## API types and contracts

API response types live in `src/types`. API clients import these types, and types must not import API clients, hooks, or React to avoid circular dependencies.

## Authentication and password reset

Authentication is backed by the API and uses a session-based flow. The frontend calls the following endpoints:

* `POST /api/auth/login` with `{ "username": "...", "password": "..." }` to start a session.
* `POST /api/auth/logout` to end the session.
* `GET /api/auth/me` to hydrate the current user on page load.

All requests include `credentials: 'include'` so cookies are sent with every call. When no active session is found, the dashboard redirects to the login screen. The forgot-password screen is informational only until backend integration is added.
