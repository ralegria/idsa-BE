import { DataTypes, literal } from "sequelize";
import { sequelize } from "../database/db.js";
import { nanoid } from "nanoid";

export const User = sequelize.define("users", {
  id: {
    type: DataTypes.UUID,
    defaultValue: literal("gen_random_uuid()"),
    primaryKey: true,
  },
  short_id: {
    type: DataTypes.STRING,
    defaultValue: () => nanoid(10),
    unique: true,
  },
  role_id: {
    type: DataTypes.INTEGER,
    allowNull: false,
  },
  firstnames: {
    type: DataTypes.STRING,
    allowNull: false,
  },
  lastnames: {
    type: DataTypes.STRING,
    allowNull: false,
  },
  email: {
    type: DataTypes.STRING,
    allowNull: false,
  },
  password: {
    type: DataTypes.STRING,
    allowNull: false,
  },
  university_name: {
    type: DataTypes.STRING,
  },
  page_title: {
    type: DataTypes.STRING,
    allowNull: true,
  },
  page_description: {
    type: DataTypes.STRING,
  },
  profile_pic: {
    type: DataTypes.STRING,
    allowNull: true,
  },
  cover_pic: {
    type: DataTypes.STRING,
    allowNull: true,
  },
  isDeleted: {
    type: DataTypes.BOOLEAN,
    allowNull: false,
    defaultValue: false,
  },
});
