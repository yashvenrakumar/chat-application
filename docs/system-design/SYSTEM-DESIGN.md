# System design — Chat backend

This document describes the **system-level architecture** of the chat backend under `src/`: major components, how they interact, runtime boundaries, and diagrams for onboarding and design reviews.

---

## 1. System purpose

The system provides:

- **REST API** under `/api/v1` for users, groups, chat history, sending messages (with optional notification side effects), read receipts, and notification inbox.
- **Real-time delivery** over **Socket.IO** on the **same TCP port** as HTTP, including presence-style signals and live message fan-out.
- **Durable state** in **MySQL** via **Sequelize** ORM models.

It is a **monolith**: one Node.js process hosts HTTP, WebSocket upgrade handling, business logic, and in-memory session state for presence.

---

## 2. System context (who talks to whom)

External actors and systems at the highest level.

```mermaid
flowchart LR
  subgraph clients [Clients]
    WEB[Web app]
    MOB[Mobile / other HTTP clients]
  end

  subgraph backend [Backend deployment]
    API[Chat backend process]
  end

  subgraph data [Data stores]
    DB[(MySQL)]
  end

  WEB -->|"HTTPS or HTTP REST + Socket.IO"| API
  MOB -->|"REST + optional Socket"| API
  API -->|"SQL via Sequelize"| DB
```

| Boundary | Description |
|----------|-------------|
| **Clients** | Any consumer that can send **`x-user-id`** on REST and **`auth.user_id`** on the socket. No separate API gateway in code. |
| **Backend** | Single deployable: Express + Socket.IO + application logic. |
| **MySQL** | Authoritative storage for users, groups, memberships, messages, read receipts, notifications. |

---

## 3. Container view (what runs where)

Inside the “Chat backend process” there is **one HTTP server** and **one Socket.IO server** attached to it. There is **no** separate message queue or cache service in this repository.

```mermaid
flowchart TB
  subgraph process [Node.js process]
    direction TB
    HTTP[Express HTTP stack]
    IO[Socket.IO engine]
    MEM[(In-memory presenceService)]
    SEQ[Sequelize ORM]
    HTTP --> SEQ
    IO --> SEQ
    IO --> MEM
    HTTP --> MEM
  end

  DB[(MySQL)]

  SEQ --> DB
```

| Container / module | Responsibility |
|---------------------|------------------|
| **Express** | Routing, JSON body parsing, middleware chain, JSON responses. |
| **Socket.IO** | Persistent connections, rooms, server→client and client→server events. |
| **Sequelize** | Connection pool, queries, `sync` in development. |
| **`presenceService`** | **Process-local** map of connected sockets and “online in group” sets — **not** replicated across multiple Node instances without extra infrastructure. |

---

## 4. Logical component architecture (`src/`)

How code is layered inside the monolith.

```mermaid
flowchart TB
  subgraph entry [Entry]
    SRV[server.ts]
    APP[app.ts]
  end

  subgraph http [HTTP path]
    R[routes]
    MW[middlewares]
    V[validators]
    C[controllers]
  end

  subgraph rt [Real-time path]
    REG[socket/register-events.ts]
    IOS[socket/io.ts]
  end

  subgraph domain [Domain / persistence]
    SV[services]
    M[models]
    CFG[config]
  end

  SRV --> APP
  SRV --> REG
  SRV --> CFG
  APP --> MW
  MW --> R
  R --> V
  R --> C
  C --> SV
  REG --> SV
  C --> IOS
  REG --> IOS
  SV --> M
  M --> CFG
```

| Layer | Folders | Role |
|-------|---------|------|
| **Entry** | `server.ts`, `app.ts` | Bootstraps DB, HTTP+Socket, global middleware order, shutdown. |
| **Routes** | `routes/` | Maps URL paths and HTTP verbs to middleware + controller handlers. |
| **Middleware** | `middlewares/` | Cross-cutting: user context (`x-user-id`), Joi body validation, 404, centralized errors. |
| **Validators** | `validators/` | Joi schemas; keep invalid data out of controllers. |
| **Controllers** | `controllers/` | Parse params/query, call services, shape HTTP status + JSON; **chat** controller also triggers **`io.emit`** / **`io.to`** and notifications. |
| **Services** | `services/` | Business rules and Sequelize access; throw **`HttpError`** for expected failures. |
| **Models** | `models/` | Table mapping, associations in `models/index.ts`. |
| **Socket** | `socket/` | Connection lifecycle, chat socket events, uses same **services** as REST. |
| **Config / utils** | `config/`, `utils/` | Env, DB singleton, `asyncHandler`, API envelope, `HttpError`. |

**Design pattern in use:** classic **three-tier inside one process** — presentation (routes/controllers/socket) → application (services) → data (models/DB), with validation at the edge.

---

## 5. Dual channel design: REST vs Socket

A core system concept is **two entry points** into the same domain services.

```mermaid
flowchart LR
  subgraph inputs [Client entry points]
    REST[REST /api/v1]
    SOC[Socket.IO events]
  end

  subgraph shared [Shared domain]
    CS[ChatService]
    GS[GroupService]
    NS[NotificationService]
    PS[presenceService]
  end

  subgraph side [Side effects]
    DB[(MySQL)]
    IOE[io emit to rooms]
    NOT[notification rows]
  end

  REST --> CS
  REST --> GS
  REST --> NS
  SOC --> CS
  SOC --> GS
  CS --> DB
  GS --> DB
  NS --> DB
  SOC --> PS

  REST --> IOE
  REST --> NOT
  SOC --> IOE
```

| Path | Persistence | Socket fan-out | Notifications |
|------|----------------|----------------|----------------|
| **REST** chat send | Yes | Yes (`io.to` rooms) | Yes (group/DM as implemented) |
| **Socket** chat send | Yes | Yes | **No** (by design in current code) |

Clients that need a consistent **notification inbox** should use **REST** for sends (or the backend should be extended so socket sends also call `NotificationService`).

---

## 6. Request flow (HTTP)

Typical authenticated API call.

```mermaid
sequenceDiagram
  participant Client
  participant Express
  participant Auth as requireUserContext
  participant Val as validateBody
  participant Ctrl as Controller
  participant Svc as Service
  participant DB as Sequelize/MySQL

  Client->>Express: HTTP + JSON + x-user-id
  Express->>Auth: after /users mount
  Auth->>Ctrl: req.auth_user_id set
  opt validated body
    Express->>Val: Joi
    Val->>Ctrl: req.validated
  end
  Ctrl->>Svc: domain call
  Svc->>DB: SQL
  DB-->>Svc: rows
  Svc-->>Ctrl: result / HttpError
  Ctrl-->>Client: JSON successResponse
```

**Unauthenticated subset:** `POST /users`, `GET /users` are mounted **before** `requireUserContext` on the API router; other mounts require **`x-user-id`**.

---

## 7. Real-time flow (Socket.IO)

Connect → join rooms from DB → exchange events (see socket doc for event names).

```mermaid
sequenceDiagram
  participant Client
  participant IO as Socket.IO
  participant Reg as register-events
  participant GS as GroupService
  participant CS as ChatService
  participant PS as presenceService

  Client->>IO: connect auth.user_id
  IO->>Reg: connection
  Reg->>GS: listMyGroups
  GS-->>Reg: groups
  Reg->>PS: addSocket + joinGroup
  Reg-->>Client: joined usr / grp rooms

  Client->>Reg: chat:group:send
  Reg->>CS: sendGroupMessage
  CS-->>Reg: message
  Reg->>IO: to grp emit group:message
```

---

## 8. Data and control: chat send (REST) end-to-end

Shows how HTTP, DB, notifications, and socket interact for one use case.

```mermaid
flowchart TD
  A[Client POST /chat/groups/:id/messages] --> B[ChatController.sendGroupMessage]
  B --> C[ChatService.sendGroupMessage]
  C --> D[(MySQL chat_message)]
  B --> E[NotificationService per member]
  E --> F[(MySQL notification)]
  B --> G["io.to grp:id emit group:message"]
  G --> H[Other connected clients in room]
```

---

## 9. Deployment and scaling considerations

| Topic | Current system | Typical evolution |
|-------|----------------|-------------------|
| **Instances** | One Node process assumed for correct **presence** and room fan-out. | Multiple instances behind a load balancer need **sticky sessions** or Redis adapter for Socket.IO; presence must move to shared store. |
| **Schema** | `sequelize.sync({ alter: true })` in development only. | Production: turn off `alter`, use migrations. |
| **Secrets** | DB password and `x-user-id` trust model. | Vault, real auth (JWT/session), TLS termination at reverse proxy. |
| **Observability** | Console logging in dev for SQL. | Structured logs, metrics, tracing IDs (`request_id` reserved in types but unused). |

---

## 10. Trust boundaries and security (conceptual)

```mermaid
flowchart LR
  subgraph untrusted [Untrusted zone]
    CL[Internet clients]
  end

  subgraph app [Application trust boundary]
    BE[Backend validates shape only]
  end

  subgraph trusted [Trusted zone]
    DB[(MySQL)]
  end

  CL -->|"x-user-id self-asserted"| BE
  CL -->|"auth.user_id self-asserted"| BE
  BE --> DB
```

The system **does not verify** that the caller owns the `user_id`; it **trusts** the header and socket auth. Document this clearly for any deployment beyond local demos.

---
 