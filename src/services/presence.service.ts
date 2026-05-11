class PresenceService {
  private userSockets = new Map<number, Set<string>>();
  private groupSockets = new Map<number, Set<number>>();

  addSocket(user_id: number, socket_id: string): void {
    const sockets = this.userSockets.get(user_id) ?? new Set<string>();
    sockets.add(socket_id);
    this.userSockets.set(user_id, sockets);
  }

  removeSocket(user_id: number, socket_id: string): void {
    const sockets = this.userSockets.get(user_id);
    if (!sockets) return;
    sockets.delete(socket_id);
    if (sockets.size === 0) this.userSockets.delete(user_id);
  }

  joinGroup(user_id: number, group_id: number): void {
    const users = this.groupSockets.get(group_id) ?? new Set<number>();
    users.add(user_id);
    this.groupSockets.set(group_id, users);
  }

  leaveGroup(user_id: number, group_id: number): void {
    const users = this.groupSockets.get(group_id);
    if (!users) return;
    users.delete(user_id);
    if (users.size === 0) this.groupSockets.delete(group_id);
  }

  getOnlineCount(group_id: number): number {
    return (this.groupSockets.get(group_id) ?? new Set<number>()).size;
  }

  getOnlineUsers(group_id: number): number[] {
    return [...(this.groupSockets.get(group_id) ?? new Set<number>())];
  }

  isUserOnline(user_id: number): boolean {
    const sockets = this.userSockets.get(user_id);
    return !!sockets && sockets.size > 0;
  }
}

export const presenceService = new PresenceService();
