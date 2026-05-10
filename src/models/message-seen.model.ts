import { DataTypes, Model, Optional } from "sequelize";
import { sequelize } from "../config/database";

export interface MessageSeenAttributes {
  message_seen_id: number;
  message_id: number;
  user_id: number;
  seen_at?: Date;
}

export type MessageSeenCreationAttributes = Optional<MessageSeenAttributes, "message_seen_id" | "seen_at">;

export class MessageSeen
  extends Model<MessageSeenAttributes, MessageSeenCreationAttributes>
  implements MessageSeenAttributes
{
  public message_seen_id!: number;
  public message_id!: number;
  public user_id!: number;
  public readonly seen_at!: Date;
}

MessageSeen.init(
  {
    message_seen_id: {
      type: DataTypes.BIGINT.UNSIGNED,
      autoIncrement: true,
      primaryKey: true,
    },
    message_id: {
      type: DataTypes.BIGINT.UNSIGNED,
      allowNull: false,
    },
    user_id: {
      type: DataTypes.BIGINT.UNSIGNED,
      allowNull: false,
    },
    seen_at: {
      type: DataTypes.DATE,
      allowNull: false,
      defaultValue: DataTypes.NOW,
    },
  },
  {
    sequelize,
    modelName: "message_seen",
    tableName: "message_seen",
    timestamps: false,
    indexes: [{ name: "uk_message_seen_message_user", fields: ["message_id", "user_id"], unique: true }],
  }
);
