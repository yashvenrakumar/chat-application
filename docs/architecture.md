

Overall Flow
__________________________
START APP
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
Handle Shutdown Signals




Architecture Overview
______________________________

Client
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
Real-time Events



Full Flow Socket
________________________
User Connects
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
Handle Disconnect





Overall Architecture Socket
 ___________________________
 Frontend
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
Broadcast Messages





Socket Events Used
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
