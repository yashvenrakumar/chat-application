"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.User = void 0;
const sequelize_1 = require("sequelize");
const database_1 = require("../config/database");
class User extends sequelize_1.Model {
}
exports.User = User;
User.init({
    user_id: {
        type: sequelize_1.DataTypes.BIGINT.UNSIGNED,
        autoIncrement: true,
        primaryKey: true,
    },
    first_name: {
        type: sequelize_1.DataTypes.STRING(100),
        allowNull: false,
    },
    last_name: {
        type: sequelize_1.DataTypes.STRING(100),
        allowNull: false,
    },
    email_id: {
        type: sequelize_1.DataTypes.STRING(200),
        allowNull: false,
        unique: "uk_user_email_id",
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
    modelName: "user",
    tableName: "user",
    timestamps: false,
    indexes: [
        { name: "idx_user_email_id", fields: ["email_id"] },
        { name: "idx_user_is_active", fields: ["is_active"] },
    ],
});
