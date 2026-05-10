import { DataTypes, Model, Optional } from "sequelize";
import { sequelize } from "../config/database";

export interface ChatGroupAttributes {
  group_id: number;
  group_title: string;
  group_type: "group";
  admin_user_id: number;
  is_active: boolean;
  created_at?: Date;
  updated_at?: Date;
}

export type ChatGroupCreationAttributes = Optional<
  ChatGroupAttributes,
  "group_id" | "group_title" | "group_type" | "admin_user_id" | "is_active" | "created_at" | "updated_at"
>;

export class ChatGroup
  extends Model<ChatGroupAttributes, ChatGroupCreationAttributes>
  implements ChatGroupAttributes
{
  public group_id!: number;
  public group_title!: string;
  public group_type!: "group";
  public admin_user_id!: number;
  public is_active!: boolean;
  public readonly created_at!: Date;
  public readonly updated_at!: Date;
}

ChatGroup.init(
  {
    group_id: {
      type: DataTypes.BIGINT.UNSIGNED,
      autoIncrement: true,
      primaryKey: true,
    },
    group_title: {
      type: DataTypes.STRING(120),
      allowNull: false,
    },
    group_type: {
      type: DataTypes.ENUM("group"),
      allowNull: false,
      defaultValue: "group",
    },
    admin_user_id: {
      type: DataTypes.BIGINT.UNSIGNED,
      allowNull: false,
    },
    is_active: {
      type: DataTypes.BOOLEAN,
      allowNull: false,
      defaultValue: true,
    },
    created_at: {
      type: DataTypes.DATE,
      allowNull: false,
      defaultValue: DataTypes.NOW,
    },
    updated_at: {
      type: DataTypes.DATE,
      allowNull: false,
      defaultValue: DataTypes.NOW,
    },
  },
  {
    sequelize,
    modelName: "chat_group",
    tableName: "chat_group",
    timestamps: false,
    indexes: [{ name: "idx_chat_group_admin_user_id", fields: ["admin_user_id"] }],
  }
);
