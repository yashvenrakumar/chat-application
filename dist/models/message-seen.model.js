"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.MessageSeen = void 0;
const sequelize_1 = require("sequelize");
const database_1 = require("../config/database");
class MessageSeen extends sequelize_1.Model {
}
exports.MessageSeen = MessageSeen;
MessageSeen.init({
    message_seen_id: {
        type: sequelize_1.DataTypes.BIGINT.UNSIGNED,
        autoIncrement: true,
        primaryKey: true,
    },
    message_id: {
        type: sequelize_1.DataTypes.BIGINT.UNSIGNED,
        allowNull: false,
    },
    user_id: {
        type: sequelize_1.DataTypes.BIGINT.UNSIGNED,
        allowNull: false,
    },
    seen_at: {
        type: sequelize_1.DataTypes.DATE,
        allowNull: false,
        defaultValue: sequelize_1.DataTypes.NOW,
    },
}, {
    sequelize: database_1.sequelize,
    modelName: "message_seen",
    tableName: "message_seen",
    timestamps: false,
    indexes: [{ name: "uk_message_seen_message_user", fields: ["message_id", "user_id"], unique: true }],
});
