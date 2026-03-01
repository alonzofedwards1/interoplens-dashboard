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

## API Routing

The frontend uses relative API paths (for example, `/api/findings` and `/api/telemetry/events`).
When running in Docker, nginx proxies `/api` requests to the backend container.

## API types and contracts

API response types live in `src/types`. API clients import these types, and types must not import API clients, hooks, or React to avoid circular dependencies.

## Authentication and password reset

Authentication is backed by the API and uses a session-based flow. The frontend calls the following endpoints:

* `POST /api/auth/login` with `{ "username": "...", "password": "..." }` to start a session.
* `POST /api/auth/logout` to end the session.
* `GET /api/auth/me` to hydrate the current user on page load.

All requests include `credentials: 'include'` so cookies are sent with every call. When no active session is found, the dashboard redirects to the login screen. The forgot-password screen is informational only until backend integration is added.
