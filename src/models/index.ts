import { ChatGroup } from "./chat-group.model";
import { ChatMessage } from "./chat-message.model";
import { GroupUserMap } from "./group-user-map.model";
import { MessageSeen } from "./message-seen.model";
import { Notification } from "./notification.model";
import { User } from "./user.model";

ChatGroup.belongsTo(User, { foreignKey: "admin_user_id", as: "admin" });
GroupUserMap.belongsTo(ChatGroup, { foreignKey: "group_id" });
GroupUserMap.belongsTo(User, { foreignKey: "user_id" });
ChatMessage.belongsTo(ChatGroup, { foreignKey: "group_id" });
ChatMessage.belongsTo(User, { foreignKey: "sender_user_id", as: "sender" });
ChatMessage.belongsTo(User, { foreignKey: "receiver_user_id", as: "receiver" });
MessageSeen.belongsTo(ChatMessage, { foreignKey: "message_id" });
MessageSeen.belongsTo(User, { foreignKey: "user_id" });
Notification.belongsTo(User, { foreignKey: "user_id" });

export { User, ChatGroup, GroupUserMap, ChatMessage, MessageSeen, Notification };
