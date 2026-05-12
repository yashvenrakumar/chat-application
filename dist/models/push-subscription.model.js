"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.PushSubscription = void 0;
const sequelize_1 = require("sequelize");
const database_1 = require("../config/database");
class PushSubscription extends sequelize_1.Model {
}
exports.PushSubscription = PushSubscription;
PushSubscription.init({
    push_subscription_id: {
        type: sequelize_1.DataTypes.BIGINT.UNSIGNED,
        autoIncrement: true,
        primaryKey: true,
    },
    user_id: {
        type: sequelize_1.DataTypes.BIGINT.UNSIGNED,
        allowNull: false,
    },
    endpoint: {
        type: sequelize_1.DataTypes.TEXT,
        allowNull: false,
    },
    keys_p256dh: {
        type: sequelize_1.DataTypes.TEXT,
        allowNull: false,
    },
    keys_auth: {
        type: sequelize_1.DataTypes.TEXT,
        allowNull: false,
    },
    created_at: {
        type: sequelize_1.DataTypes.DATE,
        allowNull: false,
        defaultValue: sequelize_1.DataTypes.NOW,
    },
}, {
    sequelize: database_1.sequelize,
    modelName: "push_subscription",
    tableName: "push_subscription",
    timestamps: false,
    indexes: [{ name: "idx_push_sub_user_id", fields: ["user_id"] }],
});
