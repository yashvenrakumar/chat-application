class PresenceService {
  private userSockets = new Map<number, Set<string>>();
  private groupSockets = new Map<number, Set<number>>();

  addSocket(usr_id: number, socket_id: string): void {
    const sockets = this.userSockets.get(usr_id) ?? new Set<string>();
    sockets.add(socket_id);
    this.userSockets.set(usr_id, sockets);
  }

  removeSocket(usr_id: number, socket_id: string): void {
    const sockets = this.userSockets.get(usr_id);
    if (!sockets) return;
    sockets.delete(socket_id);
    if (sockets.size === 0) this.userSockets.delete(usr_id);
  }

  joinGroup(usr_id: number, grp_id: number): void {
    const users = this.groupSockets.get(grp_id) ?? new Set<number>();
    users.add(usr_id);
    this.groupSockets.set(grp_id, users);
  }

  leaveGroup(usr_id: number, grp_id: number): void {
    const users = this.groupSockets.get(grp_id);
    if (!users) return;
    users.delete(usr_id);
    if (users.size === 0) this.groupSockets.delete(grp_id);
  }

  getOnlineCount(grp_id: number): number {
    return (this.groupSockets.get(grp_id) ?? new Set<number>()).size;
  }

  getOnlineUsers(grp_id: number): number[] {
    return [...(this.groupSockets.get(grp_id) ?? new Set<number>())];
  }

  isUserOnline(usr_id: number): boolean {
    const sockets = this.userSockets.get(usr_id);
    return !!sockets && sockets.size > 0;
  }
}

export const presenceService = new PresenceService();
