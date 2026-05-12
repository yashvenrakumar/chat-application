"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.ChatGroup = void 0;
const sequelize_1 = require("sequelize");
const database_1 = require("../config/database");
class ChatGroup extends sequelize_1.Model {
}
exports.ChatGroup = ChatGroup;
ChatGroup.init({
    group_id: {
        type: sequelize_1.DataTypes.BIGINT.UNSIGNED,
        autoIncrement: true,
        primaryKey: true,
    },
    group_title: {
        type: sequelize_1.DataTypes.STRING(120),
        allowNull: false,
    },
    group_type: {
        type: sequelize_1.DataTypes.ENUM("group"),
        allowNull: false,
        defaultValue: "group",
    },
    admin_user_id: {
        type: sequelize_1.DataTypes.BIGINT.UNSIGNED,
        allowNull: false,
    },
    is_active: {
        type: sequelize_1.DataTypes.BOOLEAN,
        allowNull: false,
        defaultValue: true,
    },
    created_at: {
        type: sequelize_1.DataTypes.DATE,
        allowNull: false,
        defaultValue: sequelize_1.DataTypes.NOW,
    },
    updated_at: {
        type: sequelize_1.DataTypes.DATE,
        allowNull: false,
        defaultValue: sequelize_1.DataTypes.NOW,
    },
}, {
    sequelize: database_1.sequelize,
    modelName: "chat_group",
    tableName: "chat_group",
    timestamps: false,
    indexes: [{ name: "idx_chat_group_admin_user_id", fields: ["admin_user_id"] }],
});
