"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.GroupUserMap = void 0;
const sequelize_1 = require("sequelize");
const database_1 = require("../config/database");
class GroupUserMap extends sequelize_1.Model {
}
exports.GroupUserMap = GroupUserMap;
GroupUserMap.init({
    group_user_map_id: {
        type: sequelize_1.DataTypes.BIGINT.UNSIGNED,
        autoIncrement: true,
        primaryKey: true,
    },
    group_id: {
        type: sequelize_1.DataTypes.BIGINT.UNSIGNED,
        allowNull: false,
    },
    user_id: {
        type: sequelize_1.DataTypes.BIGINT.UNSIGNED,
        allowNull: false,
    },
    is_admin: {
        type: sequelize_1.DataTypes.BOOLEAN,
        allowNull: false,
        defaultValue: false,
    },
    joined_at: {
        type: sequelize_1.DataTypes.DATE,
        allowNull: false,
        defaultValue: sequelize_1.DataTypes.NOW,
    },
    exited_at: {
        type: sequelize_1.DataTypes.DATE,
        allowNull: true,
    },
    is_exited: {
        type: sequelize_1.DataTypes.BOOLEAN,
        allowNull: false,
        defaultValue: false,
    },
}, {
    sequelize: database_1.sequelize,
    modelName: "group_user_map",
    tableName: "group_user_map",
    timestamps: false,
    indexes: [
        { name: "idx_group_user_map_group_id", fields: ["group_id"] },
        { name: "idx_group_user_map_user_id", fields: ["user_id"] },
        { name: "uk_group_user_map_group_user", fields: ["group_id", "user_id"], unique: true },
    ],
});
