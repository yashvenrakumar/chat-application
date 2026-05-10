import { DataTypes, Model, Optional } from "sequelize";
import { sequelize } from "../config/database";

export interface NotificationAttributes {
  notification_id: number;
  user_id: number;
  notification_type: "group" | "direct" | "system";
  notification_title: string;
  notification_body: string;
  is_read: boolean;
  /** Group chat notification refers to (when `notification_type` is `group`). */
  group_id?: number | null;
  /** Other user in a direct-message notification (`notification_type` `direct`): the sender. */
  related_user_id?: number | null;
  created_at?: Date;
}

export type NotificationCreationAttributes = Optional<
  NotificationAttributes,
  "notification_id" | "is_read" | "created_at" | "group_id" | "related_user_id"
>;

export class Notification
  extends Model<NotificationAttributes, NotificationCreationAttributes>
  implements NotificationAttributes
{
  public notification_id!: number;
  public user_id!: number;
  public notification_type!: "group" | "direct" | "system";
  public notification_title!: string;
  public notification_body!: string;
  public is_read!: boolean;
  public group_id!: number | null;
  public related_user_id!: number | null;
  public readonly created_at!: Date;
}

Notification.init(
  {
    notification_id: {
      type: DataTypes.BIGINT.UNSIGNED,
      autoIncrement: true,
      primaryKey: true,
    },
    user_id: {
      type: DataTypes.BIGINT.UNSIGNED,
      allowNull: false,
    },
    notification_type: {
      type: DataTypes.ENUM("group", "direct", "system"),
      allowNull: false,
      defaultValue: "system",
    },
    notification_title: {
      type: DataTypes.STRING(150),
      allowNull: false,
    },
    notification_body: {
      type: DataTypes.STRING(600),
      allowNull: false,
    },
    is_read: {
      type: DataTypes.BOOLEAN,
      allowNull: false,
      defaultValue: false,
    },
    group_id: {
      type: DataTypes.BIGINT.UNSIGNED,
      allowNull: true,
      defaultValue: null,
    },
    related_user_id: {
      type: DataTypes.BIGINT.UNSIGNED,
      allowNull: true,
      defaultValue: null,
    },
    created_at: {
      type: DataTypes.DATE,
      allowNull: false,
      defaultValue: DataTypes.NOW,
    },
  },
  {
    sequelize,
    modelName: "notification",
    tableName: "notification",
    timestamps: false,
    indexes: [
      { name: "idx_notification_user_id", fields: ["user_id"] },
      { name: "idx_notification_is_read", fields: ["is_read"] },
    ],
  }
);
