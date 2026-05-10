import { Server } from "socket.io";
import { ChatService } from "../services/chat.service";
import { GroupService } from "../services/group.service";
import { presenceService } from "../services/presence.service";

export const registerSocketEvents = (socketServer: Server): void => {
  socketServer.on("connection", async (socket) => {
    const user_id = Number(socket.handshake.auth?.user_id);
    if (!user_id || Number.isNaN(user_id)) {
      socket.disconnect();
      return;
    }

    presenceService.addSocket(user_id, socket.id);
    socket.join(`usr:${user_id}`);
    socketServer.emit("user:presence", { user_id, is_online: true });

    const groups = await GroupService.listMyGroups(user_id);
    groups.forEach((group) => {
      const group_id = Number(group.group_id);
      socket.join(`grp:${group_id}`);
      presenceService.joinGroup(user_id, group_id);
      socketServer.to(`grp:${group_id}`).emit("group:presence", {
        group_id,
        online_cnt: presenceService.getOnlineCount(group_id),
      });
    });

    socket.on("chat:group:send", async (payload: { group_id: number; message_text: string }) => {
      const message = await ChatService.sendGroupMessage({
        group_id: payload.group_id,
        sender_user_id: user_id,
        message_text: payload.message_text,
      });
      socketServer.to(`grp:${payload.group_id}`).emit("group:message", message);
    });

    socket.on("chat:direct:send", async (payload: { receiver_user_id: number; message_text: string }) => {
      const message = await ChatService.sendDirectMessage({
        sender_user_id: user_id,
        receiver_user_id: payload.receiver_user_id,
        message_text: payload.message_text,
      });
      socketServer.to(`usr:${user_id}`).emit("direct:message", message);
      socketServer.to(`usr:${payload.receiver_user_id}`).emit("direct:message", message);
    });

    socket.on("disconnect", () => {
      presenceService.removeSocket(user_id, socket.id);
      socketServer.emit("user:presence", {
        user_id,
        is_online: presenceService.isUserOnline(user_id),
      });
      groups.forEach((group) => {
        const group_id = Number(group.group_id);
        presenceService.leaveGroup(user_id, group_id);
        socketServer.to(`grp:${group_id}`).emit("group:presence", {
          group_id,
          online_cnt: presenceService.getOnlineCount(group_id),
        });
      });
    });
  });
};
