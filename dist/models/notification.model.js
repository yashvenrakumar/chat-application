"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.Notification = void 0;
const sequelize_1 = require("sequelize");
const database_1 = require("../config/database");
class Notification extends sequelize_1.Model {
}
exports.Notification = Notification;
Notification.init({
    ntf_id: {
        type: sequelize_1.DataTypes.BIGINT.UNSIGNED,
        autoIncrement: true,
        primaryKey: true,
        field: "notification_id",
    },
    user_id: {
        type: sequelize_1.DataTypes.BIGINT.UNSIGNED,
        allowNull: false,
    },
    ntf_type: {
        type: sequelize_1.DataTypes.ENUM("group", "direct", "system"),
        allowNull: false,
        defaultValue: "system",
        field: "notification_type",
    },
    ntf_title: {
        type: sequelize_1.DataTypes.STRING(150),
        allowNull: false,
        field: "notification_title",
    },
    ntf_body: {
        type: sequelize_1.DataTypes.STRING(600),
        allowNull: false,
        field: "notification_body",
    },
    is_read: {
        type: sequelize_1.DataTypes.BOOLEAN,
        allowNull: false,
        defaultValue: false,
    },
    group_id: {
        type: sequelize_1.DataTypes.BIGINT.UNSIGNED,
        allowNull: true,
        defaultValue: null,
    },
    related_user_id: {
        type: sequelize_1.DataTypes.BIGINT.UNSIGNED,
        allowNull: true,
        defaultValue: null,
    },
    created_at: {
        type: sequelize_1.DataTypes.DATE,
        allowNull: false,
        defaultValue: sequelize_1.DataTypes.NOW,
    },
}, {
    sequelize: database_1.sequelize,
    modelName: "notification",
    tableName: "notification",
    timestamps: false,
    indexes: [
        { name: "idx_ntf_user_id", fields: ["user_id"] },
        { name: "idx_ntf_is_read", fields: ["is_read"] },
    ],
});
