import { DataTypes, Model, Optional } from "sequelize";
import { sequelize } from "../config/database";

export interface ChatMessageAttributes {
  message_id: number;
  group_id?: number | null;
  sender_user_id: number;
  receiver_user_id?: number | null;
  message_text: string;
  message_type: "text";
  sent_at?: Date;
}

export type ChatMessageCreationAttributes = Optional<
  ChatMessageAttributes,
  "message_id" | "group_id" | "receiver_user_id" | "message_type" | "sent_at"
>;

export class ChatMessage
  extends Model<ChatMessageAttributes, ChatMessageCreationAttributes>
  implements ChatMessageAttributes
{
  public message_id!: number;
  public group_id!: number | null;
  public sender_user_id!: number;
  public receiver_user_id!: number | null;
  public message_text!: string;
  public message_type!: "text";
  public readonly sent_at!: Date;
}

ChatMessage.init(
  {
    message_id: {
      type: DataTypes.BIGINT.UNSIGNED,
      autoIncrement: true,
      primaryKey: true,
    },
    group_id: {
      type: DataTypes.BIGINT.UNSIGNED,
      allowNull: true,
    },
    sender_user_id: {
      type: DataTypes.BIGINT.UNSIGNED,
      allowNull: false,
    },
    receiver_user_id: {
      type: DataTypes.BIGINT.UNSIGNED,
      allowNull: true,
    },
    message_text: {
      type: DataTypes.TEXT,
      allowNull: false,
    },
    message_type: {
      type: DataTypes.ENUM("text"),
      allowNull: false,
      defaultValue: "text",
    },
    sent_at: {
      type: DataTypes.DATE,
      allowNull: false,
      defaultValue: DataTypes.NOW,
    },
  },
  {
    sequelize,
    modelName: "chat_message",
    tableName: "chat_message",
    timestamps: false,
    indexes: [
      { name: "idx_chat_message_group_id", fields: ["group_id"] },
      { name: "idx_chat_message_receiver_user_id", fields: ["receiver_user_id"] },
      { name: "idx_chat_message_sender_user_id", fields: ["sender_user_id"] },
      { name: "idx_chat_message_sent_at", fields: ["sent_at"] },
    ],
  }
);
