import { DataTypes, Model, Optional } from "sequelize";
import { sequelize } from "../config/database";

export interface NotificationAttributes {
  ntf_id: number;
  user_id: number;
  ntf_type: "group" | "direct" | "system";
  ntf_title: string;
  ntf_body: string;
  is_read: boolean;
  /** Group chat notification refers to (when `ntf_type` is `group`). */
  group_id?: number | null;
  /** Other user in a direct-message notification (`ntf_type` `direct`): the sender. */
  related_user_id?: number | null;
  created_at?: Date;
}

export type NotificationCreationAttributes = Optional<
  NotificationAttributes,
  "ntf_id" | "is_read" | "created_at" | "group_id" | "related_user_id"
>;

export class Notification
  extends Model<NotificationAttributes, NotificationCreationAttributes>
  implements NotificationAttributes
{
  public ntf_id!: number;
  public user_id!: number;
  public ntf_type!: "group" | "direct" | "system";
  public ntf_title!: string;
  public ntf_body!: string;
  public is_read!: boolean;
  public group_id!: number | null;
  public related_user_id!: number | null;
  public readonly created_at!: Date;
}

Notification.init(
  {
    ntf_id: {
      type: DataTypes.BIGINT.UNSIGNED,
      autoIncrement: true,
      primaryKey: true,
    },
    user_id: {
      type: DataTypes.BIGINT.UNSIGNED,
      allowNull: false,
    },
    ntf_type: {
      type: DataTypes.ENUM("group", "direct", "system"),
      allowNull: false,
      defaultValue: "system",
    },
    ntf_title: {
      type: DataTypes.STRING(150),
      allowNull: false,
    },
    ntf_body: {
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
      { name: "idx_ntf_user_id", fields: ["user_id"] },
      { name: "idx_ntf_is_read", fields: ["is_read"] },
    ],
  }
);
