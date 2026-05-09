import { DataTypes, Model, Optional } from "sequelize";
import { sequelize } from "../config/database";

export interface UserAttributes {
  usr_id: number;
  fst_nm: string;
  lst_nm: string;
  email_id: string;
  mob_no?: string | null;
  is_actv: boolean;
  crt_dt?: Date;
  upd_dt?: Date;
}

export type UserCreationAttributes = Optional<
  UserAttributes,
  "usr_id" | "is_actv" | "mob_no" | "crt_dt" | "upd_dt"
>;

export class User
  extends Model<UserAttributes, UserCreationAttributes>
  implements UserAttributes
{
  public usr_id!: number;
  public fst_nm!: string;
  public lst_nm!: string;
  public email_id!: string;
  public mob_no!: string | null;
  public is_actv!: boolean;
  public readonly crt_dt!: Date;
  public readonly upd_dt!: Date;
}

User.init(
  {
    usr_id: {
      type: DataTypes.BIGINT.UNSIGNED,
      autoIncrement: true,
      primaryKey: true,
    },
    fst_nm: {
      type: DataTypes.STRING(100),
      allowNull: false,
    },
    lst_nm: {
      type: DataTypes.STRING(100),
      allowNull: false,
    },
    email_id: {
      type: DataTypes.STRING(200),
      allowNull: false,
      unique: "uk_usr_email_id",
    },
    mob_no: {
      type: DataTypes.STRING(20),
      allowNull: true,
    },
    is_actv: {
      type: DataTypes.BOOLEAN,
      allowNull: false,
      defaultValue: true,
    },
    crt_dt: {
      type: DataTypes.DATE,
      allowNull: false,
      defaultValue: DataTypes.NOW,
    },
    upd_dt: {
      type: DataTypes.DATE,
      allowNull: false,
      defaultValue: DataTypes.NOW,
    },
  },
  {
    sequelize,
    modelName: "usr",
    tableName: "usr",
    timestamps: false,
    indexes: [
      { name: "idx_usr_email_id", fields: ["email_id"] },
      { name: "idx_usr_is_actv", fields: ["is_actv"] },
    ],
  }
);
