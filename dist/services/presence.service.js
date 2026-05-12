"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.presenceService = void 0;
class PresenceService {
    constructor() {
        this.userSockets = new Map();
        this.groupSockets = new Map();
    }
    addSocket(user_id, socket_id) {
        var _a;
        const sockets = (_a = this.userSockets.get(user_id)) !== null && _a !== void 0 ? _a : new Set();
        sockets.add(socket_id);
        this.userSockets.set(user_id, sockets);
    }
    removeSocket(user_id, socket_id) {
        const sockets = this.userSockets.get(user_id);
        if (!sockets)
            return;
        sockets.delete(socket_id);
        if (sockets.size === 0)
            this.userSockets.delete(user_id);
    }
    joinGroup(user_id, group_id) {
        var _a;
        const users = (_a = this.groupSockets.get(group_id)) !== null && _a !== void 0 ? _a : new Set();
        users.add(user_id);
        this.groupSockets.set(group_id, users);
    }
    leaveGroup(user_id, group_id) {
        const users = this.groupSockets.get(group_id);
        if (!users)
            return;
        users.delete(user_id);
        if (users.size === 0)
            this.groupSockets.delete(group_id);
    }
    getOnlineCount(group_id) {
        var _a;
        return ((_a = this.groupSockets.get(group_id)) !== null && _a !== void 0 ? _a : new Set()).size;
    }
    getOnlineUsers(group_id) {
        var _a;
        return [...((_a = this.groupSockets.get(group_id)) !== null && _a !== void 0 ? _a : new Set())];
    }
    isUserOnline(user_id) {
        const sockets = this.userSockets.get(user_id);
        return !!sockets && sockets.size > 0;
    }
}
exports.presenceService = new PresenceService();
