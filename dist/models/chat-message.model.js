"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.ChatMessage = void 0;
const sequelize_1 = require("sequelize");
const database_1 = require("../config/database");
class ChatMessage extends sequelize_1.Model {
}
exports.ChatMessage = ChatMessage;
ChatMessage.init({
    message_id: {
        type: sequelize_1.DataTypes.BIGINT.UNSIGNED,
        autoIncrement: true,
        primaryKey: true,
    },
    group_id: {
        type: sequelize_1.DataTypes.BIGINT.UNSIGNED,
        allowNull: true,
    },
    sender_user_id: {
        type: sequelize_1.DataTypes.BIGINT.UNSIGNED,
        allowNull: false,
    },
    receiver_user_id: {
        type: sequelize_1.DataTypes.BIGINT.UNSIGNED,
        allowNull: true,
    },
    message_text: {
        type: sequelize_1.DataTypes.TEXT,
        allowNull: false,
    },
    message_type: {
        type: sequelize_1.DataTypes.ENUM("text"),
        allowNull: false,
        defaultValue: "text",
    },
    sent_at: {
        type: sequelize_1.DataTypes.DATE,
        allowNull: false,
        defaultValue: sequelize_1.DataTypes.NOW,
    },
}, {
    sequelize: database_1.sequelize,
    modelName: "chat_message",
    tableName: "chat_message",
    timestamps: false,
    indexes: [
        { name: "idx_chat_message_group_id", fields: ["group_id"] },
        { name: "idx_chat_message_receiver_user_id", fields: ["receiver_user_id"] },
        { name: "idx_chat_message_sender_user_id", fields: ["sender_user_id"] },
        { name: "idx_chat_message_sent_at", fields: ["sent_at"] },
    ],
});
