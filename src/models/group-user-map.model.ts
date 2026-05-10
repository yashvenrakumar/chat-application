import { DataTypes, Model, Optional } from "sequelize";
import { sequelize } from "../config/database";

export interface GroupUserMapAttributes {
  group_user_map_id: number;
  group_id: number;
  user_id: number;
  is_admin: boolean;
  joined_at?: Date;
  exited_at?: Date | null;
  is_exited: boolean;
}

export type GroupUserMapCreationAttributes = Optional<
  GroupUserMapAttributes,
  "group_user_map_id" | "is_admin" | "joined_at" | "exited_at" | "is_exited"
>;

export class GroupUserMap
  extends Model<GroupUserMapAttributes, GroupUserMapCreationAttributes>
  implements GroupUserMapAttributes
{
  public group_user_map_id!: number;
  public group_id!: number;
  public user_id!: number;
  public is_admin!: boolean;
  public readonly joined_at!: Date;
  public exited_at!: Date | null;
  public is_exited!: boolean;
}

GroupUserMap.init(
  {
    group_user_map_id: {
      type: DataTypes.BIGINT.UNSIGNED,
      autoIncrement: true,
      primaryKey: true,
    },
    group_id: {
      type: DataTypes.BIGINT.UNSIGNED,
      allowNull: false,
    },
    user_id: {
      type: DataTypes.BIGINT.UNSIGNED,
      allowNull: false,
    },
    is_admin: {
      type: DataTypes.BOOLEAN,
      allowNull: false,
      defaultValue: false,
    },
    joined_at: {
      type: DataTypes.DATE,
      allowNull: false,
      defaultValue: DataTypes.NOW,
    },
    exited_at: {
      type: DataTypes.DATE,
      allowNull: true,
    },
    is_exited: {
      type: DataTypes.BOOLEAN,
      allowNull: false,
      defaultValue: false,
    },
  },
  {
    sequelize,
    modelName: "group_user_map",
    tableName: "group_user_map",
    timestamps: false,
    indexes: [
      { name: "idx_group_user_map_group_id", fields: ["group_id"] },
      { name: "idx_group_user_map_user_id", fields: ["user_id"] },
      { name: "uk_group_user_map_group_user", fields: ["group_id", "user_id"], unique: true },
    ],
  }
);
