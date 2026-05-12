import { DataTypes, Model, Optional } from "sequelize";
import { sequelize } from "../config/database";

export interface PushSubscriptionAttributes {
  push_subscription_id: number;
  user_id: number;
  endpoint: string;
  keys_p256dh: string;
  keys_auth: string;
  created_at?: Date;
}

export type PushSubscriptionCreationAttributes = Optional<
  PushSubscriptionAttributes,
  "push_subscription_id" | "created_at"
>;

export class PushSubscription
  extends Model<PushSubscriptionAttributes, PushSubscriptionCreationAttributes>
  implements PushSubscriptionAttributes
{
  public push_subscription_id!: number;
  public user_id!: number;
  public endpoint!: string;
  public keys_p256dh!: string;
  public keys_auth!: string;
  public readonly created_at!: Date;
}

PushSubscription.init(
  {
    push_subscription_id: {
      type: DataTypes.BIGINT.UNSIGNED,
      autoIncrement: true,
      primaryKey: true,
    },
    user_id: {
      type: DataTypes.BIGINT.UNSIGNED,
      allowNull: false,
    },
    endpoint: {
      type: DataTypes.TEXT,
      allowNull: false,
    },
    keys_p256dh: {
      type: DataTypes.TEXT,
      allowNull: false,
    },
    keys_auth: {
      type: DataTypes.TEXT,
      allowNull: false,
    },
    created_at: {
      type: DataTypes.DATE,
      allowNull: false,
      defaultValue: DataTypes.NOW,
    },
  },
  {
    sequelize,
    modelName: "push_subscription",
    tableName: "push_subscription",
    timestamps: false,
    indexes: [{ name: "idx_push_sub_user_id", fields: ["user_id"] }],
  },
);
