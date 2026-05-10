import { User } from "./user.model";

import { ChatGroup } from "./chat-group.model";
import { GroupUserMap } from "./group-user-map.model";

ChatGroup.belongsTo(User, { foreignKey: "admin_user_id", as: "admin" });
GroupUserMap.belongsTo(ChatGroup, { foreignKey: "group_id" });
GroupUserMap.belongsTo(User, { foreignKey: "user_id" });

export { User, ChatGroup, GroupUserMap };
