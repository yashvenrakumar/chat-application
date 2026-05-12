import type { Server } from "socket.io";
import { env } from "../config/env";

/**
 * Global `socketServer.emit("user:presence")` fans out to every connection on each
 * connect/disconnect (O(N) per churn). Scoped mode emits only to this user's personal
 * room (multi-device) and group rooms they belong to — same RAM, far less CPU/egress.
 *
 * `global` restores legacy behavior for clients that relied on universe-wide presence
 * (e.g. DM-only users with no shared groups).
 */
export const emitUserPresence = (
  socketServer: Server,
  user_id: number,
  payload: { user_id: number; is_online: boolean },
  groupIds: number[],
): void => {
  if (env.userPresenceBroadcast === "global") {
    socketServer.emit("user:presence", payload);
    return;
  }
  socketServer.to(`user:${user_id}`).emit("user:presence", payload);
  for (const group_id of groupIds) {
    socketServer.to(`group:${group_id}`).emit("user:presence", payload);
  }
};
