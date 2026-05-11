

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


