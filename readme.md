npm init -y

npm install -D typescript ts-node-dev @types/node @types/express

Initialize TypeScript:

npx tsc --init

mkdir src
touch src/server.ts

# Chat app backend

Express + Sequelize (MySQL) + Socket.IO API server.

## How the code starts

- **`package.json`** — defines dependencies and the **`dev`** script, which runs the process with `ts-node-dev` on **`src/server.ts`** (see `scripts.dev`).
- **`src/server.ts`** — **entry point**: loads env and DB, syncs Sequelize models, creates the HTTP server from the Express **`app`**, attaches Socket.IO, listens on `PORT`, and handles graceful shutdown (`SIGTERM` / `SIGINT`).
- **`src/app.ts`** — **Express application only**: middleware (CORS, Helmet, JSON), mounts routes at `/api/v1`, and wires not-found and error handlers. It does **not** open a port by itself; **`server.ts`** imports `app` and passes it to `http.createServer(app)`.

Run order: `npm run dev` → `src/server.ts` → `import app from "./app"` → HTTP + Socket.IO listen after DB connect.

## Prerequisites

- **Node.js** (LTS recommended)
- **MySQL** reachable with the credentials you put in `.env` (database must exist; Sequelize sync will create/alter tables in development)

## Setup

1. **Install dependencies** (from this folder):

   ```bash
   npm install
   ```

2. **Environment variables** — create a `.env` file in the project root. The app loads it via `dotenv` in `src/config/env.ts`. Supported variables:

   | Variable          | Purpose                                          | Default           |
   | ----------------- | ------------------------------------------------ | ----------------- |
   | `NODE_ENV`        | Environment name                                 | `development`     |
   | `PORT`            | HTTP port                                        | `5000`            |
   | `EXPOSE_API_DOCS` | API docs flag                                    | off unless `true` |
   | `DB_HOST`         | MySQL host                                       | `localhost`       |
   | `DB_PORT`         | MySQL port                                       | `3306`            |
   | `DB_NAME`         | Database name                                    | `msg`             |
   | `DB_USER`         | MySQL user                                       | `root`            |
   | `DB_PASSWORD`     | MySQL password                                   | `mysql`           |
   | `DB_SOCKET_PATH`  | Unix socket (used by Sequelize `dialectOptions`) | `/tmp/mysql.sock` |

   Create the MySQL database named in `DB_NAME` before starting if it does not exist.

3. **TypeScript** — already configured in `tsconfig.json`. No separate `build` script is defined in `package.json`; development uses `ts-node-dev` directly on `src/server.ts`. To compile manually: `npx tsc` (output in `dist/`).

## How to run

**Development** (watch mode, restarts on file changes):

```bash
npm run dev
```

This executes `ts-node-dev src/server.ts` as defined in `package.json`.

You should see a successful DB connection log, then something like: `Server is running on port <PORT>`.

**Other scripts** (from `package.json`):

- `npm test` — placeholder only (exits with an error until tests are added).

## Troubleshooting

- **Port in use** — change `PORT` in `.env` or stop the other process. The server logs a hint when `EADDRINUSE` occurs.
- **MySQL connection** — verify host, port, user, password, and that `DB_NAME` exists; on macOS, socket path may need to match your MySQL install if you connect via socket.
