

Overall Flow
__________________________
```START APP
   ↓
Load Express App
   ↓
Connect Database
   ↓
Sync Sequelize Models
   ↓
Create HTTP Server
   ↓
Create Socket.IO Server
   ↓
Register Socket Events
   ↓
Start Listening on Port
   ↓
Handle Shutdown Signals```




Architecture Overview
______________________________

```Client
   ↓
HTTP Server
   ↓
Express App
   ↓
Routes → Controllers → Services
   ↓
Database

AND

Client
   ↕
Socket.IO
   ↕
Real-time Events```



Full Flow Socket
________________________
```User Connects
    ↓
Validate User
    ↓
Mark User Online
    ↓
Join Personal Room
    ↓
Join Group Rooms
    ↓
Listen for Messages
    ↓
Broadcast Messages
    ↓
Handle Disconnect```





Overall Architecture Socket
 ___________________________
 ```Frontend
   ↓
Socket Connection
   ↓
Authenticate User
   ↓
Join Rooms
   ↓
Track Presence
   ↓
Listen Events
   ↓
Save Messages
   ↓
Broadcast Messages```





Socket Events Used
```
__________________________________________________________
| Event              | Purpose                 |
| ------------------ | ----------------------- |
| `connection`       | user connected          |
| `chat:group:send`  | send group message      |
| `group:message`    | receive group message   |
| `chat:direct:send` | send private message    |
| `direct:message`   | receive private message |
| `user:presence`    | online/offline updates  |
| `group:presence`   | active members count    |
| `disconnect`       | user disconnected       |

```



Architecture Flow
________________________

Message Sent
   ↓
Save in DB
   ↓
Create Notifications
   ↓
Emit Real-time Event
   ↓
Frontend Updates Instantly




Sending Group Message
_________________________________
Frontend
   ↓
POST /groups/5/messages
   ↓
Route
   ↓
Validation
   ↓
ChatController.sendGroupMessage()
   ↓
ChatService.sendGroupMessage()
   ↓
Save in Database
   ↓
NotificationService.createNotification()
   ↓
Store Notifications
   ↓
Socket.IO Emit
   ↓
All Users Receive Real-time Message



Presence Flow
________________
User Connects
   ↓
Socket Connected
   ↓
presenceService.addSocket()
   ↓
User Becomes Online
   ↓
Join Group Presence
   ↓
Other Users See Online Status


Seen Message Flow
______________________
User Opens Message
   ↓
POST /messages/50/seen
   ↓
markSeen()
   ↓
DB Updated
   ↓
Socket Emit
   ↓
All Clients Update Seen Status





DIRECT CHAT ARCHITECTURE
_______________________
User1
  ↓
Socket Connection
  ↓
Room: user:1
  ↓
Send Message
  ↓
Backend Saves Message
  ↓
Emit to Room: user:2
  ↓
User2 Receives Instantly



__________________



Socket Server
   ├── Room: user:1
   │      └── socket_AAAA
   │
   ├── Room: user:2
   │      └── socket_BBBB



Socket Server
   │
   ├── Room: group:5
   │      ├── User1 Socket
   │      ├── User2 Socket
   │      ├── User3 Socket
   │      └── User4 Socket




ENTIRE GROUP CHAT ARCHITECTURE
____________________________

User Connects
   ↓
Fetch User Groups
   ↓
Join Group Rooms
   ↓
User Sends Message
   ↓
Save in DB
   ↓
Emit to Group Room
   ↓
All Group Members Receive Instantly





____________________________
Real-time messaging, online presence, notifications,
group communication, private chats, and read receipts
through REST APIs + Socket.IO architecture.
# Chat Application Backend Architecture

This document describes the backend architecture implemented under `src`. The application is a TypeScript Express API with Sequelize/MySQL persistence and Socket.IO real-time messaging on the same HTTP server.

## High-Level System

```text
Client
  |
  | REST: /api/v1/*
  v
HTTP Server
  |
  +--> Express App
  |      |
  |      +--> Routes
  |      +--> Controllers
  |      +--> Services
  |      +--> Sequelize Models
  |      +--> MySQL Database
  |
  +--> Socket.IO Server
         |
         +--> Socket Event Registry
         +--> Presence Service
         +--> Chat Service
         +--> Rooms: user:{user_id}, group:{group_id}
```

The REST API handles CRUD-style workflows, validation, notification creation, pagination, and read receipts. Socket.IO handles live presence and live message delivery.

## Startup Flow

`src/server.ts` is the process entrypoint.

```text
Import Express app and request type augmentation
  |
Connect to MySQL with Sequelize
  |
Sync Sequelize models
  |
Create Node HTTP server from Express app
  |
Attach Socket.IO server to the same HTTP server
  |
Store Socket.IO instance with setSocketServer()
  |
Register socket events
  |
Listen on env.port
  |
Handle SIGTERM/SIGINT graceful shutdown
```

During shutdown, the server disconnects sockets, closes Socket.IO, closes the Sequelize connection, then closes the HTTP server.

## Application Layer

`src/app.ts` creates the Express application.

- Enables CORS for all origins.
- Adds `helmet`.
- Parses JSON request bodies with `express.json()`.
- Mounts the API router at `/api/v1`.
- Adds `notFoundMiddleware`.
- Adds `errorMiddleware`.

## Configuration And Database

`src/config/env.ts` loads environment variables with `dotenv` and exposes `nodeEnv`, `port`, `exposeApiDocs`, and MySQL connection values.

`src/config/database.ts` creates the shared Sequelize instance and exposes `sequelize` and `connectDB()`. All models use this shared Sequelize instance.

## Authentication Context

The backend currently uses a lightweight user context header instead of JWT/session authentication.

```text
x-user-id: <number>
```

`src/middlewares/auth-context.middleware.ts` validates the header and writes the parsed value to `req.auth_user_id`. Requests without a valid positive numeric `x-user-id` receive `401`.

Route protection is applied in two places:

- `/api/v1/users` is public except `/api/v1/users/directory`, which applies `requireUserContext` directly.
- `/api/v1/groups`, `/api/v1/chat`, and `/api/v1/notifications` are protected by the global `requireUserContext` middleware in `src/routes/index.ts`.

## Route Map

All paths below are mounted under `/api/v1`.

### Users

Router: `src/routes/user.routes.ts`

| Method | Path | Handler | Purpose |
| --- | --- | --- | --- |
| `POST` | `/users` | `UserController.create` | Create a user after validating the request body. |
| `GET` | `/users` | `UserController.getAll` | List all users. |
| `GET` | `/users/directory` | `UserController.listDirectory` | List users for direct messaging, excluding the current user and adding online status. Requires `x-user-id`. |

### Groups

Router: `src/routes/group.routes.ts`

All group routes require `x-user-id`.

| Method | Path | Handler | Purpose |
| --- | --- | --- | --- |
| `GET` | `/groups/my` | `GroupController.myGroups` | List groups where the current user is an active member. |
| `POST` | `/groups` | `GroupController.create` | Create a group and membership rows. |
| `PUT` | `/groups/:group_id` | `GroupController.update` | Rename a group. Admin only. |
| `GET` | `/groups/:group_id/members` | `GroupController.members` | List active group members. |
| `POST` | `/groups/:group_id/members` | `GroupController.addMembers` | Add active members. Admin only. |
| `DELETE` | `/groups/:group_id/members/:user_id` | `GroupController.removeMember` | Mark a member as exited. Admin only. |
| `POST` | `/groups/:group_id/admin/:user_id` | `GroupController.changeAdmin` | Transfer group admin to another active member. |

### Chat

Router: `src/routes/chat.routes.ts`

All chat routes require `x-user-id`.

| Method | Path | Handler | Purpose |
| --- | --- | --- | --- |
| `GET` | `/chat/groups/:group_id/messages` | `ChatController.getGroupMessages` | Fetch group messages after membership check. |
| `POST` | `/chat/groups/:group_id/messages` | `ChatController.sendGroupMessage` | Send a group message, create notifications, and emit `group:message`. |
| `GET` | `/chat/groups/:group_id/online` | `ChatController.groupOnline` | Return online user IDs and count for a group. |
| `GET` | `/chat/direct/:peer_user_id/online` | `ChatController.directOnline` | Return direct peer online status. |
| `GET` | `/chat/direct/:peer_user_id/messages` | `ChatController.getDirectMessages` | Fetch direct messages between current user and peer. |
| `POST` | `/chat/direct/:peer_user_id/messages` | `ChatController.sendDirectMessage` | Send direct message, create notification, and emit `direct:message`. |
| `POST` | `/chat/messages/:message_id/seen` | `ChatController.markSeen` | Create read receipt and emit `message:seen`. |

### Notifications

Router: `src/routes/notification.routes.ts`

All notification routes require `x-user-id`.

| Method | Path | Handler | Purpose |
| --- | --- | --- | --- |
| `GET` | `/notifications` | `NotificationController.list` | Paginated list filtered by `status=all/read/unread`. |
| `POST` | `/notifications/:ntf_id/read` | `NotificationController.markRead` | Mark the current user's notification as read. |

## Controller Responsibilities

Controllers translate HTTP requests into service calls and API responses.

| Controller | File | Responsibility |
| --- | --- | --- |
| `UserController` | `src/controllers/user.controller.ts` | User creation, full user listing, paginated direct-message directory. |
| `GroupController` | `src/controllers/group.controller.ts` | Group creation, admin-only group changes, membership, admin transfer, current user's groups. |
| `ChatController` | `src/controllers/chat.controller.ts` | Group and direct messages, online status, read receipts, notification side effects, Socket.IO emits for REST sends. |
| `NotificationController` | `src/controllers/notification.controller.ts` | Paginated notification listing and read status updates. |

All successful responses use `successResponse()` from `src/utils/apiResponse.ts`.

## Service Responsibilities

Services contain most business rules and database access.

| Service | File | Responsibility |
| --- | --- | --- |
| `UserService` | `src/services/user.service.ts` | Create users, list users, list directory users, enrich directory rows with `presenceService.isUserOnline()`. |
| `GroupService` | `src/services/group.service.ts` | Create groups, manage members, enforce admin-only actions, check active group membership, list groups and members. |
| `ChatService` | `src/services/chat.service.ts` | Persist group/direct messages, enforce group membership for group chat, fetch messages, create/read message seen records, list group member IDs. |
| `NotificationService` | `src/services/notification.service.ts` | Create notifications, paginate by read status, count unread notifications, mark notifications as read. |
| `presenceService` | `src/services/presence.service.ts` | In-memory socket/user/group presence tracking. |

## Middleware, Validators, And Utilities

| Area | Files | Purpose |
| --- | --- | --- |
| Request context | `src/middlewares/auth-context.middleware.ts` | Validates `x-user-id` and sets `req.auth_user_id`. |
| Validation | `src/middlewares/validate.middleware.ts`, `src/validators/*.ts` | Validates request bodies with Joi and stores sanitized data in `req.validated`. |
| Async errors | `src/utils/asyncHandler.ts` | Passes rejected controller promises to Express error handling. |
| HTTP errors | `src/utils/httpError.ts` | Represents expected status-code errors. |
| API shape | `src/utils/apiResponse.ts` | Builds success and error response objects. |
| 404 handling | `src/middlewares/notFound.middleware.ts` | Returns not-found responses for unknown routes. |
| Error handling | `src/middlewares/error.middleware.ts` | Converts `HttpError` and unexpected errors into JSON responses. |
| Request typing | `src/types/express-request-augmentation.ts` | Adds `validated`, `auth_user_id`, and `request_id` to Express `Request`. |

## Data Model

Model associations are registered in `src/models/index.ts`.

```text
User
  |
  +-- ChatGroup.admin_user_id
  +-- GroupUserMap.user_id
  +-- ChatMessage.sender_user_id
  +-- ChatMessage.receiver_user_id
  +-- MessageSeen.user_id
  +-- Notification.user_id

ChatGroup
  |
  +-- GroupUserMap.group_id
  +-- ChatMessage.group_id

ChatMessage
  |
  +-- MessageSeen.message_id
```

### Tables

| Model | Table | Main fields |
| --- | --- | --- |
| `User` | `user` | `user_id`, `first_name`, `last_name`, `email_id`, `is_active`, timestamps |
| `ChatGroup` | `chat_group` | `group_id`, `group_title`, `group_type`, `admin_user_id`, `is_active`, timestamps |
| `GroupUserMap` | `group_user_map` | Group membership, admin flag, exit state, exit timestamp |
| `ChatMessage` | `chat_message` | `message_id`, `group_id`, `sender_user_id`, `receiver_user_id`, `message_text`, `message_type`, `sent_at` |
| `MessageSeen` | `message_seen` | `message_id`, `user_id`, seen timestamp |
| `Notification` | `notification` | `ntf_id`, `user_id`, `ntf_type`, title/body, `is_read`, `group_id`, `related_user_id`, `created_at` |

Direct messages are stored in `chat_message` with `group_id = null` and `receiver_user_id` set. Group messages are stored with `group_id` set.

## Socket.IO Architecture

Socket.IO is created in `src/server.ts` and stored through `setSocketServer()` in `src/socket/io.ts`. Controllers import the shared `io` instance when REST actions need to emit real-time events.

Socket events are registered in `src/socket/register-events.ts`.

### Socket Connection Flow

```text
Client connects with socket.handshake.auth.user_id
  |
Validate user_id
  |
presenceService.addSocket(user_id, socket.id)
  |
Join personal room: user:{user_id}
  |
Emit user:presence
  |
Load current user's groups
  |
Join each group room: group:{group_id}
  |
presenceService.joinGroup(user_id, group_id)
  |
Emit group:presence to each group room
  |
Listen for chat events
  |
On disconnect, remove socket and update presence
```

### Rooms

```text
user:{user_id}
  One room per user. Used for direct messages and user-specific delivery.

group:{group_id}
  One room per group. All connected active members join this room on socket connect.
```

### Socket Events

| Event | Direction | Purpose |
| --- | --- | --- |
| `connection` | Client to server | Opens a socket connection and initializes presence. |
| `chat:group:send` | Client to server | Persists a group message through `ChatService.sendGroupMessage()`. |
| `group:message` | Server to clients | Broadcasts group message to `group:{group_id}`. |
| `chat:direct:send` | Client to server | Persists a direct message through `ChatService.sendDirectMessage()`. |
| `direct:message` | Server to clients | Sends direct message to sender and receiver `user:{user_id}` rooms. |
| `user:presence` | Server to clients | Announces user online/offline status. |
| `group:presence` | Server to clients | Announces online member count for a group. |
| `message:seen` | Server to clients | Announces read receipt updates after REST `markSeen`. |
| `disconnect` | Client/socket lifecycle | Cleans up presence and emits updated presence state. |

Socket message sends persist chat messages and broadcast them, but notification creation currently happens in the REST send-message controllers.

## Core Runtime Flows

### Group Message Through REST

```text
POST /api/v1/chat/groups/:group_id/messages
  |
requireUserContext reads x-user-id
  |
validateBody(sendMessageSchema)
  |
ChatController.sendGroupMessage()
  |
ChatService.sendGroupMessage()
  |
GroupService.ensureMembership()
  |
Create ChatMessage
  |
ChatService.listGroupMemberIds()
  |
NotificationService.createNotification() for all other group members
  |
io.to(group:{group_id}).emit("group:message", message)
  |
Return 201 response
```

### Group Message Through Socket

```text
chat:group:send
  |
Use connected socket user_id as sender
  |
ChatService.sendGroupMessage()
  |
GroupService.ensureMembership()
  |
Create ChatMessage
  |
socketServer.to(group:{group_id}).emit("group:message", message)
```

### Direct Message Through REST

```text
POST /api/v1/chat/direct/:peer_user_id/messages
  |
requireUserContext reads x-user-id
  |
validateBody(sendMessageSchema)
  |
ChatController.sendDirectMessage()
  |
ChatService.sendDirectMessage()
  |
Create ChatMessage with group_id = null
  |
NotificationService.createNotification() for peer user
  |
Emit direct:message to user:{sender_user_id}
  |
Emit direct:message to user:{peer_user_id}
  |
Return 201 response
```

### Direct Message Through Socket

```text
chat:direct:send
  |
Use connected socket user_id as sender
  |
ChatService.sendDirectMessage()
  |
Create ChatMessage with group_id = null
  |
Emit direct:message to user:{sender_user_id}
  |
Emit direct:message to user:{receiver_user_id}
```

### Presence

```text
Socket connected
  |
Add socket id to userSockets map
  |
Join personal room
  |
Load user's active groups
  |
Join group rooms and update groupSockets map
  |
Emit user:presence and group:presence
```

`presenceService` stores presence in memory, so online state is process-local and resets when the backend restarts.

### Read Receipts

```text
POST /api/v1/chat/messages/:message_id/seen
  |
ChatController.markSeen()
  |
ChatService.markSeen()
  |
Find ChatMessage or throw 404
  |
Find or create MessageSeen row
  |
Fetch seen users for the message
  |
io.emit("message:seen", { message_id, seen_users })
  |
Return seen record
```

## Error And Response Shape

Successful responses use this general shape:

```json
{
  "success": true,
  "message": "Operation message",
  "data": {}
}
```

Errors are returned by middleware through `errorResponse()`. Expected business errors use `HttpError`, for example:

- Missing or invalid `x-user-id`
- User is not a group member
- Only group admin can perform an action
- Group or notification not found

## Final Architecture Summary

The backend is organized around a clear path:

```text
HTTP request
  -> Route
  -> Middleware and validation
  -> Controller
  -> Service
  -> Sequelize model
  -> MySQL
  -> Optional Socket.IO emit

Socket event
  -> Socket registry
  -> Presence and chat services
  -> Sequelize model
  -> MySQL
  -> Socket.IO room broadcast
```

REST APIs provide reliable request/response workflows for users, groups, chat history, notifications, and read receipts. Socket.IO provides real-time delivery for group chat, direct chat, presence, and read receipt updates.

'

