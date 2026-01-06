# Getting Started with Create React App

This project was bootstrapped with [Create React App](https://github.com/facebook/create-react-app).

## Available Scripts

In the project directory, you can run:

### `npm start`

Runs the app in the development mode.\
Open [http://localhost:3000](http://localhost:3000) to view it in the browser.

The page will reload if you make edits.\
You will also see any lint errors in the console.

### `npm test`

Launches the test runner in the interactive watch mode.\
See the section about [running tests](https://facebook.github.io/create-react-app/docs/running-tests) for more information.

### `npm run build`

Builds the app for production to the `build` folder.\
It correctly bundles React in production mode and optimizes the build for the best performance.

The build is minified and the filenames include the hashes.\
Your app is ready to be deployed!

See the section about [deployment](https://facebook.github.io/create-react-app/docs/deployment) for more information.

### `npm run eject`

**Note: this is a one-way operation. Once you `eject`, you can’t go back!**

If you aren’t satisfied with the build tool and configuration choices, you can `eject` at any time. This command will remove the single build dependency from your project.

Instead, it will copy all the configuration files and the transitive dependencies (webpack, Babel, ESLint, etc) right into your project so you have full control over them. All of the commands except `eject` will still work, but they will point to the copied scripts so you can tweak them. At this point you’re on your own.

You don’t have to ever use `eject`. The curated feature set is suitable for small and middle deployments, and you shouldn’t feel obligated to use this feature. However we understand that this tool wouldn’t be useful if you couldn’t customize it when you are ready for it.

## Learn More

You can learn more in the [Create React App documentation](https://facebook.github.io/create-react-app/docs/getting-started).

To learn React, check out the [React documentation](https://reactjs.org/).

## Telemetry backend configuration

The dashboard reads telemetry directly from the InterOps telemetry API. Set `REACT_APP_API_BASE_URL` and `REACT_APP_TELEMETRY_BASE_URL` to the Control and Telemetry API hosts (for example, `http://control.interop.100.48.218.100.nip.io` and `http://telemetry.interop.100.48.218.100.nip.io`) so the UI can call `/api/*` endpoints without relying on mocks.

```bash
REACT_APP_API_BASE_URL=http://control.interop.100.48.218.100.nip.io \
REACT_APP_TELEMETRY_BASE_URL=http://telemetry.interop.100.48.218.100.nip.io npm start
```

The telemetry page issues `GET /api/telemetry/events` to retrieve telemetry events and displays them as-is. No additional setup is required beyond exposing that endpoint on the backend.

## Authentication and password reset

* Default dev credentials: `admin@interoplens.io` / `admin123` (seeded locally for offline testing).
* The login screen supports password reset using `/api/auth/password/forgot` and `/api/auth/password/reset`. If the backend is unreachable,
  the UI issues a time-limited local reset code so you can complete the flow during development.

For environments that require OAuth-backed authentication, the dashboard expects the following variables to be present at build or runtime so the backend can issue tokens:

```
OAUTH_TOKEN_URL=https://auth.example.com/oauth/token
OAUTH_CLIENT_ID=interop-dashboard-client
OAUTH_CLIENT_SECRET=replace-me
OAUTH_USERNAME=admin@example.com
OAUTH_PASSWORD=replace-me
```

Copy `.env.example` to `.env.production` (or your environment-specific file) and replace the placeholders with your provider's values to avoid `Missing OAuth environment variables` errors.
