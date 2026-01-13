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

Authentication is currently mocked entirely on the frontend. The login form accepts any non-empty email and password, stores a lightweight auth flag in `localStorage`, and immediately redirects to the dashboard. Use the "Use dev credentials" shortcut on the login page for quick access (`admin@interoplens.io` / `admin123`).

* There are no backend authentication calls or token checks.
* All dashboard routes are protected by the frontend auth flag and will redirect to `/login` when unauthenticated.
* The forgot-password screen is informational only until backend integration is added.
* TODO: Replace the mocked login with real backend authentication when available.
