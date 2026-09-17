# Tech Stack

## Language & runtime

- **TypeScript** (CommonJS modules, `type: "commonjs"` in package.json)
- **Node.js** with `@types/node`
- Run directly with **tsx** — no separate build/compile step in the current setup

## Frameworks & libraries

- **Express 5** for the HTTP server and routing
- Built-in Express middleware: `express.json()`, `express.urlencoded()`, and `express.static()`

## API contract

- The REST API is documented in `docs/openapi.yaml` (OpenAPI 3.0.3). Keep it in sync when adding or changing endpoints.

## Common commands

```bash
# Install dependencies
npm install

# Start the API server (runs src/api/server.ts via tsx)
npm start
```

The server listens on `PORT` (env var) or `3000` by default.

## Conventions

- Prefer TypeScript's static typing: define shared shapes as `type` aliases in `src/model/Model.ts` and reuse them across modules.
- All API responses use a consistent envelope:
  - Success: `{ success: true, data, message }`
  - Error: `{ success: false, error, message }`
- Validate request input inside handlers and return `400` with the error envelope on invalid data.
- Use appropriate HTTP status codes: `200` OK, `201` Created, `400` Bad Request, `401` Unauthorized, `403` Forbidden, `404` Not Found, `500` Internal Server Error.
- Wrap handler logic in try/catch and return a `500` error envelope on unexpected failures.
